# TEMUAN DATABASE — AUDIT CODEBASE `masjid-ataqwa`

> **Project:** Masjid Hub — Ekosistem Digital Masjid
> **Tanggal:** 3 Juli 2026

---

## Daftar Temuan

### [ID-032] Duplikasi Tabel Repayment vs Loan_Installments (Schema Bloat)
- **Severity**: Medium
- **Klasifikasi standar**: Database Normalization / Schema Hygiene
- **Lokasi**: `/home/ngome/GERAKAN_PEMUDA_BERDAYA/masjid-ataqwa/src/db/schema.ts` (baris 411-433 vs baris 935-949)
- **Skill sumber**: database-designer
- **Apa yang terjadi**: Di dalam `schema.ts`, terdapat dua definisi tabel yang memiliki peruntukan yang hampir sama untuk mencatat cicilan pengembalian modal Qardhul Hasan: tabel `repayments` dan tabel `loan_installments`. Di dalam codebase server actions, tabel `repayments` sama sekali tidak pernah digunakan atau di-import, sedangkan tabel yang aktif dipakai adalah `loan_installments`.
- **Bukti**:
  - Baris 411: `export const repayments = pgTable("repayments", { ... });`
  - Baris 935: `export const loan_installments = pgTable("loan_installments", { ... });`
- **Dampak bisnis**:
  - Mengakibatkan redudansi schema database, menambah ukuran data migrations, mempersulit pemeliharaan kode (maintenance), dan dapat membuat AI/developer lain bingung saat ingin menambahkan fitur baru pada alur pembayaran cicilan.
- **Rekomendasi perbaikan**:
  - Lakukan pembersihan schema dengan menghapus definisi `repayments` dari `schema.ts` dan jalankan migrasi `drizzle-kit generate` untuk men-drop tabel `repayments` dari database Postgres secara aman.
- **Effort estimate**: Kecil (<1 hari)
- **Status**: Belum dikerjakan

---

### [ID-033] Ketiadaan Index Pada Kolom Foreign Key Relasi Profil Pengguna (Missing DB Indexes)
- **Severity**: Low
- **Klasifikasi standar**: Database Performance / Query Optimization
- **Lokasi**: `/home/ngome/GERAKAN_PEMUDA_BERDAYA/masjid-ataqwa/src/db/schema.ts` (tabel `loans`, `transactions`, `donations`, `employees`, `inventaris`)
- **Skill sumber**: sql-database-assistant
- **Apa yang terjadi**: Kolom-kolom foreign key yang mereferensikan tabel `profiles.id` (seperti `loans.approved_by`, `transactions.created_by`, `donations.verified_by`, `employees.created_by`, dan `inventaris.created_by`) tidak dipasang indeks (`index`). Kolom-kolom ini sering dipakai dalam operasi `JOIN` atau filter audit untuk menampilkan siapa pembuat atau verifikator data tersebut di dashboard admin.
- **Bukti**:
  - Di `schema.ts` tabel `transactions`:
    ```typescript
    created_by: uuid("created_by").references(() => profiles.id),
    // Tidak ada index pada created_by di list index composite di bawah.
    ```
- **Dampak bisnis**:
  - Operasi query log audit atau filtering data berdasarkan pengurus tertentu akan memaksa PostgreSQL melakukan *Full Table Scan* seiring bertumbuhnya jumlah data transaksi dan log. Hal ini memicu kelambatan pemuatan halaman dashboard (data terasa lambat masuk/berubah).
- **Rekomendasi perbaikan**:
  - Tambahkan deklarasi index pada masing-masing foreign key di akhir definisi tabel di `schema.ts`:
    ```typescript
    index("transactions_created_by_idx").on(t.created_by)
    ```
- **Effort estimate**: Kecil (<1 hari)
- **Status**: Belum dikerjakan

