import { z } from "zod";

/* ─── Shared primitives ─── */
export const uuid = z.string().uuid();
export const phone = z.string().min(8).max(20).regex(/^[+\d][\d\s-]*$/);
export const nominal = z.number().int().min(1);

/* ─── Donations ─── */
export const akadTypeEnum = z.enum(["zakat_fitrah", "zakat_mal", "infaq", "sedekah", "wakaf", "fidyah"]);

export const createDonationSchema = z.object({
  mosque_id: uuid,
  donor_name: z.string().max(100).nullable().optional(),
  donor_phone: phone.nullable().optional(),
  amount: nominal,
  akad_type: akadTypeEnum,
  program_name: z.string().max(200).nullable().optional(),
  payment_method: z.string().max(20).optional(),
  payment_status: z.string().max(20).optional(),
});

/* ─── Mustahik ─── */
export const createMustahikSchema = z.object({
  mosque_id: uuid,
  name: z.string().min(1).max(200),
  phone: phone.nullable().optional(),
  nik: z.string().min(16).max(20).nullable().optional(),
  address: z.string().max(500).nullable().optional(),
  asnaf_id: uuid.nullable().optional(),
  sub_asnaf: z.string().max(100).nullable().optional(),
  had_kifayah_score: z.number().int().min(0).max(100).optional(),
  nomor_induk_mustahik: z.string().max(50).nullable().optional(),
  program_type: z.string().max(50).nullable().optional(),
  keterangan: z.string().max(500).nullable().optional(),
});

export const updateMustahikSchema = createMustahikSchema.partial();

/* ─── Loan Applications ─── */
export const createLoanApplicationSchema = z.object({
  name: z.string().min(1).max(200),
  phone: phone,
  nik: z.string().min(16).max(20),
  home_status: z.string().min(1).max(50),
  business_name: z.string().min(1).max(200),
  business_type: z.string().min(1).max(100),
  business_age: z.string().min(1).max(50),
  business_address: z.string().min(1).max(500),
  amount: nominal,
  week_duration: z.number().int().min(1).max(104),
  purpose: z.string().max(500).optional(),
  turnstileToken: z.string().min(1),
});

/* ─── Transactions ─── */
export const createTransactionSchema = z.object({
  mosque_id: uuid,
  type: z.enum(["Pemasukan", "Pengeluaran"]),
  category: z.string().min(1).max(200),
  amount: nominal,
  description: z.string().max(500).nullable().optional(),
  donor_name: z.string().max(100).nullable().optional(),
  phone: phone.nullable().optional(),
  transaction_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  fund_type: z.string().max(50).optional(),
  akad_type: akadTypeEnum.nullable().optional(),
});

/* ─── Employees ─── */
export const createEmployeeSchema = z.object({
  mosque_id: uuid,
  name: z.string().min(1).max(200),
  phone: phone.nullable().optional(),
  position: z.string().max(100).nullable().optional(),
  salary: nominal.nullable().optional(),
  is_active: z.boolean().optional(),
});

/* ─── Jamaah ─── */
export const createJamaahSchema = z.object({
  mosque_id: uuid,
  name: z.string().min(1).max(200),
  phone: phone.nullable().optional(),
  address: z.string().max(500).nullable().optional(),
});

/* ─── Inventaris ─── */
export const createInventarisSchema = z.object({
  mosque_id: uuid,
  name: z.string().min(1).max(200),
  quantity: z.number().int().min(1),
  condition: z.string().max(50).optional(),
  notes: z.string().max(500).nullable().optional(),
});
