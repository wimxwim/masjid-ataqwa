ALTER TABLE "mosques" ALTER COLUMN "config" SET DEFAULT '{"prayer_adjustment":2,"kajian_start_hour":19,"zakat_fitrah_amount":45000,"infaq_weekly_default":50000,"stats":{"penerima_manfaat_langsung":2418,"anak_asuh":85,"umkm_bina":42}}'::jsonb;--> statement-breakpoint
ALTER TABLE "loan_applications" ADD COLUMN "nik_encrypted" text;--> statement-breakpoint
ALTER TABLE "loan_applications" ADD COLUMN "nik_hash" text;--> statement-breakpoint
CREATE INDEX "donations_verified_by_idx" ON "donations" USING btree ("verified_by");--> statement-breakpoint
CREATE INDEX "loan_apps_nik_hash_idx" ON "loan_applications" USING btree ("nik_hash");--> statement-breakpoint
CREATE INDEX "loans_approved_by_idx" ON "loans" USING btree ("approved_by");--> statement-breakpoint
CREATE INDEX "mustahiks_created_by_idx" ON "mustahiks" USING btree ("created_by");--> statement-breakpoint
CREATE INDEX "transactions_created_by_idx" ON "transactions" USING btree ("created_by");