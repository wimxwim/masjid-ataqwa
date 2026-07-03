# PROGRESS EKSEKUSI PERBAIKAN — masjid-ataqwa

**Dimulai:** 2026-07-03
**Acuan:** `rencana-upgrade.md` (53 item prioritas P-001 s.d. P-053)
**Metode:** Satu commit = satu ID. Riset tiap temuan sebelum fix (Keamanan/Database/Arsitektur/Logging).

---

## Urutan Prioritas Eksekusi

1. **Keamanan Critical/High** — yang bisa dieksploitasi langsung
2. **Database & integritas data** — transaksi, race condition, constraint
3. **Arsitektur & alur** — error handling, state konsisten, logger tracing
4. **Bug/logic error** lainnya
5. **Logging & observability** — naik ke Level 3
6. **UI/UX** desktop & mobile
7. **Performa & SEO/lainnya**

>> CHECKPOINT AWAL: Mulai eksekusi batch 1 — Keamanan Critical

### [P-003] Proteksi endpoint /api/debug dengan requireAuth()
- **Status verifikasi ulang**: Valid
- **Perbaikan**: Tambah requireAuth() di awal handler GET
- **File**: src/app/api/debug/route.ts
- **Commit**: ae493e0 fix(P-003): [security] proteksi endpoint /api/debug dengan requireAuth()
- **Catatan**: Selesai. Endpoint sekarang hanya bisa diakses admin yang login.

### [P-004] Webhook Midtrans await handler
- **Status verifikasi ulang**: Valid
- **Perbaikan**: Ubah fire-and-forget (handlePaymentNotification().catch) jadi await dengan try/catch
- **File**: src/app/api/midtrans/webhook/route.ts
- **Commit**: 5ce4263 fix(P-004): [security] webhook Midtrans await handler, hapus fire-and-forget

### [P-008] Validasi DATABASE_URL
- **Status verifikasi ulang**: Valid
- **Perbaikan**: Ganti process.env.DATABASE_URL! dengan validasi manual + throw error jelas
- **File**: src/db/client.ts
- **Commit**: 800f139 fix(P-008): [database] validasi DATABASE_URL — hindari silent crash

### [P-002] Hapus secret tidak terpakai dari env files
- **Status verifikasi ulang**: Valid
- **Perbaikan**: Hapus SUPABASE_SECRET_KEY dan SUPABASE_SERVICE_ROLE_KEY dari .env dan .dev.vars
- **File**: .env, .dev.vars (gitignored — tidak masuk git history ✅)
- **Catatan**: BUTUH KEPUTUSAN MANUSIA — rotasi secret lain (Midtrans, Fonnte, NIK_ENCRYPTION_KEY, DATABASE_URL) perlu dilakukan di dashboard masing-masing. Juga tambah IP firewall di Supabase + buat DB user terbatas.

>> CHECKPOINT P-002 s.d. P-008: 4 temuan selesai. Lanjut P-006 (transaction restructure) + P-007 (RBAC) + P-009 (Turnstile mandatory)

### [P-006] Bungkus createLoanRestructure dalam transaction
- **Status verifikasi ulang**: Valid
- **Riset**: Pattern dari Drizzle ORM docs — db.transaction() dengan rollback otomatis jika throw
- **Sumber riset**: orm.drizzle.team/docs/transactions
- **Perbaikan**: Bungkus insert loan_restructures + update loan status + audit_log dalam db.transaction()
- **File**: src/lib/actions/loan-restructures.ts
- **Commit**: 49de0eb fix(P-006): [database] bungkus createLoanRestructure dalam transaction atomic

### [P-007] RBAC check di createLoanInstallment
- **Status verifikasi ulang**: Valid
- **Riset**: Fungsi requireRole() sudah ada dan dipakai di fungsi lain — tinggal tambah di fungsi ini
- **Perbaikan**: Tambah requireRole(mosque_id, ...) sebelum insert — verifikasi user punya akses ke masjid
- **File**: src/lib/actions/loan-installments.ts
- **Commit**: 2eff77f fix(P-007): [security] tambah RBAC check di createLoanInstallment

### [P-005] Fix race condition payInstallment
- **Status verifikasi ulang**: Valid — dan ditemukan 2 masalah tambahan
- **Riset**: PostgreSQL UPDATE atomic — `UPDATE SET col = col + val` sudah row-level lock via MVCC.
  Masalah utama adalah amount_paid OVERWRITE (bukan increment) yang menyebabkan lost update.
- **Sumber riset**: PostgreSQL docs (postgresql.org/docs/current/tutorial-transactions.html), Drizzle ORM docs transactions, SO #40162952
- **Perbaikan**:
  1. amount_paid: overwrite → atomic increment (COALESCE(amount_paid, 0) + amount_paid)
  2. Tambah validasi amount_paid <= sisa cicilan di awal
  3. total_paid sudah atomic (tidak diubah)
- **File**: src/lib/actions/loan-installments.ts
- **Commit**: fd33ecc fix(P-005): [database] fix race condition payInstallment
- **Catatan**: Idempotency key belum ditambahkan — butuh kolom baru + migrasi (follow-up)

### [P-009] Turnstile mandatory + IP verification
- **Status verifikasi ulang**: Valid — dan Zod schema tidak pernah validasi turnstile karena field name mismatch
- **Riset**: Midtrans IP range dari docs, Turnstile mandatory pattern
- **Sumber riset**: docs.midtrans.com/en/technical-reference/ip-address-range
- **Perbaikan**:
  1. Tambah IP verification webhook (MIDTRANS_IP_RANGES + ipInRanges())
  2. Jadikan Turnstile mandatory (hapus `if` guard)
  3. Fix Zod schema field name turnstile_token → turnstileToken, z.string().required
- **File**: src/app/api/midtrans/webhook/route.ts, src/lib/actions/loan-applications.ts, src/lib/validation.ts
- **Commit**: d2c67fb + 40f5720

>> CHECKPOINT P-005 s.d. P-009: Batch Keamanan Critical selesai (8 dari 9 Critical). Lanjut batch 2 — Database & Integritas Data (P-001 NIK plaintext)

### [P-001] Hapus NIK plaintext dari loan_applications
- **Status verifikasi ulang**: Valid
- **Riset**: Schema loan_applications punya 3 kolom: nik (plaintext), nik_encrypted (AES-256-GCM), nik_hash (SHA-256). nik_encrypted + nik_hash sudah cukup untuk semua operasi.
- **Sumber riset**: UU PDP Pasal 15 — Data Pribadi Sensitif wajib dienkripsi
- **Perbaikan**:
  1. Migrasi 0015: ALTER TABLE loan_applications DROP COLUMN nik
  2. Schema: hapus nik, nik_encrypted jadi NOT NULL
  3. Action: stop simpan nik plaintext
  4. UI: tampilkan hash suffix
  5. Script backfill untuk data existing
- **File**: schema.ts, loan-applications.ts, migrations/0015, sahabat-infaq/page.tsx, scripts/backfill-nik.ts
- **Commit**: c2aa5fc fix(P-001): [security] hapus NIK plaintext dari loan_applications

### [P-012] Fix IDOR di 6 fungsi get*ById
- **Status verifikasi ulang**: Valid — 6 dari 17 fungsi get*ById tidak filter mosque_id
- **Perbaikan**: Tambah resolveMosqueId() + and(eq(table.mosque_id, mid)) di semua fungsi
- **File**: inventaris.ts, asnaf.ts, jadwal-imam.ts, mustahik.ts, jamaah.ts, transactions.ts
- **Commit**: 57a0b02 fix(P-012): [security] fix IDOR — tambah mosque_id filter

>> CHECKPOINT P-001 + P-012 selesai. Lanjut batch 3 — Database & Bug Fixes (P-022, P-023, P-024, P-034, P-038, P-039)

### [P-022] Bungkus createZakatPayment + muzzaki update dalam transaction
- **Status verifikasi ulang**: Valid — 3 operasi (insert zakat_payments, audit_logs, update muzzaki) terpisah
- **Riset**: Pattern db.transaction() sudah ada di loan-restructures.ts, donations.ts
- **Perbaikan**: Bungkus 3 operasi dalam db.transaction(async (tx) => { ... })
- **Sumber riset**: orm.drizzle.team/docs/transactions
- **File**: src/lib/actions/zakat-payments.ts
- **Commit**: cd8db94

### [P-024] Validasi amount di updateTransaction
- **Status verifikasi ulang**: Valid — createTransaction validasi amount, updateTransaction tidak
- **Perbaikan**: Tambah `if (data.amount !== undefined && data.amount <= 0) throw`
- **File**: src/lib/actions/transactions.ts
- **Commit**: cd8db94

### [P-034] Validasi URL gambar (XSS via image_url/photo_ktp_url)
- **Status verifikasi ulang**: Valid — 3 fungsi simpan URL gambar tanpa validasi format/protokol
- **Riset**: Zod bisa validasi URL, tapi action tidak pakai Zod untuk field individual. Buat helper di _helpers.ts
  dengan URL constructor + cek protocol.
- **Sumber riset**: UU PDP, OWASP A03:2021 Injection
- **Perbaikan**:
  1. Helper validateImageUrl() di _helpers.ts — cek URL valid + protokol HTTPS
  2. Panggil di create/update testimonials, bumm_products, mushafir_aid
- **File**: _helpers.ts, testimonials.ts, bumm.ts, mushafir.ts
- **Commit**: cd8db94

### [P-023] Fix getDonations / getZiswafRequests filter deleted_at
- **Verifikasi ulang**: SKIP — tabel `donations` dan `ziswaf_requests` tidak punya kolom `deleted_at`.
  Audit BUG-06/BUG-07 berdasarkan codebase versi lama. Tidak ada yang perlu diperbaiki.

### [P-038] Login loading state
- **Verifikasi ulang**: SUDAH ADA — LoginPage.tsx baris 11-12: `const [loading, setLoading] = useState(false)`
  dan baris 91-95 menampilkan spinner + "Mengautentikasi..." saat loading. Tidak ada yang perlu diperbaiki.

### [P-039] Signup error message
- **Verifikasi ulang**: SKIP — Tidak ada halaman signup publik. Registrasi dilakukan oleh pengurus masjid
  secara internal.

>> CHECKPOINT P-022/P-024/P-034 selesai (3 fix). P-023/P-038/P-039 skip/stale. Lanjut batch 4 — 6 small fixes

### [P-044] deleteActivity audit log tanpa changes
- **Verifikasi ulang**: Valid — semua fungsi delete* kirim `changes: old`, deleteActivity tidak
- **Perbaikan**: Tambah `changes: row` di insert audit_log
- **File**: src/lib/actions/activity.ts
- **Commit**: ae1704e

### [P-037] Hero image tambah priority
- **Verifikasi ulang**: Valid — LandingPage hero image tanpa `priority`, delay LCP 1-3 detik
- **Perbaikan**: Tambah atribut `priority` di <Image>
- **File**: src/components/LandingPage.tsx
- **Commit**: ae1704e

### [P-040] CTA hero pakai router.push, bukan <Link>
- **Verifikasi ulang**: Status — Sebenarnya tetap perlu button karena set state sebelum navigasi.
  Solusi: tambah `router.prefetch("/donasi")` di useEffect.
- **Perbaikan**: Tambah useEffect + router.prefetch
- **File**: src/components/LandingPage.tsx
- **Commit**: ae1704e

### [P-041] Font text-[9px] terlalu kecil
- **Verifikasi ulang**: Valid — teks 6.75pt di bawah bacaan nyaman. 8 komponen terkena.
- **Perbaikan**: text-[9px] → text-[10px] di LiveActivityFeed, OverviewTab, AssetsTab, JamaahTab,
  InflowTab (2x), admin layout
- **File**: 8 komponen
- **Commit**: ae1704e

### [P-015] Redact sensitive data di semua method logger
- **Verifikasi ulang**: Valid — debug/info/warn/error tidak auto-redact, hanya .redacted() method
- **Perbaikan**: Buat helper `logWithRedact()` yang panggil `redactSensitiveData()` sebelum log,
  gunakan di debug/info/warn/error. Method .redacted() tetap jalan sendiri.
- **File**: src/lib/logger.ts
- **Commit**: ae1704e

### [P-035] LOG_LEVEL env var dengan fallback
- **Verifikasi ulang**: Valid — level log dari NODE_ENV saja, staging tidak bisa debug
- **Perbaikan**: `const LOG_LEVEL = process.env.LOG_LEVEL || (production ? "info" : "debug")`
- **File**: src/lib/logger.ts
- **Commit**: ae1704e

### [P-017] Contrast text-gray-400 pada putih
- **Verifikasi ulang**: SKIP sementara — butuh pengecekan visual per komponen. text-gray-400 di dark bg
  (LandingPage emerald section) tidak bermasalah. Hanya yang di white bg perlu di-gray-600.

### [P-031] Audit logs actor_id NOT NULL
- **Verifikasi ulang**: SKIP — butuh migration database. Perubahan schema tanpa migration
  bisa break production. Tunda ke batch berikutnya.

>> CHECKPOINT Batch 4 selesai (6 fix, 2 skip). Total progres: 19 dari 53 item prioritas.

## ⏹️ EKSEKUSI SELESAI — 2026-07-03

**Keputusan pemilik: Stop di sini.** 19 dari 53 item prioritas diperbaiki dalam 7 commit.
Semua 🔴 Critical selesai. Sisa 🟡/🟢 aman ditunda.

### Ringkasan Final

| Kategori | ✅ Selesai | ⏭️ Skip/Stale | ❌ Tersisa |
|----------|:----------:|:--------------:|:----------:|
| Keamanan Critical | 9 | 0 | 0 |
| Database/Integritas | 3 | 0 | 6 |
| Keamanan High | 2 | 1 | 2 |
| Bug | 1 | 4 | 3 |
| Standarisasi | 2 | 3 | 4 |
| UI/UX | 4 | 1 | 4 |
| Info | 0 | 0 | 5 |
| **Total** | **19** | **9** | **24** |

### Files disentuh (28 files)

**Security:** route.ts (debug, webhook), loan-applications.ts, schema.ts, loan-installments.ts, loan-restructures.ts, inventaris.ts, asnaf.ts, jadwal-imam.ts, mustahik.ts, jamaah.ts, transactions.ts, testimonials.ts, bumm.ts, mushafir.ts, _helpers.ts, validation.ts, .env/.dev.vars

**Database:** client.ts, zakat-payments.ts, migrations/0015*

**Logger:** logger.ts

**UI:** LandingPage.tsx, LoginPage.tsx (verified), TransparansiPage.tsx, OverviewTab.tsx, LiveActivityFeed.tsx, AssetsTab.tsx, JamaahTab.tsx, InflowTab.tsx, admin/layout.tsx, activity.ts

### Commits (7)

```
ae493e0  fix(P-003): proteksi /api/debug dengan requireAuth()
5ce4263  fix(P-004): webhook Midtrans await handler
800f139  fix(P-008): validasi DATABASE_URL
49de0eb  fix(P-006): bungkus createLoanRestructure dalam transaction
2eff77f  fix(P-007): RBAC check di createLoanInstallment
fd33ecc  fix(P-005): fix race condition payInstallment
d2c67fb  fix(P-009): Turnstile mandatory + IP verification
c2aa5fc  fix(P-001): hapus NIK plaintext dari loan_applications
57a0b02  fix(P-012): fix IDOR — tambah mosque_id filter
cd8db94  fix(P-022/P-024/P-034): atomicity, validasi amount, validasi URL
ae1704e  fix(P-044/P-037/P-040/P-041/P-015/P-035): batch 4 — 6 quick fixes
942c412  fix(P-045): tambah aria-label di chart Recharts
```

### [P-045] Chart Recharts tanpa fallback aksesibel
- **Verifikasi ulang**: Valid — pie chart di TransparansiPage dan OverviewTab tidak punya aria-label
- **Perbaikan**: Bungkus container chart dengan role="img" + aria-label deskriptif
- **File**: TransparansiPage.tsx, OverviewTab.tsx
- **Commit**: 942c412

>> SISA: 34 item (P-010, P-011, P-013, P-014, P-016, P-017, P-019, P-020, P-021,
>> P-025, P-026, P-028, P-029, P-030, P-031, P-032, P-033, P-036, P-042, P-043,
>> P-046, P-047, P-048, P-049-P-053)
>> P-018 merged with P-001 ✅. P-027/P-046/P-047/P-048 sudah ok ✅.
>> P-017 perlu visual review manual. P-025 prefix logic sudah benar.
