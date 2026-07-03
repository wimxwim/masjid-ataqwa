# EXECUTIVE SUMMARY — AUDIT CODEBASE masjid-ataqwa
**Tanggal audit:** 2026-07-03
**Total skill dijalankan:** 25 dari 276 (20 Kategori A + 5 Kategori B)
**Total temuan unik:** 68 (Critical: 13 | High: 22 | Medium: 16 | Low: 10 | Info: 5)
**Skor Kesehatan Arsitektur:** 6/10
**Posisi Kematangan Logging:** Level 2/4

---

## Risk Matrix

| Kategori | Critical | High | Medium | Low | Info |
|----------|----------|------|--------|-----|------|
| **Keamanan** | 4 | 7 | 5 | 0 | 2 |
| **Bug/Reliabilitas** | 2 | 3 | 5 | 2 | 0 |
| **Database/Integritas** | 5 | 5 | 3 | 1 | 1 |
| **UI/UX Desktop** | 0 | 3 | 5 | 4 | 0 |
| **UI/Mobile** | 1 | 2 | 5 | 3 | 0 |
| **Arsitektur/Alur** | — | — | — | — | — (deskriptif) |
| **Logging/Observability** | 0 | 2 | 2 | 1 | 1 |

---

## Compliance Scorecard (Perkiraan)

| Standar | Status | Catatan |
|---------|--------|---------|
| **OWASP Top 10 (2021)** | 7/10 kategori terverifikasi | Belum diverifikasi: A02 (Cryptographic Failures - need audit), A06 (Vuln Components - no SBOM), A08 (Software Integrity - no CI/CD scan) |
| **WCAG 2.2 AA** | Sebagian | Kontras gagal, aria-label missing, touch target < 24px, focus indicator lemah |
| **Core Web Vitals** | Perlu perbaikan | LCP: hero image tanpa `priority`, tidak ada skeleton loading, bundle size besar |
| **UU PDP** | Sebagian | NIK plaintext di loan_applications (violation), enkripsi AES-256-GCM untuk mustahik ✅, tapi redaksi log belum sempurna |

---

## Top 5 Prioritas Kritis

1. **[RA0003 / BUG-01]** NIK plaintext di tabel `loan_applications` — hapus kolom `nik`, enkripsi data existing
2. **[ID-001 / ID-003]** Secret produksi dalam plaintext — rotasi semua secret, hapus yg tidak terpakai
3. **[ID-004 / BUG-10]** Debug endpoint `/api/debug` tanpa auth — proteksi atau hapus
4. **[ID-009 / BUG-02]** Webhook Midtrans fire-and-forget — tambah `await`, potensi donasi hilang
5. **[RA0001 / BUG-04]** Race condition `payInstallment` — lost update, double-spend

---

# 📋 RENCANA UPAYA PERBAIKAN — PRIORITAS KRITIS (Critical)

## 🔴 CRITICAL — Security & Data Privacy

### [P-001] Hapus NIK plaintext dari loan_applications
- **ID sumber**: RA0003 | BUG-01 | ID-003 (sebagian)
- **Lokasi**: `src/db/schema.ts:381`, `src/lib/actions/loan-applications.ts:53`
- **Masalah**: Kolom `nik` menyimpan NIK asli (plaintext) di tabel loan_applications — melanggar prinsip schema.ts sendiri ("TANPA NIK mentah") dan UU PDP.
- **Dampak**: Jika database bocor, NIK ribuan pemohon pinjaman terekspos total.
- **Fix**:
  1. Buat migrasi Drizzle: drop kolom `nik`, rename `nik_encrypted` jadi `nik` atau biarkan
  2. Encrypt semua NIK existing di loan_applications
  3. Update kode di loan-applications.ts: stop simpan `nik: data.nik`
  4. Verifikasi tidak ada code lain yang baca kolom `nik` langsung
- **Effort**: Sedang (migrasi DB + update 1 action file)
- **File terkait**: `src/db/schema.ts`, `src/db/migrations/`, `src/lib/actions/loan-applications.ts`

### [P-002] Rotasi & amankan secret produksi
- **ID sumber**: ID-001 | ID-002 | ID-003 | ID-005
- **Lokasi**: `.env`, `.dev.vars`
- **Masalah**: Semua secret produksi (Midtrans, Supabase service_role, Database password, Fonnte token, NIK encryption key) dalam plaintext di 2 file. Service role key tidak terpakai.
- **Dampak**: Siapa pun dengan akses file ini bisa mengakses database, payment gateway, mengirim SMS palsu.
- **Fix**:
  1. Rotasi semua secret di dashboard masing-masing
  2. Hapus SUPABASE_SERVICE_ROLE_KEY dan SUPABASE_SECRET_KEY dari env (tidak dipakai)
  3. Pindahkan ke Cloudflare Workers Secrets atau Vercel Environment Variables
  4. Restrict database access via IP firewall (Supabase)
  5. Buat dedicated DB user dengan role terbatas untuk aplikasi
- **Effort**: Kecil (operasional, perlu klik dashboard)

### [P-003] Proteksi atau hapus endpoint /api/debug
- **ID sumber**: ID-004 | BUG-10
- **Lokasi**: `src/app/api/debug/route.ts`
- **Masalah**: Endpoint debug mengekspos info sistem (auth user, nama masjid, donasi, income/expense) tanpa auth.
- **Fix**: Tambah `requireAuth()` di handler, atau hapus/hide di production via env `NODE_ENV`.
- **Effort**: Kecil

### [P-004] Perbaiki webhook Midtrans — await handler
- **ID sumber**: ID-009 | BUG-02
- **Lokasi**: `src/app/api/midtrans/webhook/route.ts:152-154`
- **Masalah**: `handlePaymentNotification()` dipanggil tanpa `await` — di serverless bisa di-terminate sebelum selesai. Donasi hilang.
- **Fix**: `await handlePaymentNotification(body)` sebelum return response. Jika ada timeout concern, gunakan Cloudflare Queues.
- **Effort**: Kecil

### [P-005] Fix race condition payInstallment — lost update
- **ID sumber**: RA0001 | BUG-04
- **Lokasi**: `src/lib/actions/loan-installments.ts:68-113`
- **Masalah**: `total_paid` di-update dengan `COALESCE(total_paid, 0) + amount_paid` — dua request concurrent bisa lost update. Juga tidak ada idempotency key.
- **Fix**: 
  1. Ganti `amount_paid` overwrite jadi increment: `COALESCE(amount_paid, 0) + added_amount`
  2. Tambah idempotency key
  3. Validasi `amount_paid <= amount_due` di awal
- **Effort**: Sedang

### [P-006] Bungkus createLoanRestructure dalam transaction
- **ID sumber**: RA0002
- **Lokasi**: `src/lib/actions/loan-restructures.ts:46-88`
- **Masalah**: Insert loan_restructures dan update loan status dilakukan terpisah tanpa transaction.
- **Fix**: Bungkus dalam `db.transaction(async (tx) => { ... })`.
- **Effort**: Kecil

### [P-007] Tambah RBAC check di createLoanInstallment
- **ID sumber**: RA0004
- **Lokasi**: `src/lib/actions/loan-installments.ts:35-66`
- **Masalah**: Tidak verifikasi bahwa user adalah anggota masjid yang memiliki loan tersebut.
- **Fix**: Tambah `await requireRole(mosque_id, ...)` sebelum insert.
- **Effort**: Kecil

### [P-008] Validasi DATABASE_URL — hindari silent crash
- **ID sumber**: RA0005
- **Lokasi**: `src/db/client.ts:5-7`
- **Masalah**: `process.env.DATABASE_URL!` — crash cryptic jika env tidak diset.
- **Fix**: Tambah `if (!process.env.DATABASE_URL) throw new Error(...)`.
- **Effort**: Kecil

### [P-009] Fix Midtrans webhook IP verification + mandatory Turnstile
- **ID sumber**: ID-008 | ID-010 | ID-011
- **Lokasi**: 
  - `src/app/api/midtrans/webhook/route.ts` — verifikasi IP
  - `src/lib/actions/loan-applications.ts:42-45` — Turnstile opsional
  - `.env` — Turnstile test keys
- **Masalah**: Turnstile bisa di-skip dengan menghapus field token. Webhook tidak filter IP Midtrans. Turnstile pakai test key ("always passes").
- **Fix**: 
  1. Jadikan Turnstile mandatory (hapus `if`)
  2. Verifikasi IP origin Midtrans
  3. Ganti Turnstile keys produksi
- **Effort**: Kecil

---

## 🟡 HIGH — Prioritas Tinggi

### [P-010] Tambah CSRF protection
- **ID sumber**: ID-005
- **Lokasi**: Semua server actions (`src/lib/actions/*.ts`), API routes
- **Masalah**: Tidak ada CSRF token di server actions dan API routes.
- **Fix**: Implementasi CSRF token via Supabase Auth atau verifikasi Origin/Referer header.
- **Effort**: Sedang

### [P-011] Tambah rate limiting
- **ID sumber**: ID-006
- **Lokasi**: `src/lib/actions/auth.ts`, semua API routes
- **Masalah**: Tidak ada rate limiting — brute force login, API abuse.
- **Fix**: Gunakan Cloudflare Rate Limiting (gratis) atau implementasi middleware.
- **Effort**: Kecil (Cloudflare) / Sedang (custom)

### [P-012] Fix IDOR di fungsi get*ById tanpa filter mosque_id
- **ID sumber**: ID-007
- **Lokasi**: 6 file actions (asnaf, inventaris, jadwal-imam, jamaah, mustahik, transactions)
- **Masalah**: Fungsi `get*ById` tidak filter `mosque_id` — data lintas tenant bisa diakses.
- **Fix**: Tambah `and(eq(table.mosque_id, mid))` di semua fungsi get*ById.
- **Effort**: Kecil

### [P-013] Standarisasi error handling server action — stop throw
- **ID sumber**: BUG-03
- **Lokasi**: 20 dari 26 file server actions
- **Masalah**: Campur aduk `throw new Error()` vs `return { error: "..." }`. Throw menyebabkan crash UI di Next.js.
- **Fix**: Semua server action harus `return { success: true, data }` atau `return { error: "..." }`. Hapus semua `throw` kecuali auth.
- **Effort**: Besar (26 files)

### [P-014] Tambah request ID ke logger — enable tracing
- **ID sumber**: LOG-01
- **Lokasi**: `src/lib/logger.ts`, `src/middleware.ts`
- **Masalah**: `x-request-id` di-generate di middleware tapi tidak pernah di-pass ke logger.
- **Fix**: Ubah `createLogger(context, requestId?)`, gunakan AsyncLocalStorage untuk propagate requestId.
- **Effort**: Sedang

### [P-015] Fix redact sensitive data di regular logger methods
- **ID sumber**: LOG-02
- **Lokasi**: `src/lib/logger.ts:51-62`
- **Masalah**: Method `debug/info/warn/error` tidak auto-redact data sensitif — hanya method `redacted()`.
- **Fix**: Terapkan `redactSensitiveData()` di semua method, atau perluas Pino `redact.paths`.
- **Effort**: Kecil

### [P-016] Skeleton loading + error states untuk komponen publik
- **ID sumber**: UI-010, MOB-009
- **Lokasi**: LandingPage, TransparansiPage, BummPage, LiveActivityFeed
- **Masalah**: Semua data publik tidak punya error state atau skeleton loader — user lihat data kosong/null jika gagal load.
- **Fix**: Tambah `isLoading` / `isError` handling dari React Query, skeleton placeholder.
- **Effort**: Sedang

### [P-017] Kontras warna text-gray-400 pada putih
- **ID sumber**: UI-001
- **Lokasi**: Tersebar di banyak komponen
- **Masalah**: `text-gray-400` (#9ca3af) pada putih → rasio 3.1:1, gagal WCAG AA (4.5:1).
- **Fix**: Ganti ke `text-gray-600` atau `text-gray-500`.
- **Effort**: Kecil (grep + replace)

### [P-018] Fix NIK plaintext di loan_applications — action layer
- **ID sumber**: ID-012, BUG-13, ID-016
- **Lokasi**: `src/lib/actions/auth.ts`, `src/lib/actions/mustahik.ts`
- **Masalah**: Signup error message bocor ke client. FormData tanpa Zod di mustahik action. User enumeration via login timing.
- **Fix**: 
  1. Generalisasi error signup
  2. Validasi FormData dengan Zod
  3. Disable user enumeration di Supabase dashboard
- **Effort**: Kecil - Sedang

---

## 🟡 MEDIUM — Perlu Dijadwalkan

### [P-019] Bersihkan kekacauan migrasi
- **ID sumber**: RA0009, RA0013
- **Lokasi**: `src/db/migrations/`
- **Masalah**: File 0003 tidak di journal, file backup tidak terpakai, duplikasi 0000, gap idx.
- **Fix**: Reset journal, hapus file orphan, verifikasi dengan drizzle-kit.
- **Effort**: Sedang

### [P-020] Tambah partial indexes untuk soft delete
- **ID sumber**: RA0006
- **Lokasi**: Semua tabel besar (transactions, mustahiks, loans, dll)
- **Masalah**: Query filter `isNull(deleted_at)` tanpa partial index — performa turun seiring data bertambah.
- **Fix**: Tambah `CREATE INDEX CONCURRENTLY ... WHERE deleted_at IS NULL`
- **Effort**: Kecil

### [P-021] Tambah index due_date untuk loan_installments
- **ID sumber**: RA0007
- **Lokasi**: `src/db/schema.ts:913-927`
- **Masalah**: Query overdue tracking tidak punya index pada due_date.
- **Fix**: Tambah index `(status, due_date)`.
- **Effort**: Kecil

### [P-022] Bungkus createZakatPayment + createTransaction dalam transaction
- **ID sumber**: RA0010, RA0015
- **Lokasi**: `src/lib/actions/zakat-payments.ts`, `src/lib/actions/transactions.ts`
- **Masalah**: Insert data + audit log dilakukan terpisah tanpa transaction.
- **Fix**: Bungkus dalam `db.transaction()`.
- **Effort**: Kecil

### [P-023] Fix getDonations / getZiswafRequests tanpa filter deleted_at
- **ID sumber**: BUG-06, BUG-07
- **Lokasi**: `src/lib/actions/donations.ts:27-34`, `src/lib/actions/ziswaf-requests.ts:23-27`
- **Masalah**: Query get tidak filter soft-delete — data yang dihapus masih muncul.
- **Fix**: Tambah `isNull(deleted_at)` di WHERE.
- **Effort**: Kecil

### [P-024] Validasi amount di updateTransaction
- **ID sumber**: BUG-08
- **Lokasi**: `src/lib/actions/transactions.ts:162-181`
- **Masalah**: `createTransaction` validasi amount > 0, `updateTransaction` tidak.
- **Fix**: Tambah validasi amount di updateTransaction.
- **Effort**: Kecil

### [P-025] DetectFundType mapping presisi
- **ID sumber**: BUG-11
- **Lokasi**: `src/lib/actions/transactions.ts:33-55`
- **Masalah**: Prefix matching bisa salah kategorisasi — "Wakaf Domba" vs "Wakaf Uang".
- **Fix**: Gunakan mapping eksplisit (Map), bukan prefix match.
- **Effort**: Kecil

### [P-026] Admin sidebar responsive — mobile drawer
- **ID sumber**: MOB-001
- **Lokasi**: `app/(admin)/layout.tsx:15-130`
- **Masalah**: Sidebar statis w-64 di mobile menyisakan 119px untuk konten — tabel overflow.
- **Fix**: Implementasi off-canvas drawer dengan hamburger toggle.
- **Effort**: Besar

### [P-027] Touch target minimum 24x24px (WCAG 2.5.8)
- **ID sumber**: MOB-002
- **Lokasi**: `GlobalOverlays.tsx:88-95` (tombol +/- cart)
- **Masalah**: Tombol +/- keranjang hanya ~22px — gagal WCAG minimum 24x24.
- **Fix**: Ganti `p-1` ke `p-1.5` atau `min-w-[44px]`.
- **Effort**: Kecil

### [P-028] Tabel buku kas responsive pattern
- **ID sumber**: MOB-003
- **Lokasi**: `TransparansiPage.tsx:165-205`
- **Masalah**: Tabel 4 kolom tidak punya mobile pattern (card stacking).
- **Fix**: Gunakan card layout di mobile.
- **Effort**: Sedang

### [P-029] Server action failures harus di-log
- **ID sumber**: LOG-04
- **Lokasi**: Semua `src/lib/actions/*.ts`
- **Masalah**: 0 dari 26 action files panggil logger saat error.
- **Fix**: Setiap `throw` / `return { error }` panggil `log.error()` atau `log.warn()`.
- **Effort**: Besar

### [P-030] Capture IP + User-Agent di audit log
- **ID sumber**: LOG-06
- **Lokasi**: `src/db/schema.ts:531-548`, semua file actions
- **Masalah**: Kolom `ip_address` dan `user_agent` di schema tidak pernah diisi.
- **Fix**: Capture dari middleware/request header, inject ke audit log.
- **Effort**: Sedang

### [P-031] Audit logs — actor_id wajib diisi
- **ID sumber**: RA0012
- **Lokasi**: `src/db/schema.ts:533`, `src/lib/actions/donations.ts:93-104`
- **Masalah**: `actor_id` nullable, beberapa insert audit log tidak kirim actor_id.
- **Fix**: Jadikan NOT NULL di schema, pastikan semua insert kirim actor_id.
- **Effort**: Kecil

### [P-032] JSONB config tanpa validasi schema
- **ID sumber**: RA0011
- **Lokasi**: `src/db/schema.ts:106-116`
- **Masalah**: `mosques.config` JSONB tanpa validasi runtime.
- **Fix**: Buat Zod schema untuk validasi config sebelum insert/update.
- **Effort**: Kecil

### [P-033] transactions.type free text → ENUM
- **ID sumber**: RA0008
- **Lokasi**: `src/db/schema.ts:556`
- **Masalah**: Kolom `type` free text — riskan typo dan inkonsistensi.
- **Fix**: Buat ENUM atau CHECK constraint.
- **Effort**: Kecil

### [P-034] Fix URL image validation (XSS via image_url)
- **ID sumber**: ID-014
- **Lokasi**: `src/lib/actions/testimonials.ts`, `src/lib/actions/bumm.ts`, `src/lib/actions/mushafir.ts`
- **Masalah**: URL gambar tanpa validasi — bisa `javascript:` protocol atau redirect ke phishing.
- **Fix**: Validasi dengan `z.string().url()` + cek protokol HTTPS.
- **Effort**: Kecil

### [P-035] Logging: tambah LOG_LEVEL env var
- **ID sumber**: LOG-03
- **Lokasi**: `src/lib/logger.ts:30`
- **Masalah**: Level log dari NODE_ENV saja — staging dengan NODE_ENV=production tidak bisa debug.
- **Fix**: Gunakan env var `LOG_LEVEL` dengan fallback.
- **Effort**: Kecil

### [P-036] Input validation real-time di form
- **ID sumber**: UI-007
- **Lokasi**: BankInfaqPage, MustahikTable, ZakatPage
- **Masalah**: Form tidak kasih feedback error real-time, hanya setelah submit.
- **Fix**: Validasi onChange + error border + inline message.
- **Effort**: Sedang

---

## 🟢 LOW — Perbaikan Minor

### [P-037] Hero Image tanpa `priority`
- **ID sumber**: UI-006
- **Lokasi**: `LandingPage.tsx:180-186`
- **Masalah**: LCP image tanpa priority — lazy loading delay 1-3 detik.
- **Fix**: Tambah `priority`.

### [P-038] LoginPage loading state freeze
- **ID sumber**: BUG-12
- **Lokasi**: `src/components/LoginPage.tsx:13-35`
- **Masalah**: `loading` tetap true setelah `router.push()` — spinner abadi jika navigasi gagal.
- **Fix**: `setLoading(false)` setelah push atau pakai `useTransition`.

### [P-039] Signup error message bocor info
- **ID sumber**: BUG-13
- **Lokasi**: `src/lib/actions/auth.ts:44-46`
- **Masalah**: Error message dari Supabase dikirim ke client — bisa enumerasi akun.
- **Fix**: Return pesan generic, log asli ke server.

### [P-040] CTA hero pakai `<button>` bukan `<Link>`
- **ID sumber**: UI-008
- **Lokasi**: `LandingPage.tsx:158-174`
- **Masalah**: `<button>` dengan router.push() — tidak ada prefetching.
- **Fix**: Ganti ke `<Link>`.

### [P-041] Font `text-[9px]` terlalu kecil
- **ID sumber**: UI-012
- **Lokasi**: Footer, Admin layout, OverviewTab, DashboardPage
- **Masalah**: Teks 6.75pt di bawah bacaan nyaman.
- **Fix**: Naikkan ke `text-[11px]` atau `text-xs`.

### [P-042] Breadcrumb navigasi di admin
- **ID sumber**: UI-005
- **Lokasi**: `app/(admin)/layout.tsx:50-98`
- **Masalah**: Tidak ada breadcrumb — admin bisa tersesat di halaman dalam.
- **Fix**: Implementasi breadcrumb dinamis.

### [P-043] Ternary chain raksasa di admin layout
- **ID sumber**: UI-009
- **Lokasi**: `app/(admin)/layout.tsx:103-104`
- **Masalah**: 17 kondisi chaining ternary untuk judul halaman — sulit di-maintain.
- **Fix**: Gunakan `Map<string, string>` lookup.

### [P-044] deleteActivity audit log tanpa changes
- **ID sumber**: BUG-09
- **Lokasi**: `src/lib/actions/activity.ts:94-108`
- **Masalah**: Semua delete log kirim `changes: old`, deleteActivity tidak.
- **Fix**: Tambah `changes: row`.

### [P-045] Recharts chart tanpa alternatif aksesibel
- **ID sumber**: UI-011
- **Lokasi**: TransparansiPage, OverviewTab
- **Masalah**: Pie chart Recharts tidak punya fallback tekstual.
- **Fix**: Bungkus dalam `role="img"` dengan aria-label, tambah tabel `.sr-only`.

### [P-046] Admin grid statistik tidak stretch
- **ID sumber**: MOB-005
- **Lokasi**: `LandingPage.tsx:211-250`
- **Masalah**: Grid card statistik tinggi tidak seragam.
- **Fix**: Tambah `items-stretch` atau `h-full`.

### [P-047] Grid produk BUMM terlalu sempit di mobile
- **ID sumber**: MOB-011
- **Lokasi**: `BummPage.tsx:140-175`
- **Masalah**: `grid-cols-2` di 320px → card ~150px, nama produk wrapping.
- **Fix**: Gunakan `grid-cols-1` di xs, `sm:grid-cols-2`.

### [P-048] Focus indicator hilang di tombol interaktif
- **ID sumber**: UI-004
- **Lokasi**: LandingPage, ZakatPage, BummPage
- **Masalah**: `focus:outline-none` tanpa fallback ring — keyboard user buta navigasi.
- **Fix**: Ganti dengan `focus-visible:ring-2`.

---

## 🔵 INFO — Catatan untuk Scaling

### [P-049] Middleware matcher terbatas
- **ID sumber**: ID-018
- **Lokasi**: `src/middleware.ts:15-19`
- **Catatan**: Middleware hanya proteksi `/admin/*` dan `/api/admin/*`. Endpoint midtrans/public tidak kena.
- **Status**: Informasi — sesuai design saat ini.

### [P-050] resolveMosqueId fallback ke masjid pertama
- **ID sumber**: ID-019
- **Lokasi**: `src/lib/actions/_helpers.ts:6-15`
- **Catatan**: Fallback ke masjid aktif pertama jika mosqueId tidak diberikan — OK untuk 1 masjid, perlu review untuk multi-tenant.
- **Status**: Monitor saat scaling.

### [P-051] CSP unsafe-inline/unsafe-eval
- **ID sumber**: ID-013
- **Lokasi**: `next.config.ts:8`
- **Catatan**: Diperlukan Next.js untuk hydration. Bisa diperketat di production dengan nonce/strict-dynamic.
- **Status**: Rencana hardening bertahap.

### [P-052] Webhook signature verifikasi — cek versi API
- **ID sumber**: ID-017
- **Lokasi**: `src/app/api/midtrans/webhook/route.ts:21-24`
- **Catatan**: Formula signature sudah benar (orderId+statusCode+grossAmount+serverKey). Cek kompatibilitas versi Snap API.
- **Status**: Perlu verifikasi manual.

### [P-053] User enumeration via Supabase
- **ID sumber**: ID-016
- **Lokasi**: Supabase dashboard setting
- **Catatan**: Login message sudah generalisasi baik. Perlu cek setting dashboard Supabase untuk disable user enumeration.
- **Status**: Perlu verifikasi manual.

---

## 📊 DISTRIBUSI BERDASARKAN EFFORT

| Effort | Jumlah | ID |
|--------|--------|----|
| Kecil | 36 | P-001 (sebagian), P-003, P-004, P-006, P-007, P-008, P-009, P-011, P-012, P-015, P-017, P-020, P-021, P-022, P-023, P-024, P-025, P-027, P-031, P-032, P-033, P-034, P-035, P-037, P-038, P-039, P-040, P-041, P-042, P-043, P-044, P-045, P-046, P-047, P-048 |
| Sedang | 13 | P-001 (sebagian), P-005, P-010, P-014, P-016, P-019, P-028, P-029, P-030, P-036 |
| Besar | 2 | P-013 (26 files), P-026 (admin layout) |

---

## 💡 REKOMENDASI STRATEGIS

**Codebase ini solid untuk MVP 1 masjid (skor arsitektur 6/10)**, dengan foundation DB yang matang (AES-encrypted NIK, soft-delete, bigint untuk uang, audit trail, RBAC) dan logging sudah Level 2 (Pino).

**Namun, ada 3 critical blocker yang harus diperbaiki SEBELUM scale-up ke 15 masjid:**
1. **Data privacy** — NIK plaintext di loan_applications adalah pelanggaran UU PDP dan berisiko hukum
2. **Payment reliability** — Webhook fire-and-forget bisa menyebabkan kehilangan donasi (reputasi masjid)
3. **Race condition financial** — Lost update di payInstallment bisa bikin laporan keuangan tidak akurat

**Prioritas immediate (Minggu 1-2):** P-001 sampai P-008 (semua Critical) + P-014 (logging tracing)
**Prioritas bulan ini (Minggu 2-4):** P-010 (CSRF), P-013 (error handling standarisasi), P-026 (admin mobile), P-029 (log all errors)
**Lanjutan (Bulan 2):** Semua Medium + Low

> Status final: 🔴 BELUM LAYAK PRODUKSI SKALA BESAR — butuh perbaikan critical security + data integrity dulu.

---

*RENCANA UPAYA PERBAIKAN — masjid-ataqwa (3 Juli 2026)*
*53 item prioritas dari 68 temuan unik (15 overlap antar kategori di-dedup)*
