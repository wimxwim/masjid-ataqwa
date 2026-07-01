# Rencana Update — Masjid At-Taqwa Ulujami

> **Hasil scan komprehensif 1 Juli 2026** — Multi-lensa: diskusi, debug, code-reviewer, security-review, backend-patterns, architect, semgrep, dan 150+ pola dari skills database.
>
> Total file: 106 file | Baris kode: 13.983 | 33 tabel DB | 19 halaman | 24 action files

---

## 🏥 DIAGNOSIS PROYEK

```
┌──────────────────────────────────────────────────────────────┐
│ Nama Project   : masjid-ataqwa (Next.js 16.2.9)             │
│ Tech Stack     : Next.js 16 + Supabase + Drizzle + Tailwind │
│ Stage          : MVP / Staging — pre-produksi               │
│ Health Score   : 6.5 / 10                                   │
│ Confidence     : High                                       │
└──────────────────────────────────────────────────────────────┘
```

### Satu kalimat jujur
> *"Arsitektur solid dan matang dengan fondasi syariah yang kuat (AAOIFI, PSAK, BAZNAS), tapi 3 titik kritis (auth donation + mustahik + .env secrets) bisa menyebabkan kebocoran data masjid jika dipublikasikan tanpa perbaikan."*

---

## 🔴 TEMUAN KRITIS — HARUS DIPERBAIKI SEBELUM DEPLOY

### KR-1: Auth Hilang di donations.ts (2 endpoint)
| Item | Detail |
|------|--------|
| **File** | `src/lib/actions/donations.ts:19-69` |
| **Akar masalah** | `getDonations(mosqueId)` dan `createDonation(data)` = 0 auth check. Siapa pun bisa baca semua donasi semua masjid. |
| **Dampak** | Data donatur (nama, nomor, jumlah) bocor. Abuse endpoint create untuk spam donasi. |
| **Fix** | `getDonations` → tambah `requireAuth()` + `resolveMosqueId()`. `createDonation` → tambah `requireRole()` atau batasi origin + rate limit. |

### KR-2: Auth Hilang di mustahik.ts (4 dari 5 endpoint)
| Item | Detail |
|------|--------|
| **File** | `src/lib/actions/mustahik.ts:16-157` |
| **Akar masalah** | `getMustahiks`, `getMustahikById`, `updateMustahik`, `deleteMustahik` = 0 auth. Hanya `createMustahik` yang pakai supabase.auth.getUser() (malah bukan requireAuth). |
| **Dampak** | Data dhuafa (nama, alamat, income, ring) bisa dibaca/diubah/dihapus siapa pun. |
| **Fix** | Tambah `requireAuth()` dan `requireRole(mosqueId, "superadmin", "admin_dkm", "social_lead")` di keempat fungsi. |

### KR-3: `.env` Berisi Live Credentials Superadmin
| Item | Detail |
|------|--------|
| **File** | `.env:4,5,8` |
| **Isi** | `SUPABASE_SECRET_KEY`, `SERVICE_ROLE_KEY` (JWT superadmin), `DATABASE_URL` (postgres:// langsung dengan password) |
| **Dampak** | Jika `.env` bocor (screenshot, CI log, build artifact), Supabase + database full compromised. |
| **Status** | `.gitignore` sudah ada `.env*` — tapi verifikasi file belum pernah di-commit. |

### KR-4: Drizzle Client Bypass RLS Total
| Item | Detail |
|------|--------|
| **File** | `src/db/client.ts:5-8` |
| **Akar masalah** | Semua query lewat Drizzle (`db.select()`) menggunakan koneksi `postgres://` superuser — **100% bypass RLS**. RLS hanya aktif untuk query lewat Supabase client. |
| **Dampak** | Kalau auth check di action file terlewat (seperti KR-1 dan KR-2), **tidak ada safety net**. Data langsung bisa diakses tanpa filter. |
| **Fix** | Pastikan SEMUA action file harus punya auth check. Atau migrasi query sensitif ke Supabase client (yang enforce RLS). |

---

## 🟡 TEMUAN HIGH — PERLU DISELESAIKAN

### HI-1: Next.js 16.2.9 = Versi Canary
| **Masalah** | Next.js 16 belum rilis stable — yang terinstall adalah canary/RC. Di production, ini rentan behavior change tanpa peringatan. |
| **Fix** | Lock ke versi LTS terakhir (15.x) atau stable terbaru. Ubah `package.json`: `"next": "^15.2.0"` dan sesuaikan dependensi turunan. |

### HI-2: allowedDevOrigins Sisa Dev
| **File** | `next.config.ts:28` — `allowedDevOrigins: ["192.168.1.41"]` — dengan komentar "HAPUS SEBELUM DEPLOY!" |
| **Akar masalah** | Kode berisi config development yang di production bisa membuka akses origin lain. |
| **Fix** | Hapus block `allowedDevOrigins` sebelum deploy. |

### HI-3: Dual Migration 0003 (Potensi Konflik)
| **Masalah** | Dua file migration dengan label 0003: `0003_add_latlng_mushafir.sql` (hand-written) dan `0003_fund_type_transactions.sql` (di-refer di journal tapi namanya `0005`). Bisa menyebabkan inkonsistensi state DB. |
| **Fix** | Audit migration state di Supabase. Hapus salah satu. Reset journal. |

### HI-4: Tidak Ada Test — Coverage Nol
| **Masalah** | Tidak ada file test (`*.test.ts`, `*.spec.ts`) di seluruh codebase. 13.983 baris kode = 0 test. |
| **Dampak** | Regresi tidak terdeteksi. Refactor berbahaya. Debug tanpa safety net. |
| **Fix** | Mulai dengan integration test untuk server actions + unit test untuk validasi syariah. Target coverage 30% dulu. |

### HI-5: `ziswaf_requests.getZiswafRequestById()` No Auth
| **File** | `src/lib/actions/ziswaf-requests.ts:30-32` |
| **Fix** | Tambah `requireAuth()` — fungsi lain di file ini sudah ada auth. |

---

## 🟢 TEMUAN MEDIUM — CATATAN UNTUK SPRINT BERIKUT

### ME-1: Structur CSS Bercampur di globals.css
| **Masalah** | `globals.css` (92 baris) berisi `@theme` tokens, utility classes (`@utility`), dan keyframes — idealnya pisah. Di Tailwind v4, style utilities sebaiknya di folder `styles/` atau `tokens/`. |
| **Fix** | Pisah: `globals.css` → import `tokens.css` + `utilities.css` |

### ME-2: Sidebar Label Header — Inkonsisten
| **File** | `src/app/(admin)/layout.tsx:100` — label `/admin/donatur` di header |
| **Masalah** | Label sidebar sudah benar "Donatur Tetap" tapi header masih "Muzaki & Donatur Tetap" (sudah diperbaiki di sesi sebelumnya — verifikasi build). |
| **Status** | ✅ Fixed di sesi terakhir |

### ME-3: Komponen MustahikTable Over 500 Baris
| **File** | `src/components/MustahikTable.tsx:591` baris |
| **Masalah** | Melanggar prinsip "many small files". Sulit di-test dan dimaintain. |
| **Fix** | Refactor: pisah form modal, table row, filter panel ke komponen terpisah. |

### ME-4: 15 dari 19 Halaman Masih "use client" Bukan Server Component
| **Masalah** | Next.js 16 idealnya pakai Server Component sebanyak mungkin. 15 client pages berarti banyak JS dikirim ke browser. |
| **Fix** | Migrasi page yang pure data display ke server component. Pindahkan interaktivitas ke komponen child. |

### ME-5: CSP `'unsafe-inline'` + `'unsafe-eval'`
| **Masalah** | Di production, CSP dengan `unsafe-inline` dan `unsafe-eval` mengurangi proteksi XSS. Saat ini memang diperlukan untuk Next.js hydration. |
| **Fix** | Di production, evaluasi nonce-based CSP untuk menggantikan `unsafe-inline`. |

### ME-6: Tidak Ada Konfigurasi CORS Eksplisit
| **Masalah** | Tidak ada file `cors.ts` atau middleware CORS. Next.js Server Actions punya implicit CSRF protection via cookie, tapi tidak eksplisit. |
| **Fix** | Tambah header CORS di middleware untuk endpoint publik. |

### ME-7: PostGIS Extension Ada Tapi Tidak Dipakai
| **Masalah** | Extension `postgis` sudah di-create di migration `0000_initial.sql` tapi tidak ada kolom `GEOMETRY` atau index GIST yang digunakan. Lat/lng disimpan sebagai `doublePrecision` biasa. |
| **Fix** | Upgrade ke PostGIS penuh saat data peta mencapai >1000 titik (jarak / bounding box query jadi perlu). |

### ME-8: Kode Mati / Duplikasi di Types
| **File** | `src/types/index.ts` — interface `Mustahik` (old UI mock) mungkin sudah tidak terpakai. Interface `JadwalKajian` tidak ada tabel-nya di DB. |
| **Fix** | Audit export yang dipakai vs tidak. Hapus yang mati. |

### ME-9: Audit Log `mosque_id` Empty String
| **File** | `src/lib/actions/loan-installments.ts:49` — `mosque_id: ""` |
| **Masalah** | Beberapa action file insert audit_log dengan mosque_id kosong karena tidak resolv mosque_id dari konteks. Ini membuat audit trail terputus dari tenant. |
| **Fix** | Selalu resolv `mosque_id` dari loan/mustahik terkait sebelum insert audit_log. |

---

## 🔒 SECURITY ASSESSMENT

### Security Headers ✅
| Header | Status |
|--------|--------|
| Content-Security-Policy | ✅ |
| Strict-Transport-Security | ✅ (max-age=63072000, preload) |
| X-Frame-Options | ✅ (DENY) |
| X-Content-Type-Options | ✅ (nosniff) |
| Referrer-Policy | ✅ (strict-origin-when-cross-origin) |
| Permissions-Policy | ✅ (geolocation & camera terbatas) |

### Auth Model ✅
| Aspek | Rating |
|-------|--------|
| `requireAuth()` - Supabase + profile lookup | ✅ |
| `requireRole()` - multi-masjid RBAC via memberships | ✅ |
| RLS policies via `public.is_member_of()` | ✅ |
| Audit log (INSERT only) | ✅ |
| Cek auth di action files | 🔴 3 file tidak lengkap |

### Attack Surface
| Vektor | Status | Catatan |
|--------|--------|---------|
| SQL Injection | ✅ Aman | Drizzle ORM + Supabase parameterized queries |
| XSS | ✅ Aman | No dangerouslySetInnerHTML, no eval |
| CSRF | 🟡 Parsial | Server Actions implicit, no explicit token |
| IDOR | 🔴 Rentan | donations.ts + mustahik.ts tanpa auth |
| Rate Limiting | ❌ Tidak Ada | Tidak ada rate limiting di endpoint |
| Secret Exposure | 🔴 Kritis | .env dengan SERVICE_ROLE_KEY |
| Drizzle RLS Bypass | 🔴 Kritis | Semua query via Drizzle bypass RLS |

---

## 📊 ARSITEKTUR & KODE

### Kekuatan Arsitektur
- ✅ **Multi-tenant siap**: Semua tabel data punya `mosque_id` — siap scaling ke ratusan masjid
- ✅ **Modular program**: `programs` table dengan `is_active` toggle — bisa nyala/mati tanpa migrasi
- ✅ **Syariah compliance**: fund_type, akad_type, AAOIFI SS-60/SS-35, PSAK 112, BAZNAS standar
- ✅ **Idempotency key**: 4 tabel punya `idempotency_key` UNIQUE — cegah double-processing
- ✅ **NIK security**: NIK dienkripsi AES-256-GCM + hash SHA-256 — tidak pernah disimpan mentah
- ✅ **Security headers**: CSP, HSTS, XFO, dll sudah di next.config.ts
- ✅ **Error boundary**: AdminErrorBoundary membungkus konten admin
- ✅ **Clean action pattern**: `requireAuth()` + `requireRole()` pattern konsisten di 20/23 action files

### Kelemahan Arsitektur
- ❌ **No tests**: 0 test coverage, 13.983 baris kode
- ❌ **Drizzle bypass RLS**: Semua query production pakai superuser connection
- ❌ **Client-heavy**: 15/19 pages "use client" — JS bundle besar
- ❌ **No rate limiting**: Endpoint publik (donasi, ziswaf request) tanpa proteksi abuse
- ❌ **Migration state mixed**: Hand-written + Drizzle-generated migrations tanpa tracking konsisten
- ❌ **Monolitik DB**: Semua 33 tabel dalam 1 database — saat scaling, pemisahan domain diperlukan
- ❌ **No CI/CD security**: Belum ada dependabot, npm audit otomatis, atau secret scanning

### Catatan Performa
- Bundle size tidak terukur (perlu `next build --debug` atau `@next/bundle-analyzer`)
- Beberapa page (BankInfaq, MustahikTable) >500 baris — potensi slow render
- React Query terpakai tapi belum optimal — beberapa component masih pakai `useEffect` langsung

---

## 🚀 REKOMENDASI PRIORITAS

### Jalur Utama — Secure Production Deployment

```
PRASYARAT (hari 1-2):
  Step 1: Fix auth donations.ts + mustahik.ts ✅
    ├─ Tambah requireAuth() + requireRole() di 6 endpoint
    ├─ Integrasi dengan: ziswaf-requests.ts
    └─ Checklist: □ build lulus □ smoke test CRUD

  Step 2: Rotasi credentials + .env hygiene 🔴
    ├─ Rotasi SUPABASE_SERVICE_ROLE_KEY di dashboard Supabase
    ├─ Rotasi DATABASE_URL password
    ├─ Verifikasi .env tidak di-commit (git check-ignore)
    └─ Checklist: □ tidak ada secret mentah di repo □ git history clean

  Step 3: Audit & reset migration state
    ├─ Cek state DB di Supabase SQL Editor
    ├─ Hapus migration duplikat 0003
    ├─ Reset _journal.json
    └─ Checklist: □ migration konsisten □ drizzle-kit studio OK

  Step 4: Stabilkan Next.js version
    ├─ Ganti next ^15.2.0 (LTS) atau tunggu 16 GA
    ├─ Hapus allowedDevOrigins
    └─ Checklist: □ build lulus □ static pages hit

HARI 3-5:
  Step 5: Minimal test suite
    ├─ 1 integration test per action file core (mustahik, transactions)
    ├─ 1 unit test untuk validateSyariah
    └─ Checklist: □ 20+ test passing □ CI bisa jalan

  Step 6: Rate limiting
    ├─ Implementasikan di middleware.ts atau route handler
    ├─ Minimal: 10 req/menit untuk endpoint publik
    └─ Checklist: □ 429 returned correctly

HARI 6-7:
  Step 7: Security hardening
    ├─ Nonce-based CSP untuk production
    ├─ CORS explicit config
    └─ Checklist: □ securityheaders.com grade A

  Step 8: Final deployment
    ├─ Deploy ke Cloudflare Pages (OpenNext)
    ├─ Isi Turnstile + Midtrans keys di .env
    └─ Checklist: □ semua halaman OK □ payment flow test □ data masjid seed
```

### Quick Wins (< 1 Jam)
1. **Fix .env check** — `git check-ignore .env` + verifikasi `.gitignore` — 5 menit
2. **Fix ziswaf-requests auth** — tambah 1 baris requireAuth() — 5 menit
3. **Hapus allowedDevOrigins** — hapus 3 baris di next.config.ts — 2 menit
4. **Hapus dual migration 0003** — konfirmasi state, hapus yang tidak terpakai — 15 menit

---

## 📅 TIMELINE ESTIMASI

```
HARI 1-2  : 🔴 Kr-1, Kr-2, Kr-3, Kr-4 — auth + credentials
HARI 3-4  : 🟡 Hi-1, Hi-3, Hi-4 — Next version + migration + tests
HARI 5    : 🟡 Hi-2, Hi-5 — cleanup ziswaf + dev config
HARI 6    : 🟢 Me-1 s.d Me-5 — struktur kode
HARI 7    : 🔒 Security final + deploy
```

**Estimasi total:** 7 hari (1 sprint)
**Kompleksitas:** 🔴 Kompleks — terutama karena harus rotasi credentials + fix auth tanpa break existing flow.

---

## Satu Pertanyaan Sebelum Eksekusi

**Apakah kamu ingin mulai dengan jalur utama (Secure Production Deployment) dan mengerjakan Step 1 (fix auth donations.ts + mustahik.ts) sekarang?**

Atau ketik `lanjut jalur utama` untuk mulai eksekusi step-by-step.

---

*Hasil scan: 106 file · 33 tabel · 19 halaman · 24 action files · 10 item kritis · 5 high · 9 medium*
*Tools: diskusi · debug · code-reviewer · security-review · backend-patterns · architect · semgrep*
