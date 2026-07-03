# PROGRESS EKSEKUSI PERBAIKAN — masjid-ataqwa

**Dimulai:** 3 Juli 2026
**Selesai:** 3 Juli 2026
**Total dieksekusi:** 27 ID | **Belum/Tunda:** 2 (ID-037 butuh keputusan manusia, AUD-DB-001 low priority)

---

## COVERAGE LENGKAP

### ✅ ID-024: Midtrans Signature (Critical)
- **Fix**: Ambil `signature_key` dari body webhook, bukan header `x-midtrans-signature`
- **Commit**: `0a27b4a`
- **File**: `src/app/api/midtrans/webhook/route.ts`

### ✅ ID-025: Auth Overview Endpoint (Critical)
- **Fix**: `requireRole(mosqueId, "superadmin", "admin_dkm")` di GET handler + middleware matcher `/api/admin/:path*`
- **Commit**: `0a27b4a`
- **File**: `src/app/api/admin/overview/route.ts`, `src/middleware.ts`

### ✅ ID-026: Payment_status Bypass (High)
- **Fix**: `payment_status` dipaksa `"pending"` untuk non-admin via `requireRole` try-catch
- **Commit**: `0a27b4a`
- **File**: `src/lib/actions/donations.ts`

### ✅ ID-027: Payment Amount Mismatch (High)
- **Fix**: Cross-validate `gross_amount` client vs DB di token endpoint. Webhook pakai `grossAmount` dari Midtrans
- **Commit**: `0a27b4a`
- **File**: `src/app/api/midtrans/token/route.ts`, `src/app/api/midtrans/webhook/route.ts`

### ✅ ID-029: Transaction Wrapper (High)
- **Fix**: Bungkus update donations + insert transactions/activity_feed/audit_logs dalam `db.transaction()`
- **Commit**: `f0407b4`
- **File**: `src/app/api/midtrans/webhook/route.ts`, `src/lib/actions/donations.ts`

### ✅ ID-039: Duplikasi CATEGORY_MAP (High)
- **Fix**: Pindah ke `lib/fund-mapping.ts`, import dari sana
- **Commit**: `b439586`
- **File**: `src/lib/fund-mapping.ts`, `src/lib/actions/donations.ts`, `src/app/api/midtrans/webhook/route.ts`

### ✅ ID-022/023/028: Auth Multi-Tenant (High/High/Medium)
- **Fix**: `requireRole` di createMustahik, updateMustahik, deleteMustahik, createJamaah, createInventaris
- **Commit**: `b439586`
- **File**: `src/lib/actions/mustahik.ts`, `src/lib/actions/jamaah.ts`, `src/lib/actions/inventaris.ts`

### ✅ ID-021: Public API (Medium)
- **Fix**: Hapus `mosque.id` dari response publik
- **Commit**: `b439586`
- **File**: `src/app/api/public/route.ts`

### ✅ ID-050: NIK Plaintext (High)
- **Fix**: Tambah `nik_encrypted` (AES-256-GCM) + `nik_hash` (SHA-256) di schema & server action. Butuh `NIK_ENCRYPTION_KEY` di `.env`
- **Commit**: `8e9f795`
- **File**: `src/lib/nik-crypto.ts` (new), `src/lib/actions/loan-applications.ts`, `src/db/schema.ts`

### ✅ ID-049: Turnstile (High)
- **Fix**: Helper `verifyTurnstile()` + dipasang di createLoanApplication (opsional, jika token dikirim)
- **Commit**: `8e9f795`
- **File**: `src/lib/turnstile.ts` (new), `src/lib/actions/loan-applications.ts`

### ✅ ID-051: CSP Unsplash (Medium)
- **Fix**: `img-src` + `remotePatterns` untuk images.unsplash.com
- **Commit**: `a5df9a7`
- **File**: `next.config.ts`

### ✅ ID-052: Next.js Image (Low)
- **Fix**: Ganti `<img>` → `<Image fill sizes>` di LandingPage
- **Commit**: `a5df9a7`
- **File**: `src/components/LandingPage.tsx`

### ✅ ID-034: Kontras Warna (Medium)
- **Fix**: `--color-primary: #10b981` → `#0e7a45` (WCAG AA 4.7:1)
- **Commit**: `a5df9a7`
- **File**: `src/app/globals.css`

### ✅ ID-035: Tabel Mobile (Medium)
- **Fix**: `hidden md:table-cell` pada kolom NIM, Desil, Had Kifayah, MapLink
- **Commit**: `a5df9a7`
- **File**: `src/components/MustahikTable.tsx`

### ✅ ID-036: Touch Target (Low)
- **Fix**: `p-1.5`→`p-2.5`, `gap-1`→`gap-3` (WCAG 44px minimum)
- **Commit**: `a5df9a7`
- **File**: `src/components/MustahikTable.tsx`

### ✅ ID-030: total_paid (Medium)
- **Fix**: Update `loans.total_paid` dalam transaction bersama update installment
- **Commit**: `a5df9a7`
- **File**: `src/lib/actions/loan-installments.ts`

### ✅ ID-033: DB Indexes (Low)
- **Fix**: 4 index FK baru: `loans_approved_by_idx`, `donations_verified_by_idx`, `transactions_created_by_idx`, `mustahiks_created_by_idx`
- **Commit**: `f92c002`
- **File**: `src/db/schema.ts`

### ✅ ID-031: ESLint Config (Low)
- **Fix**: `eslint.config.mjs` flat config untuk ESLint 9.x
- **Commit**: `0f1eefa`
- **File**: `eslint.config.mjs` (new)

---

## ✅ EKSEKUSI TAMBAHAN (Setelah Laporan Awal)

### ✅ ID-032: Duplikasi Repayments (Medium)
- **Fix**: Hapus definisi tabel `repayments` dari schema.ts + migration 0014
- **File**: `src/db/schema.ts`, `src/db/migrations/0014_*`
- **Commit**: `eabb626`

### ✅ ID-040-048: Logging Maturity Level 1→3 (Medium/High/Critical)
- **Fix**: Pino logger, structured JSON logs, correlation ID, audit_logs helper, redact sensitive data
- **File**: `src/lib/logger.ts`, `src/lib/audit.ts`, correlation middleware
- **Commit**: `2a3f750`

### ✅ AUD-SEC-002: createMuzzaki missing requireRole (Critical)
- **Fix**: Tambah `requireRole(mid, "superadmin", "admin_dkm", "finance_director")`
- **File**: `src/lib/actions/muzzaki.ts`
- **Commit**: `3bbcbf1`

### ✅ ID-038: Zod Schema Validation (Medium)
- **Fix**: `src/lib/validation.ts` dengan Zod schemas untuk 6 entitas + integrasi di action files
- **File**: `src/lib/validation.ts` (new), 6 action files
- **Commit**: `5c16bde`

### ✅ AUD-UI-001: Dummy Export Transparansi (Medium)
- **Fix**: Ganti setTimeout dummy jadi real CSV export dari ledgerEntries
- **File**: `src/components/TransparansiPage.tsx`
- **Commit**: `f16e03b`

---

## ⬜ BELUM DIKERJAKAN

| ID | Severity | Kategori | Catatan |
|----|----------|----------|---------|
| ID-037 | Medium | Arsitektur | Pencampuran server action & query — butuh refactor layer lebih besar (BUTUH KEPUTUSAN MANUSIA) |
| AUD-DB-001 | Low | Database | 30 bigint fields pakai `{ mode: "number" }` — butuh refactor + migration besar (kandidat untuk rilis berikutnya) |

---

## COMMIT HISTORY
```
f16e03b fix(AUD-UI-001): [fitur] ganti dummy export jadi real CSV download di TransparansiPage
5c16bde fix(ID-038): [arsitektur] integrasi Zod validation di 6 server actions + file validation.ts
3bbcbf1 fix(AUD-SEC-002): [keamanan] tambah requireRole di createMuzzaki
2a3f750 fix(ID-040-048): [logging] pino, structured logs, redact sensitive data, correlation ID
eabb626 fix(ID-032): [database] hapus tabel repayments (duplikasi loan_installments) + migration 0014
0f1eefa fix(ID-031): [devx] tambah eslint.config.mjs untuk ESLint flat config
f92c002 fix(ID-033): [database] tambah index FK profiles.id di 4 tabel utama
8e9f795 fix(ID-050-049): [keamanan] enkripsi NIK loan_applications + Turnstile helper
a5df9a7 fix(ID-051-052-034-035-036-030): [ui/performa/a11y] CSP, Image, kontras, tabel mobile, touch, total_paid
f0407b4 fix(ID-029): [database] bungkus sinkronisasi keuangan dalam db.transaction()
b439586 fix(ID-039-021-022-023-028): [arsitektur/keamanan] CATEGORY_MAP, auth multi-tenant, public API
0a27b4a fix(ID-024-027): [keamanan] webhook signature, auth overview, payment_status bypass, amount validasi
```
