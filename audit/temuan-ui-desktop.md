# 🖥️ TEMUAN AUDIT UI — Desktop

> **⚠️ DEPLOY TARGET: VERCEL** — Commit & deploy via Vercel (`wimxgooo-3751`). Git push → Vercel auto-deploy production. Cloudflare Workers sebagai fallback saja.

**Proyek:** Masjid Hub — Masjid At-Taqwa Ulujami
**Tanggal:** 3 Juli 2026
**Total temuan:** 12

---

### [UI-001] Kontras rendah — teks `text-gray-400` pada latar putih
- **Severity**: High
- **Klasifikasi standar**: WCAG 2.2 1.4.3 Contrast Minimum (Minimum 4.5:1)
- **Lokasi**: Seluruh komponen (`LandingPage.tsx`, `TransparansiPage.tsx`, `ZakatPage.tsx`, `BummPage.tsx`, dll)
- **Apa yang terjadi**: Warna `text-gray-400` (#9ca3af) pada latar `bg-white` (#ffffff) menghasilkan rasio kontras ~3.1:1, jauh di bawah minimum WCAG AA (4.5:1). Ini dipakai untuk label statistik, teks deskriptif kecil, dan metadata di banyak halaman.
- **Bukti**:
  ```tsx
  // LandingPage.tsx baris 211, 225, 239, dst:
  <p className="text-xs text-gray-500 font-medium">Terkumpul Tahun Ini</p>
  // LandingPage.tsx baris 320:
  <p className="text-gray-500 max-w-2xl mx-auto text-sm sm:text-base">
  // LandingPage.tsx baris 530:
  <p className="text-[11px] text-gray-400 text-center leading-relaxed font-sans">
  ```
- **Dampak bisnis**: Pengguna dengan gangguan penglihatan (low vision) atau monitor kurang kalibrasi kesulitan membaca label penting. Menurunkan kepercayaan terhadap laporan keuangan yang seharusnya transparan.
- **Rekomendasi perbaikan**: Ganti `text-gray-400` dengan `text-gray-600` (#4b5563) untuk teks kecil, dan `text-gray-500` (#6b7280) untuk teks normal. Pastikan semua teks informasi minimal `text-gray-600` pada latar putih.
- **Effort estimate**: Sedang (perlu grepping + perubahan di banyak file)
- **Status**: Belum dikerjakan

---

### [UI-002] Tombol ikon tanpa `aria-label` — aksesibilitas keyboard terbatas
- **Severity**: High
- **Klasifikasi standar**: WCAG 2.2 4.1.2 Name, Role, Value (untuk tombol ikon tanpa label)
- **Lokasi**: `Header.tsx` (baris ~90, ~130, ~142), `MustahikTable.tsx` (baris ~178-206), `GlobalOverlays.tsx` (baris ~52-56)
- **Apa yang terjadi**: Tombol yang hanya menampilkan ikon (LogOut, ShoppingCart, X, Minus, Plus, Pencil, Trash2, MapPin) tidak memiliki `aria-label`. Pengguna screen reader tidak tahu fungsi tombol.
- **Bukti**:
  ```tsx
  // Header.tsx:90 — tombol logout hanya ikon
  <button onClick={logout} className="p-1.5 text-muted ..." title="Logout">
    <LogOut className="w-4 h-4" />
  </button>
  // Header.tsx:142 — hamburger toggle tanpa aria
  <button onClick={() => setMobileOpen(!mobileOpen)} className="p-2 ...">
    {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
  </button>
  // MustahikTable.tsx:189 — edit, delete, map buttons tanpa aria-label
  <button onClick={() => { setEditing(m); ... }} className="p-2.5 ..." title="Edit">
    <Pencil className="w-4 h-4" />
  </button>
  ```
- **Dampak bisnis**: Pengguna buta atau low-vision yang mengandalkan screen reader tidak bisa mengoperasikan panel admin, keranjang, atau navigasi. Di Indonesia, terdapat ~3 juta penyandang disabilitas netra.
- **Rekomendasi perbaikan**: Tambahkan `aria-label` pada semua tombol ikon. Contoh: `aria-label="Logout"`, `aria-label="Buka menu navigasi"`, `aria-label="Edit mustahik"`. Manfaatkan atribut `title` yang sudah ada sebagai fallback tetapi `aria-label` tetap wajib.
- **Effort estimate**: Sedang (~20-25 tombol di seluruh komponen)
- **Status**: Belum dikerjakan

---

### [UI-003] Mobile menu toggle tidak memiliki `aria-expanded` / `aria-controls`
- **Severity**: Medium
- **Klasifikasi standar**: WCAG 2.2 4.1.2 (Name, Role, Value) + ARIA Authoring Practices
- **Lokasi**: `Header.tsx` baris ~140-146
- **Apa yang terjadi**: Tombol hamburger (`#header-mobile-toggle`) tidak mengomunikasikan state ekspansi menu ke assistive technology. Pengguna screen reader tidak tahu apakah menu sedang terbuka atau tertutup.
- **Bukti**:
  ```tsx
  // Header.tsx:140-146
  <button
    onClick={() => setMobileOpen(!mobileOpen)}
    className="p-2 text-muted hover:bg-bg rounded-lg"
    id="header-mobile-toggle"
  >
    {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
  </button>
  ```
- **Dampak bisnis**: Sama seperti UI-002 — menghambat aksesibilitas bagi pengguna screen reader.
- **Rekomendasi perbaikan**: Tambahkan `aria-expanded={mobileOpen}`, `aria-controls="mobile-menu-drawer"`, dan `aria-label="Menu navigasi"`.
- **Effort estimate**: Kecil (1 file, 1 tombol)
- **Status**: Belum dikerjakan

---

### [UI-004] Focus indicator tidak terlihat pada beberapa elemen interaktif
- **Severity**: Medium
- **Klasifikasi standar**: WCAG 2.2 2.4.7 Focus Visible
- **Lokasi**: `LandingPage.tsx` (baris ~160-174, hero CTA), `ZakatPage.tsx` (baris ~188-213 tab switcher), `BummPage.tsx` (baris ~151-163 filter tabs)
- **Apa yang terjadi**: Beberapa tombol kustom menggunakan `focus:outline-none` atau `focus:outline-hidden` tanpa menyediakan `focus-visible:ring` atau fallback visual. Pengguna keyboard tidak bisa melihat elemen mana yang sedang aktif (focused).
- **Bukti**:
  ```tsx
  // ZakatPage.tsx:188 — tab zakat, menggunakan focus:outline-none tanpa ring fallback
  className={`flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all ${
    activeTab === "mal" ? "bg-surface text-primary shadow-md" : "text-muted hover:text-emerald-700"
  }`}
  // LandingPage.tsx:160 — hero CTA buttons tanpa focus ring
  className="w-full sm:w-auto bg-amber-500 hover:bg-amber-600 ..."
  ```
- **Dampak bisnis**: Pengguna navigasi keyboard (termasuk pengguna dengan motor impairment) tidak bisa menggunakan website secara efektif.
- **Rekomendasi perbaikan**: Hapus `focus:outline-none` dan ganti dengan `focus-visible:ring-2 focus-visible:ring-primary/50` pada semua tombol interaktif.
- **Effort estimate**: Sedang (tersebar di banyak file)
- **Status**: Belum dikerjakan

---

### [UI-005] Admin sidebar tidak memiliki breadcrumb navigasi
- **Severity**: Low
- **Klasifikasi standar**: —
- **Lokasi**: `app/(admin)/layout.tsx` baris 50-98
- **Apa yang terjadi**: Sidebar admin memiliki 17+ link navigasi di depth 2 (admin/settings, admin/mustahik, dll), namun tidak ada breadcrumb atau indikator posisi hirarki selain highlight link aktif. Admin bisa "tersesat" saat berada di halaman yang dalam.
- **Bukti**:
  ```tsx
  // app/(admin)/layout.tsx:100-104
  <header className="bg-surface border-b border-outline px-6 py-4 flex items-center justify-between">
    <div>
      <h1 className="font-display font-bold text-lg text-ink">
        {pathname === "/admin" ? "Dashboard Pengelola" : pathname === "/admin/mustahik" ? ... }
      </h1>
      <p className="text-xs text-muted">Masjid Jami' At-Taqwa Ulujami</p>
    </div>
  ```
  Judul halaman di-generate dengan chaining ternary raksasa, bukan breadcrumb.
- **Dampak bisnis**: Admin (pengurus masjid, kurang familiar dengan web) bisa kehilangan orientasi. Menambah beban kognitif.
- **Rekomendasi perbaikan**: Implementasikan breadcrumb dinamis berdasarkan pathname. Gunakan `Breadcrumbs` komponen dengan link yang bisa diklik.
- **Effort estimate**: Kecil (1 file, buat komponen breadcrumb)
- **Status**: Belum dikerjakan

---

### [UI-006] Landing page — gambar `Image` dari Unsplash tanpa `priority` di hero
- **Severity**: Low
- **Klasifikasi standar**: —
- **Lokasi**: `LandingPage.tsx` baris ~180-186
- **Apa yang terjadi**: Gambar hero (mosque dome) menggunakan komponen `next/image` tanpa properti `priority`. Gambar ini adalah Largest Contentful Paint (LCP) candidate, seharusnya di-priority agar tidak kena lazy loading.
- **Bukti**:
  ```tsx
  // LandingPage.tsx:180-186
  <Image
    src="https://images.unsplash.com/photo-1542810634-71277d95dcbb?auto=format&fit=crop&w=800&q=80"
    alt="At-Taqwa Mosque Dome"
    fill
    sizes="(max-width: 1024px) 100vw, 40vw"
    className="object-cover"
  />
  ```
- **Dampak bisnis**: LCP lebih lambat 1-3 detik, menurunkan Core Web Vitals dan potensi peringkat SEO. Untuk landing page publik masjid, ini krusial.
- **Rekomendasi perbaikan**: Tambahkan `priority` pada Image hero. Juga pertimbangkan local image daripada hotlink Unsplash (yang bisa slow/blocked).
- **Effort estimate**: Kecil
- **Status**: Belum dikerjakan

---

### [UI-007] Tidak ada input validation feedback real-time pada form
- **Severity**: Medium
- **Klasifikasi standar**: WCAG 2.2 3.3.1 Error Identification
- **Lokasi**: `ZakatPage.tsx` (baris ~233-284 form inputs), `BankInfaqPage.tsx` (form modal step 1-3), `MustahikTable.tsx` (form modal)
- **Apa yang terjadi**: Form input tidak memberikan feedback error real-time. Error hanya muncul setelah submit. Contoh: input nomor telepon di form reseller BUMM tidak memvalidasi format nomor, input NIK 16 digit tidak memberikan indikasi visual sebelum submit.
- **Bukti**:
  ```tsx
  // BankInfaqPage.tsx:429 — input NIK tanpa validasi real-time
  <input
    type="text"
    required
    value={userNik}
    onChange={(e) => setUserNik(e.target.value)}
    placeholder="NIK KTP 16 Digit..."
    className="w-full bg-bg border ..."
  />
  // Tidak ada indikasi error style saat NIK < 16 digit
  ```
- **Dampak bisnis**: Pengguna mengisi form panjang (Bank Infaq 3 step), lalu submit gagal karena validasi dasar — frustrasi, bounce rate tinggi. Untuk masjid yang mengandalkan donasi, ini kehilangan potensi dana.
- **Rekomendasi perbaikan**: Gunakan controlled component dengan validasi onChange: highlight border merah + pesan error inline untuk field invalid sebelum submit.
- **Effort estimate**: Sedang (tersebar di 3-4 form besar)
- **Status**: Belum dikerjakan

---

### [UI-008] Tombol CTA hero menggunakan `button` bukan `Link` untuk navigasi
- **Severity**: Info
- **Klasifikasi standar**: —
- **Lokasi**: `LandingPage.tsx` baris ~158-174
- **Apa yang terjadi**: Dua tombol CTA di hero section menggunakan `<button>` dengan `router.push()` ketimbang `<Link>` dari Next.js. Ini menghilangkan kemampuan browser untuk pre-fetch halaman tujuan.
- **Bukti**:
  ```tsx
  // LandingPage.tsx:158-164
  <button
    onClick={handleDonateClick}
    className="w-full sm:w-auto bg-amber-500 ..."
  >
    <Heart className="w-5 h-5 fill-slate-950" />
    Donasi Sekarang
  </button>
  ```
  Dimana `handleDonateClick` melakukan `router.push("/donasi")`.
- **Dampak bisnis**: Navigasi sedikit lebih lambat, tidak ada pre-fetching. Minor, namun mudah diperbaiki.
- **Rekomendasi perbaikan**: Ganti dengan komponen `<Link href="/donasi">` atau tambahkan `prefetch` di router.push.
- **Effort estimate**: Kecil
- **Status**: Belum dikerjakan

---

### [UI-009] Admin page — ternary chain raksasa 17 kondisi untuk judul halaman
- **Severity**: Medium
- **Klasifikasi standar**: —
- **Lokasi**: `app/(admin)/layout.tsx` baris 103-104
- **Apa yang terjadi**: Judul halaman header menggunakan chaining ternary expression sepanjang ~17 kondisi (satu per path admin). Ini sangat sulit dibaca, rawan error saat nambah path baru, dan tidak bisa di-internasionalisasi.
- **Bukti**:
  ```tsx
  // app/(admin)/layout.tsx:103-104 (satu baris, ~2000 karakter)
  <h1 className="...">
    {pathname === "/admin" ? "Dashboard Pengelola" 
      : pathname === "/admin/mustahik" ? "Manajemen Mustahik" 
      : pathname === "/admin/gis" ? "GIS Mustahik" 
      : ... // 14+ kondisi lagi
      : "Dashboard Pengelola"}
  </h1>
  ```
- **Dampak bisnis**: Maintenance buruk. Setiap nambah halaman admin baru harus edit file layout. Bisa typo atau lupa mapping.
- **Rekomendasi perbaikan**: Gunakan `Map<string, string>` atau object lookup di luar komponen. Contoh:
  ```tsx
  const PAGE_TITLES: Record<string, string> = {
    "/admin": "Dashboard Pengelola",
    "/admin/mustahik": "Manajemen Mustahik",
    // ...
  };
  <h1>{PAGE_TITLES[pathname] ?? "Dashboard Pengelola"}</h1>
  ```
- **Effort estimate**: Kecil
- **Status**: Belum dikerjakan

---

### [UI-010] Tidak ada fallback/error UI untuk query data yang gagal (komponen publik)
- **Severity**: High
- **Klasifikasi standar**: —
- **Lokasi**: `LandingPage.tsx` (baris ~41-47), `BummPage.tsx` (baris ~15), `BankInfaqPage.tsx` (baris ~15-16), `LiveActivityFeed.tsx` (baris ~19-20)
- **Apa yang terjadi**: Semua data query publik (mosque, stats, products, activity feed) jika gagal (network error, server 500) akan menghasilkan state undefined/null tanpa UI error. Komponen hanya menampilkan "--" atau data kosong diam-diam tanpa notifikasi ke user bahwa data gagal dimuat.
- **Bukti**:
  ```tsx
  // LandingPage.tsx:41-47
  const { data: apiData } = usePublicData();
  const mosque = apiData?.mosque ?? null;
  const stats = apiData?.stats ?? null;
  // Jika apiData undefined karena error, semua statistik = 0, tanpa indikasi error
  ```
- **Dampak bisnis**: Donatur melihat laporan kosong (statistik Rp 0) saat data gagal dimuat — menimbulkan kesan masjid tidak memiliki dana sama sekali. Ini merusak kepercayaan.
- **Rekomendasi perbaikan**: Tambahkan error state dari useQuery (isError, error). Tampilkan banner error yang informatif ("Data gagal dimuat, silakan refresh"). Pastikan data yang sudah pernah berhasil di-cache tidak hilang (gunakan `keepPreviousData`).
- **Effort estimate**: Sedang (banyak komponen publik)
- **Status**: Belum dikerjakan

---

### [UI-011] Recharts Pie Chart — tidak ada fallback aksesibilitas (data tidak bisa dibaca screen reader)
- **Severity**: Medium
- **Klasifikasi standar**: WCAG 2.2 1.1.1 Non-text Content
- **Lokasi**: `TransparansiPage.tsx` baris 220-236, `OverviewTab.tsx` baris 253-268
- **Apa yang terjadi**: Pie chart dan bar chart dari Recharts tidak memiliki alternatif tekstual. Pengguna screen reader tidak bisa membaca data breakdown dana masjid.
- **Bukti**:
  ```tsx
  // TransparansiPage.tsx:220-236
  <ResponsiveContainer width="100%" height="100%">
    <PieChart>
      <Pie data={allocationData} ...>
        {allocationData.map((entry, index) => (
          <Cell key={`cell-${index}`} fill={entry.color} />
        ))}
      </Pie>
      <Tooltip formatter={(value) => `${value}%`} />
    </PieChart>
  </ResponsiveContainer>
  ```
  Tidak ada `role="img"`, `aria-label`, atau `title` pada container chart.
- **Dampak bisnis**: Laporan keuangan (yang seharusnya transparan) tidak bisa diakses pengguna screen reader. Ini ironis untuk platform yang mengusung transparansi.
- **Rekomendasi perbaikan**: Bungkus chart dalam `<div role="img" aria-label="...">`. Tambahkan tabel data tersembunyi (`.sr-only`) yang berisi data mentah chart sebagai alternatif tekstual.
- **Effort estimate**: Kecil (2 file)
- **Status**: Belum dikerjakan

---

### [UI-012] Font `text-[10px]` dan `text-[9px]` terlalu kecil di desktop
- **Severity**: Low
- **Klasifikasi standar**: WCAG 2.2 1.4.4 Resize Text (implikasi)
- **Lokasi**: Tersebar — `Footer.tsx` baris 46, 98; `Admin layout` baris 59; `OverviewTab.tsx` baris 149, 224; `DashboardPage.tsx` baris 99
- **Apa yang terjadi**: Penggunaan `text-[10px]` (setara ~7.5pt) dan `text-[9px]` (~6.75pt) pada beberapa elemen informasi. Ukuran ini di bawah batas bacaan nyaman (minimum 12px / 9pt untuk teks kontinu WCAG).
- **Bukti**:
  ```tsx
  // Admin layout baris 59:
  <p className="text-[9px] text-emerald-400 uppercase tracking-wider">Panel Admin</p>
  // OverviewTab.tsx baris 149:
  <p className="text-[9px] text-muted mt-1 italic">
  ```
- **Dampak bisnis**: Pengguna dengan presbiopi (rabun dekat, umum di usia 40+ — banyak pengurus masjid) kesulitan membaca. Informasi penting (audit date, sub-label) jadi tidak terbaca.
- **Rekomendasi perbaikan**: Naikkan `text-[10px]` menjadi `text-[11px]` atau `text-xs` (12px). `text-[9px]` bisa digabung dengan teks sekitarnya atau naikkan.
- **Effort estimate**: Kecil (find & replace di 5-6 file)
- **Status**: Belum dikerjakan
