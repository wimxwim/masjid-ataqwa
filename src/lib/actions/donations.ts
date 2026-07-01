"use server";

import { db } from "@/db/client";
import { donations, activity_feed, audit_logs } from "@/db/schema";
import { requireAuth } from "@/lib/auth/server";
import { eq, and, desc, isNull, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";

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
  if (data.amount <= 0) throw new Error("Jumlah donasi harus lebih dari 0");

  const [row] = await db
    .insert(donations)
    .values({
      mosque_id: data.mosque_id,
      donor_name: data.donor_name ?? null,
      donor_phone: data.donor_phone ?? null,
      amount: data.amount,
      akad_type: data.akad_type,
      program_name: data.program_name ?? null,
      payment_method: (data.payment_method ?? "transfer") as "qris" | "transfer" | "tunai" | "kitabisa",
      payment_status: (data.payment_status ?? "paid") as "pending" | "paid" | "failed" | "refunded",
      paid_at: sql`NOW()`,
    })
    .returning();
  if (!row) throw new Error("Gagal menyimpan donasi");

  await db.insert(activity_feed).values({
    mosque_id: data.mosque_id,
    type: "donation",
    nama: data.donor_name ?? "Anonim",
    detail: data.program_name ?? data.akad_type,
    jumlah: data.amount,
  });

  await db.insert(audit_logs).values({
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

  revalidatePath("/");
  revalidatePath("/donasi");
  return row;
}
