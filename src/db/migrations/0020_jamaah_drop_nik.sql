ALTER TABLE "jamaah" DROP COLUMN IF EXISTS "nik_encrypted";--> statement-breakpoint
ALTER TABLE "jamaah" DROP COLUMN IF EXISTS "nik_hash";--> statement-breakpoint
DROP INDEX IF EXISTS "jamaah_nik_hash_idx";
