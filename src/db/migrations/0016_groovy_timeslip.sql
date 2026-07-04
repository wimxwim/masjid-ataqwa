ALTER TABLE "loan_applications" ALTER COLUMN "nik_encrypted" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "transactions" ADD COLUMN "reference_number" text;--> statement-breakpoint
ALTER TABLE "transactions" ADD COLUMN "entity_type" text;--> statement-breakpoint
ALTER TABLE "transactions" ADD COLUMN "entity_id" uuid;--> statement-breakpoint
ALTER TABLE "transactions" ADD COLUMN "disbursement_method" text DEFAULT 'cash';--> statement-breakpoint
ALTER TABLE "transactions" ADD COLUMN "approval_status" text DEFAULT 'approved';--> statement-breakpoint
ALTER TABLE "transactions" ADD COLUMN "approved_by" uuid;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_approved_by_profiles_id_fk" FOREIGN KEY ("approved_by") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "transactions_entity_idx" ON "transactions" USING btree ("entity_type","entity_id");--> statement-breakpoint
CREATE INDEX "transactions_approved_by_idx" ON "transactions" USING btree ("approved_by");--> statement-breakpoint
ALTER TABLE "loan_applications" DROP COLUMN "nik";--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_reference_number_unique" UNIQUE("reference_number");