# TEMUAN UI MOBILE — AUDIT CODEBASE `masjid-ataqwa`

> **Project:** Masjid Hub — Ekosistem Digital Masjid
> **Tanggal:** 3 Juli 2026

---

## Daftar Temuan

### [ID-035] Tampilan Tabel Mustahik Terlalu Padat dan Melebar di Perangkat Mobile (Missing Mobile-Optimized Layout)
- **Severity**: Medium
- **Klasifikasi standar**: WCAG 2.2 Success Criterion 1.4.10 (Reflow) / Mobile UX Best Practice
- **Lokasi**: `/home/ngome/GERAKAN_PEMUDA_BERDAYA/masjid-ataqwa/src/components/MustahikTable.tsx` (baris 139-176)
- **Skill sumber**: sleek-design-mobile-apps
- **Apa yang terjadi**: Komponen tabel mustahik menampilkan seluruh kolom data (Nama, Asnaf, Program, NIM, Ring, Desil, Had Kifayah, Aksi) pada semua ukuran layar. Meskipun tabel diletakkan dalam kontainer `overflow-x-auto`, memaksa pengguna mobile melakukan scroll horizontal yang panjang untuk membaca data adalah UX yang buruk.
- **Bukti**:
  - Di `MustahikTable.tsx`:
    ```typescript
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        ...
        {/* Tidak ada kelas responsif seperti hidden md:table-cell untuk menyembunyikan kolom sekunder di layar kecil */}
    ```
- **Dampak bisnis**:
  - Admin/pemuda masjid yang memantau atau mengentri data di lapangan menggunakan HP/tablet akan kesulitan melihat data secara ringkas, menurunkan produktivitas pengolahan data mustahik.
- **Rekomendasi perbaikan**:
  - Sembunyikan kolom sekunder (seperti NIM, Desil, Had Kifayah) pada layar kecil menggunakan kelas utility Tailwind (`hidden md:table-cell`), atau gunakan layout berbasis kartu (card layout) yang menumpuk data secara vertikal khusus untuk tampilan mobile.
- **Effort estimate**: Sedang (1-3 hari)
- **Status**: Belum dikerjakan

---

### [ID-036] Ukuran Target Sentuh Tombol Aksi Terlalu Kecil & Terlalu Dekat (Touch Target Risk)
- **Severity**: Low
- **Klasifikasi standar**: WCAG 2.2 Success Criterion 2.5.8 (Target Size - Minimum)
- **Lokasi**: `/home/ngome/GERAKAN_PEMUDA_BERDAYA/masjid-ataqwa/src/components/MustahikTable.tsx` (baris 177-205)
- **Skill sumber**: sleek-design-mobile-apps
- **Apa yang terjadi**: Tombol aksi Edit (Pencil) dan Hapus (Trash2) diletakkan berdampingan dengan ukuran padding `p-1.5` dan ikon `w-4 h-4` (luas area sentuh total hanya ~28px). Di layar handphone yang kecil, tombol-tombol ini terlalu rapat sehingga rawan salah klik.
- **Bukti**:
  ```typescript
  <div className="flex items-center justify-end gap-1">
    <button onClick={...} className="p-1.5 ..."><Pencil className="w-4 h-4" /></button>
    <button onClick={...} className="p-1.5 text-red-600 ..."><Trash2 className="w-4 h-4" /></button>
  ```
- **Dampak bisnis**:
  - Admin berisiko tinggi secara tidak sengaja menekan tombol hapus (Trash2) saat berniat mengedit data mustahik (atau sebaliknya), yang memicu konfirmasi dialog yang mengganggu atau penghapusan tidak disengaja.
- **Rekomendasi perbaikan**:
  - Tingkatkan ukuran padding tombol menjadi setidaknya `p-2.5` atau pisahkan tata letaknya, serta berikan jarak/margin yang cukup (`gap-3`) di perangkat mobile.
- **Effort estimate**: Kecil (<1 hari)
- **Status**: Belum dikerjakan

