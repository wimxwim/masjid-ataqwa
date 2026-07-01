CREATE TABLE "employees" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"mosque_id" uuid NOT NULL,
	"name" text NOT NULL,
	"phone" text,
	"position" text NOT NULL,
	"salary" bigint DEFAULT 0,
	"salary_period" text DEFAULT 'Bulanan',
	"subject" text,
	"schedule" text,
	"join_date" date,
	"status" text DEFAULT 'Aktif',
	"notes" text,
	"created_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "mushafir_aid" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"mosque_id" uuid NOT NULL,
	"name" text NOT NULL,
	"phone" text,
	"nik_hash" text,
	"address" text,
	"photo_ktp_url" text,
	"aid_type" text NOT NULL,
	"amount" bigint DEFAULT 0,
	"notes" text,
	"given_date" date NOT NULL,
	"verified_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "jadwal_imam" ADD COLUMN "muazin_subuh" text;--> statement-breakpoint
ALTER TABLE "jadwal_imam" ADD COLUMN "muazin_maghrib_isya" text;--> statement-breakpoint
ALTER TABLE "employees" ADD CONSTRAINT "employees_mosque_id_mosques_id_fk" FOREIGN KEY ("mosque_id") REFERENCES "public"."mosques"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "employees" ADD CONSTRAINT "employees_created_by_profiles_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mushafir_aid" ADD CONSTRAINT "mushafir_aid_mosque_id_mosques_id_fk" FOREIGN KEY ("mosque_id") REFERENCES "public"."mosques"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mushafir_aid" ADD CONSTRAINT "mushafir_aid_verified_by_profiles_id_fk" FOREIGN KEY ("verified_by") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "employees_mosque_idx" ON "employees" USING btree ("mosque_id");--> statement-breakpoint
CREATE INDEX "employees_position_idx" ON "employees" USING btree ("mosque_id","position");--> statement-breakpoint
CREATE INDEX "mushafir_mosque_idx" ON "mushafir_aid" USING btree ("mosque_id");--> statement-breakpoint
CREATE INDEX "mushafir_nik_hash_idx" ON "mushafir_aid" USING btree ("nik_hash");--> statement-breakpoint
CREATE INDEX "mushafir_given_date_idx" ON "mushafir_aid" USING btree ("given_date");