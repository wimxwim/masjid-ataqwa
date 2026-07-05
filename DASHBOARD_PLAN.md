# Dashboard Admin Masjid Hub — Implementation Plan (Revised)

> **Target:** Rewrite `OverviewTab.tsx` + optimize API + add chart components to match mockup (screenshot 4 Jul 2026)
> **Tech Stack:** Next.js 16 (PPR), React 19, Drizzle ORM 0.45, Supabase, Tailwind CSS v4, Recharts 3.9, TanStack Query 5.x, Zod 4
> **Revised:** 5 Jul 2026 — based on deep audit of `schema.ts`, `admin.ts`, `overview/route.ts`, `fund-mapping.ts`, `keys.ts`, `types/index.ts`

---

## 0. System Audit Summary

### DB Schema (schema.ts) — Tables relevant to dashboard

| Table | Key Columns | Notes |
|-------|------------|-------|
| `transactions` | `id`, `mosque_id`, `type` (Pemasukan/Pengeluaran), `category`, `amount` (bigint IDR), `fund_type`, `transaction_date`, `donor_name`, `recipient_name`, `approval_status`, `deleted_at` | Core ledger. Type is Indonesian enum. Amount = bigint Rupiah. Soft-delete via `deleted_at`. |
| `donations` | `id`, `mosque_id`, `donor_name`, `amount` (bigint), `akad_type` (donation_akad enum), `payment_status` (donation_status), `paid_at` | Online donations. Akad types: `zakat_mal`, `infaq`, `wakaf`, `qurban`, `fidyah`, `sedekah`, `donasi_umum`. Status: `pending`/`paid`/`expired`/`cancelled`. |
| `mustahiks` | `id`, `mosque_id`, `name`, `address`, `ring_number`, `desil_level`, `is_active`, `monthly_income`, `dependents`, `asnaf_id`, `had_kifayah_score` | Mustahik data. `is_active` boolean. |
| `jamaah` | `id`, `mosque_id`, `nama`, `phone`, `alamat`, `rt_rw`, `peran` | Jamaah (congregant) list. |
| `donatur_tetap` | `id`, `mosque_id`, `nama`, `komitmen_bulanan` (bigint), `aliran_dana` (text[]), `frekuensi`, `status` (active/inactive) | Recurring donors. |
| `inventaris` | `id`, `mosque_id`, `nama_barang`, `jumlah`, `satuan`, `kondisi`, `asal` | Mosque inventory/asset list. |
| `activity_feed` | `id`, `mosque_id`, `type`, `nama`, `alamat`, `detail`, `jumlah` | Pre-built activity log for dashboard feeds. |
| `programs` | `id`, `mosque_id`, `name`, `slug`, `description`, `is_active`, `is_featured` | Mosque programs (e.g., Qardhul Hasan). |
| `memberships` | `id`, `mosque_id`, `profile_id`, `role` (role enum) | User-mosque membership with role. |

### Current API Bottleneck (`overview/route.ts`)

```
Current: SELECT * FROM transactions/mustahiks/jamaah/inventaris/donations (5 queries, all columns, LIMIT 100)
Problem: Full table scans, no aggregation, client-side sum → O(n) memory on client
Fix:     Aggregate SQL queries server-side (see Section 2)
```

### Current Frontend Architecture

```
DashboardPage.tsx (useSearchParams for tab routing)
  └─ tabs/overview → OverviewTab.tsx (client component)
      ├─ StatCard × 4 (mustahik, masuk, keluar, REMISYA)
      ├─ PieChart (fund distribution — uses AKAD_TO_FUND from fund-mapping.ts)
      └─ QuickLinks

AdminClientLayout.tsx (sidebar + shell)
  └─ Sidebar groups: Dashboard, Kesekretariatan, Keuangan, Manajemen Data, Program, Pengaturan
```

### Existing Query Infrastructure

- **TanStack Query keys factory** (`keys.ts`): Mustahik, transactions, donatur, jadwal, inventaris, programs, bank_accounts, jamaah, employees, zakat — all follow `all/lists/list/details/detail` pattern
- **Admin query hooks** (`admin.ts`): `useAdminTransactions`, `useAdminMustahik`, `useAdminJamaah`, `useAdminInventaris`, `useAdminDonations` — all use Supabase client-side queries
- **Type adapters** (`admin.ts`): `toLedgerEntry()`, `toInventaris()`, `toMustahikShort()` — raw DB → UI types
- **Fund mapping** (`fund-mapping.ts`): `AKAD_TO_FUND` (zakat_mal→zakat_maal, infaq→infaq_tidak_terikat, etc.), `CATEGORY_MAP` (akad→category+fund_type+akad)
- **Formatter** (`format.ts`): `formatNominal()` for Rupiah number display
- **Auth pattern**: `requireRole(mosqueId, "superadmin", "admin_dkm")` in API routes

---

## 1. Mockup → Component Mapping (Revised)

| Mockup Element | Component | Data Source | API |
|---|---|---|---|
| **5 Stat Cards** (Saldo Kas, Pemasukan, Pengeluaran, Donatur, Mustahik) | `OverviewTab.tsx` → `<StatCard>` × 5 | New aggregated hook `useAdminDashboardSummary()` | `GET /api/admin/dashboard?type=summary` |
| **Line Chart 30-hari** (Pemasukan vs Pengeluaran) | New `TrendLineChart.tsx` (Recharts `<LineChart>`) | New hook `useAdminTrend30d()` | `GET /api/admin/dashboard?type=trend30d` |
| **Donut Chart ZISWAF** (Zakat, Infaq, Wakaf, Fidyah, Bank Infaq) | New `ZiswafDonutChart.tsx` (Recharts `<PieChart>`) | New hook `useAdminZiswafBreakdown()` | `GET /api/admin/dashboard?type=ziswaf` |
| **3 Kolom Aktivitas** (Donasi, Bank Infaq, Pengeluaran) | New `ActivityFeeds.tsx` | New hook `useAdminActivityFeeds()` — uses `activity_feed` table | `GET /api/admin/dashboard?type=activity` |
| **Sidebar Navigasi** | `AdminClientLayout.tsx` | Already close — minor icon/label polish | — |

---

## 2. API Layer — New Dashboard Endpoint

### New file: `src/app/api/admin/dashboard/route.ts`

**Rationale:** Keep existing `overview/route.ts` untouched (used by other admin tabs). Create dedicated dashboard endpoint with type-based routing.

```ts
// Auth: requireRole(mosqueId, "superadmin", "admin_dkm")
// Query param: ?type=summary|trend30d|ziswaf|activity

// type=summary → aggregated dashboard stats
// type=trend30d → 30-day income/expense daily breakdown
// type=ziswaf → fund category aggregation
// type=activity → latest activity feeds (from activity_feed table)
```

### Endpoint Details

#### `?type=summary` — Dashboard Summary

```sql
-- Saldo Kas (income - expense, excluding soft-deleted)
SELECT
  COALESCE(SUM(CASE WHEN type = 'Pemasukan' THEN amount ELSE 0 END), 0)
  - COALESCE(SUM(CASE WHEN type = 'Pengeluaran' THEN amount ELSE 0 END), 0) AS saldo_kas,
  COALESCE(SUM(CASE WHEN type = 'Pemasukan' THEN amount ELSE 0 END), 0) AS total_masuk,
  COALESCE(SUM(CASE WHEN type = 'Pengeluaran' THEN amount ELSE 0 END), 0) AS total_keluar
FROM transactions
WHERE mosque_id = :mosqueId AND deleted_at IS NULL;

-- Donatur Aktif (count from donatur_tetap where status = 'active')
SELECT COUNT(*) FROM donatur_tetap
WHERE mosque_id = :mosqueId AND status = 'active';

-- Mustahik Aktif (count from mustahiks where is_active = true)
SELECT COUNT(*) FROM mustahiks
WHERE mosque_id = :mosqueId AND is_active = true;
```

**Response:**
```ts
{
  saldo_kas: bigint,
  total_masuk: bigint,
  total_keluar: bigint,
  donatur_aktif: number,
  mustahik_aktif: number
}
```

#### `?type=trend30d` — 30-Day Trend

```sql
SELECT
  DATE(transaction_date) AS tanggal,
  COALESCE(SUM(CASE WHEN type = 'Pemasukan' THEN amount ELSE 0 END), 0) AS pemasukan,
  COALESCE(SUM(CASE WHEN type = 'Pengeluaran' THEN amount ELSE 0 END), 0) AS pengeluaran
FROM transactions
WHERE mosque_id = :mosqueId
  AND deleted_at IS NULL
  AND transaction_date >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY DATE(transaction_date)
ORDER BY tanggal ASC;
```

**Response:** `Array<{ tanggal: string, pemasukan: bigint, pengeluaran: bigint }>`

#### `?type=ziswaf` — ZISWAF Breakdown

```sql
SELECT
  fund_type,
  COALESCE(SUM(amount), 0) AS total
FROM transactions
WHERE mosque_id = :mosqueId
  AND deleted_at IS NULL
  AND fund_type IN ('zakat_maal', 'zakat_penghasilan', 'infaq_tidak_terikat',
                    'infaq_terikat', 'wakaf', 'fidyah', 'qurban', 'sedekah', 'bank_qardhul_hasan')
GROUP BY fund_type;
```

**Response:** `Array<{ fund_type: string, total: bigint }>`
**Label mapping:** Use `FUND_TYPE_LABEL` and `FUND_TYPE_COLORS` from `@/lib/fund-mapping`

#### `?type=activity` — Activity Feeds

```sql
-- From activity_feed table (already pre-built for this purpose)
SELECT type, nama, alamat, detail, jumlah, created_at
FROM activity_feed
WHERE mosque_id = :mosqueId
ORDER BY created_at DESC
LIMIT 20;
```

**Response:** `Array<ActivityFeedEntry>` — group by type on client (donasi, bank_infaq, pengeluaran)

---

## 3. Query Hooks — TanStack Query

### Modify: `src/lib/queries/admin.ts`

Follow existing patterns (`queryKeys.factory` pattern from `keys.ts`).

```ts
// New query keys (in keys.ts)
dashboard: {
  all: (mosqueId: string) => ['dashboard', mosqueId] as const,
  summary: (mosqueId: string) => [...queryKeys.dashboard.all(mosqueId), 'summary'] as const,
  trend30d: (mosqueId: string) => [...queryKeys.dashboard.all(mosqueId), 'trend30d'] as const,
  ziswaf: (mosqueId: string) => [...queryKeys.dashboard.all(mosqueId), 'ziswaf'] as const,
  activity: (mosqueId: string) => [...queryKeys.dashboard.all(mosqueId), 'activity'] as const,
}

// New hooks (in admin.ts)
useAdminDashboardSummary(mosqueId: string)
  → useQuery({ queryKey: queryKeys.dashboard.summary(mosqueId), queryFn: fetchDashboard('summary') })

useAdminTrend30d(mosqueId: string)
  → useQuery({ queryKey: queryKeys.dashboard.trend30d(mosqueId), queryFn: fetchDashboard('trend30d') })

useAdminZiswafBreakdown(mosqueId: string)
  → useQuery({ queryKey: queryKeys.dashboard.ziswaf(mosqueId), queryFn: fetchDashboard('ziswaf') })

useAdminActivityFeeds(mosqueId: string)
  → useQuery({ queryKey: queryKeys.dashboard.activity(mosqueId), queryFn: fetchDashboard('activity') })

// Shared fetcher
function fetchDashboard(type: string) {
  return async () => {
    const res = await fetch(`/api/dashboard?type=${type}`);
    if (!res.ok) throw new Error(`Dashboard ${type} failed`);
    return res.json();
  }
}
```

---

## 4. UI Components

### 4a. Stat Cards — `OverviewTab.tsx`

```
Layout: Horizontal row of 5 cards (responsive: 1 col mobile → 3 col tablet → 5 col desktop)
Each card:
  - Left accent strip (4px, colored per type)
  - Icon (top-right, subtle bg circle)
  - Label (text-sm, muted)
  - Value (text-2xl font-bold, formatted Rupiah / number)
  - Trend badge (optional: +5.2% vs bulan lalu — can defer to Phase 2)

Colors:
  Saldo Kas   → accent: emerald-500, icon: Wallet
  Pemasukan   → accent: blue-500, icon: TrendingUp
  Pengeluaran → accent: red-500, icon: TrendingDown
  Donatur     → accent: purple-500, icon: Users
  Mustahik    → accent: amber-500, icon: Heart

Skeleton: 5 placeholder rectangles with shimmer animation
Empty state: Show 0 values (not "no data" — 0 is valid for new masjid)
```

### 4b. Line Chart — `src/components/admin/charts/TrendLineChart.tsx` (new)

```
'use client' — required for Recharts in Next.js 16 PPR
Recharts components: <LineChart> <Line> <XAxis> <YAxis> <CartesianGrid> <Tooltip> <ResponsiveContainer>

Lines:
  Pemasukan → stroke: #10b981 (emerald-500)
  Pengeluaran → stroke: #ef4444 (red-500)

XAxis: tanggal (format: "1 Jul", "2 Jul", ...)
YAxis: Rupiah (compact: "1 jt", "500 rb")
Tooltip: full Rupiah format + tanggal lengkap
accessibilityLayer: true (Recharts 3.9 best practice)

Empty state: "Belum ada transaksi 30 hari terakhir"
Skeleton: gray rounded rectangle (300px height)
```

### 4c. Donut Chart — `src/components/admin/charts/ZiswafDonutChart.tsx` (new)

```
'use client' — required for Recharts
Recharts: <PieChart> <Pie> <Cell> <Tooltip> <Legend>

Segments from FUND_TYPE_LABEL + FUND_TYPE_COLORS (fund-mapping.ts):
  zakat_maal → "Zakat Mal" → #10b981
  zakat_penghasilan → "Zakat Penghasilan" → #06b6d4
  infaq_tidak_terikat → "Infaq" → #3b82f6
  infaq_terikat → "Infaq Terikat" → #6366f1
  wakaf → "Wakaf" → #f59e0b
  fidyah → "Fidyah" → #8b5cf6
  bank_qardhul_hasan → "Bank Infaq" → #14b8a6

Center: total Rupiah label (using custom label on inner radius)
Legend: bottom, horizontal

Empty state: "Belum ada data ZISWAF"
Skeleton: gray circle placeholder
```

### 4d. Activity Feeds — `src/components/admin/feeds/ActivityFeeds.tsx` (new)

```
3 columns below charts (responsive: 1 col mobile → 3 col desktop):

Column 1: Donasi Terbaru
Column 2: Bank Infaq
Column 3: Pengeluaran Terbaru

Each column:
  - Header with icon + title
  - List of 5 items:
    - Avatar/icon circle (color per type)
    - Primary text: donor name / item name
    - Secondary: amount (formatted Rupiah) + relative time
  - "Lihat Semua" link at bottom

Data: Filter activity_feed entries by type
  type = 'donasi' → Column 1
  type = 'bank_infaq' → Column 2
  type = 'pengeluaran' → Column 3

Skeleton: 5 gray bars per column
```

### 4e. Sidebar — `AdminClientLayout.tsx` (minor polish)

```
Sudah dekat dengan mockup. Perubahan kecil:
- Verify icons per group match mockup (LayoutDashboard, Wallet, Users, etc.)
- "Masjid Hub" logo/text at top of sidebar (sudah ada branding area)
- Ensure active state uses left accent strip (check if already implemented)
```

---

## 5. Implementation Steps

| Step | Task | File(s) | Est. |
|------|------|---------|------|
| **1** | Add dashboard query keys | `src/lib/queries/keys.ts` | 5 min |
| **2** | Create dashboard API route | `src/app/api/admin/dashboard/route.ts` | 40 min |
| **3** | Add dashboard query hooks + types | `src/lib/queries/admin.ts` | 20 min |
| **4** | Create `<StatCard>` component | `src/components/admin/cards/StatCard.tsx` | 15 min |
| **5** | Create `<TrendLineChart>` | `src/components/admin/charts/TrendLineChart.tsx` | 25 min |
| **6** | Create `<ZiswafDonutChart>` | `src/components/admin/charts/ZiswafDonutChart.tsx` | 25 min |
| **7** | Create `<ActivityFeeds>` | `src/components/admin/feeds/ActivityFeeds.tsx` | 25 min |
| **8** | Rewrite `<OverviewTab>` | `src/components/admin/tabs/OverviewTab.tsx` | 30 min |
| **9** | Sidebar polish | `src/app/(admin)/AdminClientLayout.tsx` | 10 min |
| **10** | Build + lint + typecheck | — | 10 min |
| **11** | Vitest unit tests (components + API) | `__tests__/dashboard.test.ts` | 30 min |

**Total: ~3.5 jam**

---

## 6. Files Created/Modified

```
NEW:
  src/app/api/admin/dashboard/route.ts          — Dashboard API (4 query types)
  src/components/admin/cards/StatCard.tsx         — Stat card component
  src/components/admin/charts/TrendLineChart.tsx  — 30-day line chart
  src/components/admin/charts/ZiswafDonutChart.tsx — ZISWAF donut chart
  src/components/admin/feeds/ActivityFeeds.tsx    — 3-column activity feeds
  __tests__/dashboard.test.ts                     — Unit tests

MODIFIED:
  src/lib/queries/keys.ts    — Add dashboard query key group
  src/lib/queries/admin.ts   — Add 4 dashboard hooks + fetcher
  src/components/admin/tabs/OverviewTab.tsx — Rewrite with new components
  src/app/(admin)/AdminClientLayout.tsx     — Minor sidebar polish
```

---

## 7. Constraints & Risks

| Risk | Mitigation |
|------|------------|
| **Empty data** (new masjid, no transactions) | Show 0 values (not "no data" errors). Empty state text on charts. |
| **Recharts SSR** in Next.js 16 PPR | All chart components `'use client'` + `<Suspense>` boundary in OverviewTab. |
| **bigint serialization** (JSON can't serialize bigint natively) | Use `Number()` conversion in API response, or custom serializer. Amounts fit in JS Number (max safe = 9 quadrillion, typical masjid < 1 trillion). |
| **Transaction type is Indonesian** ("Pemasukan"/"Pengeluaran") | Use exact enum values in SQL, not English. |
| **Fund type null** on some transactions | Use `COALESCE` + filter `fund_type IS NOT NULL` for ZISWAF chart. |
| **Soft-delete** (`deleted_at`) | Always filter `WHERE deleted_at IS NULL` in all queries. |
| **Performance** (aggregate on large tables) | Add index on `(mosque_id, deleted_at, transaction_date)` if not exists. |
| **34 open audit findings** | Not blocking dashboard build, but reference `audit/daftar-triase.md` for known issues. |

---

## 8. Open Questions for User

1. **Saldo Kas** — should it include donations (paid) or only transactions? Current plan: `transactions` only (income - expense).
2. **Trend indicator** (naik/turun % vs bulan lalu) — implement now or defer to Phase 2?
3. **"Lihat Semua" links** on activity columns — where should they navigate? `/admin?tab=transaksi`?
4. **Chart colors** — use the ZISWAF color palette from `FUND_TYPE_COLORS` or match mockup exactly?

---

*Plan revision: 5 Jul 2026 — System-aware rewrite based on deep audit of schema.ts (994 lines), admin.ts query hooks, overview/route.ts API, fund-mapping.ts, keys.ts, types/index.ts*
