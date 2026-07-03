# Arsitektur & Alur Data — masjid-ataqwa

## Peta Alur (Mermaid)

```mermaid
flowchart TD
  subgraph Client
    LP[LandingPage.tsx]
    ZP[ZakatPage.tsx]
    DP[DashboardPage.tsx]
    IT[InflowTab.tsx]
    subgraph State
      AC[AppContext\n(auth + cart + toast)]
      RQ[React Query\ncache layer]
      LS[local state\nuseState + useRef]
    end
  end

  subgraph API_Layer
    SA[Server Actions\n/lib/actions/*.ts]
    AR[API Routes\n/app/api/*]
  end

  subgraph Business
    AL[Auth Layer\nrequireAuth/requireRole]
    VL[Zod Validation\n/lib/validation.ts]
    FM[Fund Mapping\n/fund-mapping.ts]
  end

  subgraph Data
    DB[Drizzle ORM\n/db/client.ts]
    SC[/db/schema.ts]
    SUPA[Supabase\nAuth + RLS]
  end

  subgraph External
    MT[Midtrans]
  end

  LP -->|usePublicData| AR_Public["GET /api/public"]
  ZP -->|createDonation| SA
  ZP -.->|catch {} swallows error| LS
  DP -->|useAdminOverview| AR_Admin["GET /api/admin/overview"]
  DP -->|local state init via useRef| LS
  DP -->|triggerToast| AC
  IT -->|createTransaction| SA
  IT -->|onAddLedgerEntry| DP_LS["DashboardPage useState"]

  SA -->|requireAuth/requireRole| AL
  SA -->|parse| VL
  SA -->|CATEGORY_MAP| FM
  SA -->|db.insert/update| DB
  AL -->|supabase.auth.getUser| SUPA
  AL -->|drizzle query| DB
  AR_Admin -->|requireRole| AL
  AR_Admin -->|Promise.all + db.select| DB

  style AC fill:#f9f,stroke:#333
  style RQ fill:#bbf,stroke:#333
  style LS fill:#fbb,stroke:#333
```

## Komponen Arsitektur

| Komponen | Fungsi | Layer | Status |
|----------|--------|-------|--------|
| `middleware.ts` | Refresh session + redirect /admin → /login | Infra | ✅ |
| `AppContext` | Auth state, cart BUMM, toast, zakat preset | UI State | ⚠️ |
| `React Query` | Cache server data (admin + public) | UI State | ✅ |
| `/lib/actions/*.ts` | 26 server actions (CRUD tiap entitas) | Business | ⚠️ |
| `/lib/queries/*.ts` | React Query hooks wrapping actions/API | UI Binding | ⚠️ |
| `/app/api/*` | REST endpoints (public + admin overview) | API | ⚠️ |
| `/lib/auth/server.ts` | `requireAuth()` + `requireRole()` | Auth | ✅ |
| `/lib/validation.ts` | Zod schemas per entity | Validation | ✅ |
| `/lib/fund-mapping.ts` | Mapping akad → fund_type → category | Business | ⚠️ |
| `/db/schema.ts` | Drizzle schema (19 tables, enums, indices) | Data | ✅ |
| `/db/client.ts` | Drizzle client instance | Data | ✅ |
| `/lib/supabase/*` | Supabase SSR client (browser/server/middleware) | Auth/Infra | ✅ |
| `/lib/logger.ts` | Pino logger with redact | Observability | ⚠️ |

## Titik Membingungkan

### 1. Dua jalur donasi paralel — mana yang "resmi"?
- **ZakatPage.tsx** memanggil `createDonation()` server action → insert ke tabel `donations` → insert `transactions` + `activity_feed` + `audit_logs` dalam transaction
- **InflowTab.tsx** memanggil `createTransaction()` server action → insert langsung ke `transactions`
- Tidak jelas: apakah donasi publik via ZakatPage harusnya double-entry (donations + transactions) sementara inflow manual cukup single-entry (transactions)?
- InflowTab:130 panggil `createTransaction` tanpa `fund_type` → `detectFundType()` pakai mapping manual → bisa salah kategorisasi

### 2. `zakat_mal` vs `zakat_maal` — typo historis
- `donations.akad_type` enum: `"zakat_mal"` (1 L)
- `transactions.fund_type` enum: `"zakat_maal"` (2 A)
- `fund-mapping.ts:9` menulis komentar soal inkonsistensi ini
- Setiap kali donasi masuk, mapping `AKAD_TO_FUND` menjembatani — tapi ini rawan lupa saat tambah enum baru

### 3. Server action dual pattern — typed object vs FormData
- `donations.ts` menerima typed object `InsertDonation`
- `mustahik.ts` menerima `FormData` (seperti HTML form tradisional)
- Dua pendekatan berbeda dalam proyek yang sama — membingungkan developer baru
- `FormData` tidak dapat divalidasi oleh Zod secara langsung tanpa parsing manual (terlihat di `createMustahik` yang validasi manual: `if (!name || !address)`)

### 4. Admin data flow: "big fetch" vs granular
- Admin: `useAdminOverview(mosqueId)` → fetch ALL data (transactions, mustahik, jamaah, inventaris, donations) dalam satu request
- Turunannya: `useAdminTransactions`, `useAdminMustahik`, dll. — filter di client dengan `enabled: !!data`
- Public: tiap hook panggil server action masing-masing (granular)
- Dua strategi fetching berbeda dalam proyek yang sama untuk use case yang mirip

### 5. Nama komponen `LandingPage` TERNYATA adalah halaman "home" publik
- Letaknya di `components/`, dipanggil dari `app/(public)/page.tsx`
- Namanya "LandingPage" tapi isinya konten penuh — termasuk kalkulator zakat, tabel donasi, program grid
- Membingungkan karena biasanya Landing Page = halaman marketing awal, tapi di sini dia adalah halaman utama

### 6. ZakatPage mengelola payment flow TANPA integrasi Midtrans nyata
- `paymentStep` di state: `"summary"` → `"processing"` → `"success"`
- Tapi `handleConfirmPayment` langsung panggil `createDonation` dengan `payment_status: "paid"` tanpa benar-benar memproses pembayaran
- Server action `createDonation` menerima `payment_status` dari client (padahal harusnya dari webhook Midtrans)
- `paymentModalOpen` + `setTimeout(() => setPaymentStep("success"), 2000)` — simulasi murni

## Titik Rawan

### 🔴 1. Error ditelan diam-diam (empty catch)
- `donations.ts:44` — `catch { /* public user — keep false */ }` — error dari `requireRole` diabaikan total
- `ZakatPage.tsx:145-147` — `catch { // Donasi tetap tercatat lokal walau simpan gagal }` — user dikasih "success" padahal server action gagal
- `supabase/server.ts:20-22` — `catch { /* headers() not available */ }` — silent fallback
- **Dampak:** User lihat toast sukses, tapi data TIDAK tersimpan di database. Mustahiq tidak tercatat. Laporan keuangan tidak akurat.

### 🔴 2. Server action tanpa return type yang konsisten
- `donations.ts:112` — `return row` (object, throw on error)
- `mustahik.ts:93` — `return { success: true }` atau `return { error: string }`
- `auth.ts:14` — `return { error: string }`
- `transactions.ts:159` — `return row` (throw on error)
- **Dampak:** Client (komponen) tidak bisa handle error secara generik. Setiap komponen harus tahu apakah action throw atau return error object. Pola `try/catch` vs `if (result.error)` campur aduk.

### 🔴 3. Business logic zakat nisab di UI component (ZakatPage.tsx)
- Logika `finalNet >= malNisab → wajib zakat` ada di `useEffect` dalam komponen client
- Tarif zakat (2.5%) hardcode di line 92: `Math.round(finalNet * 0.025)`
- Nisab didapat dari `mosqueConfig.zakat_maal_nisab` — tapi fallback ke 85.000.000 jika tidak ada
- **Dampak:** Tak bisa di-test. Tak bisa dipakai ulang. Rentan terhadap perubahan konfigurasi.

### 🟡 4. State management terfragmentasi — 3 mekanisme
- **AppContext**: user, cart, toast, zakat preset
- **React Query**: semua data dari server
- **Local state + useRef**: DashboardPage punya `txInit`/`invInit` ref untuk mencegah overwrite data
- **Problem:** `DashboardPage` membaca `dbTransactions` dari React Query, lalu `useEffect` ke local state `ledgerEntries`, lalu `InflowTab` merubah `ledgerEntries` lewat `onAddLedgerEntry` callback. Ada dua sumber kebenaran untuk data yang sama.

### 🟡 5. Admin dashboard memuat SEMUA data dalam 1 request tanpa pagination
- `/api/admin/overview` → `Promise.all` 5 query → semua data dimuat sekaligus
- `transactions` dibatasi 100, tapi `mustahik` dan `jamaah` tidak ada limit
- `donations` tidak difilter `deleted_at`
- **Dampak:** Bertambahnya data masjid (mustahik, jamaah) → request makin lambat → dashboard makin berat. Cache invalidation dengan `revalidatePath` tidak optimal karena query besar.

### 🟡 6. Duplikasi logic fund mapping
- `fund-mapping.ts` — `AKAD_TO_FUND` dan `CATEGORY_MAP`
- `transactions.ts` — `FUND_FROM_CATEGORY` array + `detectFundType()` + `AKAD_MAP`
- Keduanya melakukan mapping kategori/fund_type/akad — tapi dengan struktur data dan business rule berbeda
- **Risiko:** Saat tambah kategori baru, developer bisa lupa update salah satu mapping → inkonsistensi data keuangan

### 🟡 7. Logger (pino) diimport tapi hampir tidak dipakai di action manapun
- `logger.ts` menyediakan `createLogger()` dengan redact + context
- Tidak ada satu pun server action yang impor atau panggil logger
- Error handling di action cuma `throw new Error(...)` atau `return { error: ... }`
- **Dampak:** Tidak ada visibility ke error production. Debugging bergantung pada error yang ditampilkan ke user.

### 🟡 8. Middleware expired detection tidak ada
- `middleware.ts` cuma panggil `updateSession` (refresh token) + redirect kalau user tidak ada
- Tidak ada pengecekan `user` di API routes (`/api/admin/overview` pakai `requireRole` — good)
- TAPI server actions yang tidak pakai `requireAuth()` bisa dipanggil tanpa session valid (public actions tidak ada masalah, tapi beberapa actions lupa panggil `requireAuth`?)

### 🟢 9. Inconsistency: BIN into TEXT column
- `transactions.ts:131` — `amount: data.amount` dimana data.amount adalah `number` tapi kolom di DB adalah `bigint`
- Drizzle `bigint` dengan `mode: "number"` melakukan konversi, tapi ada risiko overflow untuk nominal besar (> 2^53)
- Operasi perbandingan/aggregate di DB (`SUM`) pakai `sql<number>` — cast eksplisit, tapi rawan mismatch

### 🟢 10. ZakatPage: ID transaksi random + hardcoded
- Line 159: `id: "don-" + Math.floor(Math.random() * 100000)` — ID palsu hanya dari 6 digit, bisa bentrok
- Line 160: `tanggal: dateStr` — pakai format campuran ISO + jam lokal
- Ini hanya di UI (tidak disimpan ke DB setelah error catch), tapi user bisa lihat ID palsu di toast sukses

## Kesimpulan Arsitektur

### Kekuatan
- **Pemisahan tenant solid** — semua tabel punya `mosque_id`, siap multi-masjid
- **Skema database matang** — Drizzle ORM dengan enum, indeks komposit, unique constraint, soft-delete
- **Auth RBAC** — `requireRole()` dengan role granular siap untuk multi-level akses
- **Audit trail** — `audit_logs` insert di semua operasi penting (donasi, transaksi)
- **Validation** — Zod schema untuk most server inputs
- **Fund accounting** — Pemisahan `fund_type` dan `akad_type` sesuai fiqih muamalah

### Kelemahan
- **Error handling tidak konsisten** — throw vs return error object, empty catch di 3 titik kritis
- **Business logic bocor ke UI** — perhitungan zakat nisab di `useEffect` component
- **Dua jalur donasi** — `createDonation` vs `createTransaction` tanpa dokumentasi mana untuk skenario apa
- **State management terfragmentasi** — AppContext + React Query + local useState untuk data yang sama
- **Server action dual pattern** — typed object vs FormData membingungkan
- **Tidak ada pagination** — admin overview fetch semua data sekaligus
- **Logger tidak dipakai** — pino diimport tapi nol panggilan dari action
- **Payment flow simulasi** — ZakatPage tidak benar-benar integrasi Midtrans, cuma timeout + random ID

### Skor: 6/10
Solid di foundation (DB, auth, RBAC), tapi rapuh di middle layer (error handling konsistensi, pemisahan logic, pola server action). Cukup untuk MVP 1 masjid, TETAPI perlu dibenahi sebelum scaling ke 15+ masjid.
