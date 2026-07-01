-- Migration 0010: Loans NPF Tracking + Purpose
-- Standar: AAOIFI SS-35 (Qardhul Hasan), MRBJ NPF 0.2% model
-- Kolektibilitas = tingkat kelancaran pembayaran (1-5 standar OJK/PBI)
-- NPF (Non Performing Financing) = pembiayaan bermasalah

BEGIN;

-- ============================================================
-- 1. KOLEKTIBILITAS ENUM
-- ============================================================

DO $$ BEGIN
  CREATE TYPE "kolektibilitas" AS ENUM (
    '1_lancar',           -- ≤ 1 minggu tunggakan
    '2_dpk',              -- Dalam Perhatian Khusus: 1-2 minggu
    '3_kurang_lancar',    -- 2-4 minggu tunggakan
    '4_diragukan',        -- 4-8 minggu
    '5_macet'             -- > 8 minggu
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ============================================================
-- 2. TAMBAH KOLOM KE TABEL loans
-- ============================================================

-- purpose — tujuan pinjaman (AAOIFI SS-35 Qardhul Hasan)
ALTER TABLE "loans"
  ADD COLUMN IF NOT EXISTS "purpose" text;

-- kolektibilitas — NPF tracking level
ALTER TABLE "loans"
  ADD COLUMN IF NOT EXISTS "kolektibilitas" "kolektibilitas" DEFAULT '1_lancar';

-- restructured — apakah sudah direstrukturisasi
ALTER TABLE "loans"
  ADD COLUMN IF NOT EXISTS "restructured" boolean DEFAULT false;

-- restructured_at — tanggal restrukturisasi
ALTER TABLE "loans"
  ADD COLUMN IF NOT EXISTS "restructured_at" timestamp with time zone;

-- last_assessment_at — tanggal assessment kolektibilitas terakhir
ALTER TABLE "loans"
  ADD COLUMN IF NOT EXISTS "last_assessment_at" timestamp with time zone;

-- npf_stage — stage NPF untuk pelaporan (AAOIFI)
ALTER TABLE "loans"
  ADD COLUMN IF NOT EXISTS "npf_stage" text;

-- guarantee_description — deskripsi jaminan (jika ada, walau qardh idealnya tanpa jaminan)
ALTER TABLE "loans"
  ADD COLUMN IF NOT EXISTS "guarantee_description" text;

-- ============================================================
-- 3. INDEX
-- ============================================================

CREATE INDEX IF NOT EXISTS "loans_kolektibilitas_idx"
  ON "loans" ("mosque_id", "kolektibilitas");

CREATE INDEX IF NOT EXISTS "loans_purpose_idx"
  ON "loans" ("mosque_id", "purpose");

CREATE INDEX IF NOT EXISTS "loans_npf_stage_idx"
  ON "loans" ("mosque_id", "npf_stage");

-- ============================================================
-- 4. RESTRUCTURE LOG — tabel riwayat restrukturisasi
-- ============================================================

CREATE TABLE IF NOT EXISTS "loan_restructures" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "loan_id" uuid NOT NULL REFERENCES "loans"("id") ON DELETE CASCADE,

  "old_amount" bigint NOT NULL,
  "new_amount" bigint NOT NULL,
  "old_weekly_payment" bigint NOT NULL,
  "new_weekly_payment" bigint NOT NULL,
  "old_week_duration" integer NOT NULL,
  "new_week_duration" integer NOT NULL,
  "reason" text,
  "approved_by" uuid REFERENCES "profiles"("id"),
  "restructured_at" timestamp with time zone DEFAULT now() NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "loan_restructures_loan_idx" ON "loan_restructures" ("loan_id");

-- ============================================================
-- 5. RLS
-- ============================================================

ALTER TABLE "loan_restructures" ENABLE ROW LEVEL SECURITY;

CREATE POLICY loan_restructures_select_admin ON loan_restructures
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM loans
      WHERE loans.id = loan_restructures.loan_id
        AND public.is_member_of(loans.mosque_id)
    )
  );

CREATE POLICY loan_restructures_insert_admin ON loan_restructures
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM loans
      WHERE loans.id = loan_restructures.loan_id
        AND public.is_member_of(loans.mosque_id)
    )
  );

COMMIT;
