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
