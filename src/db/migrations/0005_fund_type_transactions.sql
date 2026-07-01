-- Migration 0005: Tambah fund_type & akad_type ke tabel transactions
-- Klasifikasi jenis dana sesuai fiqih muamalah untuk pemisahan syar'i

BEGIN;

-- 1. Buat enum baru
DO $$ BEGIN
  CREATE TYPE "fund_type" AS ENUM (
    'zakat_fitrah', 'zakat_maal',
    'infaq_terikat', 'infaq_tidak_terikat',
    'wakaf_pokok', 'wakaf_hasil',
    'qardhul_hasan',
    'non_halal'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "akad_type" AS ENUM (
    'tamlik', 'tabarru', 'wakaf', 'qardh'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 2. Tambah kolom ke tabel transactions
ALTER TABLE "transactions"
  ADD COLUMN IF NOT EXISTS "fund_type" "fund_type" NOT NULL DEFAULT 'infaq_tidak_terikat',
  ADD COLUMN IF NOT EXISTS "akad_type" "akad_type",
  ADD COLUMN IF NOT EXISTS "asnaf_type" text,
  ADD COLUMN IF NOT EXISTS "is_restricted" boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS "wakif_name" text,
  ADD COLUMN IF NOT EXISTS "ikrar_wakaf_ref" text;

-- 3. Index untuk query per fund_type
CREATE INDEX IF NOT EXISTS "transactions_fund_type_idx" ON "transactions" ("mosque_id", "fund_type");

-- 4. Update existing rows: set fund_type based on category
UPDATE "transactions" SET "fund_type" = 'zakat_fitrah' WHERE "category" ILIKE '%zakat fitrah%' AND "fund_type" = 'infaq_tidak_terikat';
UPDATE "transactions" SET "fund_type" = 'zakat_maal' WHERE "category" ILIKE '%zakat%' AND "fund_type" = 'infaq_tidak_terikat';
UPDATE "transactions" SET "fund_type" = 'infaq_terikat' WHERE ("category" ILIKE '%infaq%program%' OR "category" ILIKE '%infaq%anak asuh%') AND "fund_type" = 'infaq_tidak_terikat';
UPDATE "transactions" SET "fund_type" = 'wakaf_pokok' WHERE "category" ILIKE '%wakaf%' AND "fund_type" = 'infaq_tidak_terikat';

-- 5. Set akad_type berdasarkan fund_type
UPDATE "transactions" SET "akad_type" = 'tamlik' WHERE "fund_type" IN ('zakat_fitrah', 'zakat_maal') AND "akad_type" IS NULL;
UPDATE "transactions" SET "akad_type" = 'tabarru' WHERE "fund_type" IN ('infaq_terikat', 'infaq_tidak_terikat', 'non_halal') AND "akad_type" IS NULL;
UPDATE "transactions" SET "akad_type" = 'wakaf' WHERE "fund_type" IN ('wakaf_pokok', 'wakaf_hasil') AND "akad_type" IS NULL;
UPDATE "transactions" SET "akad_type" = 'qardh' WHERE "fund_type" = 'qardhul_hasan' AND "akad_type" IS NULL;

-- 6. Constraint: zakat tidak boleh dicampur dengan non-zakat
ALTER TABLE "transactions"
  DROP CONSTRAINT IF EXISTS "transactions_zakat_akad_check",
  ADD CONSTRAINT "transactions_zakat_akad_check"
    CHECK (
      ("fund_type" NOT IN ('zakat_fitrah', 'zakat_maal')) OR
      ("fund_type" IN ('zakat_fitrah', 'zakat_maal') AND "akad_type" = 'tamlik')
    );

COMMIT;
