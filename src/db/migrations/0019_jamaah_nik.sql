ALTER TABLE "jamaah" ADD COLUMN "nik_encrypted" text;--> statement-breakpoint
ALTER TABLE "jamaah" ADD COLUMN "nik_hash" text;--> statement-breakpoint
CREATE UNIQUE INDEX "jamaah_nik_hash_idx" ON "jamaah" USING btree ("nik_hash");
