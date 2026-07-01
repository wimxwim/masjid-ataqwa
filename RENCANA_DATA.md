# RENCANA_DATA — Jembatan Tampilan ↔ Database (Alignment)

> Status: **DRAFT v1** · 29 Jun 2026 · Menunggu mockup Gemini untuk finalisasi.
> Ini "kontrak" antara mockup (apa yang dilihat pengguna) dan database (apa yang disimpan).
> **Aturan:** tiap elemen UI dinamis WAJIB punya barisnya di sini SEBELUM dikoding.
> Semua data di-scope `mosque_id` (multi-tenant) & dilindungi RLS.
> Sumber: `ARSITEKTUR.md` §5 (12 tabel), `PRD.md`, `DESIGN.md`.

---

## A. Model Data v1 (12 tabel Postgres + PostGIS)

| # | Tabel | Kolom inti | Catatan |
|---|-------|-----------|---------|
| 1 | `mosques` | id, name, slug, address, coordinate(GEOMETRY), npwp, akta_yayasan_url, upz_number, bank_account, is_legalized, total_mustahik_target | tenant utama; PostGIS point |
| 2 | `users` | id, mosque_id, name, phone, email, password_hash, role(10), department(7), youth_dakwah_ring, avatar_url, is_verified | RBAC + REMISYA dept |
| 3 | `mustahiks` | user_id(FK), nik_encrypted, nik_hash(SHA-256), coordinate(GEOMETRY), desil_level, ring_number(1-4), monthly_income, dependents, usaha_type, is_active_borrower | **TANPA NIK mentah**; AES-256 |
| 4 | `sahabat_infaq_groups` | id, mosque_id, group_name, leader_id(FK), member_count(5/7/9), current_level(1-3), total_pokok, weekly_payment, week_duration, total_repaid, npf_flag | kelompok tanggung renteng |
| 5 | `loans` | id, mustahik_id(FK), group_id(FK), amount, weekly_payment, week_duration, current_level, status(active/completed/defaulted), total_paid, weeks_overdue | Qardhul Hasan |
| 6 | `repayments` | id, loan_id(FK), amount_paid, week_number, is_present_taklim, is_backstopped, backstopped_by_user_id, idempotency_key | cicilan + presensi |
| 7 | `kajian_silabus` | id, mosque_id, category(9), kitab, weight_pct, total_sessions, month_year | kurikulum 8 kategori + bobot |
| 8 | `bumm_products` | id, mosque_id, product_name, category(5), description, price, commission_pct, stock, image_url, is_active | BUMM ekonomi masjid |
| 9 | `affiliate_sales` | id, product_id(FK), referrer_user_id(FK), quantity, total_gmv, earned_commission, commission_status, idempotency_key | GMV pemuda |
| 10 | `unggulan_programs` | id, mosque_id, program_name, category(5), description, total_beneficiaries, total_budget, impact_description, partner_corporation | portofolio CSR |
| 11 | `audit_logs` | id, mosque_id, actor_id(FK), action(5), entity_type(6), entity_id, changes_json(JSONB), ip_address, user_agent | PARTITION BY month; INSERT-only |
| 12 | `donations` | id, mosque_id, donor_name, donor_phone, amount, akad_type(6), program(5), payment_method(4), payment_status(4), midtrans_transaction_id, idempotency_key | ZISWAF + Midtrans |

### Spatial Index
```sql
-- Semua tabel dengan coordinate GEOMETRY(Point, 4326)
CREATE INDEX idx_mosques_coordinate ON mosques USING GIST (coordinate);
CREATE INDEX idx_mustahiks_coordinate ON mustahiks USING GIST (coordinate);
```

### Audit Protection
```sql
-- Trigger larang update/delete di audit_logs
CREATE OR REPLACE FUNCTION protect_audit_logs()
RETURNS TRIGGER AS $$ BEGIN RAISE EXCEPTION 'audit_logs is append-only'; END; $$ LANGUAGE plpgsql;
CREATE TRIGGER trg_audit_protect BEFORE UPDATE OR DELETE ON audit_logs
    FOR EACH ROW EXECUTE FUNCTION protect_audit_logs();
```

---

## B. Matriks peran × aksi (dasar RLS)

| Tabel | Publik | Mustahik | Affiliate Youth | Dept Lead | Finance | Admin DKM | Superadmin |
|-------|--------|----------|----------------|-----------|---------|-----------|------------|
| **mosques** | read nama+program | — | — | — | — | RWX | RWX |
| **users** | — | read self | read self | read dept | read | RWX deptnya | RWX |
| **mustahiks** | — | read self | — | R dept | R | RWX | RWX |
| **sahabat_infaq_groups** | — | R(self group) | — | — | RWX | RWX | RWX |
| **loans** | — | R(self) | — | — | RWX | RWX | RWX |
| **repayments** | — | R(self) | — | — | RWX | R | RWX |
| **kajian_silabus** | read jadwal | read | read | RWX | R | RWX | RWX |
| **bumm_products** | read | read | read | — | R | RWX | RWX |
| **affiliate_sales** | — | — | RWX(self) | R dept | R | RW | RWX |
| **unggulan_programs** | read | read | read | — | R | RWX | RWX |
| **audit_logs** | — | — | — | — | R | R | RWX |
| **donations** | — | R(self) | — | R program | RWX | RWX | RWX |

---

## C. Alignment per LAYAR (Elemen UI → Sumber data → Akses/RLS)

### 1) Landing Publik — `(public)/page.tsx`  (SSR, ISR 60s)

| Elemen UI | Tipe | Sumber (tabel.kolom) | Aksi/Akses |
|-----------|------|----------------------|------------|
| Hero: nama masjid + logo | string | `mosques.name`, public/images/logo | baca publik |
| Hero: tagline "Dari Masjid Kita Tuntaskan Kemiskinan" | string | static | — |
| Data kemiskinan JakSel (counter) | angka | static (70.660 jiwa, 14.132 KK, 2.782 masjid) | hardcode dari BPS 2025 |
| Progress bar Bank Infaq | aggregat | `Σ donations where program=bank_infaq AND payment_status=paid` | publik (ringkasan) |
| Program cards (Bank Infaq, Wakaf Domba, Beasiswa) | list | `unggulan_programs where is_active=true` | publik; `RLS: select publik` |
| Kalkulator Zakat Penghasilan | client JS | static formula: `penghasilan × 2.5%` | publik; no DB |
| Tabel laporan donasi | aggregat | `donations` group by akad_type, month | publik (tanpa PII) |
| Footer: legalitas + sosial | string | `mosques` npwp, akta, upz | publik |

### 2) Admin Dashboard — `admin/page.tsx` (SSR, auth: admin_dkm)

| Elemen UI | Tipe | Sumber (tabel.kolom) | Aksi/Akses |
|-----------|------|----------------------|------------|
| KPI: Total Mustahik | angka | `COUNT(mustahiks)` | admin+finance; RLS mosque |
| KPI: Pinjaman Aktif | angka | `COUNT(loans WHERE status=active)` | admin+finance |
| KPI: NPF Rate | % | `COUNT(loans WHERE status=defaulted) / COUNT(loans) * 100` | admin+finance |
| KPI: Total Tersalurkan | rupiah | `SUM(loans.amount WHERE status!=defaulted)` | admin+finance |
| Ring Map (Leaflet) | map | `mustahiks.coordinate` + `ring_number` | admin+finance; PostGIS |
| Tabel Sahabat Infaq | list | `sahabat_infaq_groups` + leader name (join users) | admin+finance |
| Aktivitas terbaru | list | `audit_logs` LIMIT 10 (mosque_id) | admin only |

### 3) Mustahik GIS Map — `admin/mustahik/page.tsx` (Client, auth: admin_dkm)

| Elemen UI | Tipe | Sumber (tabel.kolom) | Aksi/Akses |
|-----------|------|----------------------|------------|
| Leaflet map + 4 circle ring | map | `mosques.coordinate` (center) + radius 500/1000/2000/4000m | admin; PostGIS |
| Marker mustahik per ring | point | `mustahiks.coordinate` + `ring_number` | admin |
| Popup: nama, ring, hutang | popup | `mustahiks` JOIN `loans` | admin |
| Filter RT/RW | query | `WHERE ring_number = ?` | client filter |
| Tombol Tambah Mustahik | nav | → `/admin/mustahik/tambah` | admin (RW) |
| Empty state | komponen | `COUNT(mustahiks)=0` → `<EmptyState>` | — |

### 4) Tambah Mustahik — `admin/mustahik/tambah/page.tsx`

| Elemen UI | Tipe | Sumber (tabel.kolom) | Aksi/Akses |
|-----------|------|----------------------|------------|
| Form: Nama, NIK, No HP, Pendapatan, Tanggungan, Usaha, Alamat | form | `mustahiks` insert | admin/surveyor; Zod `CreateMustahikSchema` |
| NIK encrypt | transform | `nik_encrypted = AES256(nik)`, `nik_hash = SHA256(nik)` | di Server Action |
| Peta pilih lokasi (Leaflet) | map | `mustahiks.coordinate` (click → lat/lng) | admin |
| Submit | action | Server Action `createMustahik` + audit log | admin; idempotency key |

### 5) Detail Mustahik — `admin/mustahik/[id]/page.tsx`

| Elemen UI | Tipe | Sumber (tabel.kolom) | Aksi/Akses |
|-----------|------|----------------------|------------|
| Profil mustahik | objek | `mustahiks` + `users` (name, phone) | admin; RLS mosque |
| Riwayat pinjaman | list | `loans WHERE mustahik_id = ?` | admin |
| Riwayat cicilan | list | `repayments WHERE loan_id IN (...)` JOIN `loans` | admin |
| Status tanggung renteng | badge | `repayments.is_backstopped` JOIN `users` | admin |
| Ring location (mini map) | map | `mustahiks.coordinate` (Leaflet, single marker) | admin |

### 6) Bank Infaq — `admin/kajian/page.tsx` (bisa dipisah nanti)

| Elemen UI | Tipe | Sumber (tabel.kolom) | Aksi/Akses |
|-----------|------|----------------------|------------|
| Daftar kelompok | list | `sahabat_infaq_groups` + `users` leader name | admin+finance |
| Detail kelompok: anggota, level, progress | list | `sahabat_infaq_groups` + `loans` + `repayments` | admin+finance |
| Level skema (L1→L2→L3) | status | `sahabat_infaq_groups.current_level` | auto-upgrade logic |
| NPF flag | badge | `sahabat_infaq_groups.npf_flag=true` | finance |

### 7) Kurikulum Kajian — `admin/kajian/silabus` (dalam satu halaman)

| Elemen UI | Tipe | Sumber (tabel.kolom) | Aksi/Akses |
|-----------|------|----------------------|------------|
| Donut chart bobot kajian | chart | `kajian_silabus.weight_pct WHERE month_year=?` | admin+dakwah |
| Jadwal pekanan (4 pekan) | list | `kajian_silabus` + sessions | admin+dakwah |
| Presensi hadir | toggle | `repayments.is_present_taklim` | dakwah_lead |

### 8) BUMM & Affiliate — `admin/bumm/page.tsx`

| Elemen UI | Tipe | Sumber (tabel.kolom) | Aksi/Akses |
|-----------|------|----------------------|------------|
| Daftar produk BUMM | list | `bumm_products` | admin+business |
| Tambah/edit produk | form | `bumm_products` insert/update (admin+business) | Zod |
| Total GMV | aggregat | `Σ affiliate_sales.total_gmv` | admin+finance |
| Komisi per produk | angka | `bumm_products.commission_pct` | business |

### 9) Laporan Keuangan — `admin/laporan/page.tsx`

| Elemen UI | Tipe | Sumber (tabel.kolom) | Aksi/Akses |
|-----------|------|----------------------|------------|
| Ringkasan ZISWAF | aggregat | `donations GROUP BY akad_type, month` | admin+finance |
| Ringkasan Bank Infaq | aggregat | `loans status + repayments` aggregate | admin+finance |
| Ringkasan BUMM | aggregat | `affiliate_sales.total_gmv GROUP BY month` | admin+finance |
| NPF Report | % | `loans WHERE status=defaulted / total` | finance |
| Download PDF | export | server-side PDF generation | admin |

### 10) Settings — `admin/settings/page.tsx`

| Elemen UI | Tipe | Sumber (tabel.kolom) | Aksi/Akses |
|-----------|------|----------------------|------------|
| Data masjid | form | `mosques` update (name, address, bank, legalitas) | admin_dkm only |
| RPJ (Rencana) | text | `mosques` (field: visi_misi) | admin_dkm |
| Upload akta, NPWP, SK UPZ | file | Cloudflare R2 → `mosques.akta_yayasan_url` | admin_dkm |
| Manajemen role user | list | `users` update role | admin_dkm |
| Pengaturan umum (app name, maintenance) | form | `mosques` settings fields | superadmin |

### 11) Portal Pemuda — `pemuda/page.tsx` (Mobile-first, auth: affiliate_youth)

| Elemen UI | Tipe | Sumber (tabel.kolom) | Aksi/Akses |
|-----------|------|----------------------|------------|
| Dashboard: komisi saya | aggregat | `Σ affiliate_sales.earned_commission WHERE referrer_user_id = me` | self only |
| Aktivitas REMISYA (GPS, Kuy Ngaji, LDSS) | list | static / atau `unggulan_programs where category=sosial` | publik |
| Ngonten: download konten 9:16 | aset | public R2 bucket / static | pemuda |
| Jualan: affiliate generator | form | `bumm_products` select → generate link → copy | pemuda |
| GMV chart | chart | `affiliate_sales GROUP BY date WHERE referrer=me` | self only |
| Peringkat penjualan | list | `affiliate_sales GROUP BY referrer_user_id ORDER BY SUM(total_gmv) DESC` | semua pemuda |

### 12) Portofolio CSR — `(public)/csr/page.tsx` (Publik)

| Eleui UI | Tipe | Sumber (tabel.kolom) | Aksi/Akses |
|-----------|------|----------------------|------------|
| Legalitas (5 checklist) | list | `mosques` (npwp, akta, upz, bank, laporan) | publik |
| Dampak program | list | `unggulan_programs` (beneficiaries, budget) | publik |
| Download PDF portofolio | file | generate server-side | publik |

---

## D. Ringkasan API Alignment

| Endpoint | Source Data | RLS/Filter |
|----------|-----------|------------|
| `GET /api/v1/public/mosque` | `mosques` where slug=? | publik |
| `GET /api/v1/public/mosque/programs` | `unggulan_programs where is_active` | publik |
| `GET /api/v1/public/mosque/kajian` | `kajian_silabus` month filter | publik |
| `POST /api/v1/public/donation/init` | `donations` insert → Midtrans | publik; Zod + Turnstile |
| `GET /api/v1/public/donation/{id}/status` | `donations` by id | publik (by idempotency key) |
| `GET /api/v1/public/leaderboard` | `affiliate_sales` group by user | publik |
| `GET /api/v1/admin/dashboard` | semua tabel aggregate | admin_dkm; RLS mosque |
| `GET /api/v1/admin/mustahik` | `mustahiks` + `users` join | admin_dkm; RLS mosque |
| `POST /api/v1/admin/mustahik` | `mustahiks` insert | admin; Zod; idempotent |
| `POST /api/v1/admin/loan` | `loans` insert (cek level) | finance; Zod; idempotent |
| `POST /api/v1/admin/repayment` | `repayments` insert | bendahara; Zod; idempotent |
| `POST /api/v1/webhook/midtrans` | `donations` update status | HMAC SHA512 verify |
| `GET /api/v1/admin/report/pdf` | aggregate + PDF generation | admin; rate 10/min |

---

## E. Status Pengisian

- [ ] Landing publik (hero, data kemiskinan, program) — nunggu mockup
- [ ] Admin Dashboard (KPI, Ring Map, aktivitas) — nunggu mockup
- [ ] Admin Mustahik (GIS Map, tambah, detail) — nunggu mockup
- [ ] Admin Bank Infaq (kelompok, level, NPF) — nunggu mockup
- [ ] Admin Kajian (kurikulum, donut, jadwal) — nunggu mockup
- [ ] Admin BUMM (produk, GMV, komisi) — nunggu mockup
- [ ] Admin Laporan (ZISWAF, infaq, PDF) — nunggu mockup
- [ ] Admin Settings (profil masjid, legalitas, user) — nunggu mockup
- [ ] Portal Pemuda (dashboard, affiliate, leaderboard) — nunggu mockup
- [ ] Publik Portofolio CSR — nunggu mockup
- [ ] Donasi (form, Midtrans, webhook) — nunggu mockup
- [ ] Kalkulator Zakat — nunggu mockup

> Semua mapping di atas akan divalidasi ulang SETELAH mockup Gemini masuk dan layout final disetujui.
> Perubahan layout → update baris alignment di atas.
>
> *RENCANA_DATA v1 — 29 Jun 2026*
