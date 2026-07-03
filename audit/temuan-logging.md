# TEMUAN LOGGING & OBSERVABILITY — AUDIT CODEBASE `masjid-ataqwa`

> **Project:** Masjid Hub — Ekosistem Digital Masjid
> **Tanggal:** 3 Juli 2026
> **Auditor:** Hermes AI (Skill: Logging-Management)

---

## Posisi Kematangan Logging Saat Ini

**Level:** 1 (Tidak ada logging yang memadai)

- Tidak ada library logging khusus (hanya `console.log`/`console.error`).
- Tidak ada structured logging.
- Tidak ada Request ID atau Correlation ID.
- Tidak ada centralized logging.
- Tidak ada audit trail untuk perubahan data.
- Tidak ada monitoring atau alerting.

---

## Temuan & Rekomendasi

### [LOG-001] Tidak Ada Library Logging Khusus
- **Severity**: High
- **Lokasi**: Seluruh codebase
- **Apa yang terjadi**: Hanya menggunakan `console.log` dan `console.error` native Node.js.
- **Bukti**:
  ```typescript
  console.error("[MIDTRANS] Token error:", response.status, errBody);
  ```
- **Dampak**:
  - Logging synchronous bisa memperlambat aplikasi.
  - Tidak ada structured logging untuk analisis.
  - Tidak ada log level (debug, info, warn, error).
  - Tidak bisa diarahkan ke centralized logging.
- **Rekomendasi**:
  - Gunakan library logging seperti `pino` atau `winston`.
  - Contoh implementasi:
    ```typescript
    import pino from "pino";
    const logger = pino({ level: "info" });
    logger.error({ reqId: "abc123", error: errBody }, "Midtrans token error");
    ```
- **Effort estimate**: Kecil (<1 hari)
- **Status**: Belum dikerjakan

---

### [LOG-002] Tidak Ada Request ID atau Correlation ID
- **Severity**: High
- **Lokasi**: Seluruh API routes dan action files
- **Apa yang terjadi**: Tidak ada Request ID atau Correlation ID untuk melacak alur request.
- **Bukti**: Tidak ditemukan `x-request-id` atau `traceparent` di header.
- **Dampak**:
  - Sulit melacak alur request di production.
  - Sulit melakukan debugging untuk error yang terjadi.
  - Tidak bisa mengaitkan log dari berbagai service.
- **Rekomendasi**:
  - Tambahkan middleware untuk menambahkan Request ID:
    ```typescript
    // src/middleware.ts
    import { NextResponse } from "next/server";
    import type { NextRequest } from "next/server";
    import { v4 as uuidv4 } from "uuid";

    export function middleware(request: NextRequest) {
      const requestId = request.headers.get("x-request-id") || uuidv4();
      const response = NextResponse.next();
      response.headers.set("x-request-id", requestId);
      return response;
    }
    ```
  - Gunakan Request ID di semua log:
    ```typescript
    logger.info({ reqId: requestId, path: "/api/donations" }, "Request started");
    ```
- **Effort estimate**: Kecil (<1 hari)
- **Status**: Belum dikerjakan

---

### [LOG-003] Tidak Ada Structured Logging
- **Severity**: High
- **Lokasi**: Seluruh codebase
- **Apa yang terjadi**: Log hanya berupa teks bebas, tidak terstruktur.
- **Bukti**:
  ```typescript
  console.log("Donasi berhasil disimpan:", donationId);
  ```
- **Dampak**:
  - Sulit melakukan query dan analisis log.
  - Tidak bisa diintegrasikan dengan tools observability (Grafana, Loki).
  - Sulit mencari log berdasarkan field tertentu (misal: `reqId`).
- **Rekomendasi**:
  - Gunakan structured logging dengan `pino`:
    ```typescript
    logger.info(
      {
        reqId: requestId,
        donationId,
        amount: donation.amount,
        status: "success"
      },
      "Donasi berhasil disimpan"
    );
    ```
- **Effort estimate**: Sedang (1-3 hari)
- **Status**: Belum dikerjakan

---

### [LOG-004] Tidak Ada Centralized Logging
- **Severity**: High
- **Lokasi**: Seluruh codebase
- **Apa yang terjadi**: Log hanya dicetak ke STDOUT/STDERR, tidak dikirim ke centralized logging.
- **Bukti**: Tidak ada konfigurasi untuk mengirim log ke Loki, Elasticsearch, atau Datadog.
- **Dampak**:
  - Sulit melakukan troubleshooting di production.
  - Tidak bisa melakukan analisis log secara terpusat.
  - Log hilang jika container/pod dihapus.
- **Rekomendasi**:
  - Gunakan **Grafana Loki** untuk centralized logging.
  - Konfigurasi `pino` untuk mengirim log ke Loki:
    ```typescript
    const logger = pino({
      transport: {
        target: "@logtail/pino",
        options: { sourceToken: process.env.LOGTAIL_TOKEN },
      },
    });
    ```
  - Atau gunakan FluentBit sebagai log collector.
- **Effort estimate**: Sedang (1-3 hari)
- **Status**: Belum dikerjakan

---

### [LOG-005] Tidak Ada Audit Logging untuk Perubahan Data
- **Severity**: Critical
- **Lokasi**: Action files (mustahik.ts, donations.ts, dll.)
- **Apa yang terjadi**: Tidak ada audit trail untuk perubahan data (create, update, delete).
- **Bukti**: Tidak ada tabel `audit_logs` atau logging untuk perubahan data.
- **Dampak**:
  - Tidak bisa melacak siapa yang mengubah data.
  - Sulit melakukan investigasi jika terjadi kesalahan atau fraud.
  - Pelanggaran **SOC 2 CC7.2** (Audit Logging).
- **Rekomendasi**:
  - Buat tabel `audit_logs`:
    ```sql
    CREATE TABLE audit_logs (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      mosque_id UUID REFERENCES mosques(id),
      action TEXT NOT NULL,  -- CREATE, UPDATE, DELETE
      entity_type TEXT NOT NULL,  -- mustahik, donation, transaction
      entity_id UUID NOT NULL,
      actor_id UUID REFERENCES profiles(id),
      metadata JSONB,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    ```
  - Tambahkan audit log di setiap action file:
    ```typescript
    await db.insert(audit_logs).values({
      mosque_id: mosqueId,
      action: "CREATE",
      entity_type: "mustahik",
      entity_id: row.id,
      actor_id: profile.id,
      metadata: { name, phone, address },
    });
    ```
- **Effort estimate**: Sedang (1-3 hari)
- **Status**: Belum dikerjakan

---

### [LOG-006] Tidak Ada Monitoring atau Alerting
- **Severity**: High
- **Lokasi**: Seluruh codebase
- **Apa yang terjadi**: Tidak ada monitoring untuk error atau performa.
- **Bukti**: Tidak ada integrasi dengan Grafana, Datadog, atau Sentry.
- **Dampak**:
  - Error tidak terdeteksi secara real-time.
  - Sulit melakukan troubleshooting di production.
  - Downtime tidak terdeteksi.
- **Rekomendasi**:
  - Integrasikan dengan **Sentry** untuk error monitoring:
    ```typescript
    import * as Sentry from "@sentry/nextjs";
    Sentry.init({ dsn: process.env.SENTRY_DSN });
    ```
  - Tambahkan alerting untuk error kritis (contoh: Midtrans webhook gagal).
  - Gunakan **Grafana Alerting** untuk log-based alerting.
- **Effort estimate**: Sedang (1-3 hari)
- **Status**: Belum dikerjakan

---

### [LOG-007] Tidak Ada Retention Policy untuk Log
- **Severity**: Medium
- **Lokasi**: Seluruh codebase
- **Apa yang terjadi**: Tidak ada kebijakan retensi log.
- **Bukti**: Tidak ada konfigurasi untuk menghapus log lama.
- **Dampak**:
  - Log menumpuk dan menghabiskan storage.
  - Biaya storage meningkat.
  - Sulit mencari log yang relevan.
- **Rekomendasi**:
  - Konfigurasi retention policy di Loki:
    ```yaml
    # loki-config.yaml
    table_manager:
      retention_deletes_enabled: true
      retention_period: 720h  # 30 days
    ```
  - Untuk Cloudflare Workers, gunakan log retention di Cloudflare Logs.
- **Effort estimate**: Kecil (<1 hari)
- **Status**: Belum dikerjakan

---

### [LOG-008] Logging Data Sensitif di Error Log
- **Severity**: High
- **Lokasi**: `src/app/api/midtrans/webhook/route.ts`
- **Apa yang terjadi**: Data sensitif (seperti `errBody` dari Midtrans) dicetak di error log.
- **Bukti**:
  ```typescript
  console.error("[MIDTRANS] Token error:", response.status, errBody);
  ```
- **Dampak**:
  - Data sensitif (seperti token, nomor kartu) bisa tercetak di log.
  - Pelanggaran **UU PDP** dan **PCI DSS**.
- **Rekomendasi**:
  - Jangan log seluruh `errBody`. Gunakan structured logging dengan redaction:
    ```typescript
    logger.error(
      {
        reqId: requestId,
        service: "midtrans",
        status: response.status,
        error: redactSensitiveData(errBody),  // Fungsi untuk menghapus data sensitif
      },
      "Midtrans token error"
    );
    ```
  - Contoh fungsi `redactSensitiveData`:
    ```typescript
    function redactSensitiveData(obj: any): any {
      if (typeof obj !== "object" || obj === null) return obj;
      const result = { ...obj };
      for (const key of Object.keys(result)) {
        if (key.toLowerCase().includes("token") || key.toLowerCase().includes("password")) {
          result[key] = "[REDACTED]";
        } else if (typeof result[key] === "object") {
          result[key] = redactSensitiveData(result[key]);
        }
      }
      return result;
    }
    ```
- **Effort estimate**: Kecil (<1 hari)
- **Status**: Belum dikerjakan

---

### [LOG-009] Tidak Ada Sampling atau Filtering untuk Log Volume Besar
- **Severity**: Medium
- **Lokasi**: Seluruh codebase
- **Apa yang terjadi**: Tidak ada mekanisme untuk mengurangi volume log.
- **Bukti**: Semua log dicetak tanpa filtering.
- **Dampak**:
  - Biaya logging meningkat.
  - Sulit mencari log yang relevan.
  - Performance aplikasi terpengaruh.
- **Rekomendasi**:
  - Gunakan sampling untuk log debug:
    ```typescript
    if (Math.random() < 0.1) {  // 10% sampling
      logger.debug({ ... }, "Debug message");
    }
    ```
  - Gunakan log level yang tepat (debug hanya di development).
  - Filter log berdasarkan severity atau path.
- **Effort estimate**: Kecil (<1 hari)
- **Status**: Belum dikerjakan

---

## Rekomendasi Strategis

1. **Implementasikan structured logging dengan `pino`** (High priority).
2. **Tambahkan Request ID dan Correlation ID** (High priority).
3. **Buat tabel `audit_logs` untuk audit trail** (Critical priority).
4. **Integrasikan dengan Grafana Loki untuk centralized logging** (High priority).
5. **Tambahkan monitoring dan alerting dengan Sentry** (High priority).
6. **Terapkan retention policy untuk log** (Medium priority).
7. **Redact data sensitif dari log** (High priority).

---

*GERAKAN PEMUDA BERDAYA — Masjid Jami' At-Taqwa Ulujami*