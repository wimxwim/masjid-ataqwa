CREATE TYPE "public"."commission_status" AS ENUM('pending', 'approved', 'paid', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."department" AS ENUM('dakwah', 'social', 'people_culture', 'media', 'business', 'finance', 'secretary');--> statement-breakpoint
CREATE TYPE "public"."desil" AS ENUM('1', '2', '3', '4');--> statement-breakpoint
CREATE TYPE "public"."donation_akad" AS ENUM('zakat_fitrah', 'zakat_mal', 'infaq', 'sedekah', 'wakaf', 'fidyah');--> statement-breakpoint
CREATE TYPE "public"."donation_payment" AS ENUM('qris', 'transfer', 'tunai', 'kitabisa');--> statement-breakpoint
CREATE TYPE "public"."donation_status" AS ENUM('pending', 'paid', 'failed', 'refunded');--> statement-breakpoint
CREATE TYPE "public"."loan_status" AS ENUM('active', 'completed', 'defaulted', 'restructured');--> statement-breakpoint
CREATE TYPE "public"."repayment_status" AS ENUM('lunas', 'kurang', 'ditanggung');--> statement-breakpoint
CREATE TYPE "public"."role" AS ENUM('superadmin', 'admin_dkm', 'finance_director', 'dakwah_lead', 'social_lead', 'people_culture', 'media_pub', 'business_lead', 'affiliate_youth', 'mustahik');--> statement-breakpoint
CREATE TABLE "affiliate_sales" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_id" uuid NOT NULL,
	"referrer_id" uuid NOT NULL,
	"program_id" uuid,
	"quantity" integer NOT NULL,
	"total_gmv" bigint NOT NULL,
	"earned_commission" bigint NOT NULL,
	"commission_status" "commission_status" DEFAULT 'pending',
	"paid_at" timestamp with time zone,
	"idempotency_key" text,
	"sold_at" timestamp with time zone DEFAULT now(),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "affiliate_sales_idempotency_key_unique" UNIQUE("idempotency_key")
);
--> statement-breakpoint
CREATE TABLE "audit_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"mosque_id" uuid NOT NULL,
	"actor_id" uuid,
	"action" text NOT NULL,
	"entity_type" text NOT NULL,
	"entity_id" text,
	"changes" jsonb,
	"ip_address" text,
	"user_agent" text,
	"metadata" jsonb,
	"occurred_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "bumm_products" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"mosque_id" uuid NOT NULL,
	"program_id" uuid,
	"product_name" text NOT NULL,
	"category" text,
	"description" text,
	"price" bigint NOT NULL,
	"commission_pct" double precision DEFAULT 15,
	"stock" integer DEFAULT 0,
	"image_url" text,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "donations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"mosque_id" uuid NOT NULL,
	"program_id" uuid,
	"donor_name" text,
	"donor_phone" text,
	"amount" bigint NOT NULL,
	"akad_type" "donation_akad" NOT NULL,
	"program_name" text,
	"payment_method" "donation_payment",
	"payment_status" "donation_status" DEFAULT 'pending',
	"midtrans_transaction_id" text,
	"qris_order_id" text,
	"idempotency_key" text,
	"paid_at" timestamp with time zone,
	"verified_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "donations_idempotency_key_unique" UNIQUE("idempotency_key")
);
--> statement-breakpoint
CREATE TABLE "kajian_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"silabus_id" uuid NOT NULL,
	"week_number" integer NOT NULL,
	"topic" text,
	"speaker" text,
	"date" date,
	"is_completed" boolean DEFAULT false,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "kajian_silabus" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"mosque_id" uuid NOT NULL,
	"program_id" uuid,
	"category" text NOT NULL,
	"kitab" text,
	"weight_pct" double precision,
	"total_sessions" integer DEFAULT 0,
	"month_year" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "kajian_mosque_category_month" UNIQUE("mosque_id","category","month_year")
);
--> statement-breakpoint
CREATE TABLE "loans" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"mosque_id" uuid NOT NULL,
	"mustahik_id" uuid NOT NULL,
	"group_id" uuid,
	"program_id" uuid,
	"amount" bigint NOT NULL,
	"weekly_payment" bigint NOT NULL,
	"week_duration" integer DEFAULT 10,
	"current_level" integer DEFAULT 1,
	"status" "loan_status" DEFAULT 'active',
	"total_paid" bigint DEFAULT 0,
	"weeks_overdue" integer DEFAULT 0,
	"approved_by" uuid,
	"approved_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "memberships" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"mosque_id" uuid NOT NULL,
	"profile_id" uuid NOT NULL,
	"role" "role" DEFAULT 'mustahik' NOT NULL,
	"department" "department",
	"youth_dakwah_ring" integer,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "memberships_mosque_profile" UNIQUE("mosque_id","profile_id")
);
--> statement-breakpoint
CREATE TABLE "mosques" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"address" text NOT NULL,
	"lat" double precision NOT NULL,
	"lng" double precision NOT NULL,
	"city" text DEFAULT 'Jakarta Selatan',
	"district" text DEFAULT 'Pesanggrahan',
	"village" text DEFAULT 'Ulujami',
	"npwp" text,
	"akta_yayasan_url" text,
	"upz_number" text,
	"upz_legalized_date" date,
	"bank_account_name" text,
	"bank_account_number" text,
	"bank_name" text,
	"is_active" boolean DEFAULT true,
	"is_legalized" boolean DEFAULT false,
	"total_mustahik_target" integer DEFAULT 100,
	"config" jsonb DEFAULT '{"prayer_adjustment":2,"kajian_start_hour":19,"zakat_fitrah_amount":45000,"infaq_weekly_default":50000}'::jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "mosques_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "mustahiks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"mosque_id" uuid NOT NULL,
	"name" text NOT NULL,
	"phone" text,
	"nik_encrypted" text,
	"nik_hash" text,
	"address" text NOT NULL,
	"lat" double precision,
	"lng" double precision,
	"desil_level" "desil",
	"ring_number" integer,
	"monthly_income" bigint,
	"dependents" integer DEFAULT 0,
	"usaha_type" text,
	"health_insurance_id" text,
	"is_active" boolean DEFAULT true,
	"notes" text,
	"created_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "mustahiks_nik_hash" UNIQUE("nik_hash")
);
--> statement-breakpoint
CREATE TABLE "profiles" (
	"id" uuid PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"phone" text,
	"email" text,
	"avatar_url" text,
	"is_verified" boolean DEFAULT false,
	"last_login_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "programs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"mosque_id" uuid NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"description" text,
	"category" text DEFAULT 'sosial' NOT NULL,
	"is_active" boolean DEFAULT false,
	"is_featured" boolean DEFAULT false,
	"sort_order" integer DEFAULT 0,
	"config" jsonb DEFAULT '{"icon":"quran","color":"#10b981","target_beneficiaries":0,"target_budget":0}'::jsonb,
	"start_date" date,
	"end_date" date,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "programs_mosque_slug" UNIQUE("mosque_id","slug")
);
--> statement-breakpoint
CREATE TABLE "repayments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"loan_id" uuid NOT NULL,
	"amount_paid" bigint NOT NULL,
	"week_number" integer NOT NULL,
	"status" "repayment_status" DEFAULT 'lunas',
	"is_backstopped" boolean DEFAULT false,
	"backstopped_by" uuid,
	"backstop_amount" bigint DEFAULT 0,
	"is_present_taklim" boolean DEFAULT false,
	"idempotency_key" text,
	"paid_at" timestamp with time zone DEFAULT now(),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "repayments_idempotency_key_unique" UNIQUE("idempotency_key")
);
--> statement-breakpoint
CREATE TABLE "sahabat_infaq_groups" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"mosque_id" uuid NOT NULL,
	"program_id" uuid,
	"group_name" text NOT NULL,
	"leader_id" uuid,
	"member_count" integer,
	"current_level" integer DEFAULT 1,
	"total_pokok" bigint DEFAULT 500000,
	"weekly_payment" bigint DEFAULT 50000,
	"week_duration" integer DEFAULT 10,
	"total_repaid" bigint DEFAULT 0,
	"status" text DEFAULT 'active',
	"npf_flag" boolean DEFAULT false,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "santri" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"mosque_id" uuid NOT NULL,
	"program_id" uuid,
	"name" text NOT NULL,
	"phone" text,
	"age" integer,
	"parent_name" text,
	"parent_phone" text,
	"address" text,
	"level" text DEFAULT 'tahsin',
	"class_group" text,
	"join_date" date,
	"is_active" boolean DEFAULT true,
	"juz_terakhir" integer DEFAULT 0,
	"surat_terakhir" text,
	"created_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "santri_attendance" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"santri_id" uuid NOT NULL,
	"date" date NOT NULL,
	"status" text DEFAULT 'hadir' NOT NULL,
	"notes" text,
	"recorded_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "attendance_santri_date" UNIQUE("santri_id","date")
);
--> statement-breakpoint
CREATE TABLE "santri_hafalan" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"santri_id" uuid NOT NULL,
	"date" date NOT NULL,
	"surah" text NOT NULL,
	"ayat_start" integer,
	"ayat_end" integer,
	"juz" integer,
	"status" text DEFAULT 'baru',
	"notes" text,
	"recorded_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "affiliate_sales" ADD CONSTRAINT "affiliate_sales_product_id_bumm_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."bumm_products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "affiliate_sales" ADD CONSTRAINT "affiliate_sales_referrer_id_profiles_id_fk" FOREIGN KEY ("referrer_id") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "affiliate_sales" ADD CONSTRAINT "affiliate_sales_program_id_programs_id_fk" FOREIGN KEY ("program_id") REFERENCES "public"."programs"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_mosque_id_mosques_id_fk" FOREIGN KEY ("mosque_id") REFERENCES "public"."mosques"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_actor_id_profiles_id_fk" FOREIGN KEY ("actor_id") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bumm_products" ADD CONSTRAINT "bumm_products_mosque_id_mosques_id_fk" FOREIGN KEY ("mosque_id") REFERENCES "public"."mosques"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bumm_products" ADD CONSTRAINT "bumm_products_program_id_programs_id_fk" FOREIGN KEY ("program_id") REFERENCES "public"."programs"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "donations" ADD CONSTRAINT "donations_mosque_id_mosques_id_fk" FOREIGN KEY ("mosque_id") REFERENCES "public"."mosques"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "donations" ADD CONSTRAINT "donations_program_id_programs_id_fk" FOREIGN KEY ("program_id") REFERENCES "public"."programs"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "donations" ADD CONSTRAINT "donations_verified_by_profiles_id_fk" FOREIGN KEY ("verified_by") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kajian_sessions" ADD CONSTRAINT "kajian_sessions_silabus_id_kajian_silabus_id_fk" FOREIGN KEY ("silabus_id") REFERENCES "public"."kajian_silabus"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kajian_silabus" ADD CONSTRAINT "kajian_silabus_mosque_id_mosques_id_fk" FOREIGN KEY ("mosque_id") REFERENCES "public"."mosques"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kajian_silabus" ADD CONSTRAINT "kajian_silabus_program_id_programs_id_fk" FOREIGN KEY ("program_id") REFERENCES "public"."programs"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "loans" ADD CONSTRAINT "loans_mosque_id_mosques_id_fk" FOREIGN KEY ("mosque_id") REFERENCES "public"."mosques"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "loans" ADD CONSTRAINT "loans_mustahik_id_mustahiks_id_fk" FOREIGN KEY ("mustahik_id") REFERENCES "public"."mustahiks"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "loans" ADD CONSTRAINT "loans_group_id_sahabat_infaq_groups_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."sahabat_infaq_groups"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "loans" ADD CONSTRAINT "loans_program_id_programs_id_fk" FOREIGN KEY ("program_id") REFERENCES "public"."programs"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "loans" ADD CONSTRAINT "loans_approved_by_profiles_id_fk" FOREIGN KEY ("approved_by") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "memberships" ADD CONSTRAINT "memberships_mosque_id_mosques_id_fk" FOREIGN KEY ("mosque_id") REFERENCES "public"."mosques"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "memberships" ADD CONSTRAINT "memberships_profile_id_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mustahiks" ADD CONSTRAINT "mustahiks_mosque_id_mosques_id_fk" FOREIGN KEY ("mosque_id") REFERENCES "public"."mosques"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mustahiks" ADD CONSTRAINT "mustahiks_created_by_profiles_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "programs" ADD CONSTRAINT "programs_mosque_id_mosques_id_fk" FOREIGN KEY ("mosque_id") REFERENCES "public"."mosques"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "repayments" ADD CONSTRAINT "repayments_loan_id_loans_id_fk" FOREIGN KEY ("loan_id") REFERENCES "public"."loans"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "repayments" ADD CONSTRAINT "repayments_backstopped_by_profiles_id_fk" FOREIGN KEY ("backstopped_by") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sahabat_infaq_groups" ADD CONSTRAINT "sahabat_infaq_groups_mosque_id_mosques_id_fk" FOREIGN KEY ("mosque_id") REFERENCES "public"."mosques"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sahabat_infaq_groups" ADD CONSTRAINT "sahabat_infaq_groups_program_id_programs_id_fk" FOREIGN KEY ("program_id") REFERENCES "public"."programs"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sahabat_infaq_groups" ADD CONSTRAINT "sahabat_infaq_groups_leader_id_profiles_id_fk" FOREIGN KEY ("leader_id") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "santri" ADD CONSTRAINT "santri_mosque_id_mosques_id_fk" FOREIGN KEY ("mosque_id") REFERENCES "public"."mosques"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "santri" ADD CONSTRAINT "santri_program_id_programs_id_fk" FOREIGN KEY ("program_id") REFERENCES "public"."programs"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "santri" ADD CONSTRAINT "santri_created_by_profiles_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "santri_attendance" ADD CONSTRAINT "santri_attendance_santri_id_santri_id_fk" FOREIGN KEY ("santri_id") REFERENCES "public"."santri"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "santri_attendance" ADD CONSTRAINT "santri_attendance_recorded_by_profiles_id_fk" FOREIGN KEY ("recorded_by") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "santri_hafalan" ADD CONSTRAINT "santri_hafalan_santri_id_santri_id_fk" FOREIGN KEY ("santri_id") REFERENCES "public"."santri"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "santri_hafalan" ADD CONSTRAINT "santri_hafalan_recorded_by_profiles_id_fk" FOREIGN KEY ("recorded_by") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "affiliate_referrer_idx" ON "affiliate_sales" USING btree ("referrer_id");--> statement-breakpoint
CREATE INDEX "affiliate_product_idx" ON "affiliate_sales" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "audit_mosque_idx" ON "audit_logs" USING btree ("mosque_id");--> statement-breakpoint
CREATE INDEX "audit_actor_idx" ON "audit_logs" USING btree ("actor_id");--> statement-breakpoint
CREATE INDEX "audit_entity_idx" ON "audit_logs" USING btree ("entity_type","entity_id");--> statement-breakpoint
CREATE INDEX "audit_occurred_idx" ON "audit_logs" USING btree ("occurred_at");--> statement-breakpoint
CREATE INDEX "bumm_mosque_idx" ON "bumm_products" USING btree ("mosque_id");--> statement-breakpoint
CREATE INDEX "donations_mosque_idx" ON "donations" USING btree ("mosque_id");--> statement-breakpoint
CREATE INDEX "donations_status_idx" ON "donations" USING btree ("payment_status");--> statement-breakpoint
CREATE INDEX "donations_program_idx" ON "donations" USING btree ("program_id");--> statement-breakpoint
CREATE INDEX "sessions_silabus_idx" ON "kajian_sessions" USING btree ("silabus_id");--> statement-breakpoint
CREATE INDEX "kajian_mosque_idx" ON "kajian_silabus" USING btree ("mosque_id");--> statement-breakpoint
CREATE INDEX "loans_mustahik_idx" ON "loans" USING btree ("mustahik_id");--> statement-breakpoint
CREATE INDEX "loans_group_idx" ON "loans" USING btree ("group_id");--> statement-breakpoint
CREATE INDEX "loans_status_idx" ON "loans" USING btree ("status");--> statement-breakpoint
CREATE INDEX "loans_mosque_idx" ON "loans" USING btree ("mosque_id");--> statement-breakpoint
CREATE INDEX "memberships_mosque_idx" ON "memberships" USING btree ("mosque_id");--> statement-breakpoint
CREATE INDEX "memberships_profile_idx" ON "memberships" USING btree ("profile_id");--> statement-breakpoint
CREATE INDEX "mustahiks_mosque_idx" ON "mustahiks" USING btree ("mosque_id");--> statement-breakpoint
CREATE INDEX "mustahiks_ring_idx" ON "mustahiks" USING btree ("mosque_id","ring_number");--> statement-breakpoint
CREATE INDEX "mustahiks_coordinate_idx" ON "mustahiks" USING btree ("lat","lng");--> statement-breakpoint
CREATE INDEX "programs_mosque_active" ON "programs" USING btree ("mosque_id","is_active");--> statement-breakpoint
CREATE INDEX "repayments_loan_idx" ON "repayments" USING btree ("loan_id");--> statement-breakpoint
CREATE INDEX "groups_mosque_idx" ON "sahabat_infaq_groups" USING btree ("mosque_id");--> statement-breakpoint
CREATE INDEX "groups_program_idx" ON "sahabat_infaq_groups" USING btree ("program_id");--> statement-breakpoint
CREATE INDEX "santri_mosque_idx" ON "santri" USING btree ("mosque_id");--> statement-breakpoint
CREATE INDEX "santri_program_idx" ON "santri" USING btree ("program_id");--> statement-breakpoint
CREATE INDEX "hafalan_santri_idx" ON "santri_hafalan" USING btree ("santri_id");