-- Migration 0006: FIX RLS SECURITY 🔴
-- Semua policy yang sebelumnya pakai profiles.mosque_id (kolom TIDAK ADA)
-- diganti ke memberships.profile_id (relasi multi-tenant yang benar)
-- Juga coverage untuk tabel yang belum punya RLS

BEGIN;

-- ============================================================
-- 1. HAPUS SEMUA POLICY LAMA
--    (dari 0000_initial.sql — pakai is_admin()/is_member())
--    (dari 0004_rls_security.sql — pakai profiles.mosque_id)
-- ============================================================

-- === 1a. Policy dari 0000_initial.sql (old naming) ===
DROP POLICY IF EXISTS mosques_select_public ON mosques;
DROP POLICY IF EXISTS mosques_write_admin ON mosques;
DROP POLICY IF EXISTS mosques_update_admin ON mosques;

DROP POLICY IF EXISTS programs_select_public ON programs;
DROP POLICY IF EXISTS programs_write_admin ON programs;
DROP POLICY IF EXISTS programs_update_admin ON programs;
DROP POLICY IF EXISTS programs_delete_admin ON programs;

DROP POLICY IF EXISTS profiles_select_self ON profiles;
DROP POLICY IF EXISTS profiles_update_self ON profiles;

DROP POLICY IF EXISTS memberships_select_self ON memberships;
DROP POLICY IF EXISTS memberships_insert_self ON memberships;
DROP POLICY IF EXISTS memberships_write_admin ON memberships;

DROP POLICY IF EXISTS mustahiks_select_self ON mustahiks;
DROP POLICY IF EXISTS mustahiks_select_admin ON mustahiks;
DROP POLICY IF EXISTS mustahiks_insert_admin ON mustahiks;
DROP POLICY IF EXISTS mustahiks_update_admin ON mustahiks;
DROP POLICY IF EXISTS mustahiks_delete_admin ON mustahiks;

DROP POLICY IF EXISTS santri_select_admin ON santri;
DROP POLICY IF EXISTS santri_write_admin ON santri;
DROP POLICY IF EXISTS santri_update_admin ON santri;

DROP POLICY IF EXISTS attendance_select_admin ON santri_attendance;
DROP POLICY IF EXISTS attendance_write_admin ON santri_attendance;

DROP POLICY IF EXISTS hafalan_select_admin ON santri_hafalan;
DROP POLICY IF EXISTS hafalan_write_admin ON santri_hafalan;

DROP POLICY IF EXISTS groups_select_member ON sahabat_infaq_groups;
DROP POLICY IF EXISTS groups_write_finance ON sahabat_infaq_groups;
DROP POLICY IF EXISTS groups_update_finance ON sahabat_infaq_groups;

DROP POLICY IF EXISTS loans_select_member ON loans;
DROP POLICY IF EXISTS loans_write_finance ON loans;
DROP POLICY IF EXISTS loans_update_finance ON loans;

DROP POLICY IF EXISTS repayments_select_member ON repayments;
DROP POLICY IF EXISTS repayments_write_finance ON repayments;

DROP POLICY IF EXISTS kajian_select_public ON kajian_silabus;
DROP POLICY IF EXISTS kajian_write_admin ON kajian_silabus;
DROP POLICY IF EXISTS kajian_update_admin ON kajian_silabus;

DROP POLICY IF EXISTS sessions_select_public ON kajian_sessions;
DROP POLICY IF EXISTS sessions_write_admin ON kajian_sessions;
DROP POLICY IF EXISTS sessions_update_admin ON kajian_sessions;

DROP POLICY IF EXISTS bumm_select_public ON bumm_products;
DROP POLICY IF EXISTS bumm_write_admin ON bumm_products;
DROP POLICY IF EXISTS bumm_update_admin ON bumm_products;

DROP POLICY IF EXISTS affiliate_select_own ON affiliate_sales;
DROP POLICY IF EXISTS affiliate_select_admin ON affiliate_sales;
DROP POLICY IF EXISTS affiliate_insert_own ON affiliate_sales;

DROP POLICY IF EXISTS donations_select_admin ON donations;
DROP POLICY IF EXISTS donations_insert_public ON donations;
DROP POLICY IF EXISTS donations_update_admin ON donations;

DROP POLICY IF EXISTS audit_select_admin ON audit_logs;

-- === 1b. Policy dari 0004_rls_security.sql (broken — pakai profiles.mosque_id) ===

DROP POLICY IF EXISTS donations_insert_public ON donations;
DROP POLICY IF EXISTS donations_select_admin ON donations;
DROP POLICY IF EXISTS donations_update_admin ON donations;

DROP POLICY IF EXISTS transactions_select_admin ON transactions;
DROP POLICY IF EXISTS transactions_insert_admin ON transactions;
DROP POLICY IF EXISTS transactions_update_admin ON transactions;
DROP POLICY IF EXISTS transactions_delete_admin ON transactions;

DROP POLICY IF EXISTS mustahiks_select_admin ON mustahiks;
DROP POLICY IF EXISTS mustahiks_insert_admin ON mustahiks;
DROP POLICY IF EXISTS mustahiks_update_admin ON mustahiks;
DROP POLICY IF EXISTS mustahiks_delete_admin ON mustahiks;

DROP POLICY IF EXISTS mushafir_aid_select_admin ON mushafir_aid;
DROP POLICY IF EXISTS mushafir_aid_insert_admin ON mushafir_aid;
DROP POLICY IF EXISTS mushafir_aid_update_admin ON mushafir_aid;

DROP POLICY IF EXISTS audit_logs_select_admin ON audit_logs;

DROP POLICY IF EXISTS activity_feed_select_public ON activity_feed;
DROP POLICY IF EXISTS activity_feed_insert_admin ON activity_feed;
DROP POLICY IF EXISTS activity_feed_update_admin ON activity_feed;
DROP POLICY IF EXISTS activity_feed_delete_admin ON activity_feed;

DROP POLICY IF EXISTS santri_select_admin ON santri;
DROP POLICY IF EXISTS santri_insert_admin ON santri;
DROP POLICY IF EXISTS santri_update_admin ON santri;
DROP POLICY IF EXISTS santri_delete_admin ON santri;

DROP POLICY IF EXISTS employees_select_admin ON employees;
DROP POLICY IF EXISTS employees_insert_admin ON employees;
DROP POLICY IF EXISTS employees_update_admin ON employees;

DROP POLICY IF EXISTS programs_select_public ON programs;
DROP POLICY IF EXISTS programs_insert_admin ON programs;
DROP POLICY IF EXISTS programs_update_admin ON programs;

DROP POLICY IF EXISTS ziswaf_requests_select_admin ON ziswaf_requests;
DROP POLICY IF EXISTS ziswaf_requests_insert_admin ON ziswaf_requests;

DROP POLICY IF EXISTS loan_installments_select_admin ON loan_installments;

DROP POLICY IF EXISTS loans_select_admin ON loans;
DROP POLICY IF EXISTS loans_insert_admin ON loans;

-- ============================================================
-- 2. FUNGSI BANTU — cek apakah user adalah anggota aktif masjid
-- ============================================================

CREATE OR REPLACE FUNCTION public.is_member_of(mosque_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.memberships
    WHERE profile_id = auth.uid()
      AND mosque_id = is_member_of.mosque_id
      AND is_active = true
  );
$$;

-- ============================================================
-- 3. REKREASI POLICY — pakai memberships
-- ============================================================

-- 3a. donations — public bisa insert, admin bisa select/update
ALTER TABLE donations ENABLE ROW LEVEL SECURITY;

CREATE POLICY donations_insert_public ON donations
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY donations_select_admin ON donations
  FOR SELECT
  USING (public.is_member_of(mosque_id));

CREATE POLICY donations_update_admin ON donations
  FOR UPDATE
  USING (public.is_member_of(mosque_id));

-- 3b. transactions — admin only
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY transactions_select_admin ON transactions
  FOR SELECT
  USING (public.is_member_of(mosque_id));

CREATE POLICY transactions_insert_admin ON transactions
  FOR INSERT
  WITH CHECK (public.is_member_of(mosque_id));

CREATE POLICY transactions_update_admin ON transactions
  FOR UPDATE
  USING (public.is_member_of(mosque_id));

CREATE POLICY transactions_delete_admin ON transactions
  FOR DELETE
  USING (public.is_member_of(mosque_id));

-- 3c. mustahiks — admin only
ALTER TABLE mustahiks ENABLE ROW LEVEL SECURITY;

CREATE POLICY mustahiks_select_admin ON mustahiks
  FOR SELECT
  USING (public.is_member_of(mosque_id));

CREATE POLICY mustahiks_insert_admin ON mustahiks
  FOR INSERT
  WITH CHECK (public.is_member_of(mosque_id));

CREATE POLICY mustahiks_update_admin ON mustahiks
  FOR UPDATE
  USING (public.is_member_of(mosque_id));

CREATE POLICY mustahiks_delete_admin ON mustahiks
  FOR DELETE
  USING (public.is_member_of(mosque_id));

-- 3d. mushafir_aid — admin only
ALTER TABLE mushafir_aid ENABLE ROW LEVEL SECURITY;

CREATE POLICY mushafir_aid_select_admin ON mushafir_aid
  FOR SELECT
  USING (public.is_member_of(mosque_id));

CREATE POLICY mushafir_aid_insert_admin ON mushafir_aid
  FOR INSERT
  WITH CHECK (public.is_member_of(mosque_id));

CREATE POLICY mushafir_aid_update_admin ON mushafir_aid
  FOR UPDATE
  USING (public.is_member_of(mosque_id));

-- 3e. audit_logs — admin only (read-only)
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY audit_logs_select_admin ON audit_logs
  FOR SELECT
  USING (public.is_member_of(mosque_id));

-- 3f. activity_feed — public select, admin insert/update/delete
ALTER TABLE activity_feed ENABLE ROW LEVEL SECURITY;

CREATE POLICY activity_feed_select_public ON activity_feed
  FOR SELECT
  USING (true);

CREATE POLICY activity_feed_insert_admin ON activity_feed
  FOR INSERT
  WITH CHECK (public.is_member_of(mosque_id));

CREATE POLICY activity_feed_update_admin ON activity_feed
  FOR UPDATE
  USING (public.is_member_of(mosque_id));

CREATE POLICY activity_feed_delete_admin ON activity_feed
  FOR DELETE
  USING (public.is_member_of(mosque_id));

-- 3g. santri — admin only
ALTER TABLE santri ENABLE ROW LEVEL SECURITY;

CREATE POLICY santri_select_admin ON santri
  FOR SELECT
  USING (public.is_member_of(mosque_id));

CREATE POLICY santri_insert_admin ON santri
  FOR INSERT
  WITH CHECK (public.is_member_of(mosque_id));

CREATE POLICY santri_update_admin ON santri
  FOR UPDATE
  USING (public.is_member_of(mosque_id));

CREATE POLICY santri_delete_admin ON santri
  FOR DELETE
  USING (public.is_member_of(mosque_id));

-- 3h. employees — admin only
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;

CREATE POLICY employees_select_admin ON employees
  FOR SELECT
  USING (public.is_member_of(mosque_id));

CREATE POLICY employees_insert_admin ON employees
  FOR INSERT
  WITH CHECK (public.is_member_of(mosque_id));

CREATE POLICY employees_update_admin ON employees
  FOR UPDATE
  USING (public.is_member_of(mosque_id));

-- 3i. programs — public select, admin insert/update
ALTER TABLE programs ENABLE ROW LEVEL SECURITY;

CREATE POLICY programs_select_public ON programs
  FOR SELECT
  USING (true);

CREATE POLICY programs_insert_admin ON programs
  FOR INSERT
  WITH CHECK (public.is_member_of(mosque_id));

CREATE POLICY programs_update_admin ON programs
  FOR UPDATE
  USING (public.is_member_of(mosque_id));

CREATE POLICY programs_delete_admin ON programs
  FOR DELETE
  USING (public.is_member_of(mosque_id));

-- 3j. loans — admin only
ALTER TABLE loans ENABLE ROW LEVEL SECURITY;

CREATE POLICY loans_select_admin ON loans
  FOR SELECT
  USING (public.is_member_of(mosque_id));

CREATE POLICY loans_insert_admin ON loans
  FOR INSERT
  WITH CHECK (public.is_member_of(mosque_id));

CREATE POLICY loans_update_admin ON loans
  FOR UPDATE
  USING (public.is_member_of(mosque_id));

CREATE POLICY loans_delete_admin ON loans
  FOR DELETE
  USING (public.is_member_of(mosque_id));

-- 3k. repayments — admin via loan.mosque_id
ALTER TABLE repayments ENABLE ROW LEVEL SECURITY;

CREATE POLICY repayments_select_admin ON repayments
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM loans
      WHERE loans.id = repayments.loan_id
        AND public.is_member_of(loans.mosque_id)
    )
  );

CREATE POLICY repayments_insert_admin ON repayments
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM loans
      WHERE loans.id = repayments.loan_id
        AND public.is_member_of(loans.mosque_id)
    )
  );

-- 3l. ziswaf_requests — admin only
ALTER TABLE ziswaf_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY ziswaf_requests_select_admin ON ziswaf_requests
  FOR SELECT
  USING (public.is_member_of(mosque_id));

CREATE POLICY ziswaf_requests_insert_admin ON ziswaf_requests
  FOR INSERT
  WITH CHECK (public.is_member_of(mosque_id));

-- 3m. loan_installments — admin via loan.mosque_id
ALTER TABLE loan_installments ENABLE ROW LEVEL SECURITY;

CREATE POLICY loan_installments_select_admin ON loan_installments
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM loans
      WHERE loans.id = loan_installments.loan_id
        AND public.is_member_of(loans.mosque_id)
    )
  );

-- ============================================================
-- 4. TAMBAH RLS UNTUK TABEL YANG BELUM PUNYA
-- (tabel yang ada di schema.ts tapi belum di-cover 0004)
-- ============================================================

-- 4a. donatur_tetap
ALTER TABLE donatur_tetap ENABLE ROW LEVEL SECURITY;

CREATE POLICY donatur_tetap_select_admin ON donatur_tetap
  FOR SELECT
  USING (public.is_member_of(mosque_id));

CREATE POLICY donatur_tetap_insert_admin ON donatur_tetap
  FOR INSERT
  WITH CHECK (public.is_member_of(mosque_id));

CREATE POLICY donatur_tetap_update_admin ON donatur_tetap
  FOR UPDATE
  USING (public.is_member_of(mosque_id));

CREATE POLICY donatur_tetap_delete_admin ON donatur_tetap
  FOR DELETE
  USING (public.is_member_of(mosque_id));

-- 4b. testimonials — public select, admin insert/update/delete
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;

CREATE POLICY testimonials_select_public ON testimonials
  FOR SELECT
  USING (true);

CREATE POLICY testimonials_insert_admin ON testimonials
  FOR INSERT
  WITH CHECK (public.is_member_of(mosque_id));

CREATE POLICY testimonials_update_admin ON testimonials
  FOR UPDATE
  USING (public.is_member_of(mosque_id));

CREATE POLICY testimonials_delete_admin ON testimonials
  FOR DELETE
  USING (public.is_member_of(mosque_id));

-- 4c. inventaris
ALTER TABLE inventaris ENABLE ROW LEVEL SECURITY;

CREATE POLICY inventaris_select_admin ON inventaris
  FOR SELECT
  USING (public.is_member_of(mosque_id));

CREATE POLICY inventaris_insert_admin ON inventaris
  FOR INSERT
  WITH CHECK (public.is_member_of(mosque_id));

CREATE POLICY inventaris_update_admin ON inventaris
  FOR UPDATE
  USING (public.is_member_of(mosque_id));

-- 4d. jamaah — public select (direktori), admin insert/update/delete
ALTER TABLE jamaah ENABLE ROW LEVEL SECURITY;

CREATE POLICY jamaah_select_public ON jamaah
  FOR SELECT
  USING (true);

CREATE POLICY jamaah_insert_admin ON jamaah
  FOR INSERT
  WITH CHECK (public.is_member_of(mosque_id));

CREATE POLICY jamaah_update_admin ON jamaah
  FOR UPDATE
  USING (public.is_member_of(mosque_id));

CREATE POLICY jamaah_delete_admin ON jamaah
  FOR DELETE
  USING (public.is_member_of(mosque_id));

-- 4e. jadwal_imam — public select, admin insert/update/delete
ALTER TABLE jadwal_imam ENABLE ROW LEVEL SECURITY;

CREATE POLICY jadwal_imam_select_public ON jadwal_imam
  FOR SELECT
  USING (true);

CREATE POLICY jadwal_imam_insert_admin ON jadwal_imam
  FOR INSERT
  WITH CHECK (public.is_member_of(mosque_id));

CREATE POLICY jadwal_imam_update_admin ON jadwal_imam
  FOR UPDATE
  USING (public.is_member_of(mosque_id));

-- 4f. bumm_products
ALTER TABLE bumm_products ENABLE ROW LEVEL SECURITY;

CREATE POLICY bumm_products_select_admin ON bumm_products
  FOR SELECT
  USING (public.is_member_of(mosque_id));

CREATE POLICY bumm_products_insert_admin ON bumm_products
  FOR INSERT
  WITH CHECK (public.is_member_of(mosque_id));

CREATE POLICY bumm_products_update_admin ON bumm_products
  FOR UPDATE
  USING (public.is_member_of(mosque_id));

-- 4g. affiliate_sales
ALTER TABLE affiliate_sales ENABLE ROW LEVEL SECURITY;

CREATE POLICY affiliate_sales_select_admin ON affiliate_sales
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM bumm_products
      WHERE bumm_products.id = affiliate_sales.product_id
        AND public.is_member_of(bumm_products.mosque_id)
    )
  );

CREATE POLICY affiliate_sales_insert_admin ON affiliate_sales
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM bumm_products
      WHERE bumm_products.id = affiliate_sales.product_id
        AND public.is_member_of(bumm_products.mosque_id)
    )
  );

-- 4h. sahabat_infaq_groups
ALTER TABLE sahabat_infaq_groups ENABLE ROW LEVEL SECURITY;

CREATE POLICY sahabat_infaq_groups_select_admin ON sahabat_infaq_groups
  FOR SELECT
  USING (public.is_member_of(mosque_id));

CREATE POLICY sahabat_infaq_groups_insert_admin ON sahabat_infaq_groups
  FOR INSERT
  WITH CHECK (public.is_member_of(mosque_id));

CREATE POLICY sahabat_infaq_groups_update_admin ON sahabat_infaq_groups
  FOR UPDATE
  USING (public.is_member_of(mosque_id));

-- 4i. kajian_silabus
ALTER TABLE kajian_silabus ENABLE ROW LEVEL SECURITY;

CREATE POLICY kajian_silabus_select_public ON kajian_silabus
  FOR SELECT
  USING (true);

CREATE POLICY kajian_silabus_insert_admin ON kajian_silabus
  FOR INSERT
  WITH CHECK (public.is_member_of(mosque_id));

CREATE POLICY kajian_silabus_update_admin ON kajian_silabus
  FOR UPDATE
  USING (public.is_member_of(mosque_id));

-- 4j. kajian_sessions — public select
ALTER TABLE kajian_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY kajian_sessions_select_public ON kajian_sessions
  FOR SELECT
  USING (true);

CREATE POLICY kajian_sessions_insert_admin ON kajian_sessions
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM kajian_silabus
      WHERE kajian_silabus.id = kajian_sessions.silabus_id
        AND public.is_member_of(kajian_silabus.mosque_id)
    )
  );

-- 4k. santri_attendance
ALTER TABLE santri_attendance ENABLE ROW LEVEL SECURITY;

CREATE POLICY santri_attendance_select_admin ON santri_attendance
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM santri
      WHERE santri.id = santri_attendance.santri_id
        AND public.is_member_of(santri.mosque_id)
    )
  );

CREATE POLICY santri_attendance_insert_admin ON santri_attendance
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM santri
      WHERE santri.id = santri_attendance.santri_id
        AND public.is_member_of(santri.mosque_id)
    )
  );

-- 4l. santri_hafalan
ALTER TABLE santri_hafalan ENABLE ROW LEVEL SECURITY;

CREATE POLICY santri_hafalan_select_admin ON santri_hafalan
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM santri
      WHERE santri.id = santri_hafalan.santri_id
        AND public.is_member_of(santri.mosque_id)
    )
  );

CREATE POLICY santri_hafalan_insert_admin ON santri_hafalan
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM santri
      WHERE santri.id = santri_hafalan.santri_id
        AND public.is_member_of(santri.mosque_id)
    )
  );

COMMIT;
