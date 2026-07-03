# AUDIT BUG PATTERN — Masjid At-Taqwa

**Tanggal:** 2026-07-03
**Auditor:** OpenCode — Logging & Bug Pattern Engine
**Scope:** Seluruh `src/` (server actions, API routes, components, middleware, lib)

---

## DAFTAR TEMUAN

### [BUG-01] 🔴 NIK plaintext tersimpan di tabel `loan_applications`

- **Severity**: Critical
- **Klasifikasi**: CWE-312 (Cleartext Storage of Sensitive Information)
- **Lokasi**: `src/lib/actions/loan-applications.ts:47-55`, `src/db/schema.ts:381`
- **Apa yang terjadi**: Saat membuat pengajuan pinjaman, NIK disimpan dalam 3 format: plaintext (`nik`), encrypted (`nik_encrypted`), dan hash (`nik_hash`). Padahal proyek ini berprinsip "TANPA NIK mentah" (lihat schema.ts:7). Kolom `nik` menyimpan NIK asli yang bisa dibaca siapa pun yang akses database (admin, dev, attacker).
- **Bukti**:
  ```ts
  // loan-applications.ts:53-55 — NIK disimpan 3 format termasuk plaintext
  nik: data.nik,           // ⚠️ PLAIN TEXT — LANG GARAM PRIVASI
  nik_encrypted: encryptNik(data.nik),
  nik_hash: hashNikServer(data.nik),

  // schema.ts:381 — kolom nik NOT NULL
  nik: text("nik").notNull(),
  ```
- **Dampak bisnis**: Pelanggaran UU PDP (Pasal 15 — Data Pribadi Sensitif). Jika database bocor, NIK 100% pengguna terbaca. Kepercayaan masjid hancur. Potensi tuntutan hukum.
- **Rekomendasi perbaikan**: Hapus kolom `nik` plaintext. Cukup `nik_encrypted` (AES-256-GCM) untuk display terbatas + `nik_hash` (SHA-256) untuk deduplikasi. Buat migrasi untuk drop kolom.
- **Effort estimate**: Sedang (migrasi DB + update kode)
- **Status**: Belum dikerjakan

---

### [BUG-02] 🔴 Midtrans webhook fire-and-forget — potensi donasi hilang

- **Severity**: Critical
- **Klasifikasi**: CWE-754 (Improper Check for Unusual or Exceptional Conditions)
- **Lokasi**: `src/app/api/midtrans/webhook/route.ts:152-154`
- **Apa yang terjadi**: Handler webhook dijalankan secara fire-and-forget (tanpa `await`). Di environment serverless (Cloudflare Workers / Vercel Edge), fungsi bisa di-terminate sebelum `handlePaymentNotification()` selesai. Akibatnya: donasi dibayar user tapi tidak tercatat di sistem.
- **Bukti**:
  ```ts
  // webhook/route.ts:152-154 — FIRE-AND-FORGET! Tidak di-await!
  handlePaymentNotification(body).catch((err) => {
    log.error("Webhook handler error", { error: String(err) });
  });

  return NextResponse.json({ status: "ok" });
  ```
- **Dampak bisnis**: Donasi senilai jutaan rupiah bisa hilang tanpa jejak. Mustahik tidak menerima bantuan. Donatur kehilangan kepercayaan.
- **Rekomendasi perbaikan**: **WAJIB** `await handlePaymentNotification(body)` sebelum return response. Jika proses lama, gunakan queue (Bull/Redis) atau Webhook forwarding.
- **Effort estimate**: Kecil (tambah `await`)
- **Status**: Belum dikerjakan

---

### [BUG-03] 🟡 Server Action throw tanpa error handling — crash UI klien

- **Severity**: High
- **Klasifikasi**: CWE-248 (Uncaught Exception)
- **Lokasi**: Semua file di `src/lib/actions/` — pola `throw new Error("Operation failed")`
- **Apa yang terjadi**: 20 dari 26 server action files menggunakan `throw new Error(...)` untuk error. Di Next.js Server Actions, throw dari server action menyebabkan client-side error boundary atau crash. Tidak ada `try/catch` di caller (component) untuk handle error ini. Sementara fungsi lain di file yang sama (seperti `mustahik.ts`) menggunakan `return { error: "..." }` — inkonsisten.
- **Bukti**:
  ```ts
  // transactions.ts:147 — throw langsung, caller harus catch
  if (!row) throw new Error("Operation failed");

  // mustahik.ts:90 — return error object, caller handle gracefully
  if (!row) return { error: "Gagal menyimpan data." };

  // Bandingkan: jadwal-imam.ts:50 juga throw
  if (!row) throw new Error("Operation failed");
  ```
- **Dampak bisnis**: User admin tiba-tiba melihat error page atau UI crash tanpa pesan jelas. Reputasi aplikasi turun.
- **Rekomendasi perbaikan**: Standarisasi: semua server action harus `return { success: true }` atau `return { error: "..." }`. Hapus semua `throw` kecuali untuk auth yang memang harus blocking. Wrapping dengan try/catch di tiap route handler.
- **Effort estimate**: Besar (26 files)
- **Status**: Belum dikerjakan

---

### [BUG-04] 🟡 Fungsi `payInstallment` rawan double-spend / race condition

- **Severity**: High
- **Klasifikasi**: CWE-362 (Race Condition)
- **Lokasi**: `src/lib/actions/loan-installments.ts:68-113`
- **Apa yang terjadi**: Pembayaran cicilan menggunakan `total_paid: sql\`COALESCE(${loans.total_paid}, 0) + ${amount_paid}\`` di dalam transaksi PostgreSQL. Namun tidak ada:
  1. Idempotency key — cicilan yang sama bisa dibayar 2x dari request berbeda
  2. Optimistic locking — `amount_paid` diupdate langsung tanpa verifikasi `old.amount_paid`
  3. Validasi bahwa `amount_paid <= amount_due` — seseorang bisa membayar lebih dari kewajiban
- **Bukti**:
  ```ts
  // loan-installments.ts:76
  const isLunas = amount_paid >= old.amount_due;

  // loan-installments.ts:79-97 — update tanpa cek existing amount_paid
  await db.transaction(async (tx) => {
    [row] = await tx
      .update(loan_installments)
      .set({
        amount_paid,           // overwrite, bukan increment!
        paid_date: sql`CURRENT_DATE`,
        status: isLunas ? "paid" : "late",
      })
      .where(eq(loan_installments.id, id))
      .returning();

    // total_paid dihitung dari request, bukan dari data aktual
    await tx
      .update(loans)
      .set({
        total_paid: sql`COALESCE(${loans.total_paid}, 0) + ${amount_paid}`,
      })
      .where(eq(loans.id, old.loan_id));
  });
  ```
- **Dampak bisnis**: Double-spend di cicilan → saldo pinjaman tidak akurat → laporan keuangan masjid salah.
- **Rekomendasi perbaikan**: 1) Tambah idempotency key di request. 2) Ubah `amount_paid` jadi increment `COALESCE(amount_paid,0) + added_amount`. 3) Validasi `amount_paid <= amount_due` di awal. 4) Pertimbangkan `SELECT ... FOR UPDATE` di dalam transaksi.
- **Effort estimate**: Sedang
- **Status**: Belum dikerjakan

---

### [BUG-05] 🟡 `verifyZakatPayment` tidak cek status sebelum re-verify

- **Severity**: High
- **Klasifikasi**: CWE-754 (Improper Check for Unusual Condition)
- **Lokasi**: `src/lib/actions/zakat-payments.ts:90-103`
- **Apa yang terjadi**: Fungsi `verifyZakatPayment()` bisa dipanggil berulang kali tanpa cek status sebelumnya. Akibatnya `verified_by` di-overwrite tiap kali diverifikasi ulang.
- **Bukti**:
  ```ts
  // zakat-payments.ts:96-99 — overwrite tanpa cek is_verified
  const [row] = await db
    .update(zakat_payments)
    .set({ is_verified: true, verified_by: profile.id })
    .where(eq(zakat_payments.id, id))
    .returning();
  ```
- **Dampak bisnis**: Menghilangkan jejak siapa yang pertama kali verifikasi pembayaran zakat.
- **Rekomendasi perbaikan**: Tambah `if (old.is_verified) throw new Error("Sudah diverifikasi")` sebelum update.
- **Effort estimate**: Kecil
- **Status**: Belum dikerjakan

---

### [BUG-06] 🟡 `getDonations` tidak filter `deleted_at`

- **Severity**: Medium
- **Klasifikasi**: CWE-424 (Improper Protection of Alternate Path)
- **Lokasi**: `src/lib/actions/donations.ts:27-34`
- **Apa yang terjadi**: Fungsi `getDonations` tidak menyaring data yang sudah di-soft-delete, sementara hampir semua fungsi `get*` lain di codebase menyertakan `isNull(deleted_at)`.
- **Bukti**:
  ```ts
  // donations.ts:29-33 — tanpa filter deleted_at
  return db
    .select()
    .from(donations)
    .where(and(eq(donations.mosque_id, mosqueId)))
    .orderBy(desc(donations.created_at));

  // Bandingkan: mustahik.ts:30 — dengan filter deleted_at
  .where(and(eq(mustahiks.mosque_id, mid), isNull(mustahiks.deleted_at)))
  ```
- **Dampak bisnis**: Donasi yang dihapus (soft-delete) masih muncul di laporan. Data tidak akurat.
- **Rekomendasi perbaikan**: Tambah `isNull(donations.deleted_at)` ke kondisi WHERE.
- **Effort estimate**: Kecil
- **Status**: Belum dikerjakan

---

### [BUG-07] 🟡 `getZiswafRequests` tidak filter `deleted_at`

- **Severity**: Medium
- **Klasifikasi**: CWE-424
- **Lokasi**: `src/lib/actions/ziswaf-requests.ts:23-27`
- **Apa yang terjadi**: Sama dengan BUG-06 — fungsi get tidak filter soft-delete.
- **Bukti**: Tidak ada `isNull(ziswaf_requests.deleted_at)` di query.
- **Dampak bisnis**: Permohonan yang dihapus masih terlihat di dashboard admin.
- **Rekomendasi perbaikan**: Tambah filter `deleted_at`.
- **Effort estimate**: Kecil
- **Status**: Belum dikerjakan

---

### [BUG-08] 🟡 `updateTransaction` tidak validasi `amount > 0`

- **Severity**: Medium
- **Klasifikasi**: CWE-20 (Improper Input Validation)
- **Lokasi**: `src/lib/actions/transactions.ts:162-181`
- **Apa yang terjadi**: `createTransaction` melakukan validasi `data.amount <= 0` (baris 118). `updateTransaction` tidak melakukan validasi serupa. Admin bisa mengupdate transaksi dengan amount negatif atau 0.
- **Bukti**:
  ```ts
  // transactions.ts:118 — createTransaction validasi
  if (data.amount <= 0) throw new Error("Jumlah transaksi harus lebih dari 0");

  // transactions.ts:162-181 — updateTransaction TIDAK validasi
  export async function updateTransaction(
    id: string,
    data: Partial<InsertTransaction>,
  ) {
    // Tidak ada cek data.amount
  ```
- **Dampak bisnis**: Data keuangan bisa dirusak — transaksi dengan amount negatif merusak laporan.
- **Rekomendasi perbaikan**: Tambah validasi `if (data.amount && data.amount <= 0) throw new Error(...)` di `updateTransaction`.
- **Effort estimate**: Kecil
- **Status**: Belum dikerjakan

---

### [BUG-09] 🟡 `deleteActivity` audit log tidak menyertakan `changes` (data yang dihapus)

- **Severity**: Medium
- **Klasifikasi**: CWE-778 (Insufficient Logging)
- **Lokasi**: `src/lib/actions/activity.ts:94-108`
- **Apa yang terjadi**: Semua fungsi `delete*` di codebase menyertakan `changes: old` di audit log kecuali `deleteActivity`.
- **Bukti**:
  ```ts
  // activity.ts:100-106 — tanpa changes
  await db.insert(audit_logs).values({
    mosque_id: mid,
    actor_id: profile.id,
    action: "delete",
    entity_type: "activity_feed",
    entity_id: id,
    // TIDAK ADA changes: old
  });

  // Bandingkan: inventaris.ts:101-108 — dengan changes
  await db.insert(audit_logs).values({
    ...
    changes: old,
  });
  ```
- **Dampak bisnis**: Jika data activity dihapus secara tidak sah, tidak ada rekaman data apa yang hilang.
- **Rekomendasi perbaikan**: Tambah `changes: row` ke audit log (data kembalian dari `delete ... returning()`).
- **Effort estimate**: Kecil
- **Status**: Belum dikerjakan

---

### [BUG-10] 🟡 Debug endpoint (`/api/debug`) mengekspos informasi sistem sensitif

- **Severity**: Medium
- **Klasifikasi**: CWE-200 (Exposure of Sensitive Information)
- **Lokasi**: `src/app/api/debug/route.ts`
- **Apa yang terjadi**: Endpoint `/api/debug` tidak memiliki proteksi auth. Siapa pun bisa akses dan melihat: nama cookie, count profiles/memberships, data donations, mustahiks, income, expense. Informasi sistem lengkap.
- **Bukti**:
  ```ts
  // debug/route.ts — tanpa auth sama sekali
  export async function GET(request: Request) {
    const result: Record<string, unknown> = { phase: "start" };
    // ... mengekspos data sensitif
  ```
- **Dampak bisnis**: Attacker bisa mapping infrastruktur (Supabase, jumlah user, jumlah donasi).
- **Rekomendasi perbaikan**: Tambah auth check. Atau comment endpoint di production. Atau proteksi via env var.
- **Effort estimate**: Kecil
- **Status**: Belum dikerjakan

---

### [BUG-11] 🟡 `updateTransaction` — `fund_type` auto-detect tipe dari string `category` bisa salah

- **Severity**: Medium
- **Klasifikasi**: CWE-185 (Incorrect Regular Expression / Pattern Match)
- **Lokasi**: `src/lib/actions/transactions.ts:33-55`
- **Apa yang terjadi**: Fungsi `detectFundType` menggunakan prefix match dan `includes()` untuk menentukan fund_type dari category. Contoh: "Zakat Fitrah Beras/Uang" → `zakat_fitrah`. Tapi `includes("Wakaf")` juga akan cocok dengan "Wakaf Domba" atau "Wakaf Uang Masjid" — yang seharusnya beda tipe. Ceknya list berurutan dengan prioritas pertama-menang. Jika ada kategori baru, bisa salah mapping.
- **Bukti**:
  ```ts
  // transactions.ts:48-54 — urutan penting, first-match wins
  function detectFundType(category: string): FundType {
    for (const [prefix, fundType] of FUND_FROM_CATEGORY) {
      if (category.startsWith(prefix) || category.includes(prefix)) {
        return fundType;
      }
    }
    return "infaq_tidak_terikat";
  }
  ```
- **Dampak bisnis**: Transaksi kategorisasi salah → laporan keuangan per jenis dana tidak akurat.
- **Rekomendasi perbaikan**: Gunakan mapping eksplisit (Map) bukan prefix matching. Validasi category saat input dengan enum dari fund_type. Atau minimal, dokumentasikan kategori yang valid.
- **Effort estimate**: Kecil
- **Status**: Belum dikerjakan

---

### [BUG-12] 🟢 LoginPage loading state tidak pernah reset jika navigasi gagal

- **Severity**: Low
- **Klasifikasi**: CWE-833 (Deadlock / UI Freeze)
- **Lokasi**: `src/components/LoginPage.tsx:13-35`
- **Apa yang terjadi**: Setelah `router.push("/admin")` dipanggil (baris 34), komponen mungkin unmount di Next.js. Tapi jika navigasi gagal (misal error boundary), state `loading` tetap `true` selamanya — tombol terus disabled dengan spinner.
- **Bukti**:
  ```ts
  // LoginPage.tsx:30-34 — loading tidak pernah false setelah push
  if (authError) {
    setError("Email atau password salah.");
    setLoading(false);
    return;
  }
  router.push("/admin");
  // loading = true SETERUSNYA
  ```
- **Dampak bisnis**: User terjebak di halaman login dengan spinner abadi.
- **Rekomendasi perbaikan**: Set `setLoading(false)` setelah `router.push()` atau pakai `useTransition` untuk handle loading state dari Next.js router.
- **Effort estimate**: Kecil
- **Status**: Belum dikerjakan

---

### [BUG-13] 🟢 Error dari Supabase auth di-server dibocorkan ke client

- **Severity**: Low
- **Klasifikasi**: CWE-209 (Information Exposure Through an Error Message)
- **Lokasi**: `src/lib/actions/auth.ts:44-46`
- **Apa yang terjadi**: Saat signup gagal, error message asli dari Supabase dikirim ke client. Supabase error bisa mengandung informasi spesifik (misal: "User already registered" vs "Invalid email format") yang membantu attacker enumerasi akun.
- **Bukti**:
  ```ts
  // auth.ts:44-46 — error message mentah dari Supabase
  if (error) {
    return { error: error.message };
  }
  ```
- **Dampak bisnis**: Attacker bisa enumerasi email yang sudah terdaftar.
- **Rekomendasi perbaikan**: Return pesan generic seperti "Gagal mendaftar. Coba lagi." dan log error asli ke server.
- **Effort estimate**: Kecil
- **Status**: Belum dikerjakan

---

## RINGKASAN

| ID | Severity | Judul | Effort |
|----|----------|-------|--------|
| BUG-01 | 🔴 **Critical** | NIK plaintext di loan_applications | Sedang |
| BUG-02 | 🔴 **Critical** | Midtrans webhook fire-and-forget | Kecil |
| BUG-03 | 🟡 **High** | Server Action throw crash UI | Besar |
| BUG-04 | 🟡 **High** | payInstallment double-spend/race | Sedang |
| BUG-05 | 🟡 **High** | verifyZakatPayment no re-verify check | Kecil |
| BUG-06 | 🟡 **Medium** | getDonations tidak filter deleted_at | Kecil |
| BUG-07 | 🟡 **Medium** | getZiswafRequests tidak filter deleted_at | Kecil |
| BUG-08 | 🟡 **Medium** | updateTransaction validasi amount | Kecil |
| BUG-09 | 🟡 **Medium** | deleteActivity audit log tidak lengkap | Kecil |
| BUG-10 | 🟡 **Medium** | /api/debug expose sistem | Kecil |
| BUG-11 | 🟡 **Medium** | detectFundType mapping tidak presisi | Kecil |
| BUG-12 | 🟢 **Low** | LoginPage loading state freeze | Kecil |
| BUG-13 | 🟢 **Low** | Signup error message bocor info | Kecil |

**Skor Kesehatan: 5/10**
— 2 Critical (data privacy violation + payment loss), 3 High (crash + race + logic), 5 Medium, 2 Low.

**Prioritas perbaikan:**
1. 🔴 Hapus NIK plaintext + migration DB
2. 🔴 Await webhook handler
3. 🟡 Standarisasi error handling server action
4. 🟡 Idempotency + race condition di payment
5. Sisanya — Kecil, bisa paralel
