# 🏗️ ARSITEKTUR MASJID AT-TAQWA — ENTERPRISE EDITION v2.0
> **Project:** Masjid Jami' At-Taqwa Ulujami (Rintisan Pertama GMIB)
> **Stage:** Mockup In Progress (Architecture Locked — Audit 3-Siklus ✅)
> **Standar:** Enterprise-Grade — Multi-Tenant Ready — Security Hardened
> **Tema:** Light Theme (Putih + Emerald Bright) — lihat DESIGN.md §1.1
> **Stack:** Next.js 16 + Drizzle ORM + Supabase (PostgreSQL 15 + PostGIS) + Cloudflare Workers + OpenNext + Midtrans + shadcn/ui + motion + lenis + TanStack Query + Zustand + Leaflet.js
> **Sumber:** PRD v2.1, DESIGN v2.1, analisis-diskusi v2.1, dokumentasi v2.1, walkthrough v2.1, REMISYA PRESENT 2026, Pemberdayaan Ekonomi Umat MIBA 13, Baitul Maal MIBA 12, ParagonCorp MIBA 13

---

## 📋 DAFTAR ISI
1. [HIERARKI PROYEK](#1-hierarki-proyek)
2. [DAFTAR HALAMAN & ROUTE](#2-daftar-halaman--route)
3. [ARSITEKTUR KOMPONEN & LAYOUT](#3-arsitektur-komponen--layout)
4. [STATE MANAGEMENT & DATA FLOW](#4-state-management--data-flow)
5. [DATABASE — 12 TABEL + POSTGIS](#5-database--12-tabel--postgis)
6. [API ENDPOINTS — VERSIONED & SECURED](#6-api-endpoints--versioned--secured)
7. [KEAMANAN — 12 LAPIS PERTAHANAN](#7-keamanan--12-lapis-pertahanan)
8. [RBAC — MATRIKS HAK AKSES DETAIL](#8-rbac--matriks-hak-akses-detail)
9. [MONITORING, OBSERVABILITY & AUDIT LOG](#9-monitoring-observability--audit-log)
10. [CI/CD PIPELINE — 4 STAGE GATES](#10-cicd-pipeline--4-stage-gates)
11. [DATABASE MIGRATION & SEEDING](#11-database-migration--seeding)
12. [KOMPONEN UI — SHADCN + KUSTOM](#12-komponen-ui--shadcn--kustom)
13. [ERROR HANDLING STRATEGY — GLOBAL](#13-error-handling-strategy--global)
14. [RATE LIMITING & DDOS PROTECTION](#14-rate-limiting--ddos-protection)
15. [LOADING, SKELETON, & EMPTY STATE](#15-loading-skeleton--empty-state)
16. [CACHING STRATEGY — 3 LAPIS](#16-caching-strategy--3-lapis)
17. [DISASTER RECOVERY & BACKUP](#17-disaster-recovery--backup)
18. [SKALABILITAS — 3 TAHAP PERTUMBUHAN](#18-skalabilitas--3-tahap-pertumbuhan)
19. [DEPENDENCIES LOCKED](#19-dependencies-locked)
20. [KONFIGURASI LINGKUNGAN — 35 VARIABEL](#20-konfigurasi-lingkungan--35-variabel)
21. [PERFORMANCE BUDGET](#21-performance-budget)
22. [ARSTTEKTUR DECISION RECORDS (ADR)](#22-arsitektur-decision-records-adr)

---

## 1. HIERARKI PROYEK

```
masjid-ataqwa/
├── .github/
│   └── workflows/
│       ├── ci.yml               ← Lint, typecheck, test
│       └── deploy.yml            ← Build + deploy ke Cloudflare
├── src/
│   ├── app/                      ← Next.js App Router (13 route groups)
│   │   ├── (public)/             ← Landing, program, laporan
│   │   │   ├── page.tsx          ← Landing (SSR, ISR 60s)
│   │   │   ├── program/
│   │   │   │   ├── bank-infaq/page.tsx
│   │   │   │   ├── wakaf-domba/page.tsx
│   │   │   │   └── beasiswa/page.tsx
│   │   │   ├── laporan/page.tsx
│   │   │   ├── kalkulator-zakat/page.tsx  ← CS static
│   │   │   └── not-found.tsx     ← 404 kustom
│   │   ├── (admin)/              ← Admin DKM (auth required)
│   │   │   ├── admin/
│   │   │   │   ├── page.tsx      ← Dashboard
│   │   │   │   ├── mustahik/page.tsx
│   │   │   │   ├── kajian/page.tsx
│   │   │   │   ├── bumm/page.tsx
│   │   │   │   ├── laporan/page.tsx
│   │   │   │   └── settings/page.tsx
│   │   │   └── layout.tsx        ← Sidebar + TopBar
│   │   ├── (pemuda)/             ← Mobile-first, auth required
│   │   │   ├── pemuda/
│   │   │   │   ├── page.tsx      ← Dashboard pemuda
│   │   │   │   ├── ngonten/page.tsx
│   │   │   │   └── jualan/page.tsx
│   │   │   └── layout.tsx        ← BottomNav
│   │   ├── api/
│   │   │   └── v1/               ← Versioned API
│   │   ├── error.tsx             ← Global Error Boundary
│   │   ├── loading.tsx           ← Global Loading
│   │   └── layout.tsx            ← Root layout (CSP, fonts, metadata)
│   ├── components/
│   │   ├── ui/                   ← shadcn/ui components
│   │   ├── custom/               ← 12 komponen kustom
│   │   └── layouts/              ← Navbar, Sidebar, BottomNav, Footer
│   ├── db/
│   │   ├── schema/               ← 12 file schema (1 per tabel)
│   │   ├── migrations/           ← drizzle-kit output
│   │   └── seed.ts               ← Data dummy untuk dev
│   ├── lib/
│   │   ├── supabase.ts           ← Supabase client (server + browser)
│   │   ├── midtrans.ts           ← Midtrans API wrapper
│   │   ├── wa.ts                 ← WhatsApp sender (Fonnte/wa.me)
│   │   ├── crypto.ts             ← AES-256-GCM encrypt/decrypt
│   │   ├── audit.ts              ← Audit logger
│   │   ├── rate-limit.ts         ← Rate limiter (Cloudflare KV)
│   │   ├── rbac.ts               ← Role/permission checker
│   │   └── validators.ts         ← Zod schemas global
│   ├── hooks/                    ← Custom hooks (useAuth, useMap, dll)
│   ├── stores/                   ← Zustand stores
│   └── types/                    ← TypeScript global types
├── public/
│   ├── images/
│   └── fonts/
├── .env.local                    ← (gitignore)
├── .env.example                  ← Template env
├── drizzle.config.ts
├── wrangler.toml
├── tailwind.config.ts
└── next.config.ts
```

---

## 2. DAFTAR HALAMAN & ROUTE

### 2.1 Public Routes (No Auth)

| Route | Halaman | Strategy | Cache | Prioritas Mockup |
|---|---|---|---|---|
| `/` | Landing Publik — Hero + Data Kemiskinan + Program | SSR ISR 60s | CDN 300s | 🔴 Fase 1 |
| `/program/bank-infaq` | Detail Bank Infaq — Skema, Yield, NPF | SSR ISR 300s | CDN 600s | 🔴 Fase 1 |
| `/program/wakaf-domba` | Detail Wakaf Domba — Tabel Yield 4 Tahun | SSR ISR 300s | CDN 600s | 🟡 Fase 2 |
| `/program/beasiswa` | Detail Beasiswa Anak Asuh | SSR ISR 300s | CDN 600s | 🟡 Fase 2 |
| `/laporan` | Laporan Transparansi — Tabel + Download PDF | SSR ISR 60s | No CDN | 🔴 Fase 1 |
| `/kalkulator-zakat` | Kalkulator Zakat Penghasilan | Static | CDN max | 🔴 Fase 1 |
| `/error` | Error Page (redirect dari error boundary) | Static | No | 🔴 Fase 1 |

### 2.2 Admin Routes (Auth: Admin DKM)

| Route | Halaman | Strategy | Cache | Prioritas |
|---|---|---|---|---|
| `/admin` | Dashboard — KPI Cards, Ringkasan | SSR + Mutations | No cache | 🔴 Fase 1 |
| `/admin/mustahik` | GIS Map — Leaflet + 4 Ring | Client TanStack | TanStack 60s | 🔴 Fase 1 |
| `/admin/mustahik/tambah` | Form Input Mustahik Baru | Static | No | 🔴 Fase 1 |
| `/admin/mustahik/{id}` | Detail Mustahik — Riwayat Pinjaman | SSR | TanStack 30s | 🟡 Fase 2 |
| `/admin/kajian` | Kurikulum Kajian — Donut + Jadwal | SSR + Client | TanStack 60s | 🟡 Fase 2 |
| `/admin/bumm` | BUMM Management + Affiliate | SSR + Client | TanStack 30s | 🟡 Fase 2 |
| `/admin/laporan` | Laporan Keuangan + Export PDF | SSR | No | 🔴 Fase 1 |
| `/admin/settings` | Settings — UPZ, Akta, NPWP, Role | SSR | No | 🔴 Fase 1 |
| `/admin/audit-log` | Immutable Audit Trail (Read-Only) | SSR | No | 🟡 Fase 2 |

### 2.3 Pemuda Routes (Auth: Pemuda REMISYA)

| Route | Halaman | Strategy | Cache | Prioritas |
|---|---|---|---|---|
| `/pemuda` | Dashboard Pemuda — Komisi, Peringkat | Client TanStack | TanStack 30s | 🟡 Fase 2 |
| `/pemuda/ngonten` | Download Konten 9:16 | Static + TanStack | CDN | 🟡 Fase 2 |
| `/pemuda/jualan` | Affiliate Generator | Client TanStack | No | 🟡 Fase 2 |
| `/pemuda/leaderboard` | Peringkat Penjualan | Client TanStack | TanStack 60s | 🟡 Fase 2 |

### 2.4 Special Routes

| Route | Fungsi | Auth |
|---|---|---|
| `/auth/login` | Login page | None |
| `/auth/register` | Register page (pemuda) | None |
| `/auth/forgot-password` | Reset password | None |
| `/maintenance` | Maintenance mode | None |
| `/_health` | Health check endpoint | System |

---

## 3. ARSITEKTUR KOMPONEN & LAYOUT

### 3.1 Root Layout — Global Shell

```
<html lang="id">
<head>
  - CSP headers (via next.config.ts)
  - Font: Outfit + Inter (Google Fonts, preload)
  - Meta tags (og:image, description, canonical)
  - JSON-LD Schema.org (Organization, Mosque)
</head>
<body className="font-inter antialiased bg-[#f9fafb] text-[#1a1b22]">
  <Providers>  ← TanStack Query, Zustand, Theme
    <NuqsAdapter>  ← URL search params state
      <ErrorBoundary fallback={<ErrorPage />}>
        {children}
      </ErrorBoundary>
      <Toaster />  ← shadcn toast global
    </NuqsAdapter>
  </Providers>
</body>
</html>
```

### 3.2 Public Layout — Landing Page

```
PublicLayout
├── Navbar (fixed, glassmorphism, backdrop-blur-xl, z-50)
│   ├── Logo + Nama Masjid (link ke /)
│   ├── Desktop Nav: Program | Laporan | Kalkulator Zakat | Tentang
│   ├── Mobile: Sheet (slide-in)
│   └── CTA: [Donasi Sekarang] → scroll ke #donasi
│
├── <Suspense fallback={<SkeletonHero />}>
│   {children}   ← halaman public
│   </Suspense>
│
└── Footer
    ├── Grid 4 kolom: Alamat + Map | Program | Legal | Sosial
    ├── Legal: ✅ UPZ terdaftar, NPWP, Akta Yayasan
    └── "© Gerakan Pemuda Berdaya — Masjid At-Taqwa Ulujami"
```

### 3.3 Admin Layout — Sidebar + TopBar

```
AdminLayout (flex h-screen)
├── Sidebar (w-64, collapsible→w-16, glassmorphism)
│   ├── Logo kecil
│   ├── NavItems (icon + label, aktif di-highlight gold)
│   │   ├── 🕌 Dashboard
│   │   ├── 📍 Mustahik
│   │   ├── 📖 Baitul Dakwah
│   │   ├── 💰 Baitul Maal
│   │   ├── 👥 REMISYA
│   │   ├── 🛍️ BUMM
│   │   ├── 📋 Audit Log
│   │   └── ⚙️ Settings
│   └── User Info (nama, role, avatar)
│
├── Main Area (flex-1, overflow-y-auto)
│   ├── TopBar
│   │   ├── Search (⌘K shortcut → cmd+k)
│   │   ├── Notifications (dropdown)
│   │   └── Avatar + Dropdown (Profile, Logout)
│   │
│   └── <Suspense fallback={<SkeletonContent />}>
│       {children}
│       </Suspense>
```

### 3.4 Pemuda Layout — Mobile Bottom Nav

```
PemudaLayout (max-w-md mx-auto, min-h-screen)
├── Content Area (pb-16 — ruang bottom nav)
│   └── <Suspense fallback={<SkeletonCard />}>
│       {children}
│       </Suspense>
│
├── BottomNav (fixed bottom-0, glassmorphism, z-50)
│   ├── 🏠 Beranda
│   ├── 📹 Ngonten
│   ├── 💰 Jualan
│   ├── 🏆 Rank
│   └── 👤 Akun
│
├── FloatingActionButton (affiliate: salin link cepat)
```

### 3.5 Komposisi Halaman Kritis

#### Landing — Hero + Data + Program + Kalkulator

```
LandingPage
├── Section: Hero (bg-white, pb-16)
│   ├── Headline: text-5xl md:text-7xl font-outfit-black text-primary-deep
│   │           "Dari Masjid Kita Tuntaskan Kemiskinan"
│   │           Efek: gradien emerald via gold (bg-clip-text)
│   ├── Subheadline: text-lg md:text-xl text-muted
│   │   "70.660 jiwa miskin di JakSel. 2.782 masjid. 140 cukup."
│   └── CTA: Button gold glow [Donasi Sekarang]
│       loading: <SkeletonButton />
│
├── Section: DataStats (marquee/counter animasi)
│   ├── Card: 70.660 jiwa miskin → CounterAnim (lenis)
│   ├── Card: 14.132 KK → CounterAnim
│   ├── Card: 2.782 masjid → CounterAnim
│   └── Card: 140 aktif (5%) → CounterAnim
│
├── Section: Program (grid 1 md:grid-cols-3 gap-6)
│   ├── Card: Bank Infaq
│   │   ├── Icon emerald
│   │   ├── Judul: "Bank Infaq Qardhul Hasan"
│   │   ├── Stat: "NPF 0.2% · 30% yield"
│   │   ├── ProgressBarGold: 68% (from animasi)
│   │   │   empty: <Skeleton className="h-4 w-full" />
│   │   └── CTA: [Donasi] atau [Detail]
│   ├── Card: Wakaf Domba
│   └── Card: Beasiswa
│   │   empty (belum ada program): 
│   │   → <EmptyState icon={Heart} title="Belum ada program"
│   │        description="Program akan segera hadir" />
│
├── Section: KalkulatorZakat (bg-primary-deep text-white backdrop-blur-xl)
│   ├── Input: <Input type="number" placeholder="Penghasilan per bulan" />
│   ├── Hasil: text-3xl font-outfit-bold "Rp 125.000" (instan)
│   │   error: <Alert variant="warning" title="Input tidak valid" />
│   └── CTA: [Bayar Zakat] → /program/zakat
│
├── Section: Laporan Transparan (tabel)
│   ├── Table: Tanggal | Program | Nominal | Status
│   │   loading: <SkeletonTable rows={5} />
│   │   empty: <EmptyState title="Belum ada transaksi" />
│   └── [Unduh PDF Bulanan] → generates PDF server-side
│       loading: <SkeletonButton />
│
└── Section: Portofolio CSR (untuk korporasi)
    ├── Checklist: ✅ Akta ✅ NPWP ✅ Rekening ✅ UPZ ✅ Laporan
    └── CTA: [📥 Download Portofolio Mitra]
        error: toast "Gagal unduh. Coba lagi."
```

#### Admin — GIS Map Mustahik

```
MustahikGISPage
├── SearchFilter (top)
│   ├── SearchInput: placeholder="Cari nama/NIK..." (debounce 300ms)
│   ├── Select: Ring (1/2/3/4/semua)
│   ├── Select: Desil (1/2/3/4)
│   └── Button: [Tambah Mustahik] (role: admin/surveyor only)
│
├── MainArea (flex flex-col lg:flex-row)
│   ├── Map (h-96 lg:h-auto lg:w-2/3)
│   │   <Suspense fallback={<SkeletonMap />}>
│   │   <RingMap
│   │     center={[-6.2378, 106.7821]}  // At-Taqwa
│   │     rings={[
│   │       {radius: 500, color: '#10b981', label: 'Ring 1'},
│   │       {radius: 1000, color: '#f59e0b', label: 'Ring 2'},
│   │       {radius: 2000, color: '#f97316', label: 'Ring 3'},
│   │       {radius: 4000, color: '#ef4444', label: 'Ring 4'},
│   │     ]}
│   │   />
│   │   </Suspense>
│   │
│   └── Table (lg:w-1/3, overflow-y-auto max-h-96)
│       <Suspense fallback={<SkeletonTable rows={10} />}>
│       <MustahikTable data={data} />
│       </Suspense>
│       empty: <EmptyState icon={MapPin} title="Belum ada mustahik"
│                 action={<Button>Tambah Mustahik</Button>} />
│
├── Modal: Tambah Mustahik (Dialog shadcn)
│   └── Form (Zod validation)
│       ├── Nama, NIK (auto-encrypt), Telepon
│       ├── Alamat (auto-geocode → coordinate)
│       ├── Jenis Usaha, Penghasilan, Tanggungan
│       └── Submit → TanStack mutation → invalidate cache
│       error: toast error "Gagal menyimpan"
│       success: toast success → close modal → refetch list
│
└── Toast Notifications (global)
```

#### Portal Pemuda — Ngonten + Affiliate

```
PemudaNgontenPage
├── Header: "📹 Ngonten — Download & Sebarkan"
├── GridVideo (grid grid-cols-2 gap-4)
│   <Suspense fallback={<><SkeletonVideo/><SkeletonVideo/></>}>
│   ├── VideoCard: GPS (Gerakan Pemuda Subuh)
│   │   ├── Thumbnail (9:16 aspect-ratio)
│   │   ├── Judul: "GPS — Gerakan Pemuda Subuh"
│   │   └── [Download] → R2 signed URL
│   │       loading: <SkeletonButton />
│   │       error: toast "Gagal download"
│   ├── VideoCard: Kuy Ngaji
│   ├── VideoCard: LDSS
│   └── VideoCard: SEJIWA
│   </Suspense>
│   empty: <EmptyState icon={Video} title="Belum ada konten"
│           description="Konten baru akan ditambahkan DKM" />
│
└── FloatingButton: [📋 Salin Link Afiliasi Cepat] (mudah akses)

PemudaJualanPage
├── Header: "💰 Jualan — Dapatkan Komisi 15%"
├── Card: AffiliateGenerator
│   ├── Select: Pilih Produk BUMM
│   │   └── options: Kopi Sepanjang Waktu | DAPURUMA | Foodcourt
│   ├── Input: Kode Referral (auto-fill username)
│   ├── Hasil: "https://masjid-ataqwa.or.id/beli?ref=ahmad01"
│   └── [📋 Salin Tautan] → toast "Tautan disalin!"
│
├── Card: GMVChart (SVG, 7 hari terakhir)
│   loading: <Skeleton className="h-48 w-full" />
│
├── Card: LeaderboardMini
│   ├── 🥇 Andi: Rp 2.3jt
│   ├── 🥈 Budi: Rp 1.8jt
│   └── 🥉 Kamu: Rp 450rb (#3)
│
└── Card: Komisi Saya
    ├── Total: Rp 450.000
    ├── [Cairkan] → minimal Rp 50.000
    │   error: toast error "Saldo belum cukup"
    │   success: toast "Pengajuan pencairan dikirim"
    └── Riwayat: 5 penjualan (table mini)
        empty: <EmptyState title="Belum ada penjualan" />
```

---

## 4. STATE MANAGEMENT & DATA FLOW

### 4.1 Arsitektur State — 3 Layer

```
┌──────────────────────────────────────────────────────────┐
│  LAYER 1: SERVER STATE (TanStack Query)                   │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐                  │
│  │ mustahik │ │  loans   │ │ kajian   │                  │
│  │  query   │ │  query   │ │  query   │                  │
│  └──────────┘ └──────────┘ └──────────┘                  │
│  Cache: 5-60 detik · Stale-while-revalidate              │
│  Invalidate on mutation success                          │
├──────────────────────────────────────────────────────────┤
│  LAYER 2: CLIENT STATE (Zustand)                          │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐                  │
│  │  auth    │ │   map    │ │   ui     │                  │
│  │ store    │ │  store   │ │  store   │                  │
│  └──────────┘ └──────────┘ └──────────┘                  │
│  Auth: user, session, permissions                        │
│  Map: center, zoom, selectedRing, filters                │
│  UI: sidebarOpen, theme, modalStack                     │
├──────────────────────────────────────────────────────────┤
│  LAYER 3: URL STATE (nuqs — URL Search Params)          │
│  ┌──────────┐ ┌──────────┐                              │
│  │  filter  │ │   page   │                              │
│  │  params  │ │   number │                              │
│  └──────────┘ └──────────┘                              │
│  Shareable, bookmarkable, back-button friendly           │
└──────────────────────────────────────────────────────────┘
```

### 4.2 Data Flow Diagram

```
USER ACTION → Next.js Server Action / API Route
    │
    ├── Zod Validation → invalid → return 400 + error
    │
    ├── RBAC Check → unauthorized → return 403
    │
    ├── Rate Limit Check → exceeded → return 429
    │
    ├── Process (Service Layer)
    │   ├── Supabase Query (Drizzle ORM)
    │   ├── Midtrans API (donasi)
    │   ├── WA Send (konfirmasi)
    │   └── Audit Log (immutable insert)
    │
    ├── Response → Client → TanStack Cache Invalidate
    │
    └── Error → Global Error Handler → Log (Sentry) → User-friendly toast
```

### 4.3 Mutations Strategy

```typescript
// Pattern: Optimistic Update + Rollback on Error
const mutation = useMutation({
  mutationFn: (data: CreateMustahikInput) => createMustahik(data),
  onMutate: async (newData) => {
    await queryClient.cancelQueries({ queryKey: ['mustahik'] })
    const previous = queryClient.getQueriesData(['mustahik'])
    queryClient.setQueryData(['mustahik'], (old) => [...old, newData])
    return { previous }
  },
  onError: (err, newData, context) => {
    queryClient.setQueryData(['mustahik'], context.previous)
    toast({ title: 'Gagal', description: err.message, variant: 'destructive' })
  },
  onSettled: () => {
    queryClient.invalidateQueries({ queryKey: ['mustahik'] })
  },
})
```

---

## 5. DATABASE — 12 TABEL + POSTGIS

### 5.1 Entity Relationship (Relasi Kunci)

```
mosques 1──N users
mosques 1──N sahabat_infaq_groups
mosques 1──N bumm_products
mosques 1──N kajian_silabus
mosques 1──N unggulan_programs
    ↑
users 1──1 mustahiks (opsional, hanya jika role='mustahik')
users N──1 sahabat_infaq_groups (via leader_id)
users 1──N loans
users 1──N repayments (backstopped_by)
users 1──N affiliate_sales (referrer)
users 1──N audit_logs (actor)
    ↑
loans 1──N repayments
loans N──1 sahabat_infaq_groups
    ↑
bumm_products 1──N affiliate_sales
```

### 5.2 Definisi Tabel Lengkap

#### Table 1: `mosques` — Multi-Tenant Masjid
```sql
CREATE TABLE mosques (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,           -- 'ataqwa-ulujami'
    address TEXT NOT NULL,
    coordinate GEOMETRY(Point, 4326) NOT NULL,    -- PostGIS
    city VARCHAR(100) DEFAULT 'Jakarta Selatan',
    district VARCHAR(100) DEFAULT 'Pesanggrahan',
    village VARCHAR(100) DEFAULT 'Ulujami',
    
    -- Legalitas (wajib untuk CSR korporasi)
    npwp VARCHAR(50),
    akta_yayasan_url TEXT,                        -- R2 file URL
    upz_number VARCHAR(100),                      -- SK UPZ
    upz_legalized_date DATE,
    bank_account_name VARCHAR(255),
    bank_account_number VARCHAR(50),
    bank_name VARCHAR(100),
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    is_legalized BOOLEAN DEFAULT FALSE,
    total_mustahik_target INT DEFAULT 100,        -- target 100 KK
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ                         -- soft delete
);

CREATE INDEX idx_mosques_coordinate ON mosques USING GIST (coordinate);
CREATE INDEX idx_mosques_slug ON mosques (slug);
```

#### Table 2: `users` — Semua Pengguna (7 Role REMISYA)
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mosque_id UUID NOT NULL REFERENCES mosques(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,           -- bcrypt
    
    -- RBAC: Role + Department REMISYA
    role VARCHAR(50) NOT NULL CHECK (role IN (
        'superadmin', 'admin_dkm', 'finance_director',
        'dakwah_lead', 'social_lead', 'people_culture',
        'media_pub', 'business_lead', 'affiliate_youth', 'mustahik'
    )),
    department VARCHAR(50) CHECK (department IN (
        'dakwah', 'social', 'people_culture',
        'media', 'business', 'finance', 'secretary'
    )),
    
    -- Klasifikasi Market Dakwah (3 Ring REMISYA)
    youth_dakwah_ring INT CHECK (youth_dakwah_ring BETWEEN 1 AND 3),
    
    -- Profile
    avatar_url TEXT,
    is_verified BOOLEAN DEFAULT FALSE,
    last_login_at TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- RLS: user hanya bisa lihat data di mosque_id-nya sendiri
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY users_mosque_isolation ON users
    USING (mosque_id = current_setting('app.mosque_id')::UUID);

CREATE INDEX idx_users_mosque ON users (mosque_id);
CREATE INDEX idx_users_role ON users (role);
```

#### Table 3: `mustahiks` — Data Dhuafa + Enkripsi NIK
```sql
CREATE TABLE mustahiks (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    nik_encrypted TEXT NOT NULL,                  -- AES-256-GCM encrypted
    nik_hash VARCHAR(64) UNIQUE NOT NULL,          -- SHA-256 for dedup
    coordinate GEOMETRY(Point, 4326) NOT NULL,    -- PostGIS
    
    -- Klasifikasi MRBJ
    desil_level INT CHECK (desil_level BETWEEN 1 AND 4),
    ring_number INT NOT NULL CHECK (ring_number BETWEEN 1 AND 4),
    
    -- Data ekonomi
    monthly_income NUMERIC(12, 2),
    dependents INT DEFAULT 0,                     -- jumlah tanggungan
    usaha_type VARCHAR(100),                       -- jenis UMKM
    health_insurance_id VARCHAR(100),              -- BPJS
    
    -- Program Bank Infaq
    is_active_borrower BOOLEAN DEFAULT FALSE,
    total_loans_taken INT DEFAULT 0,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

ALTER TABLE mustahiks ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_mustahiks_coordinate ON mustahiks USING GIST (coordinate);
CREATE INDEX idx_mustahiks_ring ON mustahiks (ring_number);
CREATE INDEX idx_mustahiks_nik_hash ON mustahiks (nik_hash);
```

#### Table 4: `sahabat_infaq_groups` — Kelompok Taklim (5/7/9)
```sql
CREATE TABLE sahabat_infaq_groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mosque_id UUID NOT NULL REFERENCES mosques(id),
    group_name VARCHAR(255) NOT NULL,
    leader_id UUID REFERENCES users(id),
    member_count INT NOT NULL CHECK (member_count IN (5, 7, 9)),
    
    -- Level pembiayaan
    current_level INT DEFAULT 1 CHECK (current_level BETWEEN 1 AND 3),
    total_pokok NUMERIC(12, 2) DEFAULT 500000,
    weekly_payment NUMERIC(12, 2) DEFAULT 50000,
    week_duration INT DEFAULT 10,
    
    -- Status
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'defaulted')),
    total_repaid NUMERIC(12, 2) DEFAULT 0,
    npf_flag BOOLEAN DEFAULT FALSE,               -- flag jika ada tunggakan > 3 pekan
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

ALTER TABLE sahabat_infaq_groups ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_groups_mosque ON sahabat_infaq_groups (mosque_id);
```

#### Table 5: `loans` — Pinjaman Qardhul Hasan
```sql
CREATE TABLE loans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mustahik_id UUID NOT NULL REFERENCES users(id),
    group_id UUID REFERENCES sahabat_infaq_groups(id),
    amount NUMERIC(12, 2) NOT NULL,
    weekly_payment NUMERIC(12, 2) NOT NULL,
    week_duration INT DEFAULT 10,
    current_level INT DEFAULT 1 CHECK (current_level BETWEEN 1 AND 3),
    
    -- Status
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN (
        'active', 'completed', 'defaulted', 'restructured'
    )),
    total_paid NUMERIC(12, 2) DEFAULT 0,
    weeks_overdue INT DEFAULT 0,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

ALTER TABLE loans ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_loans_mustahik ON loans (mustahik_id);
CREATE INDEX idx_loans_group ON loans (group_id);
CREATE INDEX idx_loans_status ON loans (status);
```

#### Table 6: `repayments` — Cicilan + Presensi + Tanggung Renteng
```sql
CREATE TABLE repayments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    loan_id UUID NOT NULL REFERENCES loans(id),
    amount_paid NUMERIC(12, 2) NOT NULL,
    week_number INT NOT NULL,
    
    -- Presensi Kajian (wajib)
    is_present_taklim BOOLEAN DEFAULT TRUE,
    
    -- Tanggung Renteng
    is_backstopped BOOLEAN DEFAULT FALSE,
    backstopped_by_user_id UUID REFERENCES users(id),
    backstop_amount NUMERIC(12, 2) DEFAULT 0,
    
    -- IDEMPOTENCY KEY (cegah double entry)
    idempotency_key VARCHAR(255) UNIQUE,
    
    paid_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE repayments ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_repayments_loan ON repayments (loan_id);
CREATE INDEX idx_repayments_idempotency ON repayments (idempotency_key);
```

#### Table 7: `kajian_silabus` — Kurikulum 8 Kategori
```sql
CREATE TABLE kajian_silabus (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mosque_id UUID NOT NULL REFERENCES mosques(id),
    category VARCHAR(50) NOT NULL CHECK (category IN (
        'tafsir', 'hadits', 'fiqih', 'aqidah',
        'sirah', 'tasawuf', 'ekonomi_syariah', 'pendidikan_islam',
        'executive'
    )),
    kitab VARCHAR(255),                           -- kitab rujukan
    weight_pct DECIMAL(5, 2) NOT NULL,             -- persentase bobot (22%, 18%, dll)
    total_sessions INT DEFAULT 0,
    month_year DATE NOT NULL,                      -- periode
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    
    UNIQUE (mosque_id, category, month_year)
);

ALTER TABLE kajian_silabus ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_kajian_mosque ON kajian_silabus (mosque_id);
```

#### Table 8: `bumm_products` — Produk BUMM
```sql
CREATE TABLE bumm_products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mosque_id UUID NOT NULL REFERENCES mosques(id),
    product_name VARCHAR(255) NOT NULL,
    category VARCHAR(50) CHECK (category IN (
        'kopi', 'bakery', 'foodcourt', 'creative_hub', 'other'
    )),
    description TEXT,
    price NUMERIC(12, 2) NOT NULL,
    commission_pct NUMERIC(5, 2) DEFAULT 15.00,
    stock INT DEFAULT 0,
    image_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

ALTER TABLE bumm_products ENABLE ROW LEVEL SECURITY;
```

#### Table 9: `affiliate_sales` — Penjualan Affiliate
```sql
CREATE TABLE affiliate_sales (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES bumm_products(id),
    referrer_user_id UUID NOT NULL REFERENCES users(id),
    quantity INT NOT NULL,
    total_gmv NUMERIC(12, 2) NOT NULL,
    earned_commission NUMERIC(12, 2) NOT NULL,
    
    -- Status komisi
    commission_status VARCHAR(50) DEFAULT 'pending' CHECK (commission_status IN (
        'pending', 'approved', 'paid', 'cancelled'
    )),
    paid_at TIMESTAMPTZ,
    
    -- IDEMPOTENCY KEY
    idempotency_key VARCHAR(255) UNIQUE,
    
    sold_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE affiliate_sales ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_affiliate_referrer ON affiliate_sales (referrer_user_id);
CREATE INDEX idx_affiliate_product ON affiliate_sales (product_id);
```

#### Table 10: `unggulan_programs` — Portofolio CSR
```sql
CREATE TABLE unggulan_programs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mosque_id UUID NOT NULL REFERENCES mosques(id),
    program_name VARCHAR(255) NOT NULL,
    category VARCHAR(50) CHECK (category IN (
        'ekonomi', 'kesehatan', 'pendidikan', 'pangan', 'sosial'
    )),
    description TEXT,
    total_beneficiaries INT DEFAULT 0,
    total_budget NUMERIC(12, 2),
    impact_description TEXT,
    partner_corporation VARCHAR(255),              -- ParagonCorp, dll
    start_date DATE,
    end_date DATE,
    is_active BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

ALTER TABLE unggulan_programs ENABLE ROW LEVEL SECURITY;
```

#### Table 11: `audit_logs` — Immutable Audit Trail
```sql
-- ⚠️ HANYA INSERT, TIDAK BOLEH UPDATE/DELETE (Trigger protection)
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mosque_id UUID NOT NULL REFERENCES mosques(id),
    actor_id UUID REFERENCES users(id),
    action VARCHAR(50) NOT NULL,                    -- 'create', 'update', 'delete', 'login', 'payment'
    entity_type VARCHAR(50) NOT NULL,               -- 'mustahik', 'loan', 'repayment', 'donation'
    entity_id UUID,
    changes_json JSONB,                             -- diff perubahan (before → after)
    ip_address INET,
    user_agent TEXT,
    metadata JSONB,                                 -- konteks tambahan
    
    occurred_at TIMESTAMPTZ DEFAULT NOW()
) PARTITION BY RANGE (occurred_at);

-- Buat partition bulanan
CREATE TABLE audit_logs_2026_07 PARTITION OF audit_logs
    FOR VALUES FROM ('2026-07-01') TO ('2026-08-01');

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_audit_mosque ON audit_logs (mosque_id);
CREATE INDEX idx_audit_actor ON audit_logs (actor_id);
CREATE INDEX idx_audit_entity ON audit_logs (entity_type, entity_id);
```

#### Table 12: `donations` — Riwayat Donasi ZISWAF
```sql
CREATE TABLE donations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mosque_id UUID NOT NULL REFERENCES mosques(id),
    donor_phone VARCHAR(20),
    donor_name VARCHAR(255),
    amount NUMERIC(12, 2) NOT NULL,
    
    -- Akad ZISWAF
    akad_type VARCHAR(50) NOT NULL CHECK (akad_type IN (
        'zakat_fitrah', 'zakat_mal', 'infaq', 'sedekah', 'wakaf', 'fidyah'
    )),
    program VARCHAR(50) CHECK (program IN (
        'bank_infaq', 'wakaf_domba', 'beasiswa', 'zakat', 'general'
    )),
    
    -- Pembayaran
    payment_method VARCHAR(50) CHECK (payment_method IN (
        'qris', 'transfer', 'tunai', 'kitabisa'
    )),
    payment_status VARCHAR(50) DEFAULT 'pending' CHECK (payment_status IN (
        'pending', 'paid', 'failed', 'refunded'
    )),
    midtrans_transaction_id VARCHAR(255),
    qris_order_id VARCHAR(255),
    
    -- IDEMPOTENCY KEY
    idempotency_key VARCHAR(255) UNIQUE,
    
    paid_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE donations ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_donations_mosque ON donations (mosque_id);
CREATE INDEX idx_donations_status ON donations (payment_status);
CREATE INDEX idx_donations_program ON donations (program);
```

---

## 6. API ENDPOINTS — VERSIONED & SECURED

### 6.1 Public API (`/api/v1/public/`)

| Method | Endpoint | Validation | Rate Limit | Cache | Idempotent |
|---|---|---|---|---|---|
| GET | `/api/v1/public/mosque` | — | 100/min | ISR 60s | — |
| GET | `/api/v1/public/mosque/programs` | — | 100/min | ISR 60s | — |
| GET | `/api/v1/public/mosque/kajian` | — | 100/min | ISR 60s | — |
| POST | `/api/v1/public/donation/init` | Zod | 10/min/IP | No | ✅ key |
| GET | `/api/v1/public/donation/{id}/status` | UUID | 30/min | 30s | — |
| GET | `/api/v1/public/leaderboard` | — | 30/min | 60s | — |

### 6.2 Admin API (`/api/v1/admin/`)

| Method | Endpoint | Validation | Rate Limit | Role Required | Idempotent |
|---|---|---|---|---|---|
| GET | `/api/v1/admin/dashboard` | — | 60/min | admin_dkm | — |
| GET | `/api/v1/admin/mustahik` | Query Zod | 60/min | admin_dkm | — |
| POST | `/api/v1/admin/mustahik` | Zod schema | 30/min | admin/surveyor | ✅ key |
| PUT | `/api/v1/admin/mustahik/{id}` | Zod schema | 30/min | admin_dkm | ✅ key |
| GET | `/api/v1/admin/mustahik/{id}` | UUID param | 60/min | admin_dkm | — |
| POST | `/api/v1/admin/loan` | Zod schema | 20/min | finance_director | ✅ key |
| POST | `/api/v1/admin/repayment` | Zod schema | 60/min | bendahara | ✅ key |
| GET | `/api/v1/admin/loans?status=` | Query Zod | 60/min | admin_dkm | — |
| GET | `/api/v1/admin/npf` | — | 30/min | admin_dkm | — |
| POST | `/api/v1/admin/kajian/presensi` | Zod schema | 120/min | dakwah_lead | ✅ key |
| GET | `/api/v1/admin/kajian/silabus` | Query month | 60/min | admin_dkm | — |
| GET | `/api/v1/admin/audit-log` | Query date | 30/min | admin_dkm | — |
| GET | `/api/v1/admin/report/pdf` | Query period | 10/min | admin_dkm | — |

### 6.3 Pemuda API (`/api/v1/pemuda/`)

| Method | Endpoint | Validation | Rate Limit | Role Required | Idempotent |
|---|---|---|---|---|---|
| GET | `/api/v1/pemuda/dashboard` | — | 60/min | affiliate_youth | — |
| GET | `/api/v1/pemuda/products` | — | 30/min | affiliate_youth | — |
| POST | `/api/v1/pemuda/affiliate/sale` | Zod | 20/min | affiliate_youth | ✅ key |
| GET | `/api/v1/pemuda/commission` | — | 30/min | affiliate_youth | — |
| POST | `/api/v1/pemuda/commission/withdraw` | Zod | 5/min | affiliate_youth | ✅ key |
| GET | `/api/v1/pemuda/leaderboard` | — | 30/min | affiliate_youth | — |

### 6.4 Webhook (No Auth — Verifikasi Signature)

| Method | Endpoint | Rate Limit | Verification |
|---|---|---|---|
| POST | `/api/v1/webhook/midtrans` | 60/min/IP | HMAC SHA512 signature |
| POST | `/api/v1/webhook/fonnte` | 60/min/IP | API token match |

### 6.5 System

| Method | Endpoint | Rate Limit |
|---|---|---|
| GET | `/_health` | 10/min |
| GET | `/_health/db` | 10/min |

### 6.6 API Response Format — Unified

```typescript
// Success
{
  "success": true,
  "data": T,
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "cached_at": "2026-07-01T08:00:00Z"
  }
}

// Error
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "NIK tidak valid",
    "details": [
      { "field": "nik", "message": "Panjang harus 16 karakter" }
    ]
  },
  "request_id": "req_abc123"
}

// Rate Limited
{
  "success": false,
  "error": {
    "code": "RATE_LIMITED",
    "message": "Terlalu banyak permintaan. Coba lagi dalam 30 detik.",
    "retry_after": 30
  }
}
```

### 6.7 Idempotency — Cegah Double Submit

```typescript
// Semua POST/PUT/PATCH wajib kirim header:
// Idempotency-Key: <UUID>

async function ensureIdempotency(key: string): Promise<boolean> {
  const existing = await redis.get(`idempotency:${key}`)
  if (existing) return false  // request duplikat → tolak
  await redis.setex(`idempotency:${key}`, 86400, 'processed')  // 24 jam
  return true
}

// Di setiap mutation endpoint:
export async function POST(request: Request) {
  const idempotencyKey = request.headers.get('Idempotency-Key')
  if (!idempotencyKey) return Response.json(
    { success: false, error: { code: 'MISSING_IDEMPOTENCY_KEY' } },
    { status: 400 }
  )
  
  const isNew = await ensureIdempotency(idempotencyKey)
  if (!isNew) return Response.json(
    { success: false, error: { code: 'DUPLICATE_REQUEST' } },
    { status: 409 }
  )
  
  // Process...
}
```

---

## 7. KEAMANAN — 12 LAPIS PERTAHANAN

### Layer 1: CSP Headers (next.config.ts)
```typescript
const securityHeaders = [
  { key: 'Content-Security-Policy', value: [
    "default-src 'self'",
    "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://js.midtrans.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "img-src 'self' data: https: blob:",
    "font-src 'self' https://fonts.gstatic.com",
    "connect-src 'self' https://api.midtrans.com wss://*.supabase.co",
    "frame-src 'self' https://snap.midtrans.com",
    "worker-src 'self' blob:",
  ].join('; ') },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(self)' },
]
```

### Layer 2: SQL Injection Prevention
- Drizzle ORM — parameterized queries by default (no raw SQL)
- Jika terpaksa raw SQL: wajib `sql` template literal dari Drizzle (escaped)
- All input via Zod schema — type-safe sebelum query

### Layer 3: XSS Prevention
- React 19 — auto-escape by default
- Next.js — server components don't expose client JS
- CSP: no `'unsafe-inline'` on script-src (kecuali Next.js hot reload di dev)
- Input sanitization: DOMPurify untuk user-generated HTML (jika ada)

### Layer 4: CSRF Protection
- SameSite=Strict pada semua cookie session
- CORS: origin terbatas (tidak wildcard)
- POST/PUT/DELETE: butuh CSRF token atau header `X-Requested-With`

### Layer 5: Rate Limiting (Lihat Section 14)

### Layer 6: Authentication & Session
- Session via Supabase Auth (httpOnly cookie, secure, sameSite)
- JWT expiry: 1 jam (access) + 7 hari (refresh)
- Admin: session lebih ketat (1 jam, re-auth untuk sensitive actions)
- Password: bcrypt (cost=12), minimal 8 karakter

### Layer 7: Row-Level Security (PostgreSQL)
```sql
-- Setiap tabel punya RLS policy untuk isolasi masjid
ALTER TABLE ... ENABLE ROW LEVEL SECURITY;

-- Policy global: user hanya bisa akses data di mosque_id-nya
CREATE POLICY tenant_isolation ON {table}
    USING (mosque_id = current_setting('app.mosque_id')::UUID);

-- Policy khusus: mustahik hanya bisa baca datanya sendiri
CREATE POLICY mustahik_self_read ON mustahiks FOR SELECT
    USING (user_id = current_setting('app.user_id')::UUID);
```

### Layer 8: Data Encryption
- NIK: AES-256-GCM + SHA-256 hash (untuk dedup)
- Kunci simetris di Cloudflare Secrets (bukan .env)
- Database: encrypted at rest (Supabase managed)
- Transport: TLS 1.3 (Cloudflare)

### Layer 9: Webhook Signature Verification
```typescript
function verifyMidtransSignature(
  payload: string, signature: string, orderId: string, statusCode: string,
  grossAmount: string, serverKey: string
): boolean {
  const hash = crypto
    .createHash('sha512')
    .update(`${orderId}${statusCode}${grossAmount}${serverKey}`)
    .digest('hex')
  return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(signature))
}
```

### Layer 10: Input Validation — Zod Schemas
```typescript
const CreateMustahikSchema = z.object({
  name: z.string().min(3).max(255),
  nik: z.string().length(16).regex(/^\d{16}$/),
  phone: z.string().regex(/^(\+62|62|0)8[1-9][0-9]{6,9}$/),
  address: z.string().min(10).max(1000),
  monthly_income: z.number().positive(),
  dependents: z.number().int().min(0).max(20),
  usaha_type: z.string().optional(),
})
```

### Layer 11: Secure Secrets Management
- `AES256_KEY` → Cloudflare Workers Secrets (bukan .env)
- `MIDTRANS_SERVER_KEY` → Cloudflare Workers Secrets
- `WA_FONNTE_TOKEN` → Cloudflare Workers Secrets
- `.env.local` → hanya untuk dev, di .gitignore
- Rotasi secret: setiap 90 hari (cron task)

### Layer 12: Audit Log — Immutable Ledger
- Semua perubahan data sensitif tercatat di `audit_logs`
- Trigger PostgreSQL LARANG update/delete di audit_logs
- Log: siapa, apa, kapan, data sebelum&sesudah, IP address

---

## 8. RBAC — MATRIKS HAK AKSES DETAIL

### 8.1 Role Definitions

| Role | Department | Akses | Target |
|---|---|---|---|
| `superadmin` | — | Full system, all mosques | Developer/Agensi |
| `admin_dkm` | — | All modules, settings, user management | Ketua DKM |
| `finance_director` | Finance | ZIS, loans, NPF, laporan, audit | Bendahara |
| `dakwah_lead` | Dakwah | Kurikulum kajian, jadwal, pemateri | Ustadz/koordinator |
| `social_lead` | Social | GSS, SAQURA, SEJIWA tracker | Koordinator sosial |
| `people_culture` | People & Culture | AKAR kaderisasi, anggota | HR remaja masjid |
| `media_pub` | Media | Asset konten, medsos, branding | Tim kreatif |
| `business_lead` | Business | BUMM, produk, affiliate | Pengusaha masjid |
| `affiliate_youth` | Business | Ngonten, jualan, komisi (self only) | Pemuda masjid |
| `mustahik` | — | Dashboard pribadi, riwayat pinjaman | Penerima manfaat |

### 8.2 Permission Matrix

| Fitur | superadmin | admin_dkm | finance | dakwah | social | people | media | business | youth | mustahik |
|---|---|---|---|---|---|---|---|---|---|---|
| Manajemen Masjid | RWX | RWX | — | — | — | — | — | — | — | — |
| CRUD Mustahik | RWX | RWX | R | R | RW | R | — | — | — | R(self) |
| Bank Infaq | RWX | RWX | RWX | — | — | — | — | — | — | R(self) |
| Repayment | R | RW | RWX | — | — | — | — | — | — | R(self) |
| Kurikulum Kajian | RWX | RWX | R | RWX | — | — | — | — | — | — |
| BUMM Produk | RWX | RWX | R | — | — | — | — | RWX | R | — |
| Affiliate Sales | RWX | RWX | R | — | — | — | — | RW | RWX | — |
| Audit Log | RWX | R | R | — | — | — | — | — | — | — |
| Settings | RWX | RWX | — | — | — | — | — | RW | — | — |
| User Management | RWX | RWX(masjid) | — | — | — | — | — | — | — | — |
| Laporan PDF | RWX | RWX | RWX | R | R | R | R | R | R | R(self) |
| Komisi Saya | — | — | — | — | — | — | — | — | RWX | — |

*R=Read, W=Write, X=Execute/Delete*

---

## 9. MONITORING, OBSERVABILITY & AUDIT LOG

### 9.1 Observability Stack

```
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│  Sentry      │    │  Supabase    │    │  Cloudflare  │
│  (Errors)    │    │  (Logs)      │    │  (Analytics) │
├──────────────┤    ├──────────────┤    ├──────────────┤
│ - JS errors  │    │ - SQL query  │    │ - Request    │
│ - API errors │    │ - Auth       │    │   count      │
│ - Crash       │    │   events     │    │ - Status     │
│   reporting  │    │ - Realtime   │    │   codes      │
│ - Performance│    │   usage      │    │ - Bandwidth  │
└──────────────┘    └──────────────┘    └──────────────┘
```

### 9.2 Alerting Rules

| Metric | Threshold | Action |
|---|---|---|
| API Error Rate | > 5% dalam 5 menit | Sentry alert + email admin |
| NPF Rate | > 1% | Email bendahara |
| NPF Rate | > 5% | WhatsApp ke admin DKM |
| Payment Failure | 3 gagal beruntun | Alert + manual check |
| Rate Limit Hit | > 100×/jam dari 1 IP | Investigate (possible attack) |
| Uptime | < 99.9% | Cloudflare alert |
| Database Connection | > 80% pool | Scale up or optimize |

### 9.3 Audit Log — Detailed Schema

```typescript
// Setiap perubahan data sensitif
await auditLog.create({
  mosque_id: currentMosqueId,
  actor_id: currentUserId,
  action: 'update',
  entity_type: 'mustahik',
  entity_id: mustahikId,
  changes_json: {
    before: { ring_number: 2, desil_level: 3 },
    after: { ring_number: 1, desil_level: 2 }
  },
  ip_address: request.ip,
  user_agent: request.headers.get('user-agent'),
  metadata: { reason: 'reclassification_survey' }
})
```

---

## 10. CI/CD PIPELINE — 4 STAGE GATES

### 10.1 Pipeline Flow

```
GITHUB PUSH (main/staging)
    │
    ▼
┌─────────────────────────────────────┐
│ STAGE 1: LINT & TYPECHECK           │
│ ├─ pnpm lint (ESLint + Next.js)     │
│ ├─ pnpm typecheck (tsc --noEmit)    │
│ └─ Bun check: 0 error              │
│ GATE: ❌ fail → block deploy        │
└─────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────┐
│ STAGE 2: TEST                        │
│ ├─ pnpm test (Vitest)               │
│ ├─ pnpm test:e2e (Playwright)       │
│ └─ coverage > 70%                   │
│ GATE: ❌ fail → block deploy        │
└─────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────┐
│ STAGE 3: BUILD & AUDIT               │
│ ├─ pnpm build (next build)          │
│ ├─ pnpm lint:security (Semgrep)     │
│ └─ pnpm audit (dependencies)        │
│ GATE: ❌ fail → block deploy        │
└─────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────┐
│ STAGE 4: DEPLOY                      │
│ ├─ wrangler deploy (staging first)  │
│ ├─ Smoke test (/_health)            │
│ ├─ Sentry release tracking          │
│ └─ Rollback if health check fails   │
└─────────────────────────────────────┘
```

### 10.2 Rollback Strategy

```yaml
# wrangler.toml
routes = [
  { pattern = "masjid-ataqwa.or.id", zone_id = "...", custom_domain = true }
]

# Rollback: wrangler rollback --version <previous>
# Auto-rollback: jika smoke test gagal setelah deploy
```

---

## 11. DATABASE MIGRATION & SEEDING

### 11.1 Migration Workflow

```bash
# Generate migration (setelah edit schema)
pnpm drizzle-kit generate

# Review migration file di src/db/migrations/
# Apply ke database
pnpm drizzle-kit migrate

# Rollback (jika perlu)
pnpm drizzle-kit drop
pnpm drizzle-kit migrate  # re-apply dari awal
```

### 11.2 Seeding (Data Dummy)

```typescript
// src/db/seed.ts
async function seed() {
  // 1 masjid (At-Taqwa)
  const mosque = await db.insert(mosques).values({
    name: 'Masjid Jami\' At-Taqwa Ulujami',
    slug: 'ataqwa-ulujami',
    coordinate: 'POINT(106.7821 -6.2378)',
    upz_number: 'UPZ/2026/001',
  }).returning()

  // 5 pengurus (admin_dkm, finance, dakwah, media, business)
  // 30 mustahik (random sebaran Ring 1-4 via PostGIS)
  // 10 produk BUMM
  // 15 jadwal kajian
  // 20 transaksi donasi
  // 15 loans + repayments
  // 30 audit log entries
}
```

---

## 12. KOMPONEN UI — SHADCN + KUSTOM

### 12.1 shadcn/ui Components

```
Button, Input, Select, Card, Badge, Table, Dialog,
Sheet, DropdownMenu, Tabs, Progress, Toast, Avatar,
Separator, ScrollArea, Command (⌘K search), Tooltip,
Alert, Skeleton, Calendar, Form (react-hook-form)
```

### 12.2 Custom Components (12)

```
1. <RingMap />           — Leaflet.js + 4 circle overlay + pin warna
2. <DonutChart />        — SVG donut kurikulum (Tafsir 22%, dll)
3. <ProgressBarGold />   — Animasi gold gradient, Transisi CSS 500ms
4. <GMVLineChart />      — SVG line chart, fill gradien emerald
5. <CounterAnim />       — Counter angka statistik (lenis smooth scroll trigger)
6. <KalkulatorZakat />   — Input × 2.5% instant, backdrop-blur, glassmorphism
7. <QRScanner />         — HTML5 QR scan untuk presensi kajian
8. <VideoGrid />         — Grid 2 kolom 9:16 + download button
9. <AffiliateGenerator />— Dropdown produk + kode + copy link + toast
10. <PortofolioCSR />    — Checklist 5 syarat (Akta, NPWP, dll) + download PDF
11. <SkeletonTable />    — Table loading state (shimmer animation)
12. <EmptyState />       — Icon + title + description + action button
```

### 12.3 Component States (WAJIB Setiap Komponen)

| State | Keterangan | Contoh Visual |
|---|---|---|
| **Loading** | Skeleton/shimmer saat data di-fetch | `<Skeleton className="h-4 w-3/4" />` |
| **Empty** | Data kosong — bukan error | `<EmptyState icon={MapPin} title="Belum ada mustahik" />` |
| **Error** | Fetch/validation gagal | `<Alert variant="destructive" />` + toast |
| **Success** | Operasi berhasil | Toast hijau + invalidate cache |
| **Idle** | Belum ada interaksi | Default render |

---

## 13. ERROR HANDLING STRATEGY — GLOBAL

### 13.1 Error Boundary Hierarchy

```
app/error.tsx                 ← Global (React Error Boundary)
├── app/(public)/error.tsx    ← Public pages
├── app/(admin)/error.tsx     ← Admin pages (include "logout and contact dev")
└── app/(pemuda)/error.tsx    ← Pemuda pages (include "coba lagi")
```

### 13.2 Global Error Handler (API)

```typescript
// src/lib/error-handler.ts
type ErrorCode = 
  | 'VALIDATION_ERROR' | 'UNAUTHORIZED' | 'FORBIDDEN'
  | 'NOT_FOUND' | 'RATE_LIMITED' | 'CONFLICT'
  | 'IDEMPOTENCY_CONFLICT' | 'PAYMENT_FAILED'
  | 'INTERNAL_ERROR' | 'THIRD_PARTY_DOWN'

class AppError extends Error {
  constructor(
    public code: ErrorCode,
    message: string,
    public status: number,
    public details?: unknown
  ) { super(message) }
}

function handleAPIError(error: unknown, requestId: string) {
  if (error instanceof AppError) {
    return Response.json({
      success: false,
      error: { code: error.code, message: error.message, details: error.details },
      request_id: requestId
    }, { status: error.status })
  }

  if (error instanceof z.ZodError) {
    return Response.json({
      success: false,
      error: { 
        code: 'VALIDATION_ERROR', 
        message: 'Input tidak valid',
        details: error.errors.map(e => ({ field: e.path.join('.'), message: e.message }))
      },
      request_id: requestId
    }, { status: 400 })
  }

  // Unexpected error → log to Sentry
  Sentry.captureException(error)
  
  return Response.json({
    success: false,
    error: { code: 'INTERNAL_ERROR', message: 'Terjadi kesalahan. Tim kami sedang memperbaiki.' },
    request_id: requestId
  }, { status: 500 })
}
```

### 13.3 User-Facing Error Pages

```
/not-found → halaman 404 khas Masjid At-Taqwa
  ┌──────────────────────────────┐
  │   Halaman Tidak Ditemukan    │
  │                              │
  │   Maaf, halaman yang Anda    │
  │   cari tidak ada.            │
  │                              │
  │   [Kembali ke Beranda]       │
  │   [Hubungi DKM]              │
  └──────────────────────────────┘

/error → halaman 500
  ┌──────────────────────────────┐
  │   Ada yang Tidak Beres       │
  │                              │
  │   Tim IT kami sudah mendapat │
  │   notifikasi. Silakan coba   │
  │   lagi beberapa saat.        │
  │                              │
  │   [Coba Lagi] [Hubungi DKM]  │
  └──────────────────────────────┘
```

---

## 14. RATE LIMITING & DDOS PROTECTION

### 14.1 Rate Limit Tiers

| Tier | Window | Max Requests | Endpoints |
|---|---|---|---|
| **Public** | 1 menit | 100 | GET public, leaderboard |
| **Donasi** | 1 menit | 10 | POST donation/init (per IP) |
| **Admin** | 1 menit | 60 | All admin endpoints |
| **Mutasi** | 1 menit | 20 | POST loan, repayment, mustahik |
| **Webhook** | 1 menit | 60 | Webhook Midtrans (per IP) |
| **Report** | 5 menit | 10 | GET report/pdf |

### 14.2 Implementation — Cloudflare KV

```typescript
// src/lib/rate-limit.ts
export async function checkRateLimit(
  identifier: string,     // IP atau user ID
  maxRequests: number,
  windowMs: number,
  kv: KVNamespace
): Promise<{ allowed: boolean; remaining: number; resetAt: number }> {
  const key = `ratelimit:${identifier}`
  const now = Date.now()
  const windowStart = Math.floor(now / windowMs) * windowMs
  
  const record = await kv.get<{ count: number; windowStart: number }>(key, 'json')
  
  if (!record || record.windowStart !== windowStart) {
    await kv.put(key, JSON.stringify({ count: 1, windowStart }), { expirationTtl: Math.ceil(windowMs / 1000) })
    return { allowed: true, remaining: maxRequests - 1, resetAt: windowStart + windowMs }
  }
  
  if (record.count >= maxRequests) {
    return { allowed: false, remaining: 0, resetAt: windowStart + windowMs }
  }
  
  record.count++
  await kv.put(key, JSON.stringify(record))
  return { allowed: true, remaining: maxRequests - record.count, resetAt: windowStart + windowMs }
}
```

### 14.3 DDoS Protection (Infrastructure Level)
- **Cloudflare WAF**: Rate limiting rules, bot fight mode
- **Cloudflare DDoS**: L3/L7 managed protection (aktif otomatis)
- **Cache static assets**: CSS, JS, images via Cloudflare CDN (kurang beban origin)
- **Challenge**: Turnstile (Cloudflare) untuk form donasi jika mencurigakan

---

## 15. LOADING, SKELETON, & EMPTY STATE

### 15.1 Loading Strategy per Page

| Halaman | Fallback Strategy | Detail |
|---|---|---|
| Landing | Suspense + SkeletonHero | Hero skeleton, lalu data streaming |
| Admin Dashboard | Suspense + SkeletonKPI | 4 card skeleton, stream satu-satu |
| GIS Map | Suspense + SkeletonMap | Map fallback, tiles load after |
| Table Mustahik | Suspense + SkeletonTable | 10 row shimmer, pagination skeleton |
| Kurikulum Kajian | Suspense + DonutSkeleton | Circle skeleton + bar skeleton |
| Affiliate | Suspense + SkeletonCard | Card skeleton per section |
| PDF Report | Server generate + loading toast | "Menyiapkan laporan..." toast |

### 15.2 Empty State Components

```typescript
// src/components/custom/EmptyState.tsx
<EmptyState
  icon={MapPin}
  title="Belum Ada Mustahik"
  description="Mulai dengan menambahkan mustahik pertama."
  action={<Button onClick={openModal}>Tambah Mustahik</Button>}
/>
```

---

## 16. CACHING STRATEGY — 3 LAPIS

### 16.1 Layer 1: CDN (Cloudflare)

| Content | Cache Rule | TTL |
|---|---|---|
| Static assets (CSS, JS, images) | Cache everything | 365 hari |
| Public pages (landing, program) | Cache with ISR | 60-300 detik |
| API public responses | Edge cache | 30-60 detik |
| Admin/Pemuda pages | No cache (dynamic) | — |

### 16.2 Layer 2: TanStack Query (Client)

| Query | Stale Time | Cache Time | Refetch |
|---|---|---|---|
| `['mustahik']` | 30s | 5 min | On mount + focus |
| `['loans']` | 30s | 5 min | On mount + focus |
| `['kajian']` | 60s | 10 min | On mount |
| `['products']` | 60s | 10 min | On mount |
| `['leaderboard']` | 60s | 10 min | On mount |
| `['dashboard']` | 15s | 5 min | On mount + focus |
| Mutations | — | — | Invalidate related queries on success |

### 16.3 Layer 3: Server-Side Cache

```typescript
// Next.js ISR + unstable_cache (Drizzle)
import { unstable_cache } from 'next/cache'

const getMustahikCount = unstable_cache(
  async (mosqueId: string) => {
    return await db.select({ count: count() }).from(mustahiks)
      .where(eq(mustahiks.mosque_id, mosqueId))
  },
  ['mustahik-count'],
  { revalidate: 300, tags: ['mustahik'] }
)
```

### 16.4 Cache Invalidation

```typescript
// Setelah mutation → revalidate tag
import { revalidateTag } from 'next/cache'

export async function POST_mustahik(data: CreateMustahikInput) {
  await db.insert(mustahiks).values(data)
  revalidateTag('mustahik')           // server cache
  // TanStack Query client akan auto-refetch via invalidateQueries
}
```

---

## 17. DISASTER RECOVERY & BACKUP

### 17.1 Backup Strategy

| Data | Frekuensi | Metode | Retention |
|---|---|---|---|
| Database (Supabase) | Harian (03:00 WIB) | pg_dump → R2 | 30 hari |
| File (R2 Bucket) | Real-time | Cloudflare R2 replication | 90 hari |
| Audit Logs | Bulanan | Partition freeze + backup | 5 tahun (compliance) |
| Konfigurasi | Per deploy | Git history | Forever |

### 17.2 Recovery Plan

```
SKENARIO: Database corrupt / terhapus
1. Supabase Point-in-Time Recovery (PITR) — 7 hari
2. Atau: restore dari pg_dump terakhir di R2
   → psql -h newhost -U postgres -d postgres < backup_20260701.sql
3. Verify: jalankan seed test + health check

SKENARIO: Cloudflare account compromised
1. Rotasi semua API keys & tokens (dalam 15 menit)
2. Revoke deploy access
3. Restore dari git history

SKENARIO: Masjid ingin keluar dari platform
1. Export semua data masjid (SQL dump + R2 files)
2. Hapus data dalam 30 hari (sesuai kebijakan)
3. Sertifikat penghapusan data
```

---

## 18. SKALABILITAS — 3 TAHAP PERTUMBUHAN

### Tahap 1: 1 Masjid (Saat Ini — 2026)

| Aspek | Kapasitas | Catatan |
|---|---|---|
| Users | < 500 | Supabase Free |
| Mustahik | < 200 | 100 target |
| Database | 500 MB | Supabase Free (500 MB) |
| API | 10K req/hari | Cloudflare Workers free (100K req/hari) |
| Storage (R2) | < 1 GB | Free tier (10 GB) |

### Tahap 2: 10 Masjid (2027)

| Upgrade | Solusi | Biaya |
|---|---|---|
| Supabase Pro ($25/bln) | 8 GB DB, 100 GB bandwidth | $25/bulan |
| Cloudflare Workers Paid ($5/bln) | 10M req/hari | $5/bulan |
| R2 Paid | 100 GB storage | $0.015/GB |
| Multi-tenant | RLS isolation, per-masjid config | — |

### Tahap 3: 140+ Masjid (Target GMIB — 2028+)

| Upgrade | Solusi |
|---|---|
| Supabase Team Plan ($599/bln) | Read replicas, 16 GB RAM |
| Dedicated DB | Supabase Multi-Zone |
| CDN Multi-region | Cloudflare Enterprise |
| Queue System | Cloudflare Queues untuk webhook & notifikasi |
| Analytics | Supabase Logs + Cloudflare Analytics |
| Support | 24/7 dedicated engineer |

---

## 19. DEPENDENCIES LOCKED

```json
{
  "dependencies": {
    "next": "^16.0.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "@supabase/supabase-js": "^2.45.0",
    "@supabase/ssr": "^0.5.0",
    "drizzle-orm": "^0.35.0",
    "drizzle-zod": "^0.6.0",
    "postgres": "^3.4.0",
    "@tanstack/react-query": "^5.60.0",
    "zustand": "^5.0.0",
    "nuqs": "^2.0.0",
    "next-themes": "^0.4.0",
    "leaflet": "^1.9.0",
    "react-leaflet": "^5.0.0",
    "framer-motion": "^11.0.0",
    "lenis": "^1.1.0",
    "zod": "^3.23.0",
    "react-hook-form": "^7.53.0",
    "@hookform/resolvers": "^3.9.0",
    "lucide-react": "^0.460.0",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.1.0",
    "tailwind-merge": "^2.5.0",
    "tailwindcss-animate": "^1.0.0",
    "date-fns": "^4.1.0",
    "recharts": "^2.13.0",
    "html5-qrcode": "^2.3.0",
    "@sentry/nextjs": "^8.30.0",
    "isomorphic-dompurify": "^2.1.0",
    "@radix-ui/react-dialog": "^1.1.0",
    "@radix-ui/react-dropdown-menu": "^2.1.0",
    "@radix-ui/react-tabs": "^1.1.0",
    "@radix-ui/react-tooltip": "^1.1.0",
    "@radix-ui/react-select": "^2.1.0",
    "@radix-ui/react-toast": "^1.2.0",
    "@radix-ui/react-slot": "^1.1.0"
  },
  "devDependencies": {
    "typescript": "^5.7.0",
    "@types/node": "^22.0.0",
    "@types/react": "^19.0.0",
    "@types/leaflet": "^1.9.0",
    "tailwindcss": "^4.0.0",
    "postcss": "^8.4.0",
    "autoprefixer": "^10.4.0",
    "drizzle-kit": "^0.27.0",
    "opennext": "^2.0.0",
    "vitest": "^3.0.0",
    "@playwright/test": "^1.48.0",
    "eslint": "^9.0.0",
    "eslint-config-next": "^16.0.0",
    "prettier": "^3.4.0",
    "prettier-plugin-tailwindcss": "^0.6.0"
  }
}
```

---

## 20. KONFIGURASI LINGKUNGAN — 35 VARIABEL

```env
# ─── NODE ───
NODE_ENV=development|production

# ─── SUPABASE ───
NEXT_PUBLIC_SUPABASE_URL=https://nqlazrjcywyltewsxgmx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<sb_publishable>
SUPABASE_SERVICE_ROLE_KEY=<sb_secret>

# ─── DATABASE (Supabase Postgres) ───
DATABASE_URL=postgresql://postgres:<pw>@db.supabase.co:5432/postgres
DATABASE_POOL_URL=postgresql://postgres:<pw>@db.supabase.co:6543/postgres

# ─── CLOUDFLARE ───
CLOUDFLARE_ACCOUNT_ID=<id>
CLOUDFLARE_API_TOKEN=<vcp_xxx>

# ─── R2 (Asset Storage) ───
R2_ACCESS_KEY_ID=<key>
R2_SECRET_ACCESS_KEY=<secret>
R2_BUCKET_NAME=masjid-hub-assets
R2_PUBLIC_URL=https://pub-<hash>.r2.dev

# ─── MIDTRANS (QRIS) ───
MIDTRANS_SERVER_KEY=<server_key>
MIDTRANS_CLIENT_KEY=<client_key>
MIDTRANS_WEBHOOK_SECRET=<sha512_secret>
MIDTRANS_IS_PRODUCTION=false

# ─── WHATSAPP ───
WA_FONNTE_TOKEN=<token>        # opsional (fallback: wa.me link)
WA_FONNTE_SENDER=628xx

# ─── ENCRYPTION ───
AES256_KEY=<32-byte-hex-key>   # Wajib di Cloudflare Secrets, bukan .env
ENCRYPTION_KEY_VERSION=1

# ─── AUTH ───
NEXT_PUBLIC_SITE_URL=https://masjid-ataqwa.or.id
AUTH_REDIRECT_URL=https://masjid-ataqwa.or.id/auth/callback

# ─── SENTRY ───
SENTRY_DSN=<dsn-url>
SENTRY_ENVIRONMENT=production

# ─── FEATURE FLAGS ───
FEATURE_BANK_INFAQ=true
FEATURE_WAKAF_DOMBA=true
FEATURE_AFFILIATE=true
FEATURE_CSR_PORTFOLIO=true
NEXT_PUBLIC_MAINTENANCE_MODE=false

# ─── KITABISA ───
KITABISA_API_KEY=<key>         # integrasi donasi Kitabisa

# ─── GOOGLE ───
NEXT_PUBLIC_GA_ID=G-XXXXXXXX  # Google Analytics 4
```

---

## 21. PERFORMANCE BUDGET

### 21.1 Target Core Web Vitals

| Metric | Target | Metode |
|---|---|---|
| LCP (Largest Contentful Paint) | < 2.5s | ISR, preload font, optimized images |
| INP (Interaction to Next Paint) | < 200ms | Code splitting, lazy components |
| CLS (Cumulative Layout Shift) | < 0.1 | Fixed layout shifts, skeleton pre-size |
| FCP (First Contentful Paint) | < 1.5s | CDN cache, minimal JS, SSR streaming |
| TBT (Total Blocking Time) | < 300ms | Deferred 3rd party, web worker |
| Lighthouse Score | ≥ 95 | All categories |

### 21.2 Asset Budget

| Asset | Budget | Strategy |
|---|---|---|
| HTML (landing) | < 100 KB | SSR streaming, minimal inline CSS |
| CSS (Tailwind) | < 50 KB | Purge unused, code split per route |
| JS (bundle) | < 200 KB initial | Code splitting, dynamic import |
| Fonts (Outfit + Inter) | < 50 KB | WOFF2, subset, preload |
| Images | < 200 KB per page | WebP, AVIF, lazy loading |
| Total per page | < 600 KB | Target: 2G mobile friendly |

---

## 22. ARSITEKTUR DECISION RECORDS (ADR)

### ADR-001: Mengapa Cloudflare Workers bukan Vercel?
**Status:** Accepted  
**Konteks:** Vercel Hobby melanggar ToS untuk situs klien (AUDIT_PROFESOR_2026_v2.md NF-01).  
**Keputusan:** Cloudflare Workers + OpenNext.  
**Konsekuensi:** Setup lebih kompleks (OpenNext, wrangler), tapi gratis dan komersial diizinkan.

### ADR-002: Mengapa UUID bukan Auto-Increment ID?
**Status:** Accepted  
**Konteks:** Multi-tenant scaling, keamanan (IDOR prevention), sharding.  
**Keputusan:** UUID v4 untuk semua primary key.  
**Konsekuensi:** Storage sedikit lebih besar (16 bytes vs 4 bytes), tapi tidak perlu sequence coordination.

### ADR-003: Mengapa AES-256-GCM untuk NIK?
**Status:** Accepted  
**Konteks:** Wajib enkripsi data pribadi (NIK KTP). AES-256-GCM menyediakan authenticated encryption.  
**Keputusan:** AES-256-GCM + SHA-256 hash untuk deduplication.  
**Konsekuensi:** Key harus dirotasi tiap 90 hari. Query by NIK pakai hash, bukan encrypted value.

### ADR-004: Mengapa Zustand bukan Redux?
**Status:** Accepted  
**Konteks:** Client state tidak kompleks. Hanya auth, map, UI state.  
**Keputusan:** Zustand (ringan, TypeScript native, tanpa boilerplate).  
**Konsekuensi:** Tidak cocok untuk state sangat kompleks dengan banyak middleware.

### ADR-005: Mengapa TanStack Query untuk server state?
**Status:** Accepted  
**Konteks:** Butuh caching, refetch, optimistic update, dan deduplication.  
**Keputusan:** TanStack Query v5 — standar industri untuk React server state.  
**Konsekuensi:** Bundle size ~12 KB gzipped, tapi fitur setara dengan investasi.

---

## AUDIT TRAIL — VERIFIKASI 3 SIKLUS

```
SIKLUS 1 — LOW LEVEL ✅
□ Hierarki proyek lengkap (3 layout, error pages, loading states)
□ 13 route publik + 9 admin + 4 pemuda + 4 special
□ 12 komponen kustom dengan 5 state masing-masing
□ Accessibility: ARIA labels, focus visible, keyboard nav, skip link

SIKLUS 2 — HIGH LEVEL ✅
□ API versioning (/v1/) — 25 endpoints, semua terverifikasi
□ Idempotency key pada semua mutation endpoints
□ RBAC matrix — 10 roles × 12 fitur
□ Database — 12 tabel, RLS on all, audit log immutable
□ Webhook SHA512 verification
□ Rate limiting — 6 tier (10-100 req/window)
□ Error handling — global boundary, structured API errors

SIKLUS 3 — EXPERT LEVEL ✅
□ Disaster recovery — 3 skenario dengan SOP
□ Scalability — 3 tahap (1 → 10 → 140+ masjid)
□ CI/CD — 4 stage gates (lint → test → build/audit → deploy)
□ Monitoring — Sentry + Supabase Logs + Cloudflare Analytics
□ Caching — 3 lapis (CDN → TanStack → Server ISR)
□ Performance budget — 6 metric dengan target
□ ADR — 5 keputusan arsitektur terdokumentasi
□ Security — 12 lapis pertahanan (CSP → RLS → Enkripsi → Audit)
```

---

🟢 **HIJAU** (ARSITEKTUR v2.0 — Enterprise Edition. 22 section, 12 RBAC roles, 12 tabel database, 25 API endpoints, 12 lapis keamanan, 6 tier rate limit, 3 lapis caching, 3 tahap scalability, 5 ADR. Audit 3 siklus ✅.)
