"use server";

import { db } from "@/db/client";
import {
  donations,
  activity_feed,
  audit_logs,
  transactions,
} from "@/db/schema";
import { requireAuth, requireRole } from "@/lib/auth/server";
import { CATEGORY_MAP } from "@/lib/fund-mapping";
import { eq, and, desc, isNull, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { createDonationSchema } from "@/lib/validation";

export type InsertDonation = {
  mosque_id: string;
  donor_name?: string | null;
  donor_phone?: string | null;
  amount: number;
  akad_type: "zakat_fitrah" | "zakat_mal" | "infaq" | "sedekah" | "wakaf" | "fidyah";
  program_name?: string | null;
  payment_method?: string | null;
  payment_status?: string;
};

export async function getDonations(mosqueId: string) {
  await requireAuth();
  return db
    .select()
    .from(donations)
    .where(and(eq(donations.mosque_id, mosqueId)))
    .orderBy(desc(donations.created_at));
}

export async function createDonation(data: InsertDonation) {
  createDonationSchema.parse(data);

  /* Only admin can set payment_status directly — public donations always start as pending */
  let userIsAdmin = false;
  try {
    await requireRole(data.mosque_id, "superadmin", "admin_dkm", "finance_director");
    userIsAdmin = true;
  } catch { /* public user — keep false */ }

  const paymentStatus = userIsAdmin ? (data.payment_status ?? "pending") : "pending";

  let row: typeof donations.$inferSelect | undefined;

  await db.transaction(async (tx) => {
    [row] = await tx
      .insert(donations)
      .values({
        mosque_id: data.mosque_id,
        donor_name: data.donor_name ?? null,
        donor_phone: data.donor_phone ?? null,
        amount: data.amount,
        akad_type: data.akad_type,
        program_name: data.program_name ?? null,
        payment_method: (data.payment_method ?? "transfer") as "qris" | "transfer" | "tunai" | "kitabisa",
        payment_status: paymentStatus as "pending" | "paid" | "failed" | "refunded",
        paid_at: paymentStatus === "paid" ? sql`NOW()` : null,
      })
      .returning();
    if (!row) throw new Error("Gagal menyimpan donasi");

    if (paymentStatus === "paid") {
      await tx.insert(activity_feed).values({
        mosque_id: data.mosque_id,
        type: "donation",
        nama: data.donor_name ?? "Anonim",
        detail: data.program_name ?? data.akad_type,
        jumlah: data.amount,
      });

      const m = CATEGORY_MAP[data.akad_type] ?? CATEGORY_MAP.infaq;
      const progLabel = data.program_name ? ` – ${data.program_name}` : "";
      const txValue: typeof transactions.$inferInsert = {
        mosque_id: data.mosque_id,
        type: "Pemasukan",
        category: `${m!.category}${progLabel}`,
        amount: data.amount,
        description: `Donasi online dari ${data.donor_name ?? "Anonim"}`,
        donor_name: data.donor_name ?? null,
        phone: data.donor_phone ?? null,
        transaction_date: new Date().toISOString().split("T")[0]!,
        fund_type: m!.fund_type,
        akad_type: m!.akad,
      };
      await tx.insert(transactions).values(txValue);
    }

    await tx.insert(audit_logs).values({
      mosque_id: data.mosque_id,
      action: "insert",
      entity_type: "donations",
      entity_id: row.id,
      metadata: {
        amount: data.amount,
        akad_type: data.akad_type,
        program_name: data.program_name,
        donor_name: data.donor_name,
      },
    });
  });

  if (!row) throw new Error("Gagal menyimpan donasi");

  revalidatePath("/");
  revalidatePath("/donasi");
  revalidatePath("/transparansi");
  return row;
}
