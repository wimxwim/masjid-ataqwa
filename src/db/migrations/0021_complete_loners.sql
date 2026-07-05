CREATE TYPE "public"."transaction_type" AS ENUM('Pemasukan', 'Pengeluaran');--> statement-breakpoint
CREATE TABLE "dkm_members" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"mosque_id" uuid NOT NULL,
	"role" text NOT NULL,
	"full_name" text NOT NULL,
	"phone" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "mustahiks" DROP CONSTRAINT "mustahiks_nik_hash";--> statement-breakpoint
ALTER TABLE "muzzaki" DROP CONSTRAINT "muzzaki_nik_hash";--> statement-breakpoint
ALTER TABLE "transactions" ALTER COLUMN "type" SET DATA TYPE "public"."transaction_type" USING "type"::"public"."transaction_type";--> statement-breakpoint
CREATE INDEX "dkm_members_user_mosque_idx" ON "dkm_members" USING btree ("user_id","mosque_id");--> statement-breakpoint
ALTER TABLE "mustahiks" ADD CONSTRAINT "mustahiks_mosque_nik_hash" UNIQUE("mosque_id","nik_hash");--> statement-breakpoint
ALTER TABLE "muzzaki" ADD CONSTRAINT "muzzaki_mosque_nik_hash" UNIQUE("mosque_id","nik_hash");