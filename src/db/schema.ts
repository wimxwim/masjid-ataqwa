/**
 * Skema database Masjid At-Taqwa v1 (Drizzle ORM, Postgres/Supabase + PostGIS).
 *
 * Prinsip:
 * - Modular — semua program di master `programs` table, bisa nyala/mati via `is_active`
 * - Multi-masjid — SEMUA tabel data men-scope `mosque_id`. Siap scaling ke 140+ masjid
 * - TANPA NIK mentah — NIK dienkripsi AES-256-GCM + hash SHA-256 untuk dedup
 * - Uang sebagai bigint Rupiah utuh (IDR tanpa sen)
 * - Drizzle untuk DEFINISI skema + migrasi. Akses RUNTIME lewat klien Supabase (RLS aktif)
 *
 * Program aktif awal: Kampung Quran (is_active=true)
 * Program siap colok: Bank Infaq, Wakaf Domba, Beasiswa UMKM, BUMM
 */
import {
  pgTable, pgEnum, uuid, text, boolean, timestamp, date,
  bigint, integer, jsonb, doublePrecision, unique, index,
} from "drizzle-orm/pg-core";

/* ============================== ENUM ============================== */

export const roleEnum = pgEnum("role", [
  "superadmin", "admin_dkm", "finance_director",
  "dakwah_lead", "social_lead", "people_culture",
  "media_pub", "business_lead", "affiliate_youth", "mustahik",
]);

export const departmentEnum = pgEnum("department", [
  "dakwah", "social", "people_culture", "media", "business", "finance", "secretary",
]);

export const desilEnum = pgEnum("desil", ["1", "2", "3", "4"]);

export const loanStatusEnum = pgEnum("loan_status", [
  "active", "completed", "defaulted", "restructured",
]);

export const kolektibilitasEnum = pgEnum("kolektibilitas", [
  "1_lancar",
  "2_dpk",
  "3_kurang_lancar",
  "4_diragukan",
  "5_macet",
]);

export const commissionStatusEnum = pgEnum("commission_status", [
  "pending", "approved", "paid", "cancelled",
]);

export const donationAkadEnum = pgEnum("donation_akad", [
  "zakat_fitrah", "zakat_mal", "infaq", "sedekah", "wakaf", "fidyah",
]);

/** fund_type — klasifikasi jenis dana sesuai fiqih muamalah */
export const fundTypeEnum = pgEnum("fund_type", [
  "zakat_fitrah", "zakat_maal",
  "infaq_terikat", "infaq_tidak_terikat",
  "wakaf_pokok", "wakaf_hasil",
  "qardhul_hasan",
  "non_halal",
]);
export type FundType = (typeof fundTypeEnum.enumValues)[number];

/** akad_type — klasifikasi akad syariah untuk transaksi */
export const akadTypeEnum = pgEnum("akad_type", [
  "tamlik", "tabarru", "wakaf", "qardh",
]);
export type AkadType = (typeof akadTypeEnum.enumValues)[number];

export const donationPaymentEnum = pgEnum("donation_payment", [
  "qris", "transfer", "tunai", "kitabisa",
]);

export const donationStatusEnum = pgEnum("donation_status", [
  "pending", "paid", "failed", "refunded",
]);

/* ============================== FONDASI ============================== */

/** Masjid (tenant). */
export const mosques = pgTable("mosques", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  address: text("address").notNull(),
  lat: doublePrecision("lat").notNull(),
  lng: doublePrecision("lng").notNull(),
  city: text("city").default("Jakarta Selatan"),
  district: text("district").default("Pesanggrahan"),
  village: text("village").default("Ulujami"),

  // Legalitas (penting untuk CSR korporasi)
  npwp: text("npwp"),
  akta_yayasan_url: text("akta_yayasan_url"),
  upz_number: text("upz_number"),
  upz_legalized_date: date("upz_legalized_date"),
  bank_account_name: text("bank_account_name"),
  bank_account_number: text("bank_account_number"),
  bank_name: text("bank_name"),

  // Status
  is_active: boolean("is_active").default(true),
  is_legalized: boolean("is_legalized").default(false),
  total_mustahik_target: integer("total_mustahik_target").default(100),

  // Konfigurasi (JSONB — flexible untuk tiap masjid)
  config: jsonb("config").default({
    prayer_adjustment: 2,
    kajian_start_hour: 19,
    zakat_fitrah_amount: 45000,
    infaq_weekly_default: 50000,
    stats: {
      penerima_manfaat_langsung: 2418,
      anak_asuh: 85,
      umkm_bina: 42,
    },
  }),

  created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  deleted_at: timestamp("deleted_at", { withTimezone: true }),
});

/** Program masjid — modular, bisa nyala/mati. */
export const programs = pgTable("programs", {
  id: uuid("id").defaultRandom().primaryKey(),
  mosque_id: uuid("mosque_id").notNull().references(() => mosques.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  slug: text("slug").notNull(),
  description: text("description"),
  category: text("category").notNull().default("sosial"),

  // Toggle nyala/mati
  is_active: boolean("is_active").default(false),
  is_featured: boolean("is_featured").default(false),   // tampil di landing
  sort_order: integer("sort_order").default(0),

  // Konfigurasi spesifik program (JSONB — berbeda tiap jenis program)
  config: jsonb("config").default({
    icon: "quran",              // ikon dari lucide-react
    color: "#10b981",           // warna tema
    target_beneficiaries: 0,    // target penerima manfaat
    target_budget: 0,           // target dana
  }),

  start_date: date("start_date"),
  end_date: date("end_date"),

  created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  deleted_at: timestamp("deleted_at", { withTimezone: true }),
}, (t) => [
  unique("programs_mosque_slug").on(t.mosque_id, t.slug),
  index("programs_mosque_active").on(t.mosque_id, t.is_active),
]);

/* ============================== PENGGUNA ============================== */

/** Profil pengguna — id = auth.uid (Supabase Auth). */
export const profiles = pgTable("profiles", {
  id: uuid("id").primaryKey(),
  name: text("name").notNull(),
  phone: text("phone"),
  email: text("email"),
  avatar_url: text("avatar_url"),
  is_verified: boolean("is_verified").default(false),
  last_login_at: timestamp("last_login_at", { withTimezone: true }),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

/** Keanggotaan di masjid — basis multi-tenant + RBAC peran. */
export const memberships = pgTable("memberships", {
  id: uuid("id").defaultRandom().primaryKey(),
  mosque_id: uuid("mosque_id").notNull().references(() => mosques.id, { onDelete: "cascade" }),
  profile_id: uuid("profile_id").notNull().references(() => profiles.id, { onDelete: "cascade" }),
  role: roleEnum("role").notNull().default("mustahik"),
  department: departmentEnum("department"),

  // Market Dakwah Ring (REMISYA)
  youth_dakwah_ring: integer("youth_dakwah_ring"),

  is_active: boolean("is_active").default(true),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (t) => [
  unique("memberships_mosque_profile").on(t.mosque_id, t.profile_id),
  index("memberships_mosque_idx").on(t.mosque_id),
  index("memberships_profile_idx").on(t.profile_id),
]);

/* ============================== MUSTAHIK ============================== */

/** Mustahik — data dhuafa. */
export const mustahiks = pgTable("mustahiks", {
  id: uuid("id").defaultRandom().primaryKey(),
  mosque_id: uuid("mosque_id").notNull().references(() => mosques.id, { onDelete: "cascade" }),

  // Data pribadi (tanpa NIK mentah)
  name: text("name").notNull(),
  phone: text("phone"),
  nik_encrypted: text("nik_encrypted"),     // AES-256-GCM
  nik_hash: text("nik_hash"),               // SHA-256 untuk dedup
  address: text("address").notNull(),
  lat: doublePrecision("lat"),
  lng: doublePrecision("lng"),

  // Klasifikasi
  desil_level: desilEnum("desil_level"),
  asnaf_id: uuid("asnaf_id").references(() => asnaf.id),
  sub_asnaf: text("sub_asnaf"),
  had_kifayah_score: integer("had_kifayah_score").default(50),
  nomor_induk_mustahik: text("nomor_induk_mustahik"),
  program_type: text("program_type"),
  ring_number: integer("ring_number"),       // 1-4
  monthly_income: bigint("monthly_income", { mode: "number" }),
  dependents: integer("dependents").default(0),
  usaha_type: text("usaha_type"),
  health_insurance_id: text("health_insurance_id"),

  // Status
  is_active: boolean("is_active").default(true),
  notes: text("notes"),

  created_by: uuid("created_by").references(() => profiles.id),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  deleted_at: timestamp("deleted_at", { withTimezone: true }),
}, (t) => [
  index("mustahiks_mosque_idx").on(t.mosque_id),
  index("mustahiks_ring_idx").on(t.mosque_id, t.ring_number),
  unique("mustahiks_nik_hash").on(t.nik_hash),
  index("mustahiks_coordinate_idx").on(t.lat, t.lng),
  index("mustahiks_asnaf_idx").on(t.mosque_id, t.asnaf_id),
  unique("mustahiks_nim_mosque_unique").on(t.mosque_id, t.nomor_induk_mustahik),
  index("mustahiks_had_kifayah_idx").on(t.mosque_id, t.had_kifayah_score),
  index("mustahiks_created_by_idx").on(t.created_by),
]);

/* ============================== PROGRAM: KAMPUNG QURAN ============================== */

/** Santri Kampung Quran. */
export const santri = pgTable("santri", {
  id: uuid("id").defaultRandom().primaryKey(),
  mosque_id: uuid("mosque_id").notNull().references(() => mosques.id, { onDelete: "cascade" }),
  program_id: uuid("program_id").references(() => programs.id, { onDelete: "set null" }),

  name: text("name").notNull(),
  phone: text("phone"),
  age: integer("age"),
  parent_name: text("parent_name"),
  parent_phone: text("parent_phone"),
  address: text("address"),

  // Level pembelajaran
  level: text("level").default("tahsin"),   // tahsin, tahfidz, tafsir
  class_group: text("class_group"),
  join_date: date("join_date"),
  is_active: boolean("is_active").default(true),

  // Progress
  juz_terakhir: integer("juz_terakhir").default(0),
  surat_terakhir: text("surat_terakhir"),

  created_by: uuid("created_by").references(() => profiles.id),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  deleted_at: timestamp("deleted_at", { withTimezone: true }),
}, (t) => [
  index("santri_mosque_idx").on(t.mosque_id),
  index("santri_program_idx").on(t.program_id),
]);

/** Presensi santri Kampung Quran. */
export const santri_attendance = pgTable("santri_attendance", {
  id: uuid("id").defaultRandom().primaryKey(),
  santri_id: uuid("santri_id").notNull().references(() => santri.id, { onDelete: "cascade" }),
  date: date("date").notNull(),
  status: text("status").notNull().default("hadir"),  // hadir, izin, sakit, alpha
  notes: text("notes"),
  recorded_by: uuid("recorded_by").references(() => profiles.id),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (t) => [
  unique("attendance_santri_date").on(t.santri_id, t.date),
]);

/** Setoran hafalan santri. */
export const santri_hafalan = pgTable("santri_hafalan", {
  id: uuid("id").defaultRandom().primaryKey(),
  santri_id: uuid("santri_id").notNull().references(() => santri.id, { onDelete: "cascade" }),
  date: date("date").notNull(),
  surah: text("surah").notNull(),
  ayat_start: integer("ayat_start"),
  ayat_end: integer("ayat_end"),
  juz: integer("juz"),
  status: text("status").default("baru"),   // baru, murojaah, lancar
  notes: text("notes"),
  recorded_by: uuid("recorded_by").references(() => profiles.id),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (t) => [
  index("hafalan_santri_idx").on(t.santri_id),
]);

/* ============================== PROGRAM: BANK INFAQ ============================== */

/** Kelompok Sahabat Infaq (tanggung renteng). */
export const sahabat_infaq_groups = pgTable("sahabat_infaq_groups", {
  id: uuid("id").defaultRandom().primaryKey(),
  mosque_id: uuid("mosque_id").notNull().references(() => mosques.id, { onDelete: "cascade" }),
  program_id: uuid("program_id").references(() => programs.id, { onDelete: "set null" }),

  group_name: text("group_name").notNull(),
  leader_id: uuid("leader_id").references(() => profiles.id),
  member_count: integer("member_count"),

  current_level: integer("current_level").default(1),
  total_pokok: bigint("total_pokok", { mode: "number" }).default(500000),
  weekly_payment: bigint("weekly_payment", { mode: "number" }).default(50000),
  week_duration: integer("week_duration").default(10),
  total_repaid: bigint("total_repaid", { mode: "number" }).default(0),

  status: text("status").default("active"),  // active, completed, defaulted
  npf_flag: boolean("npf_flag").default(false),

  created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  deleted_at: timestamp("deleted_at", { withTimezone: true }),
}, (t) => [
  index("groups_mosque_idx").on(t.mosque_id),
  index("groups_program_idx").on(t.program_id),
]);

/** Pinjaman Qardhul Hasan. */
export const loans = pgTable("loans", {
  id: uuid("id").defaultRandom().primaryKey(),
  mosque_id: uuid("mosque_id").notNull().references(() => mosques.id, { onDelete: "cascade" }),
  mustahik_id: uuid("mustahik_id").notNull().references(() => mustahiks.id),
  group_id: uuid("group_id").references(() => sahabat_infaq_groups.id),
  program_id: uuid("program_id").references(() => programs.id, { onDelete: "set null" }),

  amount: bigint("amount", { mode: "number" }).notNull(),
  weekly_payment: bigint("weekly_payment", { mode: "number" }).notNull(),
  week_duration: integer("week_duration").default(10),
  current_level: integer("current_level").default(1),
  status: loanStatusEnum("status").default("active"),
  total_paid: bigint("total_paid", { mode: "number" }).default(0),
  weeks_overdue: integer("weeks_overdue").default(0),

  // AAOIFI SS-35 Qardhul Hasan
  purpose: text("purpose"),
  guarantee_description: text("guarantee_description"),

  // NPF Tracking (MRBJ model)
  kolektibilitas: kolektibilitasEnum("kolektibilitas").default("1_lancar"),
  npf_stage: text("npf_stage"),
  restructured: boolean("restructured").default(false),
  restructured_at: timestamp("restructured_at", { withTimezone: true }),
  last_assessment_at: timestamp("last_assessment_at", { withTimezone: true }),

  approved_by: uuid("approved_by").references(() => profiles.id),
  approved_at: timestamp("approved_at", { withTimezone: true }),

  created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  deleted_at: timestamp("deleted_at", { withTimezone: true }),
}, (t) => [
  index("loans_mustahik_idx").on(t.mustahik_id),
  index("loans_group_idx").on(t.group_id),
  index("loans_status_idx").on(t.status),
  index("loans_approved_by_idx").on(t.approved_by),
  index("loans_mosque_idx").on(t.mosque_id),
  index("loans_kolektibilitas_idx").on(t.mosque_id, t.kolektibilitas),
  index("loans_purpose_idx").on(t.mosque_id, t.purpose),
  index("loans_npf_stage_idx").on(t.mosque_id, t.npf_stage),
]);

/** Pengajuan modal Qardhul Hasan dari publik (sebelum jadi mustahik/loan). */
export const loan_applications = pgTable("loan_applications", {
  id: uuid("id").defaultRandom().primaryKey(),
  mosque_id: uuid("mosque_id").notNull().references(() => mosques.id, { onDelete: "cascade" }),

  name: text("name").notNull(),
  phone: text("phone").notNull(),
  nik: text("nik").notNull(),
  nik_encrypted: text("nik_encrypted"),
  nik_hash: text("nik_hash"),
  home_status: text("home_status").notNull(),

  business_name: text("business_name").notNull(),
  business_type: text("business_type").notNull(),
  business_age: text("business_age").notNull(),
  business_address: text("business_address").notNull(),

  amount: bigint("amount", { mode: "number" }).notNull(),
  week_duration: integer("week_duration").notNull(),
  purpose: text("purpose"),

  status: text("status").default("pending"),
  notes: text("notes"),

  reviewed_by: uuid("reviewed_by").references(() => profiles.id),
  reviewed_at: timestamp("reviewed_at", { withTimezone: true }),
  converted_loan_id: uuid("converted_loan_id").references(() => loans.id),

  created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  deleted_at: timestamp("deleted_at", { withTimezone: true }),
}, (t) => [
  index("loan_apps_mosque_idx").on(t.mosque_id),
  index("loan_apps_status_idx").on(t.status),
  index("loan_apps_nik_hash_idx").on(t.nik_hash),
]);

/* ============================== PROGRAM: KAJIAN ============================== */

/** Kurikulum kajian (8 kategori). */
export const kajian_silabus = pgTable("kajian_silabus", {
  id: uuid("id").defaultRandom().primaryKey(),
  mosque_id: uuid("mosque_id").notNull().references(() => mosques.id, { onDelete: "cascade" }),
  program_id: uuid("program_id").references(() => programs.id, { onDelete: "set null" }),

  category: text("category").notNull(),  // tafsir, hadits, fiqih, aqidah, sirah, tasawuf, ekonomi_syariah, pendidikan_islam, executive
  kitab: text("kitab"),
  weight_pct: doublePrecision("weight_pct"),
  total_sessions: integer("total_sessions").default(0),
  month_year: text("month_year").notNull(),  // "2026-07"

  created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  deleted_at: timestamp("deleted_at", { withTimezone: true }),
}, (t) => [
  unique("kajian_mosque_category_month").on(t.mosque_id, t.category, t.month_year),
  index("kajian_mosque_idx").on(t.mosque_id),
]);

/** Jadwal kajian per pekan. */
export const kajian_sessions = pgTable("kajian_sessions", {
  id: uuid("id").defaultRandom().primaryKey(),
  silabus_id: uuid("silabus_id").notNull().references(() => kajian_silabus.id, { onDelete: "cascade" }),
  week_number: integer("week_number").notNull(),
  topic: text("topic"),
  speaker: text("speaker"),
  date: date("date"),
  is_completed: boolean("is_completed").default(false),
  notes: text("notes"),

  created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (t) => [
  index("sessions_silabus_idx").on(t.silabus_id),
]);

/* ============================== PROGRAM: BUMM (ekonomi masjid) ============================== */

/** Produk BUMM. */
export const bumm_products = pgTable("bumm_products", {
  id: uuid("id").defaultRandom().primaryKey(),
  mosque_id: uuid("mosque_id").notNull().references(() => mosques.id, { onDelete: "cascade" }),
  program_id: uuid("program_id").references(() => programs.id, { onDelete: "set null" }),

  product_name: text("product_name").notNull(),
  category: text("category"),
  description: text("description"),
  price: bigint("price", { mode: "number" }).notNull(),
  commission_pct: doublePrecision("commission_pct").default(15),
  stock: integer("stock").default(0),
  image_url: text("image_url"),
  is_active: boolean("is_active").default(true),

  created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  deleted_at: timestamp("deleted_at", { withTimezone: true }),
}, (t) => [
  index("bumm_mosque_idx").on(t.mosque_id),
]);

/** Penjualan affiliate oleh pemuda. */
export const affiliate_sales = pgTable("affiliate_sales", {
  id: uuid("id").defaultRandom().primaryKey(),
  product_id: uuid("product_id").notNull().references(() => bumm_products.id),
  referrer_id: uuid("referrer_id").notNull().references(() => profiles.id),
  program_id: uuid("program_id").references(() => programs.id, { onDelete: "set null" }),

  quantity: integer("quantity").notNull(),
  total_gmv: bigint("total_gmv", { mode: "number" }).notNull(),
  earned_commission: bigint("earned_commission", { mode: "number" }).notNull(),
  commission_status: commissionStatusEnum("commission_status").default("pending"),
  paid_at: timestamp("paid_at", { withTimezone: true }),

  idempotency_key: text("idempotency_key").unique(),

  sold_at: timestamp("sold_at", { withTimezone: true }).defaultNow(),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (t) => [
  index("affiliate_referrer_idx").on(t.referrer_id),
  index("affiliate_product_idx").on(t.product_id),
]);

/* ============================== DONASI & KEUANGAN ============================== */

/** Donasi ZISWAF. */
export const donations = pgTable("donations", {
  id: uuid("id").defaultRandom().primaryKey(),
  mosque_id: uuid("mosque_id").notNull().references(() => mosques.id, { onDelete: "cascade" }),
  program_id: uuid("program_id").references(() => programs.id, { onDelete: "set null" }),

  donor_name: text("donor_name"),
  donor_phone: text("donor_phone"),
  amount: bigint("amount", { mode: "number" }).notNull(),
  akad_type: donationAkadEnum("akad_type").notNull(),
  program_name: text("program_name"),

  // Pembayaran
  payment_method: donationPaymentEnum("payment_method"),
  payment_status: donationStatusEnum("payment_status").default("pending"),
  midtrans_transaction_id: text("midtrans_transaction_id"),
  qris_order_id: text("qris_order_id"),

  idempotency_key: text("idempotency_key").unique(),

  paid_at: timestamp("paid_at", { withTimezone: true }),
  verified_by: uuid("verified_by").references(() => profiles.id),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (t) => [
  index("donations_mosque_idx").on(t.mosque_id),
  index("donations_status_idx").on(t.payment_status),
  index("donations_program_idx").on(t.program_id),
  index("donations_verified_by_idx").on(t.verified_by),
]);

/* ============================== AUDIT ============================== */

/** Audit log — INSERT only. */
export const audit_logs = pgTable("audit_logs", {
  id: uuid("id").defaultRandom().primaryKey(),
  mosque_id: uuid("mosque_id").notNull().references(() => mosques.id),
  actor_id: uuid("actor_id").references(() => profiles.id),
  action: text("action").notNull(),      // create, update, delete, login, payment
  entity_type: text("entity_type").notNull(),  // mustahik, loan, donation, santri, dll
  entity_id: text("entity_id"),
  changes: jsonb("changes"),             // before → after
  ip_address: text("ip_address"),
  user_agent: text("user_agent"),
  metadata: jsonb("metadata"),
  occurred_at: timestamp("occurred_at", { withTimezone: true }).defaultNow().notNull(),
}, (t) => [
  index("audit_mosque_idx").on(t.mosque_id),
  index("audit_actor_idx").on(t.actor_id),
  index("audit_entity_idx").on(t.entity_type, t.entity_id),
  index("audit_occurred_idx").on(t.occurred_at),
]);

/* ============================== KEUANGAN ============================== */

/** Transaksi harian masjid — pemasukan & pengeluaran. */
export const transactions = pgTable("transactions", {
  id: uuid("id").defaultRandom().primaryKey(),
  mosque_id: uuid("mosque_id").notNull().references(() => mosques.id, { onDelete: "cascade" }),
  type: text("type").notNull(),                     // "Pemasukan" | "Pengeluaran"
  category: text("category").notNull(),             // "Kotak Amal Jumat", "Honor Ustadz", dll
  amount: bigint("amount", { mode: "number" }).notNull(),
  description: text("description"),
  donor_name: text("donor_name"),                   // khusus pemasukan
  recipient_name: text("recipient_name"),            // khusus pengeluaran
  phone: text("phone"),
  notes: text("notes"),
  transaction_date: date("transaction_date").notNull(),

  fund_type: fundTypeEnum("fund_type").notNull().default("infaq_tidak_terikat"),
  akad_type: akadTypeEnum("akad_type"),

  asnaf_type: text("asnaf_type"),
  is_restricted: boolean("is_restricted").default(false),
  wakif_name: text("wakif_name"),
  ikrar_wakaf_ref: text("ikrar_wakaf_ref"),

  created_by: uuid("created_by").references(() => profiles.id),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  deleted_at: timestamp("deleted_at", { withTimezone: true }),
}, (t) => [
  index("transactions_mosque_idx").on(t.mosque_id),
  index("transactions_type_idx").on(t.mosque_id, t.type),
  index("transactions_date_idx").on(t.transaction_date),
  index("transactions_fund_type_idx").on(t.mosque_id, t.fund_type),
  index("transactions_created_by_idx").on(t.created_by),
]);

/** Donatur tetap — komitmen rutin. */
export const donatur_tetap = pgTable("donatur_tetap", {
  id: uuid("id").defaultRandom().primaryKey(),
  mosque_id: uuid("mosque_id").notNull().references(() => mosques.id, { onDelete: "cascade" }),
  nama: text("nama").notNull(),
  phone: text("phone"),
  alamat: text("alamat"),
  komitmen_bulanan: bigint("komitmen_bulanan", { mode: "number" }).default(0),
  aliran_dana: text("aliran_dana").default("Dana Operasional Masjid"),
  program_spesifik: text("program_spesifik"),
  frekuensi: text("frekuensi").default("Bulanan"),
  status: text("status").default("Aktif"),
  riwayat_penerimaan: jsonb("riwayat_penerimaan").default([]),

  created_by: uuid("created_by").references(() => profiles.id),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  deleted_at: timestamp("deleted_at", { withTimezone: true }),
}, (t) => [
  index("donatur_mosque_idx").on(t.mosque_id),
]);

/* ============================== JADWAL & IMAM ============================== */

/** Jadwal imam shalat, khatib Jumat & muazin. */
export const jadwal_imam = pgTable("jadwal_imam", {
  id: uuid("id").defaultRandom().primaryKey(),
  mosque_id: uuid("mosque_id").notNull().references(() => mosques.id, { onDelete: "cascade" }),
  tanggal: date("tanggal").notNull(),
  hari: text("hari"),
  imam_subuh: text("imam_subuh"),
  imam_maghrib_isya: text("imam_maghrib_isya"),
  khatib_jumat: text("khatib_jumat"),
  muazin_subuh: text("muazin_subuh"),
  muazin_maghrib_isya: text("muazin_maghrib_isya"),

  created_by: uuid("created_by").references(() => profiles.id),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  deleted_at: timestamp("deleted_at", { withTimezone: true }),
}, (t) => [
  index("jadwal_mosque_idx").on(t.mosque_id),
  index("jadwal_tanggal_idx").on(t.tanggal),
]);

/* ============================== PEGAWAI MASJID ============================== */

/** Pegawai masjid — marbot, muazin, imam tetap, guru kajian, security, kebersihan. */
export const employees = pgTable("employees", {
  id: uuid("id").defaultRandom().primaryKey(),
  mosque_id: uuid("mosque_id").notNull().references(() => mosques.id, { onDelete: "cascade" }),

  name: text("name").notNull(),
  phone: text("phone"),
  position: text("position").notNull(),       // Marbot, Muazin, Imam Tetap, Guru Kajian, Security, Kebersihan
  salary: bigint("salary", { mode: "number" }).default(0),
  salary_period: text("salary_period").default("Bulanan"),  // Bulanan, Mingguan, Per-Kajian
  subject: text("subject"),                    // khusus Guru Kajian: Tafsir, Hadits, Fiqih, dll
  schedule: text("schedule"),                  // jadwal mengajar: "Senin 19:00 WIB"
  join_date: date("join_date"),
  status: text("status").default("Aktif"),     // Aktif, Nonaktif, Resign
  notes: text("notes"),

  created_by: uuid("created_by").references(() => profiles.id),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  deleted_at: timestamp("deleted_at", { withTimezone: true }),
}, (t) => [
  index("employees_mosque_idx").on(t.mosque_id),
  index("employees_position_idx").on(t.mosque_id, t.position),
]);

/* ============================== BANTUAN MUKIM/MUSAFIR ============================== */

/** Bantuan insidental untuk musafir/mukim — cegah double-claim via nik_hash. */
export const mushafir_aid = pgTable("mushafir_aid", {
  id: uuid("id").defaultRandom().primaryKey(),
  mosque_id: uuid("mosque_id").notNull().references(() => mosques.id, { onDelete: "cascade" }),

  name: text("name").notNull(),
  phone: text("phone"),
  nik_hash: text("nik_hash"),                  // SHA-256 NIK untuk dedup — anti double-claim
  address: text("address"),
  photo_ktp_url: text("photo_ktp_url"),        // foto KTP

  lat: doublePrecision("lat"),
  lng: doublePrecision("lng"),

  aid_type: text("aid_type").notNull(),        // Uang Tunai, Sembako, Transport, Obat
  amount: bigint("amount", { mode: "number" }).default(0),
  notes: text("notes"),
  given_date: date("given_date").notNull(),

  verified_by: uuid("verified_by").references(() => profiles.id),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  deleted_at: timestamp("deleted_at", { withTimezone: true }),
}, (t) => [
  index("mushafir_mosque_idx").on(t.mosque_id),
  index("mushafir_nik_hash_idx").on(t.nik_hash),
  index("mushafir_given_date_idx").on(t.given_date),
]);

/* ============================== INVENTARIS ============================== */

/** Inventaris / aset masjid. */
export const inventaris = pgTable("inventaris", {
  id: uuid("id").defaultRandom().primaryKey(),
  mosque_id: uuid("mosque_id").notNull().references(() => mosques.id, { onDelete: "cascade" }),
  nama_barang: text("nama_barang").notNull(),
  jumlah: integer("jumlah").default(1),
  satuan: text("satuan").default("Unit"),
  kondisi: text("kondisi").default("Baik"),
  asal: text("asal").default("Wakaf"),

  created_by: uuid("created_by").references(() => profiles.id),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  deleted_at: timestamp("deleted_at", { withTimezone: true }),
}, (t) => [
  index("inventaris_mosque_idx").on(t.mosque_id),
]);

/* ============================== TESTIMONIALS ============================== */

/** Testimonial penerima manfaat. */
export const testimonials = pgTable("testimonials", {
  id: uuid("id").defaultRandom().primaryKey(),
  mosque_id: uuid("mosque_id").notNull().references(() => mosques.id, { onDelete: "cascade" }),
  mustahik_id: uuid("mustahik_id").references(() => mustahiks.id, { onDelete: "set null" }),
  nama: text("nama").notNull(),
  usia: integer("usia"),
  title: text("title"),
  story: text("story").notNull(),
  ring: text("ring"),
  durasi_bulan: integer("durasi_bulan"),
  image_url: text("image_url"),
  is_active: boolean("is_active").default(true),

  created_by: uuid("created_by").references(() => profiles.id),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  deleted_at: timestamp("deleted_at", { withTimezone: true }),
}, (t) => [
  index("testimonials_mosque_idx").on(t.mosque_id),
  index("testimonials_active_idx").on(t.mosque_id, t.is_active),
]);

/* ============================== DIREKTORI JAMAAH ============================== */

/** Database jamaah / warga sekitar (berbeda dari profiles yang untuk login). */
export const jamaah = pgTable("jamaah", {
  id: uuid("id").defaultRandom().primaryKey(),
  mosque_id: uuid("mosque_id").notNull().references(() => mosques.id, { onDelete: "cascade" }),
  nama: text("nama").notNull(),
  phone: text("phone"),
  alamat: text("alamat"),
  rt_rw: text("rt_rw"),
  peran: text("peran").default("Warga"),

  created_by: uuid("created_by").references(() => profiles.id),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  deleted_at: timestamp("deleted_at", { withTimezone: true }),
}, (t) => [
  index("jamaah_mosque_idx").on(t.mosque_id),
]);

/* ============================== ACTIVITY FEED ============================== */

/** Feed aktivitas real-time (donasi, mustahik, BUMM) untuk landing page. */
export const activity_feed = pgTable("activity_feed", {
  id: uuid("id").defaultRandom().primaryKey(),
  mosque_id: uuid("mosque_id").notNull().references(() => mosques.id, { onDelete: "cascade" }),
  type: text("type").notNull(),         // donation, zakat, bumm, mustahik
  nama: text("nama").notNull(),
  alamat: text("alamat"),
  detail: text("detail"),
  jumlah: bigint("jumlah", { mode: "number" }),

  created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (t) => [
  index("feed_mosque_idx").on(t.mosque_id),
  index("feed_created_idx").on(t.created_at),
]);

/* ============================== ASNAF ============================== */

/** 8 golongan asnaf penerima zakat (QS. At-Taubah: 60). */
export const asnaf = pgTable("asnaf", {
  id: uuid("id").defaultRandom().primaryKey(),
  mosque_id: uuid("mosque_id").notNull().references(() => mosques.id, { onDelete: "cascade" }),
  code: text("code").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  arabic_name: text("arabic_name"),
  quran_ayat: text("quran_ayat"),
  priority: integer("priority").default(0),
  is_active: boolean("is_active").default(true),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (t) => [
  index("asnaf_mosque_idx").on(t.mosque_id),
]);

/* ============================== MUZZAKI ============================== */

/** Muzzaki — pembayar zakat (wajib, bukan donatur sukarela). */
export const muzzaki = pgTable("muzzaki", {
  id: uuid("id").defaultRandom().primaryKey(),
  mosque_id: uuid("mosque_id").notNull().references(() => mosques.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  phone: text("phone"),
  nik_encrypted: text("nik_encrypted"),
  nik_hash: text("nik_hash"),
  address: text("address"),
  muzzaki_type: text("muzzaki_type").default("perseorangan"),
  is_regular: boolean("is_regular").default(false),
  last_asset_value: bigint("last_asset_value", { mode: "number" }).default(0),
  last_zakat_amount: bigint("last_zakat_amount", { mode: "number" }).default(0),
  last_zakat_year: integer("last_zakat_year"),
  notes: text("notes"),
  is_active: boolean("is_active").default(true),
  created_by: uuid("created_by").references(() => profiles.id),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  deleted_at: timestamp("deleted_at", { withTimezone: true }),
}, (t) => [
  index("muzzaki_mosque_idx").on(t.mosque_id),
  unique("muzzaki_nik_hash").on(t.nik_hash),
]);

/* ============================== ZAKAT PAYMENTS ============================== */

/** Riwayat pembayaran zakat (muzzaki → masjid). */
export const zakat_payments = pgTable("zakat_payments", {
  id: uuid("id").defaultRandom().primaryKey(),
  mosque_id: uuid("mosque_id").notNull().references(() => mosques.id, { onDelete: "cascade" }),
  muzzaki_id: uuid("muzzaki_id").references(() => muzzaki.id, { onDelete: "cascade" }),
  zakat_type: text("zakat_type").notNull(),
  amount: bigint("amount", { mode: "number" }).notNull(),
  asnaf_id: uuid("asnaf_id").references(() => asnaf.id),
  distribution_note: text("distribution_note"),
  payment_method: text("payment_method"),
  payment_status: text("payment_status").default("paid"),
  paid_at: timestamp("paid_at", { withTimezone: true }).defaultNow(),
  zakat_year: integer("zakat_year").notNull(),
  is_verified: boolean("is_verified").default(false),
  verified_by: uuid("verified_by").references(() => profiles.id),
  transaction_id: uuid("transaction_id").references(() => transactions.id, { onDelete: "set null" }),
  notes: text("notes"),
  idempotency_key: text("idempotency_key").unique(),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (t) => [
  index("zakat_payments_mosque_idx").on(t.mosque_id),
  index("zakat_payments_muzzaki_idx").on(t.muzzaki_id),
  index("zakat_payments_year_idx").on(t.mosque_id, t.zakat_year),
  index("zakat_payments_asnaf_idx").on(t.asnaf_id),
]);

/* ============================== WAKAF ASSETS ============================== */

/** Aset wakaf (AAOIFI SS-60, PSAK-112). */
export const wakaf_assets = pgTable("wakaf_assets", {
  id: uuid("id").defaultRandom().primaryKey(),
  mosque_id: uuid("mosque_id").notNull().references(() => mosques.id, { onDelete: "cascade" }),
  program_id: uuid("program_id").references(() => programs.id, { onDelete: "set null" }),
  asset_name: text("asset_name").notNull(),
  asset_type: text("asset_type").notNull(),
  description: text("description"),
  certificate_number: text("certificate_number"),
  certificate_date: date("certificate_date"),
  land_area: doublePrecision("land_area"),
  location: text("location"),
  lat: doublePrecision("lat"),
  lng: doublePrecision("lng"),
  nazhir_name: text("nazhir_name"),
  nazhir_type: text("nazhir_type").default("perorangan"),
  nazhir_phone: text("nazhir_phone"),
  nazhir_address: text("nazhir_address"),
  wakif_name: text("wakif_name"),
  wakif_phone: text("wakif_phone"),
  wakif_type: text("wakif_type").default("perseorangan"),
  beneficiary_type: text("beneficiary_type").default("umum"),
  beneficiary_description: text("beneficiary_description"),
  acquisition_value: bigint("acquisition_value", { mode: "number" }).default(0),
  current_value: bigint("current_value", { mode: "number" }).default(0),
  last_valuation_date: date("last_valuation_date"),
  status: text("status").default("aktif"),
  is_productive: boolean("is_productive").default(false),
  revenue_generated: bigint("revenue_generated", { mode: "number" }).default(0),
  notes: text("notes"),
  is_active: boolean("is_active").default(true),
  created_by: uuid("created_by").references(() => profiles.id),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  deleted_at: timestamp("deleted_at", { withTimezone: true }),
}, (t) => [
  index("wakaf_mosque_idx").on(t.mosque_id),
  index("wakaf_type_idx").on(t.mosque_id, t.asset_type),
  index("wakaf_productive_idx").on(t.mosque_id, t.is_productive),
  index("wakaf_status_idx").on(t.mosque_id, t.status),
]);

/* ============================== ZISWAF REQUESTS ============================== */

/** Permohonan ZISWAF dari jamaah. */
export const ziswaf_requests = pgTable("ziswaf_requests", {
  id: uuid("id").defaultRandom().primaryKey(),
  mosque_id: uuid("mosque_id").notNull().references(() => mosques.id, { onDelete: "cascade" }),
  requestor_name: text("requestor_name").notNull(),
  requestor_phone: text("requestor_phone"),
  type: text("type").notNull(),
  amount: bigint("amount", { mode: "number" }),
  description: text("description"),
  status: text("status").default("pending"),
  notes: text("notes"),
  reviewed_by: uuid("reviewed_by").references(() => profiles.id),
  reviewed_at: timestamp("reviewed_at", { withTimezone: true }),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (t) => [
  index("ziswaf_requests_mosque_idx").on(t.mosque_id),
  index("ziswaf_requests_status_idx").on(t.mosque_id, t.status),
]);

/* ============================== LOAN INSTALLMENTS ============================== */

/** Cicilan pinjaman qardhul hasan — skema harian/mingguan. */
export const loan_installments = pgTable("loan_installments", {
  id: uuid("id").defaultRandom().primaryKey(),
  loan_id: uuid("loan_id").notNull().references(() => loans.id, { onDelete: "cascade" }),
  amount_due: bigint("amount_due", { mode: "number" }).notNull(),
  amount_paid: bigint("amount_paid", { mode: "number" }).default(0),
  due_date: date("due_date"),
  paid_date: date("paid_date"),
  week_number: integer("week_number"),
  status: text("status").default("pending"),
  notes: text("notes"),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (t) => [
  index("installments_loan_idx").on(t.loan_id),
  index("installments_status_idx").on(t.loan_id, t.status),
]);

/* ============================== LOAN RESTRUCTURES ============================== */

/** Riwayat restrukturisasi pinjaman. */
export const loan_restructures = pgTable("loan_restructures", {
  id: uuid("id").defaultRandom().primaryKey(),
  loan_id: uuid("loan_id").notNull().references(() => loans.id, { onDelete: "cascade" }),
  old_amount: bigint("old_amount", { mode: "number" }).notNull(),
  new_amount: bigint("new_amount", { mode: "number" }).notNull(),
  old_weekly_payment: bigint("old_weekly_payment", { mode: "number" }).notNull(),
  new_weekly_payment: bigint("new_weekly_payment", { mode: "number" }).notNull(),
  old_week_duration: integer("old_week_duration").notNull(),
  new_week_duration: integer("new_week_duration").notNull(),
  reason: text("reason"),
  approved_by: uuid("approved_by").references(() => profiles.id),
  restructured_at: timestamp("restructured_at", { withTimezone: true }).defaultNow().notNull(),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (t) => [
  index("loan_restructures_loan_idx").on(t.loan_id),
]);
