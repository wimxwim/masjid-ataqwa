# AUDIT LOGGING — Masjid At-Taqwa

> **⚠️ DEPLOY TARGET: VERCEL** — Commit & deploy via Vercel (`wimxgooo-3751`). Git push → Vercel auto-deploy production. Cloudflare Workers sebagai fallback saja.

**Tanggal:** 2026-07-03
**Auditor:** OpenCode — Logging & Bug Pattern Engine
**Scope:** `src/` seluruh codebase

---

## 1. MATURITY ASSESSMENT

| Level | Kriteria | Status | Bukti |
|-------|----------|--------|-------|
| **Level 1** | console.log/error saja | ❌ Tidak | Zero penggunaan `console.*` di seluruh codebase ✅ |
| **Level 2** | Library proper (Pino), redact, level, JSON | ✅ Ya | `src/lib/logger.ts` — Pino, redact config, level (debug/prod), JSON output |
| **Level 3** | Request ID propagated antar service | ❌ Tidak | `middleware.ts` generate x-request-id tapi TIDAK pernah di-pass ke logger context |
| **Level 4** | Centralized logging + monitoring pipeline | ❌ Tidak | Tidak ada log shipping, tidak ada external sink |

**Kesimpulan: Logging Maturity = Level 2 (dari 4)**

---

## 2. TEMUAN DETAIL

---

### [LOG-01] Logger tidak memakai request ID — zero tracing capability

- **Severity**: High
- **Klasifikasi**: CWE-778 (Insufficient Logging)
- **Lokasi**: `src/lib/logger.ts` (semua), `src/middleware.ts:9`
- **Apa yang terjadi**: Middleware menghasilkan `x-request-id` via `globalThis.crypto.randomUUID()` dan set di response header, tapi ID ini tidak pernah diteruskan ke logger. Tidak ada correlation ID antar log entry, sehingga tidak mungkin menelusuri satu request dari middleware → server action → database query.
- **Bukti**:
  ```ts
  // middleware.ts:9 — request ID dibuat tapi tidak pernah dikirim ke logger
  const requestId = request.headers.get("x-request-id") || globalThis.crypto.randomUUID();
  response.headers.set("x-request-id", requestId);

  // logger.ts:49-67 — createLogger hanya menerima context string statis
  export function createLogger(context: string) {
    return {
      debug: (msg: string, data?: Record<string, unknown>) => {
        logger.debug({ ...data, context }, msg);
      },
      // ... tidak ada parameter requestId
    };
  }
  ```
- **Dampak bisnis**: Jika terjadi error di production, mustahil menelusuri penyebab karena log tidak bisa dikorelasikan. Debugging jadi tebak-tebakan.
- **Rekomendasi perbaikan**: Ubah `createLogger(context, requestId?)` — set default dari `globalThis.crypto.randomUUID()` jika tidak ada. Di middleware, inject requestId ke `AsyncLocalStorage` atau request header untuk diakses Server Actions/API routes.
- **Effort estimate**: Sedang
- **Status**: Belum dikerjakan

---

### [LOG-02] Regular logger methods (debug/info/warn/error) tidak menerapkan `redactSensitiveData`

- **Severity**: High
- **Klasifikasi**: CWE-532 (Insertion of Sensitive Information into Log File)
- **Lokasi**: `src/lib/logger.ts:51-62`
- **Apa yang terjadi**: Fungsi `redactSensitiveData()` (baris 8-27) hanya dipanggil oleh method `redacted()` (baris 63-65). Method `debug`, `info`, `warn`, `error` (baris 51-62) langsung melempar data mentah ke Pino. Pino config `redact.paths` hanya mencakup `req.headers.cookie`, `req.headers.authorization`, `errBody.token`, `errBody.password`, `errBody.card_number` — tapi data di level `{ password: "xxx" }` tanpa prefix `errBody.*` TIDAK akan ter-redact.
- **Bukti**:
  ```ts
  // logger.ts:60-62 — error method tidak pakai redactSensitiveData
  error: (msg: string, data?: Record<string, unknown>) => {
    logger.error({ ...data, context }, msg);
  },

  // logger.ts:37-46 — redact paths terbatas pada prefix errBody.*
  redact: {
    paths: [
      "req.headers.cookie",
      "req.headers.authorization",
      "errBody.token",
      "errBody.password",
      "errBody.card_number",
    ],
  },
  ```
- **Dampak bisnis**: Developer yang secara tidak sengaja log `{ password: "rahasia123" }` via `log.info()` akan menulis password ke file log production. Pelanggaran data privasi.
- **Rekomendasi perbaikan**: Terapkan `redactSensitiveData()` di semua method, bukan hanya `redacted()`. Atau pasang Pino `redact.paths` untuk top-level field sensitif (tidak hanya `errBody.*`).
- **Effort estimate**: Kecil
- **Status**: Belum dikerjakan

---

### [LOG-03] Logger Pino level config tidak sinkron dengan runtime

- **Severity**: Low
- **Klasifikasi**: CWE-779 (Logging of Excessive Data)
- **Lokasi**: `src/lib/logger.ts:30`
- **Apa yang terjadi**: Level log ditentukan dari `NODE_ENV` saja. Di environment staging/preview yang juga pakai `NODE_ENV=production`, log debug tidak akan muncul.
- **Bukti**:
  ```ts
  level: process.env.NODE_ENV === "production" ? "info" : "debug",
  ```
- **Dampak bisnis**: Debugging di staging sulit jika staging juga menggunakan mode production.
- **Rekomendasi perbaikan**: Gunakan env var terpisah `LOG_LEVEL` dengan fallback ke `info`.
- **Effort estimate**: Kecil
- **Status**: Belum dikerjakan

---

### [LOG-04] Tidak ada logging untuk server action failures

- **Severity**: Medium
- **Klasifikasi**: CWE-778 (Insufficient Logging)
- **Lokasi**: Semua file di `src/lib/actions/*.ts`
- **Apa yang terjadi**: Semua server action throws `throw new Error("...")` atau return `{ error: "..." }` tanpa satu pun yang memanggil logger. Error tidak tercatat di mana pun — hanya tampil di response client.
- **Bukti**:
  ```ts
  // transactions.ts:147 — error dibiarkan tanpa log
  if (!row) throw new Error("Operation failed");

  // mustahik.ts:90 — return error tanpa log
  if (!row) return { error: "Gagal menyimpan data." };
  ```
- **Dampak bisnis**: Admin tidak tahu kalau ada error sistem karena tidak ada notifikasi. Error hanya muncul saat user mengeluh.
- **Rekomendasi perbaikan**: Setiap `throw` sebelum re-throw, panggil `log.error()`. Untuk return `{ error }`, panggil `log.warn()`.
- **Effort estimate**: Besar (26 action files)
- **Status**: Belum dikerjakan

---

### [LOG-05] `redacted()` method hanya dipanggil di 2 tempat dari seluruh codebase

- **Severity**: Info
- **Klasifikasi**: CWE-532
- **Lokasi**: `src/lib/logger.ts:63-65`
- **Apa yang terjadi**: Method `redacted()` di logger dirancang khusus untuk log data sensitif dengan redaksi otomatis, tapi hanya dipanggil di 2 lokasi dari total ~26 file action:
  1. `src/app/api/midtrans/token/route.ts:79` — `log.redacted("Token error from Midtrans API", ...)`
  2. `src/app/api/midtrans/token/route.ts:93` — `log.redacted("Unexpected error", ...)`
  3. `src/lib/turnstile.ts:25` — `log.redacted("Verifikasi error", ...)`
- **Bukti**: Hanya 3 pemanggilan `log.redacted()` vs puluhan pemanggilan `log.*` biasa.
- **Dampak bisnis**: Developer yang tidak sadar akan terus pakai `log.error()` untuk data sensitif.
- **Rekomendasi perbaikan**: Tambahkan comment di definisi method yang jelas membedakan kapan pakai `redacted()`. Atau pertimbangkan auto-redact di semua method via Pino `redact.paths`.
- **Effort estimate**: Kecil
- **Status**: Belum dikerjakan

---

### [LOG-06] Audit log terbatas — tidak capture IP address atau user-agent

- **Severity**: Medium
- **Klasifikasi**: CWE-778 (Insufficient Logging)
- **Lokasi**: `src/db/schema.ts:531-548` (tabel audit_logs), semua file actions
- **Apa yang terjadi**: Schema `audit_logs` punya kolom `ip_address` dan `user_agent` (baris 539-540), tapi tidak ada satu pun insert ke `audit_logs` yang mengisi kolom tersebut. Semua audit insert hanya mengisi `actor_id`, `action`, `entity_type`, `entity_id`, `changes`.
- **Bukti**:
  ```ts
  // schema.ts:539-540 — kolom didefinisikan
  ip_address: text("ip_address"),
  user_agent: text("user_agent"),

  // Semua insert audit log — contoh di transactions.ts:149-156
  await db.insert(audit_logs).values({
    mosque_id: mosqueId,
    action: "update",
    entity_type: "transactions",
    entity_id: id,
    actor_id: profile.id,
    changes: { old, new: data },
    // ip_address dan user_agent tidak pernah diisi
  });
  ```
- **Dampak bisnis**: Jika terjadi penyalahgunaan akun, tidak ada cara untuk melacak dari IP mana akses dilakukan. Audit log tidak bisa digunakan untuk forensik.
- **Rekomendasi perbaikan**: Di middleware atau helper, capture IP dan User-Agent dari request header, lalu inject ke setiap audit log. Bisa via AsyncLocalStorage atau parameter fungsi.
- **Effort estimate**: Sedang
- **Status**: Belum dikerjakan

---

## 3. RINGKASAN

| ID | Severity | Judul | Effort |
|----|----------|-------|--------|
| LOG-01 | 🔴 High | Logger tidak pakai request ID | Sedang |
| LOG-02 | 🔴 High | Regular logger tidak redact data sensitif | Kecil |
| LOG-03 | 🟢 Low | Level log hardcode NODE_ENV | Kecil |
| LOG-04 | 🟡 Medium | Server action failures tidak di-log | Besar |
| LOG-05 | 🔵 Info | `redacted()` jarang dipanggil | Kecil |
| LOG-06 | 🟡 Medium | Audit log tidak capture IP/User-Agent | Sedang |

**Skor Kesehatan Logging: 5/10** — Foundation sudah Level 2 (Pino ✅), tapi belum ada tracing, belum ada error logging sistematis, dan rawan bocor data sensitif.
