# 📱 TEMUAN AUDIT MOBILE RESPONSIVENESS — Masjid At-Taqwa Ulujami

> **⚠️ DEPLOY TARGET: VERCEL** — Commit & deploy via Vercel (`wimxgooo-3751`). Git push → Vercel auto-deploy production. Cloudflare Workers sebagai fallback saja.

**Tanggal:** 3 Juli 2026
**Total temuan:** 11

---

### [MOB-001] 🔴 Admin sidebar tidak memiliki responsive breakpoint — konten hancur di mobile
- **Severity**: Critical
- **Klasifikasi standar**: WCAG 2.2 1.4.10 Reflow
- **Lokasi**: `app/(admin)/layout.tsx` baris 15-130
- **Apa yang terjadi**: Layout admin menggunakan sidebar statis dengan lebar `w-64` yang selalu dirender tanpa mekanisme toggle/sembunyi di layar kecil. Pada viewport 375px (iPhone SE), sidebar 256px menyisakan hanya ~119px untuk konten utama, menyebabkan teks dan tabel overflow horizontal.
- **Bukti**:
  ```tsx
  // app/(admin)/layout.tsx:15-18 — sidebar selalu dirender
  <aside className="w-64 bg-primary-deep text-white flex flex-col ...">
    // 17+ nav items, selalu terlihat
  </aside>
  // Tidak ada lg:hidden atau md:hidden, tidak ada mobile hamburger toggle
  // Konten utama hanya mendapat flex-1 (sisa setelah w-64)
  <main className="flex-1 bg-bg min-h-screen overflow-x-auto">
    // Pada 375px: 375 - 256 = 119px untuk konten
    // Tabel Buku Kas (min-width ~600px) overflow horizontal
  </main>
  ```
- **Dampak bisnis**: Admin (pengurus masjid) yang mengakses panel via smartphone tidak bisa menggunakan aplikasi. Fitur CRUD mustahik, buku kas, dan GIS tidak bisa dioperasikan dari mobile — meskipun 70%+ trafik web Indonesia berasal dari mobile.
- **Rekomendasi perbaikan**:
  1. Bungkus sidebar dalam drawer off-canvas: `fixed left-0 top-0 z-50 h-screen` dengan state open/close
  2. Tambahkan hamburger button di top bar saat viewport < `lg`
  3. Overlay backdrop saat sidebar terbuka
  4. Animasi transisi: `translate-x-0` (open) / `-translate-x-full` (closed)
- **Effort estimate**: Besar (refactor layout admin, perlu state management sidebar, testing mobile flow)
- **Status**: Belum dikerjakan

---

### [MOB-002] 🔴 Touch target tombol +/- di keranjang hanya ~22px — gagal WCAG minimum 24x24
- **Severity**: High
- **Klasifikasi standar**: WCAG 2.2 2.5.8 Target Size (Minimum)
- **Lokasi**: `GlobalOverlays.tsx` baris 88-95
- **Apa yang terjadi**: Tombol increment/decrement quantity barang di drawer keranjang menggunakan `p-1` dengan icon `w-3.5 h-3.5` dan area klik efektif hanya ~22x22px. Ini di bawah threshold WCAG 2.5.8 (minimum 24x24px).
- **Bukti**:
  ```tsx
  // GlobalOverlays.tsx:88-95
  <button
    onClick={() => handleDecrement(index)}
    className="p-1 border rounded-lg hover:bg-bg transition-colors"
  >
    <Minus className="w-3.5 h-3.3 text-muted" />
  </button>
  // p-1 = 4px padding. 4 + 14 (icon w-3.5) + 4 = 22px total
  ```
- **Dampak bisnis**: Pengguna dengan jari besar atau motorik halus terbatas (tremor) kesulitan menekan tombol quantity. Produk di BUMM susah diatur qty-nya. Drop-off funnel checkout meningkat.
- **Rekomendasi perbaikan**: Ganti `p-1` menjadi `p-1.5` (24px total) atau gunakan `min-w-[44px] min-h-[44px]` (WCAG recommend 44x44 untuk mobile). Icon diperbesar ke `w-4 h-4`.
- **Effort estimate**: Kecil (1 file, 2 tombol)
- **Status**: Belum dikerjakan

---

### [MOB-003] 🔴 Tabel Buku Kas tidak memiliki responsive pattern untuk layar kecil
- **Severity**: High
- **Klasifikasi standar**: WCAG 2.2 1.4.10 Reflow
- **Lokasi**: `TransparansiPage.tsx` baris 165-205
- **Apa yang terjadi**: Tabel keuangan menggunakan `overflow-x-auto` tetapi kolom-kolom tidak di-prioritaskan. Pada mobile, user harus scroll horizontal untuk membaca baris: nama transaksi, sumber dana, jumlah, tanggal. Tidak ada kolom stacking/collapse untuk prioritas informasi.
- **Bukti**:
  ```tsx
  // TransparansiPage.tsx:165-205
  <table className="w-full text-sm">
    <thead>
      <tr className="border-b border-outline ...">
        <th className="text-left py-3 px-4">Deskripsi</th>
        <th className="text-right py-3 px-4">Jumlah</th>
        <th className="text-center py-3 px-4">Sumber</th>
        <th className="text-right py-3 px-4">Tanggal</th>
      </tr>
    </thead>
    // 4 kolom lebar, di mobile < 375px dengan sidebar admin (119px) = tiap kolom < 30px
  ```
- **Dampak bisnis**: Laporan keuangan tidak bisa dibaca di mobile. Donatur yang ingin transparansi tidak bisa melihat rincian.
- **Rekomendasi perbaikan**: Gunakan card layout untuk mobile (setiap baris jadi card terpisah) — kolom kiri: deskripsi + tanggal, kolom kanan: jumlah. Atau gunakan `display: grid` yang collapse ke 2 kolom di mobile. Alternatif: stacked table pattern dengan pseudo-elements sebagai label.
- **Effort estimate**: Sedang (2-3 tabel: Transparansi, OverviewTab, BukuKas)
- **Status**: Belum dikerjakan

---

### [MOB-004] 🟡 Header sticky `h-20` memakan ~80px dari viewport mobile
- **Severity**: Medium
- **Klasifikasi standar**: —
- **Lokasi**: `Header.tsx` baris 38-72
- **Apa yang terjadi**: Header sticky dengan tinggi `h-20` (80px) dan padding tambahan (`py-3` ~12px) selalu terlihat. Pada iPhone SE (viewport 667px), header memakan ~12% dari tinggi layar. Konten hero di LandingPage (550px) harus di-scroll untuk dilihat.
- **Bukti**:
  ```tsx
  // Header.tsx:38
  <header className="sticky top-0 z-50 bg-surface/95 backdrop-blur-sm border-b border-outline h-20 ...">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
      // Logo + navigation items
    </div>
  </header>
  ```
- **Dampak bisnis**: Pengunjung mobile harus scroll untuk melihat hero section — mengurangi engagement dengan CTA utama (Donasi Sekarang). Bounce rate lebih tinggi.
- **Rekomendasi perbaikan**: Turunkan `h-20` menjadi `h-16` di mobile (`h-20 sm:h-16 lg:h-20`). Kurangi padding vertikal logo dan nav items. Pastikan CTA hero muncul di atas fold.
- **Effort estimate**: Kecil
- **Status**: Belum dikerjakan

---

### [MOB-005] 🟡 Statistik Landing Page — layout `grid-cols-2` tanpa stretch di mobile
- **Severity**: Medium
- **Klasifikasi standar**: —
- **Lokasi**: `LandingPage.tsx` baris 211-250
- **Apa yang terjadi**: Grid statistik menggunakan `grid-cols-2` di mobile tetapi tinggi card tidak seragam jika konten tidak sama panjang. Card terakhir di baris pertama mungkin punya tinggi berbeda dari tetangganya, menyebabkan whitespace tidak rapi.
- **Bukti**:
  ```tsx
  // LandingPage.tsx:211
  <div className="grid grid-cols-2 lg:grid-cols-4 gap-0 divide-y-2 lg:divide-y-0 lg:divide-x-2 divide-outline">
    // Card statistik tanpa h-full atau items-stretch
  </div>
  ```
  Tidak ada `items-stretch` atau `h-full` pada child card, jadi tinggi card ditentukan oleh konten saja.
- **Dampak bisnis**: Tampilan kurang rapi, memberi kesan kurang profesional di mata donatur potensial.
- **Rekomendasi perbaikan**: Tambahkan `items-stretch` pada grid atau `h-full` pada setiap card statistik.
- **Effort estimate**: Kecil
- **Status**: Belum dikerjakan

---

### [MOB-006] 🟡 Modal (Bank Infaq, Checkout, Mustahik) tidak memiliki perilaku scroll-aware bottom sheet di mobile
- **Severity**: Medium
- **Klasifikasi standar**: WCAG 2.2 1.4.10 Reflow
- **Lokasi**: `BankInfaqPage.tsx` (baris ~550-620), `GlobalOverlays.tsx` (baris ~98-180), `MustahikTable.tsx` (baris ~220-290)
- **Apa yang terjadi**: Modal menggunakan `modal-box` dengan `max-w-lg` (512px). Pada viewport 375px, modal memenuhi >100% lebar tanpa margin. Konten panjang (form 3-step Bank Infaq) mengharuskan scroll di dalam modal yang sempit, tanpa background dismiss atau drag-to-close pattern native mobile.
- **Bukti**:
  ```tsx
  // BankInfaqPage.tsx:550
  <dialog className="modal" ref={appModalRef} ...>
    <div className="modal-box max-w-lg max-h-[95vh] overflow-y-auto rounded-2xl">
      // Form 3-step dengan banyak input
    </div>
  </dialog>
  ```
  Tidak ada backdrop blur, tidak ada gaya bottom sheet (`items-end`), tidak ada drag handle.
- **Dampak bisnis**: Pengalaman isi aplikasi pinjaman di mobile buruk. Pengguna bisa frustrasi dan tidak melanjutkan aplikasi.
- **Rekomendasi perbaikan**: Untuk mobile, gunakan bottom sheet style (`modal-bottom sm:modal-middle` di DaisyUI) dengan drag handle bar visual. Pastikan ada backdrop dismiss yang jelas.
- **Effort estimate**: Sedang (3-4 modal di berbagai komponen)
- **Status**: Belum dikerjakan

---

### [MOB-007] 🟡 Filter GIS mustahik — ring selector tidak memiliki label aksesibel
- **Severity**: Medium
- **Klasifikasi standar**: WCAG 2.2 4.1.2 Name, Role, Value
- **Lokasi**: `GisPage.tsx` baris 172-185, 195-215
- **Apa yang terjadi**: Dropdown dan select untuk filter ring/desil mustahik menggunakan elemen native tanpa `aria-label`. Di mobile, label di atas dropdown memudar (text-sm text-muted) dan mudah terlewat.
- **Bukti**:
  ```tsx
  // GisPage.tsx:172-185
  <label className="block text-xs text-muted font-medium mb-1">Ring</label>
  <select value={selectedRing} onChange={...} className="w-full bg-white border ... py-2 text-xs">
    <option value="">Semua Ring</option>
    <option value="Ring 1">Ring 1 — Prioritas Utama</option>
  </select>
  ```
- **Dampak bisnis**: Pengguna screen reader tidak bisa mengoperasikan filter GIS. Data pemetaan mustahik tidak bisa di-filter.
- **Rekomendasi perbaikan**: Tambahkan `aria-label` pada setiap `<select>`.
- **Effort estimate**: Kecil
- **Status**: Belum dikerjakan

---

### [MOB-008] 🟡 Dashboard admin — grafik donut di OverviewTab tidak responsif di mobile
- **Severity**: Medium
- **Klasifikasi standar**: WCAG 2.2 1.4.10 Reflow
- **Lokasi**: `OverviewTab.tsx` baris 250-270
- **Apa yang terjadi**: Recharts PieChart menggunakan `ResponsiveContainer` yang secara teknis responsif, namun layout grid sekitarnya (`grid-cols-1 md:grid-cols-2`) membuat chart berukuran penuh. Di mobile dengan sidebar (MASALAH MOB-001), ruang yang tersisa ~119px, membuat chart donut menjadi sangat kecil (< 100x100px) sehingga tidak terbaca.
- **Bukti**:
  ```tsx
  // OverviewTab.tsx:250
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
    <div className="bg-surface border border-outline rounded-xl p-4 sm:p-6">
      <h3 className="font-semibold text-ink mb-4">Distribusi Penerimaan</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>...</PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  ```
- **Dampak bisnis**: Admin tidak bisa membaca breakdown distribusi penerimaan dana dari mobile.
- **Rekomendasi perbaikan**: Di mobile, ganti chart visual dengan stacked horizontal bar atau tabel angka sederhana yang lebih readable di layar sempit.
- **Effort estimate**: Sedang (perlu conditional rendering chart vs tabel berdasarkan viewport)
- **Status**: Belum dikerjakan

---

### [MOB-009] 🟢 Loading states — tidak ada skeleton loader di mobile yang bandwidth-sensitif
- **Severity**: Low
- **Klasifikasi standar**: —
- **Lokasi**: `LandingPage.tsx`, `TransparansiPage.tsx`, `BummPage.tsx`, `DashboardPage.tsx`
- **Apa yang terjadi**: Semua data fetching menggunakan React Query tanpa komponen `<Skeleton>` atau loading placeholder. Di koneksi lambat (3G mobile, umum di Indonesia), user melihat blank page/layout kosong sampai data terisi, tanpa indikasi bahwa konten sedang dimuat.
- **Bukti**:
  ```tsx
  // LandingPage.tsx:47-68
  // Tidak ada: if (isLoading) return <Skeleton />
  return (
    <div>
      <HeroSection stats={stats} />
      <StatsTicker stats={stats} />
      // Jika stats null (loading), hero menampilkan Rp 0 — confusing
    </div>
  )
  ```
- **Dampak bisnis**: Pengguna 3G (mayoritas Indonesia) melihat halaman kosong atau data nol — mengira website error, lalu meninggalkan situs. Bounce rate tinggi.
- **Rekomendasi perbaikan**: Tambahkan skeleton loader untuk setiap section. Gunakan `h-` proporsional (h-96 untuk hero, h-32 untuk grid). Pastikan skeleton tidak menyebabkan layout shift (beri ukuran tetap).
- **Effort estimate**: Besar (hampir semua komponen publik perlu skeleton)
- **Status**: Belum dikerjakan

---

### [MOB-010] 🟢 Button `py-3 px-4` di tab zakat — area tap bisa lebih lebar
- **Severity**: Low
- **Klasifikasi standar**: WCAG 2.2 2.5.8 Target Size (Minimum)
- **Lokasi**: `ZakatPage.tsx` baris 188-213
- **Apa yang terjadi**: Tab button (Mal/Profesi/Infaq) memiliki `py-3 px-4` yang sudah memadai (~48x~variable px) untuk tinggi, namun touch target horizontal antar tab sangat rapat (tanpa gap) — pengguna mobile riskan salah tap tab sebelah.
- **Bukti**:
  ```tsx
  // ZakatPage.tsx:188
  <div className="flex bg-bg rounded-xl p-1.5">
    <button className={`flex-1 py-3 px-4 ...`}>Zakat Mal</button>
    <button className={`flex-1 py-3 px-4 ...`}>Zakat Profesi</button>
    <button className={`flex-1 py-3 px-4 ...`}>Infaq</button>
  </div>
  ```
  Tidak ada `gap-` antar button, hanya `p-1.5` di container yang memberikan sedikit jarak.
- **Dampak bisnis**: Pengguna mobile salah pilih jenis zakat, input ulang, frustrasi.
- **Rekomendasi perbaikan**: Tambahkan `gap-1` atau pastikan `p-1.5` cukup sebagai buffer antar tombol. Gunakan `rounded-lg` di tombol individual untuk visual separation yang jelas.
- **Effort estimate**: Kecil
- **Status**: Belum dikerjakan

---

### [MOB-011] 🟢 Grid produk BUMM — `grid-cols-2` di mobile menyebabkan card terlalu sempit untuk informasi
- **Severity**: Low
- **Klasifikasi standar**: —
- **Lokasi**: `BummPage.tsx` baris 140-175
- **Apa yang terjadi**: Grid produk menggunakan `grid-cols-2` di mobile tanpa breakpoint `sm:grid-cols-2 lg:grid-cols-3`. Pada viewport 320-375px, tiap card produk hanya ~150px lebar — cukup sempit untuk menampilkan nama produk (terpotong), harga (tertumpuk), dan gambar (kecil).
- **Bukti**:
  ```tsx
  // BummPage.tsx:140
  <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
    // card produk dengan Image (aspect-video ~150x84px di mobile)
  </div>
  ```
  Nama produk panjang wrapping ke 2-3 baris di mobile.
- **Dampak bisnis**: Produk BUMM tidak terlihat menarik di mobile. Pengguna enggan membeli karena informasi tidak jelas.
- **Rekomendasi perbaikan**: Gunakan `grid-cols-1` di viewport terkecil (xs), lalu `sm:grid-cols-2`. Atau kurangi jumlah informasi yang ditampilkan di card mobile. Potong nama produk dengan line-clamp-2.
- **Effort estimate**: Kecil
- **Status**: Belum dikerjakan
