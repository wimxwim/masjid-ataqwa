# TEMUAN BUG — AUDIT CODEBASE `masjid-ataqwa`

> **Project:** Masjid Hub — Ekosistem Digital Masjid
> **Tanggal:** 3 Juli 2026

---

## Daftar Temuan

### [ID-029] Tidak Ada Transaction Wrapper Pada Proses Sinkronisasi Keuangan
- **Severity**: High
- **Klasifikasi standar**: ACID (Atomicity) / Data Inconsistency / Code Smell
- **Lokasi**: `/home/ngome/GERAKAN_PEMUDA_BERDAYA/masjid-ataqwa/src/app/api/midtrans/webhook/route.ts` dan `/home/ngome/GERAKAN_PEMUDA_BERDAYA/masjid-ataqwa/src/lib/actions/donations.ts`
- **Skill sumber**: code-reviewer
- **Apa yang terjadi**: Ketika pembayaran berhasil dikonfirmasi (baik lewat webhook Midtrans maupun manual via action), sistem mengupdate tabel `donations`, menyisipkan baris di `transactions` (buku besar), dan menyisipkan baris di `activity_feed`. Ketiga operasi database ini berjalan secara berurutan tanpa dibungkus dalam SQL transaction (`db.transaction`).
- **Bukti**:
  ```typescript
  // Di route.ts webhook:
  await db.update(donations).set({...}).where(...);
  if (paymentStatus === "paid") {
    await db.insert(transactions).values(...);
    await db.insert(activity_feed).values(...);
  }
  ```
- **Dampak bisnis**:
  - Jika terjadi gangguan koneksi database setelah update status donasi sukses namun sebelum pencatatan transaksi buku besar selesai, data donasi akan berstatus lunas ("paid") tetapi tidak tercatat di buku besar keuangan (Buku Besar). Hal ini memicu ketidaksesuaian hitungan kas masjid secara misterius (data missing).
- **Rekomendasi perbaikan**:
  - Gunakan `await db.transaction(async (tx) => { ... })` untuk membungkus seluruh rangkaian operasi penulisan tersebut agar jika salah satu gagal, semuanya di-rollback secara otomatis.
- **Effort estimate**: Kecil (<1 hari)
- **Status**: Belum dikerjakan

---

### [ID-030] Akumulator `total_paid` Pada Tabel `loans` Tidak Pernah Diupdate (Stale Loan Totals)
- **Severity**: Medium
- **Klasifikasi standar**: Logic Bug / Data Inconsistency
- **Lokasi**: `/home/ngome/GERAKAN_PEMUDA_BERDAYA/masjid-ataqwa/src/lib/actions/loan-installments.ts` (baris 68-98)
- **Skill sumber**: sql-database-assistant
- **Apa yang terjadi**: Fungsi `payInstallment` melakukan update pada baris tabel `loan_installments` untuk mencatat jumlah cicilan yang dibayarkan, namun tidak memiliki logika untuk memperbarui kolom `total_paid` di tabel induk `loans`.
- **Bukti**:
  ```typescript
  const [row] = await db
    .update(loan_installments)
    .set({
      amount_paid,
      paid_date: sql`CURRENT_DATE`,
      status: isLunas ? "paid" : "late",
    })
    .where(eq(loan_installments.id, id))
    .returning();
  // Tidak ada update ke tabel loans untuk menambahkan amount_paid ke total_paid.
  ```
- **Dampak bisnis**:
  - Kolom `total_paid` di tabel `loans` akan selalu bernilai 0 atau tidak sinkron meskipun nasabah/mustahik sudah membayar cicilan mereka hingga lunas. Hal ini merusak laporan performa pinjaman (NPF, kolektibilitas) dan dashboard analitik Bank Infaq.
- **Rekomendasi perbaikan**:
  - Jalankan operasi update tambahan di dalam transaksi yang sama untuk mengupdate `total_paid` di tabel `loans` ketika cicilan dibayarkan.
- **Effort estimate**: Kecil (<1 hari)
- **Status**: Belum dikerjakan

---

### [ID-031] Kegagalan Eksekusi Linter Akibat Ketiadaan File eslint.config.js
- **Severity**: Low
- **Klasifikasi standar**: Developer Experience (DX) / Code Quality
- **Lokasi**: Root directory (ketiadaan file konfigurasi ESLint)
- **Skill sumber**: code-reviewer
- **Apa yang terjadi**: Dependensi ESLint menggunakan versi 9.x yang mewajibkan format Flat Config (`eslint.config.js`). Namun di dalam proyek tidak tersedia file konfigurasi tersebut, sehingga perintah `npm run lint` gagal total dengan exit code 2.
- **Bukti**:
  ```
  ESLint couldn't find an eslint.config.(js|mjs|cjs) file.
  From ESLint v9.0.0, the default configuration file is now eslint.config.js.
  ```
- **Dampak bisnis**:
  - CI/CD build atau proses pengecekan kualitas kode otomatis oleh tim/AI developer lain akan terhambat dan mengalami error, menyulitkan pendeteksian dini terhadap bug sintaksis.
- **Rekomendasi perbaikan**:
  - Buat file `eslint.config.mjs` di root dengan konfigurasi extend dari `eslint-config-next` versi 15/16.
- **Effort estimate**: Kecil (<1 hari)
- **Status**: Belum dikerjakan

