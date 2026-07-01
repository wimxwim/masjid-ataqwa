# 🎨 DESAIN UTAMA (DESIGN SYSTEM) v2.1 — MASJID AT-TAQWA
> **Project:** Rintisan Pertama — Masjid Jami' At-Taqwa Ulujami
> **Tema Visual:** Islamic Warm & Trustworthy — Light Theme Premium
> **Filosofi Branding:** ROMANTIS (Ramah Orang Muda, Ramah Anak-anak, Ramah Lansia, Ramah Disabilitas, Ramah Musawafir)
> **Sumber inspirasi:** Gotong Royong PWA, REMISYA PRESENT 2026, Kitabisa, ParagonCorp, MRBJ

---

## 1. PANDUAN WARNA & BRANDING (VISUAL STYLE GUIDE)

### 1.1 Palet Warna (Color Palette Tokens)
```
┌─────────────────────────────────────────────────────────────┐
│ BG HALAMAN           #f9fafb  HSL(0, 0%, 98%)               │
│   → Latar utama — abu sangat muda, hangat, tidak silau      │
│                                                             │
│ SURFACE (Kartu)      #ffffff  HSL(0, 0%, 100%)              │
│   → Kartu, card, panel — putih bersih kontras tinggi        │
│                                                             │
│ EMERALD BRIGHT (Primer) #10b981  HSL(160, 84%, 39%)         │
│   → Tombol CTA, header, ikon aktif, link                    │
│                                                             │
│ EMERALD DEEP (Header) #0e7a45  HSL(156, 80%, 27%)           │
│   → Header navbar, footer, bg section penting               │
│                                                             │
│ GOLD WARM (Aksen)     #c8a84e  HSL(44, 53%, 55%)            │
│   → Tombol donasi, progress bar, badge premium              │
│                                                             │
│ TEKS UTAMA            #1a1b22  HSL(230, 14%, 12%)           │
│   → Body text, heading — gelap tapi tidak hitam pekat       │
│                                                             │
│ TEKS MUTED            #6b7280  HSL(220, 9%, 46%)            │
│   → Meta, label, caption                                    │
│                                                             │
│ BORDER / OUTLINE      #e5e7eb  HSL(220, 13%, 91%)           │
│   → Garis pemisah, border kartu subtle                      │
│                                                             │
│ SEMANTIC:                                                   │
│   Sukses     #10b981  Emerald — Lunas / Terbayar            │
│   Warning    #f59e0b  Amber — Tanggung Renteng Aktif        │
│   Bahaya     #ef4444  Red — NPF Tinggi / Default            │
│   Info       #3b82f6  Blue — Program Kajian / Edukasi       │
└─────────────────────────────────────────────────────────────┘
```

Root layout: `color-scheme: light`. Landing & admin light-mode. Dark mode opsional di fase 3.

### 1.1b CSS (Tailwind v4 `@theme`)
```css
@import "tailwindcss";

@theme {
  --color-primary: #10b981;
  --color-primary-dark: #059669;
  --color-primary-deep: #0e7a45;
  --color-header: #0e7a45;
  --color-finance: #0a5c34;
  --color-accent: #c8a84e;
  --color-bg: #f9fafb;
  --color-surface: #ffffff;
  --color-ink: #1a1b22;
  --color-muted: #6b7280;
  --color-outline: #e5e7eb;
  --color-success-subtle: #ecfdf5;

  --font-sans: var(--font-outfit), ui-sans-serif, system-ui, sans-serif;
  --radius-card: 1.5rem;
}

:root { color-scheme: light; }
body {
  background: var(--color-bg);
  color: var(--color-ink);
  font-family: var(--font-sans);
}
```

### 1.2 Tipografi (Typography Hierarchy)
| Level | Font | Weight | Ukuran | Konteks |
|---|---|---|---|---|
| Headline Hero | Outfit | Black (900) | text-5xl/6xl | Landing page hero |
| Heading 1-2 | Outfit | Bold (700) | text-3xl/4xl | Judul section |
| Heading 3-4 | Outfit | Semibold (600) | text-xl/2xl | Sub-judul |
| Body Text | Inter | Regular (400) | text-base | Paragraf konten |
| Data/Table | Inter | Medium (500) | text-sm | Tabel transaksi |
| Caption | Inter | Regular | text-xs | Meta, label badge |

### 1.3 Filosofi Visual — ROMANTIS Branding
Desain aplikasi harus memancarkan **keramahan** (ROMANTIS) sekaligus **premium** (hijau emerald di atas putih hangat):

| Prinsip | Implementasi Visual | Target Audiens |
|---|---|---|
| **R**amah Orang Muda | Glassmorphism, transisi halus, motion, Lenis smooth scroll | Gen Z & Milenial (Ring 2 & 3) |
| **R**amah Anak-anak | Ikon bulat, warna cerah, ilustrasi karakter | Anak-anak TPQ/Tahfidz |
| **R**amah Lansia | Kontras tinggi, font lebih besar opsi, minimal animasi | Lansia jamaah reguler |
| **R**amah Disabilitas | ARIA labels, focus visible, keyboard navigable | Semua |
| **R**amah Musawafir | Mobile-first, PWA offline-capable, loading cepat | Musafir & pengguna jalan |

### 1.4 Display & Delivery (Prinsip 2D — dari Paragon MIBA)
```
DISPLAY:   Tampilkan dampak secara visual premium
           → Foto mustahik, progress bar, map ring interaktif
DELIVERY:  Sampaikan laporan transparan dan tepat waktu
           → WA auto-report tiap tanggal 1, PDF unduhan
```

---

## 2. SPESIFIKASI DETIL ANTARMUKA PENGGUNA (UI PAGES)

### 2.1 Landing Page Donatur (Muzakki View)
```
┌──────────────────────────────────────────────┐
│ HERO SECTION                                │
│ ┌──────────────────────────────────────────┐ │
│ │ "Dari Masjid Kita Tuntaskan Kemiskinan"   │ │
│ │ Font: Outfit Black text-6xl              │ │
│ │ Efek: Gradien emerald (#0e7a45 → #10b981)│ │
│ │ Bg: putih bersih, text hijau tua         │ │
│ │ ┌──────────────────────────────────────┐ │ │
│ │ │ Progress Bar: Bank Infaq At-Taqwa     │ │ │
│ │ │ ████████████░░░░ 68% dari Rp 50 Juta  │ │ │
│ │ │ Warna gold (#c8a84e), animasi lebar   │ │ │
│ │ └──────────────────────────────────────┘ │ │
│ │ [DONASI SEKARANG] — Tombol emerald glow   │ │
│ └──────────────────────────────────────────┘ │
├──────────────────────────────────────────────┤
│ DATA KEMISKINAN REAL (sticky section)         │
│   "JakSel: 70.660 jiwa miskin,               │
│    2.782 masjid, 140 masjid cukup"           │
│   Animasi counter naik realtime              │
├──────────────────────────────────────────────┤
│ DAFTAR PROGRAM (card grid 3 kolom)            │
│ ┌────────┐ ┌────────┐ ┌────────┐           │
│ │ Bank   │ │ Wakaf  │ │ Beasiswa│           │
│ │ Infaq  │ │ Domba  │ │ Anak    │           │
│ │ 30% yr │ │ 30% yr │ │ Asuh    │           │
│ └────────┘ └────────┘ └────────┘           │
├──────────────────────────────────────────────┤
│ KALKULATOR ZAKAT PENGHASILAN                 │
│   Input: Rp ________ × 2.5% = Rp ________   │
│   Efek: backdrop-blur, instant result        │
├──────────────────────────────────────────────┤
│ LAPORAN TRANSPARANSI (tabel real-time)        │
│   Donasi masuk → QRIS → update otomatis     │
│   [Unduh PDF Laporan Bulanan]               │
└──────────────────────────────────────────────┘
```

### 2.2 Ring Map Visual — Distribusi Mustahik
```
┌──────────────────────────────────────────────┐
│              MASJID AT-TAQWA                  │
│              (📍 Pusat)                       │
│                                              │
│          ╭──────────────────────╮             │
│         ╱  Ring 4 (>2km)       ╲            │
│        │   ╭──────────────╮    │            │
│        │  ╱  Ring 3       ╲   │            │
│        │ │  (1-2km)  ╭──╮  │  │            │
│        │  ╲  Ring 2 ╱    ╲ ╱  │            │
│        │   ╰──(500m-1km)──╯   │            │
│         ╲  Ring 1 (<500m)    ╱             │
│          ╰──────────────────────╯           │
│                                              │
│  🟢 Pin Mustahik (warna per ring)            │
│  🟡 Legend: Ring 1 → 4 dengan opasitas       │
│  Library: Leaflet.js (gratis)                │
└──────────────────────────────────────────────┘
```

### 2.3 Dashboard Admin DKM (Gaya MRBJ REMISYA)
```
┌──────────────────────────────────────────────┐
│ SIDEBAR KIRI (fitur collapsible)              │
│ ├─ 🕌 Dashboard                               │
│ ├─ 📍 Mustahik (GIS Map)                     │
│ ├─ 📖 Baitul Dakwah (Kajian)                 │
│ ├─ 💰 Baitul Maal (ZISWAF)                   │
│ ├─ 👥 REMISYA (7 Dept)                       │
│ ├─ 🛍️ BUMM & Affiliate                      │
│ └─ ⚙️ Settings                               │
├──────────────────────────────────────────────┤
│ MAIN PANEL — KPI CARDS (grid 4)              │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──┐ │
│ │Mustahik  │ │ Pinjaman │ │ NPF      │ │GMV│ │
│ │ 47 org   │ │ Rp 23.5jt│ │ 0.2%     │ │12 │ │
│ └──────────┘ └──────────┘ └──────────┘ └──┘ │
├──────────────────────────────────────────────┤
│ RING MAP + TABLE SAHABAT INFAQ               │
│ Peta interaktif (Leaflet) + tabel di bawah    │
│ ┌──────┬──────┬──────┬──────┬──────┐        │
│ │ Nama │ Ring │Cicilan│ Status │ Aksi │        │
│ ├──────┼──────┼──────┼──────┼──────┤        │
│ │Ahmad │ R1   │ 50rb │ ✅    │ ...  │        │
│ │Siti  │ R2   │ 50rb │ 🟡TR  │ ...  │        │
│ └──────┴──────┴──────┴──────┴──────┘        │
└──────────────────────────────────────────────┘
```

### 2.4 Portal Pemuda (Masjid Affiliate — Mobile First)
```
┌──────────────────────────────────────────────┐
│ NAV: Beranda | Ngonten | Jualan | Rank       │
├──────────────────────────────────────────────┤
│ AKTIVITAS REMISYA (Ring 1-specific)          │
│ ┌──────────────────────────────────────────┐ │
│ │ 📹 GPS — Gerakan Pemuda Subuh            │ │
│ │ 📹 Kuy Ngaji — Ngaji asyik bareng        │ │
│ │ 📹 LDSS — Ladies Day Sit and Sip         │ │
│ └──────────────────────────────────────────┘ │
│ [DOWNLOAD] — tombol penuh lebar               │
├──────────────────────────────────────────────┤
│ AFFILIATE GENERATOR                           │
│ Produk: [Kopi Sepanjang Waktu ▼]             │
│ Kode: [ahmad01]                               │
│ [📋 Salin Tautan] → "Link disalin!" toast    │
├──────────────────────────────────────────────┤
│ GMV CHART (SVG path, gradien fill)           │
│ ╱╲    ╱╲    ╱╲                               │
│╱  ╲  ╱  ╲  ╱  ╲  (garis gold, fill emerald) │
│ Sen Sel Rab Kam Jum                          │
├──────────────────────────────────────────────┤
│ KOMISI SAYA: Rp 450.000 [Cairkan]            │
│ Peringkat: #3 dari 30 pemuda                 │
└──────────────────────────────────────────────┘
```

### 2.5 Dashboard Admin — Warna Tema
```
Landing & Admin: Light theme
  ├── Bg halaman   #f9fafb
  ├── Kartu         #ffffff (shadow-lg, rounded-2xl)
  ├── Sidebar       bg-primary-deep (#0e7a45), text putih
  ├── Header stats  bg-surface, border-l-4 border-primary
  ├── Tabel         bg-white, header bg-emerald-50
  └── Tombol aksi   bg-primary (#10b981) hover:bg-primary-dark

Premium accent: Gold (#c8a84e) untuk progress bar & badge VIP
```

### 2.6 Kurikulum Kajian Dashboard (Baitul Dakwah)
```
┌──────────────────────────────────────────────┐
│ KURIKULUM BULANAN — [Bulan] [Tahun]          │
├──────────────────────────────────────────────┤
│ DONUT CHART — Bobot Kajian                   │
│                                              │
│         ╭──────────────────╮                 │
│        ╱     Tafsir 22%    ╲                │
│       │  ┌─── Hadits 18%   │                │
│       │  │ ┌─ Fiqih 16%    │                │
│       │  │ │ Aqidah 16%    │                │
│       │  │ │ Sirah 16%     │                │
│       │  │ └─ Executive 12%│                │
│       │  └─────────────────│                │
│        ╲                  ╱                 │
│         ╰──────────────────╯                │
│                                              │
│ Jadwal Kajian                                │
│ ┌──────┬──────────┬──────────┬──────────┐  │
│ │ Pekan│ Materi   │ Pemateri │ Status   │  │
│ ├──────┼──────────┼──────────┼──────────┤  │
│ │ 1    │ Tafsir   │ Dr. ...  │ ✅ Selesai│  │
│ │ 2    │ Hadits   │ KH ...   │ 🔜 ...  │  │
│ └──────┴──────────┴──────────┴──────────┘  │
└──────────────────────────────────────────────┘
```

### 2.6 Portofolio CSR — Untuk Mitra Korporasi (ParagonCorp Style)
```
┌──────────────────────────────────────────────┐
│ PORTOFOLIO PROGRAM — Siap Audit Korporasi     │
├──────────────────────────────────────────────┤
│ Kesiapan Tata Kelola:                         │
│ ✅ Akta Yayasan/DKM terdaftar                 │
│ ✅ NPWP Lembaga                               │
│ ✅ Rekening bank resmi                        │
│ ✅ UPZ legal                                  │
│ ✅ Laporan keuangan rutin                     │
├──────────────────────────────────────────────┤
│ Dampak Program:                               │
│ - 100 KK mustahik aktif                       │
│ - 30 pemuda kader REMISYA                     │
│ - NPF 0.2% (audited)                         │
│ - Rp 50jt GMV BUMM/bulan                      │
├──────────────────────────────────────────────┤
│ [DOWNLOAD PORTOFOLIO PDF] — tombol emerald     │
└──────────────────────────────────────────────┘
```

---

## 3. RESPONSIVE BREAKPOINTS

| Device | Lebar | Layout | Catatan |
|---|---|---|---|
| Mobile S | < 375px | 1 kolom | Portal pemuda prioritas |
| Mobile L | 376-640px | 1 kolom | Affiliate, Ngonten |
| Tablet | 641-1024px | 2 kolom | Dashboard admin |
| Desktop | 1025-1440px | 3 kolom | Landing page, data table |
| Wide | > 1441px | 4 kolom | GIS Map full width |

---

## 4. KOMPONEN VISUAL TOKENS

| Token | Value | Penggunaan |
|---|---|---|
| border-radius button | 12px (rounded-xl) | Semua tombol |
| border-radius card | 16px (rounded-2xl) | Card program, profil |
| border-radius modal | 24px (rounded-3xl) | Popup donasi |
| shadow card | shadow-lg / shadow-xl | Kartu program, dashboard |
| shadow modal | shadow-2xl | Modal donasi |
| backdrop-blur | 12px (backdrop-blur-xl) | Navbar, kalkulator zakat |
| transition duration | 300ms | Hover, page transition |
| container max-w | 1280px (max-w-7xl) | Layout utama |

---

🟢 **HIJAU** (DESIGN v2.1 — palet light theme putih+emerald bright — referensi gotong-royong PWA. Menunggu mockup Gemini untuk finalisasi layout.)
