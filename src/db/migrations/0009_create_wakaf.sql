-- Migration 0009: Wakaf Assets (AAOIFI SS-60, PSAK-112)
-- Standar: AAOIFI SS-60 (Waqf, supersedes SS-34), PSAK 112 (Wakaf Indonesia)
-- Wakaf = aset yang diabadikan untuk kepentingan umum, tidak boleh dijual/diwariskan

BEGIN;

-- ============================================================
-- 1. WAKAF ASSETS
-- ============================================================

CREATE TABLE IF NOT EXISTS "wakaf_assets" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "mosque_id" uuid NOT NULL REFERENCES "mosques"("id") ON DELETE CASCADE,
  "program_id" uuid REFERENCES "programs"("id") ON DELETE SET NULL,

  -- Asset identity
  "asset_name" text NOT NULL,
  "asset_type" text NOT NULL,           -- tanah, bangunan, uang_tunai, kendaraan, kitab, dsb
  "description" text,
  "certificate_number" text,            -- nomor sertifikat wakaf / AIW (Akta Ikrar Wakaf)
  "certificate_date" date,              -- tanggal AIW
  "land_area" double precision,         -- luas tanah (m²) — khusus tanah/bangunan
  "location" text,
  "lat" double precision,
  "lng" double precision,

  -- Nazhir (pengelola wakaf — AAOIFI SS-60 §5)
  "nazhir_name" text,                   -- nama nazhir (perorangan/lembaga)
  "nazhir_type" text DEFAULT 'perorangan', -- perorangan, organisasi, badan_hukum
  "nazhir_phone" text,
  "nazhir_address" text,

  -- Wakif (pemberi wakaf)
  "wakif_name" text,
  "wakif_phone" text,
  "wakif_type" text DEFAULT 'perseorangan', -- perseorangan, perusahaan, lembaga

  -- Manfaat wakaf
  "beneficiary_type" text DEFAULT 'umum',  -- umum, khusus (wakaf ahli)
  "beneficiary_description" text,

  -- Nilai wakaf
  "acquisition_value" bigint DEFAULT 0,     -- nilai perolehan
  "current_value" bigint DEFAULT 0,         -- nilai terkini (revaluasi berkala)
  "last_valuation_date" date,

  -- Status
  "status" text DEFAULT 'aktif',            -- aktif, dikelola, dialihkan, rusak
  "is_productive" boolean DEFAULT false,    -- wakaf produktif (menghasilkan)
  "revenue_generated" bigint DEFAULT 0,     -- total hasil yang sudah dihasilkan
  "notes" text,
  "is_active" boolean DEFAULT true,

  "created_by" uuid REFERENCES "profiles"("id"),
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "deleted_at" timestamp with time zone
);

CREATE INDEX IF NOT EXISTS "wakaf_mosque_idx" ON "wakaf_assets" ("mosque_id");
CREATE INDEX IF NOT EXISTS "wakaf_type_idx" ON "wakaf_assets" ("mosque_id", "asset_type");
CREATE INDEX IF NOT EXISTS "wakaf_productive_idx" ON "wakaf_assets" ("mosque_id", "is_productive");
CREATE INDEX IF NOT EXISTS "wakaf_status_idx" ON "wakaf_assets" ("mosque_id", "status");

-- ============================================================
-- 2. RLS
-- ============================================================

ALTER TABLE "wakaf_assets" ENABLE ROW LEVEL SECURITY;

CREATE POLICY wakaf_assets_select_public ON wakaf_assets
  FOR SELECT
  USING (true);

CREATE POLICY wakaf_assets_insert_admin ON wakaf_assets
  FOR INSERT
  WITH CHECK (public.is_member_of(mosque_id));

CREATE POLICY wakaf_assets_update_admin ON wakaf_assets
  FOR UPDATE
  USING (public.is_member_of(mosque_id));

COMMIT;
