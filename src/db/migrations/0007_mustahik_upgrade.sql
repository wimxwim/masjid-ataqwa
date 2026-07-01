-- Migration 0007: Upgrade mustahik — asnaf, had kifayah, NIM
-- Standar: BAZNAS Peraturan BAZNAS No. 1/2023 + AAOIFI SS-35
-- Referensi: MIBA MRBJ model (asnaf-based targeting, ring system)

BEGIN;

-- ============================================================
-- 1. TABEL REFERENSI ASNAF (8 golongan penerima zakat)
-- ============================================================
CREATE TABLE IF NOT EXISTS "asnaf" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "mosque_id" uuid NOT NULL REFERENCES "mosques"("id") ON DELETE CASCADE,
  "code" text NOT NULL,
  "name" text NOT NULL,
  "description" text,
  "arabic_name" text,
  "quran_ayat" text,
  "priority" integer DEFAULT 0,
  "is_active" boolean DEFAULT true,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

-- Asnaf dasar (8 asnaf) — auto-insert untuk tiap masjid baru via trigger later
-- Fakir, Miskin, Amil, Muallaf, Riqab, Gharim, Fisabilillah, Ibnusabil

-- ============================================================
-- 2. TAMBAH KOLOM KE mustahiks
-- ============================================================

-- asnaf_id — FK ke tabel asnaf (ganti desil_level sebagai primary classifier)
ALTER TABLE "mustahiks"
  ADD COLUMN IF NOT EXISTS "asnaf_id" uuid REFERENCES "asnaf"("id");

-- sub_asnaf — sub-kategori dalam asnaf (misal: fakir_kronis, miskin_produktif)
ALTER TABLE "mustahiks"
  ADD COLUMN IF NOT EXISTS "sub_asnaf" text;

-- had_kifayah_score — skor kecukupan berdasarkan BAZNAS (0-100)
-- Semakin rendah = semakin membutuhkan
ALTER TABLE "mustahiks"
  ADD COLUMN IF NOT EXISTS "had_kifayah_score" integer DEFAULT 50 CHECK (had_kifayah_score >= 0 AND had_kifayah_score <= 100);

-- nomor_induk_mustahik — NIM format: MASJID_SLUG/TAHUN/SEQUENTIAL
-- Contoh: ATAQWA/2026/0001
ALTER TABLE "mustahiks"
  ADD COLUMN IF NOT EXISTS "nomor_induk_mustahik" text;

-- program_type — jenis program yang diikuti mustahik
ALTER TABLE "mustahiks"
  ADD COLUMN IF NOT EXISTS "program_type" text;

-- constraint: nomor_induk_mustahik unique per mosque
ALTER TABLE "mustahiks"
  DROP CONSTRAINT IF EXISTS "mustahiks_nim_mosque_unique",
  ADD CONSTRAINT "mustahiks_nim_mosque_unique" UNIQUE ("mosque_id", "nomor_induk_mustahik");

-- ============================================================
-- 3. INDEX
-- ============================================================

CREATE INDEX IF NOT EXISTS "mustahiks_asnaf_idx"
  ON "mustahiks" ("mosque_id", "asnaf_id");

CREATE INDEX IF NOT EXISTS "mustahiks_had_kifayah_idx"
  ON "mustahiks" ("mosque_id", "had_kifayah_score");

-- ============================================================
-- 4. ASNAF RLS
-- ============================================================

ALTER TABLE "asnaf" ENABLE ROW LEVEL SECURITY;

CREATE POLICY asnaf_select_public ON asnaf
  FOR SELECT
  USING (true);

CREATE POLICY asnaf_insert_admin ON asnaf
  FOR INSERT
  WITH CHECK (public.is_member_of(mosque_id));

CREATE POLICY asnaf_update_admin ON asnaf
  FOR UPDATE
  USING (public.is_member_of(mosque_id));

COMMIT;
