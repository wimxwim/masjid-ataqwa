-- Migration 0008: Muzzaki & Zakat Payments
-- Standar: AAOIFI SS-35 (Zakat), BAZNAS Peraturan BAZNAS No. 1/2023
-- Muzzaki = pembayar zakat (berbeda dari donatur — wajib vs sukarela)

BEGIN;

-- ============================================================
-- 1. MUZZAKI
-- ============================================================

CREATE TABLE IF NOT EXISTS "muzzaki" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "mosque_id" uuid NOT NULL REFERENCES "mosques"("id") ON DELETE CASCADE,

  -- Data pribadi
  "name" text NOT NULL,
  "phone" text,
  "nik_encrypted" text,
  "nik_hash" text,
  "address" text,

  -- Klasifikasi kepatuhan zakat (AAOIFI SS-35)
  "muzzaki_type" text DEFAULT 'perseorangan',  -- perseorangan, perusahaan, lembaga
  "is_regular" boolean DEFAULT false,           -- rutin bayar tiap tahun

  -- Harta wajib zakat (self-reported)
  "last_asset_value" bigint DEFAULT 0,
  "last_zakat_amount" bigint DEFAULT 0,
  "last_zakat_year" integer,

  "notes" text,
  "is_active" boolean DEFAULT true,

  "created_by" uuid REFERENCES "profiles"("id"),
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "deleted_at" timestamp with time zone
);

CREATE INDEX IF NOT EXISTS "muzzaki_mosque_idx" ON "muzzaki" ("mosque_id");
CREATE UNIQUE INDEX IF NOT EXISTS "muzzaki_nik_hash_idx" ON "muzzaki" ("nik_hash") WHERE nik_hash IS NOT NULL;

-- ============================================================
-- 2. ZAKAT PAYMENTS (riwayat pembayaran zakat)
-- ============================================================

CREATE TABLE IF NOT EXISTS "zakat_payments" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "mosque_id" uuid NOT NULL REFERENCES "mosques"("id") ON DELETE CASCADE,
  "muzzaki_id" uuid REFERENCES "muzzaki"("id") ON DELETE CASCADE,

  -- Jenis zakat
  "zakat_type" text NOT NULL,       -- fitrah, maal, profesi, pertanian, perniagaan, emas, dsb
  "amount" bigint NOT NULL,

  -- Peruntukan
  "asnaf_id" uuid REFERENCES "asnaf"("id"),
  "distribution_note" text,          -- catatan distribusi ke asnaf tertentu

  -- Pembayaran
  "payment_method" text,             -- qris, transfer, tunai
  "payment_status" text DEFAULT 'paid',
  "paid_at" timestamp with time zone DEFAULT now(),
  "zakat_year" integer NOT NULL,      -- tahun hijriah zakat
  "is_verified" boolean DEFAULT false,
  "verified_by" uuid REFERENCES "profiles"("id"),

  -- Sync ke transactions
  "transaction_id" uuid REFERENCES "transactions"("id") ON DELETE SET NULL,

  "notes" text,
  "idempotency_key" text UNIQUE,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "zakat_payments_mosque_idx" ON "zakat_payments" ("mosque_id");
CREATE INDEX IF NOT EXISTS "zakat_payments_muzzaki_idx" ON "zakat_payments" ("muzzaki_id");
CREATE INDEX IF NOT EXISTS "zakat_payments_year_idx" ON "zakat_payments" ("mosque_id", "zakat_year");
CREATE INDEX IF NOT EXISTS "zakat_payments_asnaf_idx" ON "zakat_payments" ("asnaf_id");

-- ============================================================
-- 3. CONSTRAINT: zakat fitrah harus amount sesuai konfigurasi masjid
-- (soft constraint — warning level)
-- ============================================================

-- ============================================================
-- 4. RLS
-- ============================================================

ALTER TABLE "muzzaki" ENABLE ROW LEVEL SECURITY;

CREATE POLICY muzzaki_select_admin ON muzzaki
  FOR SELECT
  USING (public.is_member_of(mosque_id));

CREATE POLICY muzzaki_insert_admin ON muzzaki
  FOR INSERT
  WITH CHECK (public.is_member_of(mosque_id));

CREATE POLICY muzzaki_update_admin ON muzzaki
  FOR UPDATE
  USING (public.is_member_of(mosque_id));

ALTER TABLE "zakat_payments" ENABLE ROW LEVEL SECURITY;

CREATE POLICY zakat_payments_insert_public ON zakat_payments
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY zakat_payments_select_admin ON zakat_payments
  FOR SELECT
  USING (public.is_member_of(mosque_id));

COMMIT;
