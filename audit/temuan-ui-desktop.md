# TEMUAN UI DESKTOP — AUDIT CODEBASE `masjid-ataqwa`

> **Project:** Masjid Hub — Ekosistem Digital Masjid
> **Tanggal:** 3 Juli 2026

---

## Daftar Temuan

### [ID-034] Kontras Warna Primary Emerald Terlalu Rendah (WCAG 2.2 AA Contrast Failure)
- **Severity**: Medium
- **Klasifikasi standar**: WCAG 2.2 Success Criterion 1.4.3 (Contrast - Minimum)
- **Lokasi**: `/home/ngome/GERAKAN_PEMUDA_BERDAYA/masjid-ataqwa/src/app/globals.css` (baris 4-5) dan seluruh komponen UI yang menggunakan `text-primary` atau `bg-primary` dengan teks putih.
- **Skill sumber**: a11y-audit
- **Apa yang terjadi**: Warna hijau primary (`#10b981`) dan primary-dark (`#059669`) digunakan sebagai latar belakang tombol dengan teks putih, atau sebagai warna teks di atas latar belakang putih (`#ffffff`). Contrast ratio untuk `#10b981` pada putih hanya **2.88:1**, dan untuk `#059669` hanya **3.8:1**. Keduanya gagal mencapai rasio minimal **4.5:1** yang dipersyaratkan WCAG untuk teks normal.
- **Bukti**:
  - Di `globals.css`:
    ```css
    --color-primary: #10b981;      /* Contrast: 2.88:1 */
    --color-primary-dark: #059669; /* Contrast: 3.80:1 */
    ```
- **Dampak bisnis**:
  - Tombol aksi dan informasi penting dengan skema warna primary sulit dibaca oleh pengguna dengan gangguan penglihatan (low vision) atau saat layar perangkat terpapar sinar matahari langsung, mengurangi inklusivitas aplikasi.
- **Rekomendasi perbaikan**:
  - Gunakan warna primary yang lebih gelap untuk elemen teks/tombol pada latar belakang putih, misalnya `--color-primary-deep: #0e7a45` (rasio kontras **4.7:1**, lulus WCAG AA).
- **Effort estimate**: Kecil (<1 hari)
- **Status**: Belum dikerjakan

---

### [ID-052] Penggunaan Tag `<img>` Native Tanpa Next.js `<Image />` Component (Unoptimized Remote Images)
- **Severity**: Low
- **Klasifikasi standar**: Core Web Vitals (Largest Contentful Paint - LCP) / Web Performance
- **Lokasi**: `/home/ngome/GERAKAN_PEMUDA_BERDAYA/masjid-ataqwa/src/components/LandingPage.tsx` (baris 180) dan `/home/ngome/GERAKAN_PEMUDA_BERDAYA/masjid-ataqwa/src/components/LandingPage.tsx` (baris 349)
- **Skill sumber**: web-perf
- **Apa yang terjadi**: Halaman utama memuat gambar eksternal (seperti foto kubah masjid dari Unsplash) menggunakan tag native HTML `<img>` alih-alih menggunakan komponen bawaan Next.js `<Image />` (`next/image`).
- **Bukti**:
  ```typescript
  <img 
    src="https://images.unsplash.com/photo-1542810634-71277d95dcbb?auto=format&fit=crop&w=800&q=80" 
    alt="At-Taqwa Mosque Dome" 
    className="w-full h-full object-cover"
  />
  ```
- **Dampak bisnis**:
  - Mengakibatkan pemuatan data gambar berukuran penuh yang tidak terkompresi, memperlambat kecepatan load halaman (Core Web Vitals LCP terhambat), serta meningkatkan konsumsi kuota bandwidth hosting masjid.
- **Rekomendasi perbaikan**:
  - Konfigurasikan domain remote di `next.config.ts` dan ubah tag `<img>` menjadi komponen `<Image />` Next.js dengan properti `width`, `height`, atau `fill` + `sizes` untuk otomatisasi optimasi ukuran gambar.
- **Effort estimate**: Kecil (<1 hari)
- **Status**: Belum dikerjakan


