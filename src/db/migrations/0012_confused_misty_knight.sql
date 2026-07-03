CREATE TYPE "public"."kolektibilitas" AS ENUM('1_lancar', '2_dpk', '3_kurang_lancar', '4_diragukan', '5_macet');--> statement-breakpoint
CREATE TABLE "asnaf" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"mosque_id" uuid NOT NULL,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"arabic_name" text,
	"quran_ayat" text,
	"priority" integer DEFAULT 0,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "loan_applications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"mosque_id" uuid NOT NULL,
	"name" text NOT NULL,
	"phone" text NOT NULL,
	"nik" text NOT NULL,
	"home_status" text NOT NULL,
	"business_name" text NOT NULL,
	"business_type" text NOT NULL,
	"business_age" text NOT NULL,
	"business_address" text NOT NULL,
	"amount" bigint NOT NULL,
	"week_duration" integer NOT NULL,
	"purpose" text,
	"status" text DEFAULT 'pending',
	"notes" text,
	"reviewed_by" uuid,
	"reviewed_at" timestamp with time zone,
	"converted_loan_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "loan_installments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"loan_id" uuid NOT NULL,
	"amount_due" bigint NOT NULL,
	"amount_paid" bigint DEFAULT 0,
	"due_date" date,
	"paid_date" date,
	"week_number" integer,
	"status" text DEFAULT 'pending',
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "loan_restructures" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"loan_id" uuid NOT NULL,
	"old_amount" bigint NOT NULL,
	"new_amount" bigint NOT NULL,
	"old_weekly_payment" bigint NOT NULL,
	"new_weekly_payment" bigint NOT NULL,
	"old_week_duration" integer NOT NULL,
	"new_week_duration" integer NOT NULL,
	"reason" text,
	"approved_by" uuid,
	"restructured_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "muzzaki" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"mosque_id" uuid NOT NULL,
	"name" text NOT NULL,
	"phone" text,
	"nik_encrypted" text,
	"nik_hash" text,
	"address" text,
	"muzzaki_type" text DEFAULT 'perseorangan',
	"is_regular" boolean DEFAULT false,
	"last_asset_value" bigint DEFAULT 0,
	"last_zakat_amount" bigint DEFAULT 0,
	"last_zakat_year" integer,
	"notes" text,
	"is_active" boolean DEFAULT true,
	"created_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "muzzaki_nik_hash" UNIQUE("nik_hash")
);
--> statement-breakpoint
CREATE TABLE "wakaf_assets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"mosque_id" uuid NOT NULL,
	"program_id" uuid,
	"asset_name" text NOT NULL,
	"asset_type" text NOT NULL,
	"description" text,
	"certificate_number" text,
	"certificate_date" date,
	"land_area" double precision,
	"location" text,
	"lat" double precision,
	"lng" double precision,
	"nazhir_name" text,
	"nazhir_type" text DEFAULT 'perorangan',
	"nazhir_phone" text,
	"nazhir_address" text,
	"wakif_name" text,
	"wakif_phone" text,
	"wakif_type" text DEFAULT 'perseorangan',
	"beneficiary_type" text DEFAULT 'umum',
	"beneficiary_description" text,
	"acquisition_value" bigint DEFAULT 0,
	"current_value" bigint DEFAULT 0,
	"last_valuation_date" date,
	"status" text DEFAULT 'aktif',
	"is_productive" boolean DEFAULT false,
	"revenue_generated" bigint DEFAULT 0,
	"notes" text,
	"is_active" boolean DEFAULT true,
	"created_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "zakat_payments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"mosque_id" uuid NOT NULL,
	"muzzaki_id" uuid,
	"zakat_type" text NOT NULL,
	"amount" bigint NOT NULL,
	"asnaf_id" uuid,
	"distribution_note" text,
	"payment_method" text,
	"payment_status" text DEFAULT 'paid',
	"paid_at" timestamp with time zone DEFAULT now(),
	"zakat_year" integer NOT NULL,
	"is_verified" boolean DEFAULT false,
	"verified_by" uuid,
	"transaction_id" uuid,
	"notes" text,
	"idempotency_key" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "zakat_payments_idempotency_key_unique" UNIQUE("idempotency_key")
);
--> statement-breakpoint
CREATE TABLE "ziswaf_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"mosque_id" uuid NOT NULL,
	"requestor_name" text NOT NULL,
	"requestor_phone" text,
	"type" text NOT NULL,
	"amount" bigint,
	"description" text,
	"status" text DEFAULT 'pending',
	"notes" text,
	"reviewed_by" uuid,
	"reviewed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "loans" ADD COLUMN "purpose" text;--> statement-breakpoint
ALTER TABLE "loans" ADD COLUMN "guarantee_description" text;--> statement-breakpoint
ALTER TABLE "loans" ADD COLUMN "kolektibilitas" "kolektibilitas" DEFAULT '1_lancar';--> statement-breakpoint
ALTER TABLE "loans" ADD COLUMN "npf_stage" text;--> statement-breakpoint
ALTER TABLE "loans" ADD COLUMN "restructured" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "loans" ADD COLUMN "restructured_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "loans" ADD COLUMN "last_assessment_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "mustahiks" ADD COLUMN "asnaf_id" uuid;--> statement-breakpoint
ALTER TABLE "mustahiks" ADD COLUMN "sub_asnaf" text;--> statement-breakpoint
ALTER TABLE "mustahiks" ADD COLUMN "had_kifayah_score" integer DEFAULT 50;--> statement-breakpoint
ALTER TABLE "mustahiks" ADD COLUMN "nomor_induk_mustahik" text;--> statement-breakpoint
ALTER TABLE "mustahiks" ADD COLUMN "program_type" text;--> statement-breakpoint
ALTER TABLE "asnaf" ADD CONSTRAINT "asnaf_mosque_id_mosques_id_fk" FOREIGN KEY ("mosque_id") REFERENCES "public"."mosques"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "loan_applications" ADD CONSTRAINT "loan_applications_mosque_id_mosques_id_fk" FOREIGN KEY ("mosque_id") REFERENCES "public"."mosques"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "loan_applications" ADD CONSTRAINT "loan_applications_reviewed_by_profiles_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "loan_applications" ADD CONSTRAINT "loan_applications_converted_loan_id_loans_id_fk" FOREIGN KEY ("converted_loan_id") REFERENCES "public"."loans"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "loan_installments" ADD CONSTRAINT "loan_installments_loan_id_loans_id_fk" FOREIGN KEY ("loan_id") REFERENCES "public"."loans"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "loan_restructures" ADD CONSTRAINT "loan_restructures_loan_id_loans_id_fk" FOREIGN KEY ("loan_id") REFERENCES "public"."loans"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "loan_restructures" ADD CONSTRAINT "loan_restructures_approved_by_profiles_id_fk" FOREIGN KEY ("approved_by") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "muzzaki" ADD CONSTRAINT "muzzaki_mosque_id_mosques_id_fk" FOREIGN KEY ("mosque_id") REFERENCES "public"."mosques"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "muzzaki" ADD CONSTRAINT "muzzaki_created_by_profiles_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wakaf_assets" ADD CONSTRAINT "wakaf_assets_mosque_id_mosques_id_fk" FOREIGN KEY ("mosque_id") REFERENCES "public"."mosques"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wakaf_assets" ADD CONSTRAINT "wakaf_assets_program_id_programs_id_fk" FOREIGN KEY ("program_id") REFERENCES "public"."programs"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wakaf_assets" ADD CONSTRAINT "wakaf_assets_created_by_profiles_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "zakat_payments" ADD CONSTRAINT "zakat_payments_mosque_id_mosques_id_fk" FOREIGN KEY ("mosque_id") REFERENCES "public"."mosques"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "zakat_payments" ADD CONSTRAINT "zakat_payments_muzzaki_id_muzzaki_id_fk" FOREIGN KEY ("muzzaki_id") REFERENCES "public"."muzzaki"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "zakat_payments" ADD CONSTRAINT "zakat_payments_asnaf_id_asnaf_id_fk" FOREIGN KEY ("asnaf_id") REFERENCES "public"."asnaf"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "zakat_payments" ADD CONSTRAINT "zakat_payments_verified_by_profiles_id_fk" FOREIGN KEY ("verified_by") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "zakat_payments" ADD CONSTRAINT "zakat_payments_transaction_id_transactions_id_fk" FOREIGN KEY ("transaction_id") REFERENCES "public"."transactions"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ziswaf_requests" ADD CONSTRAINT "ziswaf_requests_mosque_id_mosques_id_fk" FOREIGN KEY ("mosque_id") REFERENCES "public"."mosques"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ziswaf_requests" ADD CONSTRAINT "ziswaf_requests_reviewed_by_profiles_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "asnaf_mosque_idx" ON "asnaf" USING btree ("mosque_id");--> statement-breakpoint
CREATE INDEX "loan_apps_mosque_idx" ON "loan_applications" USING btree ("mosque_id");--> statement-breakpoint
CREATE INDEX "loan_apps_status_idx" ON "loan_applications" USING btree ("status");--> statement-breakpoint
CREATE INDEX "installments_loan_idx" ON "loan_installments" USING btree ("loan_id");--> statement-breakpoint
CREATE INDEX "installments_status_idx" ON "loan_installments" USING btree ("loan_id","status");--> statement-breakpoint
CREATE INDEX "loan_restructures_loan_idx" ON "loan_restructures" USING btree ("loan_id");--> statement-breakpoint
CREATE INDEX "muzzaki_mosque_idx" ON "muzzaki" USING btree ("mosque_id");--> statement-breakpoint
CREATE INDEX "wakaf_mosque_idx" ON "wakaf_assets" USING btree ("mosque_id");--> statement-breakpoint
CREATE INDEX "wakaf_type_idx" ON "wakaf_assets" USING btree ("mosque_id","asset_type");--> statement-breakpoint
CREATE INDEX "wakaf_productive_idx" ON "wakaf_assets" USING btree ("mosque_id","is_productive");--> statement-breakpoint
CREATE INDEX "wakaf_status_idx" ON "wakaf_assets" USING btree ("mosque_id","status");--> statement-breakpoint
CREATE INDEX "zakat_payments_mosque_idx" ON "zakat_payments" USING btree ("mosque_id");--> statement-breakpoint
CREATE INDEX "zakat_payments_muzzaki_idx" ON "zakat_payments" USING btree ("muzzaki_id");--> statement-breakpoint
CREATE INDEX "zakat_payments_year_idx" ON "zakat_payments" USING btree ("mosque_id","zakat_year");--> statement-breakpoint
CREATE INDEX "zakat_payments_asnaf_idx" ON "zakat_payments" USING btree ("asnaf_id");--> statement-breakpoint
CREATE INDEX "ziswaf_requests_mosque_idx" ON "ziswaf_requests" USING btree ("mosque_id");--> statement-breakpoint
CREATE INDEX "ziswaf_requests_status_idx" ON "ziswaf_requests" USING btree ("mosque_id","status");--> statement-breakpoint
ALTER TABLE "mustahiks" ADD CONSTRAINT "mustahiks_asnaf_id_asnaf_id_fk" FOREIGN KEY ("asnaf_id") REFERENCES "public"."asnaf"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "loans_kolektibilitas_idx" ON "loans" USING btree ("mosque_id","kolektibilitas");--> statement-breakpoint
CREATE INDEX "loans_purpose_idx" ON "loans" USING btree ("mosque_id","purpose");--> statement-breakpoint
CREATE INDEX "loans_npf_stage_idx" ON "loans" USING btree ("mosque_id","npf_stage");--> statement-breakpoint
CREATE INDEX "mustahiks_asnaf_idx" ON "mustahiks" USING btree ("mosque_id","asnaf_id");--> statement-breakpoint
CREATE INDEX "mustahiks_had_kifayah_idx" ON "mustahiks" USING btree ("mosque_id","had_kifayah_score");--> statement-breakpoint
ALTER TABLE "mustahiks" ADD CONSTRAINT "mustahiks_nim_mosque_unique" UNIQUE("mosque_id","nomor_induk_mustahik");