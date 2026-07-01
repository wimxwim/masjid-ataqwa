-- ============================================================
-- MIGRASI 0000: INITIAL — MASJID AT-TAQWA
-- Ekstensi + Enum + Semua Tabel + RLS + Audit Trigger
-- ============================================================

-- 1. EKSTENSI
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- 2. ENUM
CREATE TYPE role AS ENUM ('superadmin','admin_dkm','finance_director','dakwah_lead','social_lead','people_culture','media_pub','business_lead','affiliate_youth','mustahik');
CREATE TYPE department AS ENUM ('dakwah','social','people_culture','media','business','finance','secretary');
CREATE TYPE desil AS ENUM ('1','2','3','4');
CREATE TYPE loan_status AS ENUM ('active','completed','defaulted','restructured');
CREATE TYPE repayment_status AS ENUM ('lunas','kurang','ditanggung');
CREATE TYPE commission_status AS ENUM ('pending','approved','paid','cancelled');
CREATE TYPE donation_akad AS ENUM ('zakat_fitrah','zakat_mal','infaq','sedekah','wakaf','fidyah');
CREATE TYPE donation_payment AS ENUM ('qris','transfer','tunai','kitabisa');
CREATE TYPE donation_status AS ENUM ('pending','paid','failed','refunded');

-- 3. TABEL

-- 3a. FONDASI
CREATE TABLE mosques (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    address TEXT NOT NULL,
    lat DOUBLE PRECISION NOT NULL,
    lng DOUBLE PRECISION NOT NULL,
    city TEXT DEFAULT 'Jakarta Selatan',
    district TEXT DEFAULT 'Pesanggrahan',
    village TEXT DEFAULT 'Ulujami',
    npwp TEXT,
    akta_yayasan_url TEXT,
    upz_number TEXT,
    upz_legalized_date DATE,
    bank_account_name TEXT,
    bank_account_number TEXT,
    bank_name TEXT,
    is_active BOOLEAN DEFAULT true,
    is_legalized BOOLEAN DEFAULT false,
    total_mustahik_target INTEGER DEFAULT 100,
    config JSONB DEFAULT '{"prayer_adjustment":2,"kajian_start_hour":19,"zakat_fitrah_amount":45000,"infaq_weekly_default":50000}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE TABLE programs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mosque_id UUID NOT NULL REFERENCES mosques(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL DEFAULT 'sosial',
    is_active BOOLEAN DEFAULT false,
    is_featured BOOLEAN DEFAULT false,
    sort_order INTEGER DEFAULT 0,
    config JSONB DEFAULT '{"icon":"quran","color":"#10b981","target_beneficiaries":0,"target_budget":0}',
    start_date DATE,
    end_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    UNIQUE (mosque_id, slug)
);
CREATE INDEX idx_programs_mosque_active ON programs (mosque_id, is_active);

-- 3b. PENGGUNA
CREATE TABLE profiles (
    id UUID PRIMARY KEY,
    name TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    avatar_url TEXT,
    is_verified BOOLEAN DEFAULT false,
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE memberships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mosque_id UUID NOT NULL REFERENCES mosques(id) ON DELETE CASCADE,
    profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    role role NOT NULL DEFAULT 'mustahik',
    department department,
    youth_dakwah_ring INTEGER,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (mosque_id, profile_id)
);
CREATE INDEX idx_memberships_mosque ON memberships (mosque_id);
CREATE INDEX idx_memberships_profile ON memberships (profile_id);

-- 3c. MUSTAHIK
CREATE TABLE mustahiks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mosque_id UUID NOT NULL REFERENCES mosques(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    phone TEXT,
    nik_encrypted TEXT,
    nik_hash TEXT UNIQUE,
    address TEXT NOT NULL,
    lat DOUBLE PRECISION,
    lng DOUBLE PRECISION,
    desil_level desil,
    ring_number INTEGER,
    monthly_income BIGINT,
    dependents INTEGER DEFAULT 0,
    usaha_type TEXT,
    health_insurance_id TEXT,
    is_active BOOLEAN DEFAULT true,
    notes TEXT,
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);
CREATE INDEX idx_mustahiks_mosque ON mustahiks (mosque_id);
CREATE INDEX idx_mustahiks_ring ON mustahiks (mosque_id, ring_number);
CREATE INDEX idx_mustahiks_coordinate ON mustahiks (lat, lng);

-- 3d. KAMPUNG QURAN
CREATE TABLE santri (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mosque_id UUID NOT NULL REFERENCES mosques(id) ON DELETE CASCADE,
    program_id UUID REFERENCES programs(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    phone TEXT,
    age INTEGER,
    parent_name TEXT,
    parent_phone TEXT,
    address TEXT,
    level TEXT DEFAULT 'tahsin',
    class_group TEXT,
    join_date DATE,
    is_active BOOLEAN DEFAULT true,
    juz_terakhir INTEGER DEFAULT 0,
    surat_terakhir TEXT,
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);
CREATE INDEX idx_santri_mosque ON santri (mosque_id);
CREATE INDEX idx_santri_program ON santri (program_id);

CREATE TABLE santri_attendance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    santri_id UUID NOT NULL REFERENCES santri(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    status TEXT NOT NULL DEFAULT 'hadir',
    notes TEXT,
    recorded_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (santri_id, date)
);

CREATE TABLE santri_hafalan (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    santri_id UUID NOT NULL REFERENCES santri(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    surah TEXT NOT NULL,
    ayat_start INTEGER,
    ayat_end INTEGER,
    juz INTEGER,
    status TEXT DEFAULT 'baru',
    notes TEXT,
    recorded_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_hafalan_santri ON santri_hafalan (santri_id);

-- 3e. BANK INFAQ
CREATE TABLE sahabat_infaq_groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mosque_id UUID NOT NULL REFERENCES mosques(id) ON DELETE CASCADE,
    program_id UUID REFERENCES programs(id) ON DELETE SET NULL,
    group_name TEXT NOT NULL,
    leader_id UUID REFERENCES profiles(id),
    member_count INTEGER,
    current_level INTEGER DEFAULT 1,
    total_pokok BIGINT DEFAULT 500000,
    weekly_payment BIGINT DEFAULT 50000,
    week_duration INTEGER DEFAULT 10,
    total_repaid BIGINT DEFAULT 0,
    status TEXT DEFAULT 'active',
    npf_flag BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);
CREATE INDEX idx_groups_mosque ON sahabat_infaq_groups (mosque_id);
CREATE INDEX idx_groups_program ON sahabat_infaq_groups (program_id);

CREATE TABLE loans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mosque_id UUID NOT NULL REFERENCES mosques(id) ON DELETE CASCADE,
    mustahik_id UUID NOT NULL REFERENCES mustahiks(id),
    group_id UUID REFERENCES sahabat_infaq_groups(id),
    program_id UUID REFERENCES programs(id) ON DELETE SET NULL,
    amount BIGINT NOT NULL,
    weekly_payment BIGINT NOT NULL,
    week_duration INTEGER DEFAULT 10,
    current_level INTEGER DEFAULT 1,
    status loan_status DEFAULT 'active',
    total_paid BIGINT DEFAULT 0,
    weeks_overdue INTEGER DEFAULT 0,
    approved_by UUID REFERENCES profiles(id),
    approved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);
CREATE INDEX idx_loans_mustahik ON loans (mustahik_id);
CREATE INDEX idx_loans_group ON loans (group_id);
CREATE INDEX idx_loans_status ON loans (status);
CREATE INDEX idx_loans_mosque ON loans (mosque_id);

CREATE TABLE repayments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    loan_id UUID NOT NULL REFERENCES loans(id) ON DELETE CASCADE,
    amount_paid BIGINT NOT NULL,
    week_number INTEGER NOT NULL,
    status repayment_status DEFAULT 'lunas',
    is_backstopped BOOLEAN DEFAULT false,
    backstopped_by UUID REFERENCES profiles(id),
    backstop_amount BIGINT DEFAULT 0,
    is_present_taklim BOOLEAN DEFAULT false,
    idempotency_key TEXT UNIQUE,
    paid_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_repayments_loan ON repayments (loan_id);

-- 3f. KAJIAN
CREATE TABLE kajian_silabus (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mosque_id UUID NOT NULL REFERENCES mosques(id) ON DELETE CASCADE,
    program_id UUID REFERENCES programs(id) ON DELETE SET NULL,
    category TEXT NOT NULL,
    kitab TEXT,
    weight_pct DOUBLE PRECISION,
    total_sessions INTEGER DEFAULT 0,
    month_year TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    UNIQUE (mosque_id, category, month_year)
);
CREATE INDEX idx_kajian_mosque ON kajian_silabus (mosque_id);

CREATE TABLE kajian_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    silabus_id UUID NOT NULL REFERENCES kajian_silabus(id) ON DELETE CASCADE,
    week_number INTEGER NOT NULL,
    topic TEXT,
    speaker TEXT,
    date DATE,
    is_completed BOOLEAN DEFAULT false,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_sessions_silabus ON kajian_sessions (silabus_id);

-- 3g. BUMM
CREATE TABLE bumm_products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mosque_id UUID NOT NULL REFERENCES mosques(id) ON DELETE CASCADE,
    program_id UUID REFERENCES programs(id) ON DELETE SET NULL,
    product_name TEXT NOT NULL,
    category TEXT,
    description TEXT,
    price BIGINT NOT NULL,
    commission_pct DOUBLE PRECISION DEFAULT 15,
    stock INTEGER DEFAULT 0,
    image_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);
CREATE INDEX idx_bumm_mosque ON bumm_products (mosque_id);

CREATE TABLE affiliate_sales (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES bumm_products(id),
    referrer_id UUID NOT NULL REFERENCES profiles(id),
    program_id UUID REFERENCES programs(id) ON DELETE SET NULL,
    quantity INTEGER NOT NULL,
    total_gmv BIGINT NOT NULL,
    earned_commission BIGINT NOT NULL,
    commission_status commission_status DEFAULT 'pending',
    paid_at TIMESTAMPTZ,
    idempotency_key TEXT UNIQUE,
    sold_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_affiliate_referrer ON affiliate_sales (referrer_id);
CREATE INDEX idx_affiliate_product ON affiliate_sales (product_id);

-- 3h. DONASI
CREATE TABLE donations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mosque_id UUID NOT NULL REFERENCES mosques(id) ON DELETE CASCADE,
    program_id UUID REFERENCES programs(id) ON DELETE SET NULL,
    donor_name TEXT,
    donor_phone TEXT,
    amount BIGINT NOT NULL,
    akad_type donation_akad NOT NULL,
    program_name TEXT,
    payment_method donation_payment,
    payment_status donation_status DEFAULT 'pending',
    midtrans_transaction_id TEXT,
    qris_order_id TEXT,
    idempotency_key TEXT UNIQUE,
    paid_at TIMESTAMPTZ,
    verified_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_donations_mosque ON donations (mosque_id);
CREATE INDEX idx_donations_status ON donations (payment_status);
CREATE INDEX idx_donations_program ON donations (program_id);

-- 3i. AUDIT
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mosque_id UUID NOT NULL REFERENCES mosques(id),
    actor_id UUID REFERENCES profiles(id),
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT,
    changes JSONB,
    ip_address TEXT,
    user_agent TEXT,
    metadata JSONB,
    occurred_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_audit_mosque ON audit_logs (mosque_id);
CREATE INDEX idx_audit_actor ON audit_logs (actor_id);
CREATE INDEX idx_audit_entity ON audit_logs (entity_type, entity_id);
CREATE INDEX idx_audit_occurred ON audit_logs (occurred_at);

-- 4. ROW LEVEL SECURITY

-- Helper: ambil mosque_id dari session
CREATE OR REPLACE FUNCTION current_mosque_id() RETURNS UUID AS $$
    SELECT NULLIF(current_setting('app.mosque_id', true), '')::UUID;
$$ LANGUAGE SQL STABLE;

-- Helper: cek role user
CREATE OR REPLACE FUNCTION current_user_role(m_id UUID) RETURNS role AS $$
    SELECT role FROM memberships WHERE profile_id = auth.uid() AND mosque_id = m_id AND is_active = true LIMIT 1;
$$ LANGUAGE SQL STABLE;

-- Helper: cek apakah user admin di masjid tertentu
CREATE OR REPLACE FUNCTION is_admin(m_id UUID) RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 FROM memberships
        WHERE profile_id = auth.uid() AND mosque_id = m_id
        AND role IN ('superadmin', 'admin_dkm') AND is_active = true
    );
$$ LANGUAGE SQL STABLE;

-- Helper: cek apakah user anggota masjid
CREATE OR REPLACE FUNCTION is_member(m_id UUID) RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 FROM memberships
        WHERE profile_id = auth.uid() AND mosque_id = m_id AND is_active = true
    );
$$ LANGUAGE SQL STABLE;

-- RLS: MOSQUES
ALTER TABLE mosques ENABLE ROW LEVEL SECURITY;
CREATE POLICY mosques_select_public ON mosques FOR SELECT USING (is_active = true);
CREATE POLICY mosques_write_admin ON mosques FOR INSERT WITH CHECK (is_admin(id));
CREATE POLICY mosques_update_admin ON mosques FOR UPDATE USING (is_admin(id));

-- RLS: PROGRAMS
ALTER TABLE programs ENABLE ROW LEVEL SECURITY;
CREATE POLICY programs_select_public ON programs FOR SELECT USING (is_active = true OR is_member(mosque_id));
CREATE POLICY programs_write_admin ON programs FOR INSERT WITH CHECK (is_admin(mosque_id));
CREATE POLICY programs_update_admin ON programs FOR UPDATE USING (is_admin(mosque_id));
CREATE POLICY programs_delete_admin ON programs FOR DELETE USING (is_admin(mosque_id));

-- RLS: PROFILES
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY profiles_select_self ON profiles FOR SELECT USING (id = auth.uid());
CREATE POLICY profiles_update_self ON profiles FOR UPDATE USING (id = auth.uid());

-- RLS: MEMBERSHIPS
ALTER TABLE memberships ENABLE ROW LEVEL SECURITY;
CREATE POLICY memberships_select_self ON memberships FOR SELECT USING (profile_id = auth.uid());
CREATE POLICY memberships_insert_self ON memberships FOR INSERT WITH CHECK (profile_id = auth.uid());
CREATE POLICY memberships_write_admin ON memberships FOR UPDATE USING (is_admin(mosque_id));

-- RLS: MUSTAHIKS
ALTER TABLE mustahiks ENABLE ROW LEVEL SECURITY;
CREATE POLICY mustahiks_select_self ON mustahiks FOR SELECT USING (created_by = auth.uid());
CREATE POLICY mustahiks_select_admin ON mustahiks FOR SELECT USING (is_admin(mosque_id));
CREATE POLICY mustahiks_insert_admin ON mustahiks FOR INSERT WITH CHECK (is_admin(mosque_id));
CREATE POLICY mustahiks_update_admin ON mustahiks FOR UPDATE USING (is_admin(mosque_id));
CREATE POLICY mustahiks_delete_admin ON mustahiks FOR DELETE USING (is_admin(mosque_id));

-- RLS: SANTRI
ALTER TABLE santri ENABLE ROW LEVEL SECURITY;
CREATE POLICY santri_select_admin ON santri FOR SELECT USING (is_admin(mosque_id));
CREATE POLICY santri_write_admin ON santri FOR INSERT WITH CHECK (is_admin(mosque_id));
CREATE POLICY santri_update_admin ON santri FOR UPDATE USING (is_admin(mosque_id));

-- RLS: SANTRI ATTENDANCE
ALTER TABLE santri_attendance ENABLE ROW LEVEL SECURITY;
CREATE POLICY attendance_select_admin ON santri_attendance FOR SELECT USING (
    EXISTS (SELECT 1 FROM santri s JOIN memberships m ON m.profile_id = auth.uid() AND m.is_active = true WHERE s.id = santri_id)
);
CREATE POLICY attendance_write_admin ON santri_attendance FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM santri s JOIN memberships m ON m.profile_id = auth.uid() AND m.is_active = true AND m.role IN ('superadmin','admin_dkm','dakwah_lead') WHERE s.id = santri_id)
);

-- RLS: SANTRI HAFALAN
ALTER TABLE santri_hafalan ENABLE ROW LEVEL SECURITY;
CREATE POLICY hafalan_select_admin ON santri_hafalan FOR SELECT USING (
    EXISTS (SELECT 1 FROM santri s JOIN memberships m ON m.profile_id = auth.uid() AND m.is_active = true WHERE s.id = santri_id)
);
CREATE POLICY hafalan_write_admin ON santri_hafalan FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM santri s JOIN memberships m ON m.profile_id = auth.uid() AND m.is_active = true AND m.role IN ('superadmin','admin_dkm','dakwah_lead') WHERE s.id = santri_id)
);

-- RLS: SAHABAT INFAQ
ALTER TABLE sahabat_infaq_groups ENABLE ROW LEVEL SECURITY;
CREATE POLICY groups_select_member ON sahabat_infaq_groups FOR SELECT USING (is_member(mosque_id));
CREATE POLICY groups_write_finance ON sahabat_infaq_groups FOR INSERT WITH CHECK (is_admin(mosque_id));
CREATE POLICY groups_update_finance ON sahabat_infaq_groups FOR UPDATE USING (is_admin(mosque_id));

-- RLS: LOANS
ALTER TABLE loans ENABLE ROW LEVEL SECURITY;
CREATE POLICY loans_select_member ON loans FOR SELECT USING (is_member(mosque_id));
CREATE POLICY loans_write_finance ON loans FOR INSERT WITH CHECK (is_admin(mosque_id));
CREATE POLICY loans_update_finance ON loans FOR UPDATE USING (is_admin(mosque_id));

-- RLS: REPAYMENTS
ALTER TABLE repayments ENABLE ROW LEVEL SECURITY;
CREATE POLICY repayments_select_member ON repayments FOR SELECT USING (
    EXISTS (SELECT 1 FROM loans l WHERE l.id = loan_id AND is_member(l.mosque_id))
);
CREATE POLICY repayments_write_finance ON repayments FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM loans l WHERE l.id = loan_id AND is_admin(l.mosque_id))
);

-- RLS: KAJIAN
ALTER TABLE kajian_silabus ENABLE ROW LEVEL SECURITY;
CREATE POLICY kajian_select_public ON kajian_silabus FOR SELECT USING (true);
CREATE POLICY kajian_write_admin ON kajian_silabus FOR INSERT WITH CHECK (is_admin(mosque_id));
CREATE POLICY kajian_update_admin ON kajian_silabus FOR UPDATE USING (is_admin(mosque_id));

ALTER TABLE kajian_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY sessions_select_public ON kajian_sessions FOR SELECT USING (true);
CREATE POLICY sessions_write_admin ON kajian_sessions FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM kajian_silabus s WHERE s.id = silabus_id AND is_admin(s.mosque_id))
);
CREATE POLICY sessions_update_admin ON kajian_sessions FOR UPDATE USING (
    EXISTS (SELECT 1 FROM kajian_silabus s WHERE s.id = silabus_id AND is_admin(s.mosque_id))
);

-- RLS: BUMM
ALTER TABLE bumm_products ENABLE ROW LEVEL SECURITY;
CREATE POLICY bumm_select_public ON bumm_products FOR SELECT USING (is_active = true);
CREATE POLICY bumm_write_admin ON bumm_products FOR INSERT WITH CHECK (is_admin(mosque_id));
CREATE POLICY bumm_update_admin ON bumm_products FOR UPDATE USING (is_admin(mosque_id));

ALTER TABLE affiliate_sales ENABLE ROW LEVEL SECURITY;
CREATE POLICY affiliate_select_own ON affiliate_sales FOR SELECT USING (referrer_id = auth.uid());
CREATE POLICY affiliate_select_admin ON affiliate_sales FOR SELECT USING (
    EXISTS (SELECT 1 FROM bumm_products p WHERE p.id = product_id AND is_admin(p.mosque_id))
);
CREATE POLICY affiliate_insert_own ON affiliate_sales FOR INSERT WITH CHECK (referrer_id = auth.uid());

-- RLS: DONATIONS
ALTER TABLE donations ENABLE ROW LEVEL SECURITY;
CREATE POLICY donations_select_admin ON donations FOR SELECT USING (is_admin(mosque_id));
CREATE POLICY donations_insert_public ON donations FOR INSERT WITH CHECK (true);
CREATE POLICY donations_update_admin ON donations FOR UPDATE USING (is_admin(mosque_id));

-- RLS: AUDIT LOGS (read-only untuk admin)
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY audit_select_admin ON audit_logs FOR SELECT USING (is_admin(mosque_id));
-- Audit log: INSERT only (via trigger di app, bukan RLS)

-- 5. AUDIT LOG — Penting: audit_logs tidak bisa di-update/di-delete
CREATE OR REPLACE FUNCTION protect_audit_logs()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'audit_logs is append-only. UPDATE/DELETE not allowed.';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_audit_protect
    BEFORE UPDATE OR DELETE ON audit_logs
    FOR EACH ROW EXECUTE FUNCTION protect_audit_logs();

-- 6. INDEX SPATIAL (PostGIS untuk fitur peta)
-- Gunakan GIST index jika kolom coordinate sudah GEOMETRY type
-- Untuk sekarang pakai lat/lng biasa dulu (double precision)
-- CREATE INDEX idx_mosques_coordinate ON mosques USING GIST (coordinate);
-- Nanti di-upgrade ke PostGIS penuh saat data peta sudah banyak

-- 7. UPDATED_AT TRIGGER (otomatis update timestamp)
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_mosques_updated_at BEFORE UPDATE ON mosques FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_programs_updated_at BEFORE UPDATE ON programs FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_mustahiks_updated_at BEFORE UPDATE ON mustahiks FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_santri_updated_at BEFORE UPDATE ON santri FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_groups_updated_at BEFORE UPDATE ON sahabat_infaq_groups FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_loans_updated_at BEFORE UPDATE ON loans FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_kajian_updated_at BEFORE UPDATE ON kajian_silabus FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_bumm_updated_at BEFORE UPDATE ON bumm_products FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- 8. VERIFIKASI
-- Jalankan setelah migrasi:
-- SELECT tablename FROM pg_tables WHERE schemaname='public';
-- SELECT * FROM pg_policies;
