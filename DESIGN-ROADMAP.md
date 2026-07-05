# Rancangan Polish Desain & Animasi — Masjid At-Taqwa Ulujami

> Goals: menerapkan glassmorphism, typografi ketat, dan animasi scroll-reveal yang konsisten di seluruh halaman publik & admin, sambil tetap mempertahankan identitas Islami emerald-gold.
> Status: 8 fase redesign pertama sudah selesai (tokens, header, footer, landing hero/program/transparansi, donasi, admin layout, login card).
> Skope berikut ini: **polish lanjutan**, bukan migrasi pembayaran. Payment gateway tetap Midtrans dan akan diganti nanti setelah desain final.

---

## 0. Temuan Riset Tren Web Design 2026 (Agar Berkelas)

Riset dari **Figma Resource Library**, **Wix Blog**, **Elementor Blog**, dan **Muzli Blog** menunjukkan arah desain 2026 yang paling relevan untuk Masjid At-Taqwa:

| Tren 2026 | Relevansi untuk Masjid At-Taqwa | Keputusan Desain |
|-----------|--------------------------------|------------------|
| **Bold typography & exaggerated hierarchy** | Heading besar dengan tracking ketat + teks pendukung kecil menjadi standar premium | Terapkan `tracking-tighter` dan kontras ukuran hero `text-4xl/5xl` dengan body `text-xs` |
| **Glassmorphism + neumorphism / "Frosted Touch"** | Kombinasi blur, transparansi, dan bayangan lembut memberi kesan modern & trustworthy | Lanjutkan `glass`/`glass-strong`, tambahkan *soft shadow* dan *glow* pada kartu utama |
| **Micro-interactions / micro-delight** | Animasi kecil pada tombol, input, kartu memberikan kesan "hidup" tanpa mengganggu | Hover-lift, focus-glow, button press, shimmer loading, scroll-reveal |
| **Motion with function** | Animasi harus membantu usability, bukan sekadar hiasan | Scroll-reveal untuk struktur, hover state untuk affordance, skeleton saat loading |
| **Organic shapes & soft gradients** | Bentuk organik dan gradasi halus mengurangi kesan kotak/kaku | Tambahkan SVG mask/divider organik & gradasi emerald-gold halus di hero |
| **Storytelling & brand experience** | Website menceritakan nilai & dampak, bukan hanya informasi | Perkuat section "donasi = dampak", live feed, kisah penerima manfaat |
| **Dark mode as standard** | Opsi terang/gelap menjadi ekspektasi pengguna | Pertahankan toggle tema yang sudah ada, pastikan glass tetap bekerja di dark |
| **Accessibility as creative default** | WCAG, reduced-motion, kontras, ARIA bukan lagi opsional | Semua animasi bisa dimatikan, fokus terlihat, warna tetap readable |
| **Sustainable / performance-first design** | Ringan = cepat = ramah SEO & ramah lingkungan | Optimasi gambar, lazy load, animasi CSS tanpa JS berat, hindari WebGL berlebihan |
| **AI co-designer** | AI membantu otomatisasi & personalisasi | Tetap fokus pada craft manual untuk identitas unik, tidak generik |

### Yang TIDAK akan dipakai (biar tetap Islamic & trustworthy)
- **Brutalism / anti-design** — terlalu kasar untuk citra masjid.
- **Dopamine neon / Y2K / retrofuturism** — tidak cocok dengan identitas emerald-gold.
- **WebGL 3D berat / particle complex** — riskan performance & aksesibilitas.

---

## 1. Token & Utilitas yang Sudah Tersedia

File: `src/app/globals.css`

| Token / Utilitas | Nilai / Efek | Cara Pakai |
|------------------|--------------|------------|
| `glass` | putih 72% + blur 16px + border putih 45% | kartu ringan |
| `glass-strong` | putih 85% + blur 24px + border putih 60% | kartu utama, modal, receipt |
| `glass-dark` | hitam-emerald 72% + blur 16px | overlay hero, footer, sidebar admin |
| `shadow-1` s/d `shadow-5` | bayangan dengan tint emerald | hierarki kedalaman |
| `shadow-glow` | glow emerald | CTA/focus/sukses |
| `shadow-glow-accent` | glow gold | akcent/emas |
| `reveal` / `reveal-visible` | fade-up scroll reveal | tambah class `reveal` elemen |
| `hover-lift` + `hover-lift-active` | naik −6px + shadow saat hover | `hover-lift hover:hover-lift-active` |
| `tracking-tight` / `tracking-tighter` | −0.02em / −0.04em | heading |
| `font-arabic` | Noto Naskh Arabic | ayat/hadith |
| `@media (prefers-reduced-motion: reduce)` | matikan animasi | otomatis |

---

## 2. Audit Halaman & Komponen

| Lokasi | Status Saat Ini | Rencana |
|--------|-----------------|---------|
| `Header.tsx` | ✅ Sudah glass | — pertahankan |
| `Footer.tsx` | ✅ Sudah glass | — pertahankan |
| `HeroSection.tsx` | ✅ Glass + reveal | — pertahankan |
| `ProgramGrid.tsx` | ✅ Glass card + hover-lift | — pertahankan |
| `TransparencyTable.tsx` | ✅ Glass table | — pertahankan |
| `DonasiSekarang.tsx` | ✅ Glass form | — pertahankan |
| `DeleteConfirmDialog.tsx` | ✅ Glass modal | — pertahankan |
| `GlobalOverlays.tsx` | ✅ Glass drawer/toast | — pertahankan |
| `ThemeToggle.tsx` | ✅ Animasi rotasi | — pertahankan |
| `AdminClientLayout.tsx` | ✅ Glass sidebar + header | — pertahankan |
| `DashboardPage.tsx` | ✅ Glass header admin | — pertahankan |
| `LoginPage.tsx` | ⚠️ Masih flat (`bg-surface` solid) | Ubah ke `glass-strong`, header `glass-dark`, rounded-3xl, shadow-4 |
| `PrayerTimes.tsx` | ⚠️ Flat (`bg-surface/80`) | Ubah ke `glass`, tambah `reveal`, style time pill aktif |
| `LiveActivityFeed.tsx` | ⚠️ Solid slate | Kiri → `glass-dark` dengan glow accent; kanan → `glass`; card feed → `glass-strong hover-lift` |
| `ZakatCalculator.tsx` | ⚠️ Flat slate section | Section wrapper `glass-dark` atau gradient emerald; form card `glass-strong`; input `glass` + focus glow |
| `PartnerLogos.tsx` | ⚠️ Flat dashed border | Card mitra → `glass hover-lift` dengan border putih 30%, logo grayscale-gold hover |
| `payment/pending` | ⚠️ Flat amber/emerald solid | Reseipt glass dengan glow amber; QRIS card; status timeline |
| `payment/success` | ⚠️ Flat emerald solid | Receipt glass dengan glow success; konfeti subtle; detil transaksi terstruktur |
| `payment/error` | ⚠️ Flat red solid | Glass error card dengan glow red; aksi coba lagi/ bantuan |
| `TransparansiClient.tsx` | ⚠️ Flat stats + chart cards | Bento stats → `glass-strong`; chart cards → `glass`; ledger table → `glass-strong`; filter bar → `glass` |
| `BummPage.tsx` | ⚠️ Hero solid + produk flat | Hero → `glass-dark` dengan pattern grid; stats → `glass`; product card → `glass-strong hover-lift`; form reseller → `glass-strong` |
| `BankInfaqClient.tsx` | ⚠️ Hero solid + card flat | Hero → `glass-dark`; simulator → `glass-strong`; step cards → `glass hover-lift`; testimonial → `glass`; modal → `glass-strong` |
| Admin tab & cards (`StatCard`, `OverviewTab`, dsb) | ⚠️ Masih banyak `bg-surface` solid | Terapkan `glass`/`glass-strong`, stat icon dengan glow, tabel ledger glass |
| `WelcomeOnboarding.tsx` | ⚠️ Belum dicek | Sesuaikan dengan glass + reveal |
| `ZakatPage.tsx` | ⚠️ Belum dicek | Sesuaikan glass + reveal |

---

## 3. Komponen Bantu Baru (Shared)

Buat di `src/components/design-system/` agar konsistensi tidak bergantung copy-paste.

### 3.1 `GlassContainer` (server-safe wrapper)
```tsx
<div className="glass rounded-[var(--radius-card)] p-6 sm:p-8 shadow-2">
  {children}
</div>
```

### 3.2 `GlassCard`
Kombinasi `glass-strong`, `rounded-2xl/3xl`, `shadow-3`, optional `hover-lift`.

### 3.3 `SectionShell`
```tsx
<section className="py-16 lg:py-20 px-4 sm:px-6 lg:px-8">
  <div className="max-w-7xl mx-auto space-y-10">
    {/* optional header */}
  </div>
</section>
```

### 3.4 `SectionHeader`
Kepala section dengan keterangan, badge, dan arabic divider opsional.

### 3.5 `StatusBadge`
Badge status transaksi: pending (amber), success (emerald), error (red), dengan glass pill.

### 3.6 `StatusReceipt`
Template receipt untuk `payment/pending`, `payment/success`, `payment/error`:
- Header icon bulat dengan glow
- Body `glass-strong` atau `glass-dark`
- Detail transaksi dua kolom monospace
- Footer aksi dua tombol

---

## 4. Strategi Animasi

### 4.1 Global Scroll Reveal
- `ScrollRevealProvider` sudah aktif dan mengamati class `.reveal`.
- Setiap section/panel utama wajib memiliki class `reveal`.
- Untuk grup card, gunakan `reveal` di setiap card + `transition-delay` inline untuk efek stagger.
- Contoh delay: `style={{ transitionDelay: `${i * 80}ms` }}`.

### 4.2 Micro-interactions
- Hover card: `hover-lift hover:hover-lift-active` (jangan taruh pseudo di `@utility`).
- Hover tombol: `active:scale-95`, shadow glow.
- Input focus: `ring-2 ring-primary/20 shadow-glow`.
- Icon status success/pending: `animate-float` atau `animate-bounce-in` saat mount.

### 4.3 Performance & Aksesibilitas
- Semua keyframe sudah di `globals.css`.
- `prefers-reduced-motion: reduce` otomatis mematikan animasi (`!important` override).
- Hindari animasi pada setiap element di viewport berat; fokus pada section heading + card utama.

---

## 5. Spesifikasi Halaman Prioritas

### 5.1 Payment Status Pages — "Glass Receipt"

#### Success
- Container: `max-w-lg mx-auto`, center dengan `min-h-[70vh]`.
- Card: `glass-strong rounded-[var(--radius-card)] shadow-4`.
- Header: `glass-dark text-white text-center` + icon check berwarna emerald dengan `shadow-glow`.
- Body detil: rows dengan border bawah subtle `border-outline`.
- Total: `text-primary-deep` (atau gold `text-accent`) monospace besar.
- Ayat: pakai `font-arabic` + `glass` box dengan border gold 20%.
- CTA: primary + ghost glass.

#### Pending
- Header: amber icon dengan glow amber.
- QRIS card area: jika metode QRIS, tampilkan placeholder QRIS label + panduan scan.
- Rekening tujuan: `glass` card, rekening monospace tracking-wide.
- Countdown/tombol cek status (opsional).

#### Error
- Header: red icon dengan glow red.
- Box alasan: `glass` list bullet.
- Aksi: coba lagi + bantuan WhatsApp.

### 5.2 Landing — komponen tersisa

#### PrayerTimes
- Card: `glass rounded-2xl`.
- Pill waktu sholat aktif: `bg-primary text-white shadow-glow` atau `glass-strong`.
- `reveal` saat masuk viewport.

#### LiveActivityFeed
- Panel kiri (Tally): `glass-dark text-white` + radial gradient, tally number `text-accent`.
- Panel kanan: `glass-strong`, card feed `glass hover-lift`.
- Density selector: `glass` pill, aktif `bg-primary/20 ring-1 ring-primary/30`.

#### ZakatCalculator
- Section background: gradient emerald halus (`bg-gradient-to-br from-emerald-900 to-emerald-950`) atau `glass-dark`.
- Form card: `glass-strong rounded-3xl shadow-4`.
- Tab jenis zakat: `glass` pill, aktif `bg-surface shadow-glow`.
- Input focus glow.
- Hasil perhitungan: `glass` border gold.

#### PartnerLogos
- Card mitra: `glass rounded-2xl border border-white/30 hover-lift`.
- Label: `tracking-tight font-display`.
- Section tanpa background solid — inline dengan halaman.

### 5.3 BUMM Page

- Hero: ganti `bg-primary-deep` solid → `glass-dark` dengan pattern grid + glow accent.
- Stats grid: `glass` atas `bg-bg`.
- Product card: `glass-strong rounded-2xl shadow-2 hover:hover-lift-active`.
- Badge Terlaris: `bg-accent text-ink`.
- Kategori tab: `glass` pill.
- Reseller form: `glass-strong rounded-3xl`.

### 5.4 Bank Infaq Page

- Hero: `glass-dark` + emerald glow.
- Simulator: slider + breakdown card dalam `glass-strong`.
- Step cards: `glass hover-lift`, nomor step bulat dengan ring.
- Testimonials: `glass` card horizontal dengan avatar ring gold.
- Modal: `glass-strong` dengan header `glass-dark`.

### 5.5 Laporan / Transparansi

- Bento stats: `glass-strong`.
- Chart card: `glass`.
- Ledger section: `glass-strong`.
- Ledger header: sticky `glass-strong`.
- Table row hover: `hover:bg-primary/5`.
- Filter bar: `glass`.
- Tombol ekspor: ghost glass.

### 5.6 Admin Dashboard

- StatCard: `glass` + icon glow.
- OverviewTab cards: `glass-strong`.
- Charts container: `glass`.
- Ledger tables: `glass-strong`.
- Tab navigasi: glass pill.
- Semua detail/drawer/modal: `glass-strong`.

---

## 6. Fase Eksekusi (Usulan)

| Fase | Fokus | Estimasi | Deliverables |
|------|-------|----------|--------------|
| **A** | Shared design-system components + Payment Status Pages | 1–2 hari | `GlassCard`, `SectionHeader`, `StatusReceipt`; `pending`, `success`, `error` glass receipt |
| **B** | Public content pages: BUMM, Bank Infaq, Laporan | 2–3 hari | glass + reveal di ketiga halaman; modal/form glass |
| **C** | Landing sisa: PrayerTimes, LiveActivityFeed, ZakatCalculator, PartnerLogos | 1–2 hari | semua section konsisten glass + reveal |
| **D** | Admin polish: StatCard, tabs, charts, tables | 1–2 hari | admin dashboard glass menyeluruh |
| **E** | QA, responsive, reduced-motion, build | 0.5–1 hari | build pass, Lighthouse visual OK, no regression |

---

## 7. Aturan Keras Selama Polish

1. **Tidak boleh mengubah identitas warna**: tetap emerald + gold; tidak pakai biru sebagai warna utama.
2. **Tidak boleh menghilangkan reduced-motion**: semua animasi wajib bisa dimatikan via media query yang sudah ada.
3. **Tidak boleh pseudo-selector di `@utility`**: hover di komponen, bukan di CSS utility.
4. **Minimal hardcode**: pakai token (`--radius-card`, `--shadow-*`, warna dari theme Tailwind).
5. **Tetap responsif**: card ≤ 1 kolom di mobile, max 3–4 kolom di desktop.
6. **No payment gateway code change**: integrasi Midtrans tetap; hanya UI dihaluskan.

---

## 8. Pertanyaan ke Pemilik Sebelum Mulai Eksekusi

1. **Mau mulai dari Fase A (payment receipt glass) atau Fase C (landing sisa)?** — mana yang paling ingin dilihat hasilnya duluan?
2. **Apakah mau ditambahkan background pattern halal/islami (geometris subtil) di hero/content section, atau tetap bersih minimalis?**
3. **Yang diutamakan: visual publik (jamaah) atau admin dashboard dulu?**

Jawabanmu akan menentukan urutan file yang saya kerjakan selanjutnya.
