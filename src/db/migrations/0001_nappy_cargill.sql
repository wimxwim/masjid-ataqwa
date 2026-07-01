CREATE TABLE "activity_feed" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"mosque_id" uuid NOT NULL,
	"type" text NOT NULL,
	"nama" text NOT NULL,
	"alamat" text,
	"detail" text,
	"jumlah" bigint,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "donatur_tetap" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"mosque_id" uuid NOT NULL,
	"nama" text NOT NULL,
	"phone" text,
	"alamat" text,
	"komitmen_bulanan" bigint DEFAULT 0,
	"aliran_dana" text DEFAULT 'Dana Operasional Masjid',
	"program_spesifik" text,
	"frekuensi" text DEFAULT 'Bulanan',
	"status" text DEFAULT 'Aktif',
	"riwayat_penerimaan" jsonb DEFAULT '[]'::jsonb,
	"created_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "inventaris" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"mosque_id" uuid NOT NULL,
	"nama_barang" text NOT NULL,
	"jumlah" integer DEFAULT 1,
	"satuan" text DEFAULT 'Unit',
	"kondisi" text DEFAULT 'Baik',
	"asal" text DEFAULT 'Wakaf',
	"created_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "jadwal_imam" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"mosque_id" uuid NOT NULL,
	"tanggal" date NOT NULL,
	"hari" text,
	"imam_subuh" text,
	"imam_maghrib_isya" text,
	"khatib_jumat" text,
	"created_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "jamaah" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"mosque_id" uuid NOT NULL,
	"nama" text NOT NULL,
	"phone" text,
	"alamat" text,
	"rt_rw" text,
	"peran" text DEFAULT 'Warga',
	"created_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "testimonials" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"mosque_id" uuid NOT NULL,
	"mustahik_id" uuid,
	"nama" text NOT NULL,
	"usia" integer,
	"title" text,
	"story" text NOT NULL,
	"ring" text,
	"durasi_bulan" integer,
	"image_url" text,
	"is_active" boolean DEFAULT true,
	"created_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "transactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"mosque_id" uuid NOT NULL,
	"type" text NOT NULL,
	"category" text NOT NULL,
	"amount" bigint NOT NULL,
	"description" text,
	"donor_name" text,
	"recipient_name" text,
	"phone" text,
	"notes" text,
	"transaction_date" date NOT NULL,
	"created_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "activity_feed" ADD CONSTRAINT "activity_feed_mosque_id_mosques_id_fk" FOREIGN KEY ("mosque_id") REFERENCES "public"."mosques"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "donatur_tetap" ADD CONSTRAINT "donatur_tetap_mosque_id_mosques_id_fk" FOREIGN KEY ("mosque_id") REFERENCES "public"."mosques"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "donatur_tetap" ADD CONSTRAINT "donatur_tetap_created_by_profiles_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventaris" ADD CONSTRAINT "inventaris_mosque_id_mosques_id_fk" FOREIGN KEY ("mosque_id") REFERENCES "public"."mosques"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventaris" ADD CONSTRAINT "inventaris_created_by_profiles_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "jadwal_imam" ADD CONSTRAINT "jadwal_imam_mosque_id_mosques_id_fk" FOREIGN KEY ("mosque_id") REFERENCES "public"."mosques"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "jadwal_imam" ADD CONSTRAINT "jadwal_imam_created_by_profiles_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "jamaah" ADD CONSTRAINT "jamaah_mosque_id_mosques_id_fk" FOREIGN KEY ("mosque_id") REFERENCES "public"."mosques"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "jamaah" ADD CONSTRAINT "jamaah_created_by_profiles_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "testimonials" ADD CONSTRAINT "testimonials_mosque_id_mosques_id_fk" FOREIGN KEY ("mosque_id") REFERENCES "public"."mosques"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "testimonials" ADD CONSTRAINT "testimonials_mustahik_id_mustahiks_id_fk" FOREIGN KEY ("mustahik_id") REFERENCES "public"."mustahiks"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "testimonials" ADD CONSTRAINT "testimonials_created_by_profiles_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_mosque_id_mosques_id_fk" FOREIGN KEY ("mosque_id") REFERENCES "public"."mosques"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_created_by_profiles_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "feed_mosque_idx" ON "activity_feed" USING btree ("mosque_id");--> statement-breakpoint
CREATE INDEX "feed_created_idx" ON "activity_feed" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "donatur_mosque_idx" ON "donatur_tetap" USING btree ("mosque_id");--> statement-breakpoint
CREATE INDEX "inventaris_mosque_idx" ON "inventaris" USING btree ("mosque_id");--> statement-breakpoint
CREATE INDEX "jadwal_mosque_idx" ON "jadwal_imam" USING btree ("mosque_id");--> statement-breakpoint
CREATE INDEX "jadwal_tanggal_idx" ON "jadwal_imam" USING btree ("tanggal");--> statement-breakpoint
CREATE INDEX "jamaah_mosque_idx" ON "jamaah" USING btree ("mosque_id");--> statement-breakpoint
CREATE INDEX "testimonials_mosque_idx" ON "testimonials" USING btree ("mosque_id");--> statement-breakpoint
CREATE INDEX "testimonials_active_idx" ON "testimonials" USING btree ("mosque_id","is_active");--> statement-breakpoint
CREATE INDEX "transactions_mosque_idx" ON "transactions" USING btree ("mosque_id");--> statement-breakpoint
CREATE INDEX "transactions_type_idx" ON "transactions" USING btree ("mosque_id","type");--> statement-breakpoint
CREATE INDEX "transactions_date_idx" ON "transactions" USING btree ("transaction_date");