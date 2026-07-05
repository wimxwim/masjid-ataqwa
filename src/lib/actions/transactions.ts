"use server";

import { db } from "@/db/client";
import { transactions, audit_logs, fundTypeEnum, akadTypeEnum } from "@/db/schema";
import { requireAuth, requireRole } from "@/lib/auth/server";
import { resolveMosqueId } from "./_helpers";
import { eq, and, desc, asc, isNull, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { createTransactionSchema } from "@/lib/validation";

export type FundType = "zakat_fitrah" | "zakat_maal" | "infaq_terikat" | "infaq_tidak_terikat" | "wakaf_pokok" | "wakaf_hasil" | "qardhul_hasan" | "non_halal";
export type AkadType = "tamlik" | "tabarru" | "wakaf" | "qardh";

export type InsertTransaction = {
  mosque_id: string;
  type: "Pemasukan" | "Pengeluaran";
  category: string;
  amount: number;
  description?: string | null;
  donor_name?: string | null;
  recipient_name?: string | null;
  phone?: string | null;
  notes?: string | null;
  transaction_date: string;
  fund_type?: FundType;
  akad_type?: AkadType;
  asnaf_type?: string;
  is_restricted?: boolean;
  wakif_name?: string;
  ikrar_wakaf_ref?: string;
};

/* ─── auto-detect fund_type dari category ─── */
const FUND_FROM_CATEGORY: [string, FundType][] = [
  ["Zakat Fitrah Beras/Uang", "zakat_fitrah"],
  ["Zakat Fitrah", "zakat_fitrah"],
  ["Zakat Maal", "zakat_maal"],
  ["Zakat", "zakat_maal"],
  ["Wakaf Produktif Domba", "wakaf_hasil"],
  ["Wakaf Uang Masjid", "wakaf_pokok"],
  ["Wakaf", "wakaf_pokok"],
  ["Infaq Program Anak Asuh", "infaq_terikat"],
  ["Infaq Bank Infaq Syariah", "qardhul_hasan"],
  ["Infaq", "infaq_tidak_terikat"],
  ["Sedekah", "infaq_tidak_terikat"],
  ["Qardhul Hasan", "qardhul_hasan"],
];

function detectFundType(category: string): FundType {
  for (const [prefix, fundType] of FUND_FROM_CATEGORY) {
    if (category.startsWith(prefix) || category.includes(prefix)) {
      return fundType;
    }
  }
  return "infaq_tidak_terikat";
}

/* ─── mapping fund_type → akad_type ─── */
const AKAD_MAP: Record<FundType, AkadType> = {
  zakat_fitrah: "tamlik",
  zakat_maal: "tamlik",
  infaq_terikat: "tabarru",
  infaq_tidak_terikat: "tabarru",
  wakaf_pokok: "wakaf",
  wakaf_hasil: "wakaf",
  qardhul_hasan: "qardh",
  non_halal: "tabarru",
};

/* ─── larangan syariah ─── */
function validateSyariah(data: {
  type: string;
  category: string;
  fund_type?: string | null;
  akad_type?: string | null;
}) {
  const ft = data.fund_type ?? detectFundType(data.category);

  // Berlaku untuk PEMASUKAN dan PENGELUARAN
  if (ft.startsWith("zakat_") && data.category.toLowerCase().includes("operasional")) {
    throw new Error("Dana zakat hanya boleh disalurkan ke 8 asnaf. Tidak untuk operasional masjid.");
  }

  if (ft.startsWith("wakaf_") && data.category.toLowerCase().includes("operasional")) {
    throw new Error("Dana wakaf tidak boleh digunakan untuk operasional masjid. Hanya untuk hasil/manfaat wakaf.");
  }

  // Cek akad khusus pemasukan
  if (data.type !== "Pemasukan") return;

  if (ft.startsWith("zakat_") && data.akad_type && data.akad_type !== "tamlik") {
    throw new Error("Akad zakat wajib tamlik (pemilikan). Tidak boleh dicampur akad lain.");
  }
}

export async function getTransactions(mosqueId: string, type?: "Pemasukan" | "Pengeluaran") {
  await requireRole(mosqueId, "superadmin", "admin_dkm", "finance_director");

  const conditions = [eq(transactions.mosque_id, mosqueId), isNull(transactions.deleted_at)];
  if (type) conditions.push(eq(transactions.type, type));

  return db
    .select()
    .from(transactions)
    .where(and(...conditions))
    .orderBy(desc(transactions.transaction_date), asc(transactions.created_at));
}

export async function getTransaction(id: string, mosqueId?: string) {
  await requireAuth();
  const mid = mosqueId ?? await resolveMosqueId();
  await requireRole(mid, "superadmin", "admin_dkm", "finance_director");
  const [row] = await db
    .select()
    .from(transactions)
    .where(and(eq(transactions.id, id), eq(transactions.mosque_id, mid)))
    .limit(1);
  return row ?? null;
}

export async function createTransaction(data: InsertTransaction) {
  createTransactionSchema.parse(data);
  const profile = await requireAuth();
  const mosqueId = data.mosque_id;
  await requireRole(mosqueId, "superadmin", "admin_dkm", "finance_director");

  if (data.amount <= 0) throw new Error("Jumlah transaksi harus lebih dari 0");

  const fundType: FundType = data.fund_type ?? detectFundType(data.category);
  const akadType: AkadType | null = data.akad_type ?? AKAD_MAP[fundType] ?? null;

  validateSyariah({ ...data, fund_type: fundType, akad_type: akadType });

  const [row] = await db.transaction(async (tx) => {
    const [inserted] = await tx
      .insert(transactions)
      .values({
        mosque_id: mosqueId,
        type: data.type,
        category: data.category,
        amount: Math.round(data.amount),
        description: data.description ?? null,
        donor_name: data.donor_name ?? null,
        recipient_name: data.recipient_name ?? null,
        phone: data.phone ?? null,
        notes: data.notes ?? null,
        transaction_date: data.transaction_date,
        fund_type: fundType,
        akad_type: akadType,
        asnaf_type: data.asnaf_type ?? null,
        is_restricted: data.is_restricted ?? null,
        wakif_name: data.wakif_name ?? null,
        ikrar_wakaf_ref: data.ikrar_wakaf_ref ?? null,
        created_by: profile.id,
      })
      .returning();
    if (!inserted) throw new Error("Operation failed");

    await tx.insert(audit_logs).values({
      mosque_id: mosqueId,
      action: "insert",
      entity_type: "transactions",
      entity_id: inserted.id,
      actor_id: profile.id,
      changes: data,
    });

    return [inserted];
  });

  revalidatePath(`/admin/${mosqueId}/keuangan`);
  return row;
}

/** Field yang boleh diedit client. Field identitas/audit tidak boleh ikut dari client. */
export type UpdateTransaction = Omit<
  Partial<InsertTransaction>,
  "mosque_id" | "created_at" | "created_by" | "deleted_at"
>;

export async function updateTransaction(
  id: string,
  data: UpdateTransaction,
) {
  const profile = await requireAuth();
  const old = await getTransaction(id);
  if (!old) throw new Error("Transaksi tidak ditemukan");

  await requireRole(old.mosque_id, "superadmin", "admin_dkm", "finance_director");

  if (data.amount !== undefined && data.amount <= 0) {
    throw new Error("Jumlah transaksi harus lebih dari 0");
  }

  const updateData: Record<string, unknown> = { ...data, updated_at: sql`NOW()` };

  if (data.fund_type || data.category) {
    const fundType: FundType = data.fund_type ?? old.fund_type ?? detectFundType(data.category ?? old.category);
    updateData.fund_type = fundType;
    if (!data.akad_type && !old.akad_type) {
      updateData.akad_type = AKAD_MAP[fundType] ?? null;
    }
    validateSyariah({ ...old, ...data, fund_type: fundType });
  }

  const [row] = await db
    .update(transactions)
    .set(updateData)
    .where(and(
      eq(transactions.id, id),
      eq(transactions.mosque_id, old.mosque_id),
    ))
    .returning();
  if (!row) throw new Error("Operation failed");

  await db.insert(audit_logs).values({
    mosque_id: old.mosque_id,
    action: "update",
    entity_type: "transactions",
    entity_id: id,
    actor_id: profile.id,
    changes: { old, new: data },
  });

  revalidatePath(`/admin/${old.mosque_id}/keuangan`);
  return row;
}

export async function deleteTransaction(id: string) {
  const profile = await requireAuth();
  const old = await getTransaction(id);
  if (!old) throw new Error("Transaksi tidak ditemukan");

  await requireRole(old.mosque_id, "superadmin", "admin_dkm", "finance_director");

  await db
    .update(transactions)
    .set({ deleted_at: sql`NOW()` })
    .where(eq(transactions.id, id));

  await db.insert(audit_logs).values({
    mosque_id: old.mosque_id,
    action: "delete",
    entity_type: "transactions",
    entity_id: id,
    actor_id: profile.id,
    changes: old,
  });

  revalidatePath(`/admin/${old.mosque_id}/keuangan`);
}
