-- Hapus kolom NIK plaintext dari loan_applications (P-001)
-- Data NIK sudah ada di nik_encrypted (AES-256-GCM) untuk entri baru sejak migrasi 0013.
-- Untuk data existing sebelum 0013 dengan nik_encrypted IS NULL:
--   Jalankan script backfill: tsx scripts/backfill-nik.ts
--   (membaca nik → encryptNik() → update nik_encrypted + nik_hash)
-- Setelah backfill selesai, jalankan migrasi ini.
--> statement-breakpoint
ALTER TABLE "loan_applications" DROP COLUMN "nik";
