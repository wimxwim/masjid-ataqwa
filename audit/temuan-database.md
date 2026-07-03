# 🔍 AUDIT DATABASE — Masjid At-Taqwa (masjid-ataqwa)
**Tanggal:** 2026-07-03
**Auditor:** OpenCode DB Audit Engine
**Cakupan:** Schema, Migrasi, Query Patterns, Atomicity, Race Conditions

---

## RINGKASAN

| Metrik | Nilai |
|--------|-------|
| Total tabel | 27 (aktif di schema.ts) |
| Total migrasi | 15 file (14 di _journal.json) |
| Enum types | 11 (role, department, desil, loan_status, commission_status, donation_akad, donation_payment, donation_status, fund_type, akad_type, kolektibilitas) |
| Total foreign keys | 50+ |
| Indexes | 60+ |
| Temuan Critical | 5 |
| Temuan High | 5 |
| Temuan Medium | 3 |
| Temuan Low/Info | 2 |

---

### [RA0001] Race condition pada payInstallment — total_paid increment tidak atomic
- **Severity**: 🔴 Critical
- **Lokasi**: `src/lib/actions/loan-installments.ts` (baris ~79-97)
- **Apa yang terjadi**: Method `payInstallment()` menggunakan `COALESCE(total_paid, 0) + amount_paid` yang membaca nilai total_paid saat ini lalu menambahkan. Dua request concurrent akan membaca nilai yang sama, mengakibatkan salah satu pembayaran hilang (lost update).
- **Bukti**:
```typescript
// src/lib/actions/loan-installments.ts:90-97
await tx
  .update(loans)
  .set({
    total_paid: sql`COALESCE(${loans.total_paid}, 0) + ${amount_paid}`,
    updated_at: sql`NOW()`,
  })
  .where(eq(loans.id, old.loan_id));
```
- **Dampak bisnis**: Kehilangan data pembayaran cicilan dari mustahik — saldo pinjaman tidak akurat, NPF report salah, kepercayaan mustahik hilang. Potensi kerugian finansial.
- **Rekomendasi perbaikan**: Gunakan atomic update yang tidak bergantung pada nilai baca sebelumnya. Di PostgreSQL, `UPDATE ... SET total_paid = total_paid + amount_paid` sudah atomic. Drizzle: `sql\`${loans.total_paid} + ${amount_paid}\`` sudah cukup karena diterjemahkan ke SQL ekspresi. Pastikan ini berjalan di dalam transaksi yang sama dengan validasi.
- **Effort estimate**: Kecil
- **Status**: Belum dikerjakan

### [RA0002] createLoanRestructure — insert restructure log & update loan status tidak dalam 1 transaksi
- **Severity**: 🔴 Critical
- **Lokasi**: `src/lib/actions/loan-restructures.ts` (baris ~46-88)
- **Apa yang terjadi**: Insert ke `loan_restructures` dan update status loan menjadi `"restructured"` dilakukan secara terpisah (2 db call, tanpa `db.transaction()`). Jika insert berhasil tapi update gagal (atau sebaliknya), data menjadi inkonsisten.
- **Bukti**:
```typescript
// src/lib/actions/loan-restructures.ts:49-73 — NO WRAPPER TRANSACTION
const [row] = await db
  .insert(loan_restructures) // ← berhasil
  ...
  .returning();

const [loan] = await db
  .update(loans)             // ← gagal? → inkonsisten
  .set({
    status: "restructured",
    restructured: true,
    restructured_at: sql`NOW()`,
  })
  .where(eq(loans.id, data.loan_id))
  .returning();
```
- **Dampak bisnis**: Loan bisa tercatat sebagai restructured tanpa riwayat restruktur, atau riwayat restruktur ada tanpa loan update. Ini mengacaukan audit trail dan NPF tracking.
- **Rekomendasi perbaikan**: Bungkus kedua operasi dalam `db.transaction(async (tx) => { ... })`.
- **Effort estimate**: Kecil
- **Status**: Belum dikerjakan

### [RA0003] NIK disimpan dalam plaintext di tabel loan_applications
- **Severity**: 🔴 Critical
- **Lokasi**: `src/db/schema.ts` (baris ~381) & `src/db/migrations/0012_confused_misty_knight.sql` (baris 20)
- **Apa yang terjadi**: Tabel `loan_applications` memiliki kolom `nik: text("nik").notNull()` — NIK disimpan dalam plaintext. Meskipun ada kolom `nik_encrypted`, kolom `nik` tetap menyimpan NIK asli. Ini melanggar prinsip schema.ts sendiri ("TANPA NIK mentah — NIK dienkripsi AES-256-GCM").
- **Bukti**:
```typescript
// schema.ts:381
nik: text("nik").notNull(),           // ← PLAINTEXT NIK!
nik_encrypted: text("nik_encrypted"),
nik_hash: text("nik_hash"),
```
- **Dampak bisnis**: Jika database bocor, NIK ribuan pemohon pinjaman terekspos. Pelanggaran UU Perlindungan Data Pribadi (UU PDP) Indonesia. Potensi denda dan kriminal.
- **Rekomendasi perbaikan**: Hapus kolom `nik` plaintext, simpan hanya `nik_encrypted` (AES-256-GCM) + `nik_hash` (SHA-256 untuk dedup). Buat migrasi untuk encrypt NIK yang sudah ada.
- **Effort estimate**: Sedang
- **Status**: Belum dikerjakan

### [RA0004] createLoanInstallment — tidak ada verifikasi akses masjid sebelum insert
- **Severity**: 🔴 Critical
- **Lokasi**: `src/lib/actions/loan-installments.ts` (baris ~35-66)
- **Apa yang terjadi**: Fungsi `createLoanInstallment` hanya mengambil `mosque_id` dari loan untuk audit log tapi tidak memverifikasi bahwa user adalah anggota masjid tersebut. Tidak ada `requireRole()` atau pengecekan keanggotaan. User dari masjid A bisa menambahkan cicilan ke pinjaman di masjid B.
- **Bukti**:
```typescript
// src/lib/actions/loan-installments.ts:35-53
export async function createLoanInstallment(data: InsertLoanInstallment) {
  const profile = await requireAuth();
  const [loan] = await db.select({ mosque_id: loans.mosque_id })
    .from(loans).where(eq(loans.id, data.loan_id)).limit(1);
  const mosque_id = loan?.mosque_id ?? "";  // ← hanya untuk log, TIDAK dicek

  const [row] = await db
    .insert(loan_installments) // ← insert terjadi tanpa verifikasi akses
    .values({ ... })
    .returning();
```
- **Dampak bisnis**: Multi-tenant breach — admin masjid A bisa memanipulasi data pinjaman masjid B. Kehilangan integritas data antar tenant.
- **Rekomendasi perbaikan**: Tambahkan `await requireRole(mosque_id, ...)` sebelum insert. Pastikan user adalah anggota masjid yang memiliki loan tersebut.
- **Effort estimate**: Kecil
- **Status**: Belum dikerjakan

### [RA0005] DATABASE_URL tanpa validasi — crash tanpa error message jelas
- **Severity**: 🔴 Critical
- **Lokasi**: `src/db/client.ts` (baris 5-7)
- **Apa yang terjadi**: `process.env.DATABASE_URL!` menggunakan non-null assertion. Jika env variable tidak diset, aplikasi crash dengan "Cannot read properties of undefined" bukan pesan error yang jelas. Tidak ada validasi atau fallback.
- **Bukti**:
```typescript
// src/db/client.ts:5-7
const connectionString = process.env.DATABASE_URL!;
const client = postgres(connectionString, { prepare: false });
export const db = drizzle(client, { schema });
```
- **Dampak bisnis**: Semua server action yang mengakses DB akan crash tanpa pesan error informatif di production. Deploy config yang salah = downtime total.
- **Rekomendasi perbaikan**: Tambahkan validasi: `if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL environment variable is required");`
- **Effort estimate**: Kecil
- **Status**: Belum dikerjakan

---

### [RA0006] Missing partial indexes untuk soft delete (deleted_at IS NULL)
- **Severity**: 🟡 High
- **Lokasi**: SEMUA tabel (schema.ts & migrations)
- **Apa yang terjadi**: Sebagian besar query aktif memfilter `isNull(deleted_at)`, tapi tidak ada partial index `WHERE deleted_at IS NULL` di tabel besar. Tanpa partial index, query soft-delete harus full scan atau bergantung pada index kolom lain.
- **Bukti**: Query pattern di seluruh codebase:
```typescript
// transactions.ts:98 — filter deleted_at di hampir semua query
const conditions = [eq(transactions.mosque_id, mosqueId), isNull(transactions.deleted_at)];
```
Tapi di migration:
```sql
-- transactions_date_idx: tidak include deleted_at
CREATE INDEX "transactions_date_idx" ON "transactions" ("transaction_date");
```
- **Dampak bisnis**: Performa query memburuk seiring pertumbuhan data (ribuan soft-delete rows). Dashboard transparansi dan laporan keuangan makin lambat.
- **Rekomendasi perbaikan**: Tambahkan partial indexes untuk tabel besar: `transactions`, `mustahiks`, `loans`, `donatur_tetap`, `wakaf_assets`. Contoh: `CREATE INDEX CONCURRENTLY idx_transactions_active ON transactions (mosque_id) WHERE deleted_at IS NULL;`
- **Effort estimate**: Kecil
- **Status**: Belum dikerjakan

### [RA0007] Tidak ada index pada loan_installments.due_date untuk query overdue
- **Severity**: 🟡 High
- **Lokasi**: `src/db/schema.ts` (baris 913-927)
- **Apa yang terjadi**: Tabel `loan_installments` hanya punya index `(loan_id, status)` dan `(loan_id)`. Tidak ada index pada `due_date` atau `(status, due_date)` yang diperlukan untuk query "cicilan jatuh tempo hari ini" atau "overdue tracking".
- **Bukti**:
```typescript
// schema.ts:924-927
}, (t) => [
  index("installments_loan_idx").on(t.loan_id),
  index("installments_status_idx").on(t.loan_id, t.status),
]);
```
- **Dampak bisnis**: NPF tracking (kolektibilitas) bergantung pada deteksi overdue. Tanpa index, query overdue akan lambat dan tidak scalable.
- **Rekomendasi perbaikan**: Tambahkan index: `index("installments_due_status_idx").on(t.status, t.due_date)`
- **Effort estimate**: Kecil
- **Status**: Belum dikerjakan

### [RA0008] transactions.type menggunakan free text bukan ENUM
- **Severity**: 🟡 High
- **Lokasi**: `src/db/schema.ts` (baris 553-584)
- **Apa yang terjadi**: Kolom `transactions.type` didefinisikan sebagai `text("type").notNull()` tanpa ENUM atau CHECK constraint. Query filter menggunakan string literal `"Pemasukan"` | `"Pengeluaran"`. Tidak ada proteksi dari typo atau nilai invalid.
- **Bukti**:
```typescript
// schema.ts:556
type: text("type").notNull(),  // ← free text, riskan inkonsistensi
```
```typescript
// transactions.ts:80-89 — filter menggunakan hardcoded string
if (ft.startsWith("zakat_") && data.akad_type && data.akad_type !== "tamlik") {
  throw new Error("Akad zakat wajib tamlik...");
}
```
- **Dampak bisnis**: Data tidak konsisten — misalnya "Pemasukan" vs "pemasukan" vs "PEMASUKAN" bisa masuk. Laporan keuangan agregat jadi tidak akurat.
- **Rekomendasi perbaikan**: Buat ENUM `transaction_type ('Pemasukan', 'Pengeluaran')` atau tambahkan CHECK constraint.
- **Effort estimate**: Kecil
- **Status**: Belum dikerjakan

### [RA0009] Kekacauan penomoran migrasi — file 0003, 0004, 0005 tidak konsisten dengan journal
- **Severity**: 🟡 High
- **Lokasi**: `src/db/migrations/` direktori
- **Apa yang terjadi**: Terdapat ketidakcocokan antara file migration di disk dan entry di `_journal.json`:
  - `0003_add_latlng_mushafir.sql` ada di disk TAPI tidak ada di journal (tidak terdaftar sebagai migrasi)
  - `0004_rls_security.sql.bak` — file backup yang tidak dijalankan
  - Journal idx=3 mengacu ke tag `0003_fund_type_transactions` (file: `0005_fund_type_transactions.sql`)
  - Journal idx=5 juga mengacu ke tag `0005_fund_type_transactions`
  - Ada gap idx=4 di journal
  - `0000_initial.sql` (manual SQL) dan `0000_good_machine_man.sql` (Drizzle-generated) duplikat schema awal
- **Dampak bisnis**: Siapa pun yang menjalankan `drizzle-kit migrate` akan mendapatkan error karena inkonsistensi. Migrasi ke environment baru (staging/production) rawan gagal. Risiko data loss.
- **Rekomendasi perbaikan**: Reset journal dengan snapshot terbaru. Hapus file migration yang tidak terpakai (`0003_add_latlng_mushafir.sql`, `0000_initial.sql`, `0004_rls_security.sql.bak`). Jalankan `drizzle-kit migrate` untuk verifikasi.
- **Effort estimate**: Sedang
- **Status**: Belum dikerjakan

### [RA0010] createZakatPayment update muzzaki.last_zakat_amount tanpa transaction atomicity
- **Severity**: 🟡 High
- **Lokasi**: `src/lib/actions/zakat-payments.ts` (baris ~40-88)
- **Apa yang terjadi**: Insert `zakat_payments` dan update `muzzaki.last_zakat_amount` dilakukan dalam 2 db call terpisah tanpa transaksi. Jika update muzzaki gagal setelah insert berhasil, data zakat payment tercatat tapi last_zakat_amount muzzaki tidak terupdate (inkonsisten). Juga tidak ada transaksi untuk menjamin atomicity antara `zakat_payments` dan `muzzaki` update.
- **Bukti**:
```typescript
// zakat-payments.ts:45-84 — dua operasi terpisah
const [row] = await db.insert(zakat_payments)...returning(); // ← berhasil

// ... (audit log insert) ...

// ← Jika gagal di sini, zakat_payments tetap tercatat
if (data.muzzaki_id) {
  await db.update(muzzaki)
    .set({
      last_zakat_amount: data.amount,
      last_zakat_year: data.zakat_year,
    })
    .where(eq(muzzaki.id, data.muzzaki_id));
}
```
- **Dampak bisnis**: Muzzaki memiliki riwayat pembayaran zakat tapi tidak tercermin di profil. Laporan zakat tahunan menjadi tidak akurat. Potensi double-claim atau miss-komunikasi dengan muzzaki.
- **Rekomendasi perbaikan**: Bungkus INSERT zakat_payments + audit_log + UPDATE muzzaki dalam satu `db.transaction()`.
- **Effort estimate**: Kecil
- **Status**: Belum dikerjakan

---

### [RA0011] mosques.config JSONB tanpa validasi schema pada write
- **Severity**: 🟡 Medium
- **Lokasi**: `src/db/schema.ts` (baris 106-116)
- **Apa yang terjadi**: Kolom `config` bertipe JSONB hanya punya default value. Tidak ada mekanisme validasi struktur JSON yang masuk dari kode aplikasi. Jika ada bug di form/API, data config bisa korup tanpa terdeteksi.
- **Bukti**:
```typescript
// schema.ts:106-116
config: jsonb("config").default({
  prayer_adjustment: 2,           // numeric
  kajian_start_hour: 19,          // numeric
  zakat_fitrah_amount: 45000,     // numeric
  infaq_weekly_default: 50000,    // numeric
  stats: {
    penerima_manfaat_langsung: 2418,
    anak_asuh: 85,
    umkm_bina: 42,
  },
}),
```
- **Dampak bisnis**: Config masjid korup menyebabkan kalkulasi zakat fitrah salah, jadwal kajian kacau, stats landing page tidak akurat.
- **Rekomendasi perbaikan**: Buat helper/validation function yang memvalidasi struktur config sebelum insert/update, atau gunakan library Zod schema untuk validasi runtime.
- **Effort estimate**: Kecil
- **Status**: Belum dikerjakan

### [RA0012] Kolom wajib (NOT NULL) pada audit_logs untuk akuntabilitas
- **Severity**: 🟡 Medium
- **Lokasi**: `src/db/schema.ts` (baris 531-548)
- **Apa yang terjadi**: `audit_logs.actor_id` adalah nullable (`uuid("actor_id").references(...)` tanpa `.notNull()`). Ada beberapa panggilan audit_logs yang tidak mengirim `actor_id` — contoh di `donations.ts:93-104` tidak menyertakan `actor_id`. Ini membuat audit trail tidak bisa di-trace ke pengguna spesifik.
- **Bukti**:
```typescript
// donations.ts:93-104 — tanpa actor_id!
await tx.insert(audit_logs).values({
  mosque_id: data.mosque_id,
  action: "insert",
  entity_type: "donations",
  entity_id: row.id,
  metadata: { ... },
  // ← actor_id tidak dikirim!
});
```
```typescript
// schema.ts:533 — actor_id nullable
actor_id: uuid("actor_id").references(() => profiles.id),  // ← tanpa .notNull()
```
- **Dampak bisnis**: Tidak bisa diaudit siapa yang mencatat donasi (terutama donasi tunai oleh admin). Potensi fraud tidak terdeteksi.
- **Rekomendasi perbaikan**: Jadikan `actor_id` sebagai `NOT NULL` di schema. Pastikan semua kode yang insert audit_logs mengirim `actor_id` dari `requireAuth()`.
- **Effort estimate**: Kecil
- **Status**: Belum dikerjakan

### [RA0013] File migrasi duplikat: 0000_initial.sql dan 0000_good_machine_man.sql
- **Severity**: 🟢 Low
- **Lokasi**: `src/db/migrations/0000_initial.sql` dan `src/db/migrations/0000_good_machine_man.sql`
- **Apa yang terjadi**: Dua file dengan nomor 0000 — yang satu adalah SQL manual awal (`0000_initial.sql`) dan yang satu lagi adalah Drizzle-generated (`0000_good_machine_man.sql`). Hanya `0000_good_machine_man` yang tercatat di `_journal.json`. File manual menjadi dead code.
- **Bukti**:
```
📁 migrations/
├── 0000_initial.sql           ← SQL manual (530 baris) — TIDAK di journal
├── 0000_good_machine_man.sql  ← Drizzle-generated (363 baris) — DI journal
├── 0004_rls_security.sql.bak  ← Backup, tidak dijalankan
...
```
- **Dampak bisnis**: Kebingungan developer baru. Risiko menjalankan file yang salah saat migrasi manual.
- **Rekomendasi perbaikan**: Hapus `0000_initial.sql` dan `0004_rls_security.sql.bak` karena tidak terdaftar di journal.
- **Effort estimate**: Kecil
- **Status**: Belum dikerjakan

---

### [RA0014] Tidak ada integritas referensial antara loan_applications dengan loans
- **Severity**: 🟢 Info
- **Lokasi**: `src/db/schema.ts` (baris 400)
- **Apa yang terjadi**: `loan_applications.converted_loan_id` mereferensi `loans.id` (valid FK), tapi tidak ada mekanisme yang mencegah 1 loan_applications dikonversi ke multiple loans. Juga tidak ada constraint unique `(converted_loan_id)` untuk memastikan 1:1 mapping.
- **Bukti**:
```typescript
// schema.ts:400
converted_loan_id: uuid("converted_loan_id").references(() => loans.id),
```
- **Dampak bisnis**: Satu pengajuan bisa dikonversi ke >1 pinjaman. Double-claim. Risiko fraud.
- **Rekomendasi perbaikan**: Tambahkan unique constraint: `unique("loan_apps_conversion_unique").on(t.converted_loan_id)` — pastikan 1 loan hanya berasal dari 1 pengajuan.
- **Effort estimate**: Kecil
- **Status**: Belum dikerjakan

### [RA0015] createTransaction tidak menggunakan transaction wrapper
- **Severity**: 🟢 Low
- **Lokasi**: `src/lib/actions/transactions.ts` (baris ~113-159)
- **Apa yang terjadi**: Fungsi `createTransaction` melakukan INSERT ke `transactions` lalu INSERT ke `audit_logs` secara sequential tanpa `db.transaction()`. Jika audit_logs gagal, transaksi tetap tersimpan tanpa jejak audit.
- **Bukti**:
```typescript
// transactions.ts:125-156 — tanpa transaction wrapper
const [row] = await db.insert(transactions).values({...}).returning();
// ← gap: jika ini gagal di baris 149...
await db.insert(audit_logs).values({...});  // ← audit log bisa gagal
```
- **Dampak bisnis**: Transaksi keuangan tercatat tanpa audit log. Sulit di-reconcile.
- **Rekomendasi perbaikan**: Bungkus dalam `db.transaction(async (tx) => { ... })`.
- **Effort estimate**: Kecil
- **Status**: Belum dikerjakan

---

## RINGKASAN EKSEKUTIF

| Kategori | Temuan | Severitas |
|----------|--------|-----------|
| **Race Condition** | payInstallment total_paid lost update (RA0001) | 🔴 Critical |
| **Atomicity** | createLoanRestructure tanpa transaksi (RA0002) | 🔴 Critical |
| **Data Security** | NIK plaintext di loan_applications (RA0003) | 🔴 Critical |
| **Multi-tenant** | createLoanInstallment bypass RBAC (RA0004) | 🔴 Critical |
| **Config** | DATABASE_URL tanpa validasi (RA0005) | 🔴 Critical |
| **Performance** | Missing partial indexes soft-delete (RA0006) | 🟡 High |
| **Performance** | Missing index due_date overdue (RA0007) | 🟡 High |
| **Integritas Data** | transactions.type free text (RA0008) | 🟡 High |
| **DevOps** | Migration numbering chaos (RA0009) | 🟡 High |
| **Atomicity** | createZakatPayment tanpa transaksi (RA0010) | 🟡 High |
| **Schema** | JSONB tanpa validasi (RA0011) | 🟡 Medium |
| **Akuntabilitas** | audit_logs.actor_id nullable (RA0012) | 🟡 Medium |
| **Maintenance** | File migrasi duplikat (RA0013) | 🟢 Low |
| **Integritas** | loan_applications → loans 1:N mapping (RA0014) | 🟢 Info |
| **Atomicity** | createTransaction tanpa wrapper (RA0015) | 🟢 Low |

### Prioritas Perbaikan (Urutan Rekomendasi)

1. 🔴 **RA0003** — Encrypt NIK yang ada, hapus kolom `nik` plaintext
2. 🔴 **RA0001** — Fix race condition payInstallment
3. 🔴 **RA0002** — Bungkus restructure dalam transaction
4. 🔴 **RA0004** — Tambah RBAC check di createLoanInstallment
5. 🔴 **RA0005** — Validasi DATABASE_URL
6. 🟡 **RA0009** — Bersihkan kekacauan migrasi (reset journal)
7. 🟡 **RA0010** — Transaction wrapper di zakat-payments
8. 🟡 **RA0006** — Partial indexes soft delete
9. 🟡 **RA0007** — Index due_date
10. Sisanya sesuai effort

### Yang SUDAH BAIK
- ✅ Prinsip bigint untuk uang (tanpa float rounding)
- ✅ Monitoring soft-delete pattern konsisten di semua tabel (deleted_at)
- ✅ Idempotency key pada donations, zakat_payments, affiliate_sales
- ✅ Fungsi `is_member_of()` SECURITY DEFINER (fix RLS chicken-and-egg)
- ✅ Auto-profile trigger untuk new signups
- ✅ Updated_at trigger otomatis (via SQL trigger di DB side — jangan lupa verifikasi masih jalan)
- ✅ Fund type + akad type classification (syariah compliance)
