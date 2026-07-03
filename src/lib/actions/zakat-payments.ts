"use server";

import { db } from "@/db/client";
import { zakat_payments, audit_logs, muzzaki } from "@/db/schema";
import { requireAuth, requireRole } from "@/lib/auth/server";
import { resolveMosqueId } from "./_helpers";
import { eq, and, desc, isNull, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export type InsertZakatPayment = {
  muzzaki_id?: string | null;
  zakat_type: string;
  amount: number;
  asnaf_id?: string | null;
  distribution_note?: string | null;
  payment_method?: string | null;
  payment_status?: string;
  zakat_year: number;
  is_verified?: boolean;
  notes?: string | null;
  transaction_id?: string | null;
};

export async function getZakatPayments(mosqueId?: string) {
  const mid = await resolveMosqueId(mosqueId);
  await requireRole(mid, "superadmin", "admin_dkm", "finance_director");
  return db
    .select()
    .from(zakat_payments)
    .where(eq(zakat_payments.mosque_id, mid))
    .orderBy(desc(zakat_payments.paid_at));
}

export async function getZakatPaymentById(id: string, mosqueId?: string) {
  const mid = mosqueId ?? await resolveMosqueId();
  const [row] = await db.select().from(zakat_payments).where(and(eq(zakat_payments.id, id), eq(zakat_payments.mosque_id, mid))).limit(1);
  return row ?? null;
}

export async function createZakatPayment(data: InsertZakatPayment) {
  const profile = await requireAuth();
  const mid = await resolveMosqueId();
  await requireRole(mid, "superadmin", "admin_dkm", "finance_director");

  const [row] = await db
    .insert(zakat_payments)
    .values({
      mosque_id: mid,
      muzzaki_id: data.muzzaki_id ?? null,
      zakat_type: data.zakat_type,
      amount: data.amount,
      asnaf_id: data.asnaf_id ?? null,
      distribution_note: data.distribution_note ?? null,
      payment_method: data.payment_method ?? null,
      payment_status: data.payment_status ?? "paid",
      zakat_year: data.zakat_year,
      is_verified: data.is_verified ?? true,
      verified_by: profile.id,
      notes: data.notes ?? null,
      transaction_id: data.transaction_id ?? null,
    })
    .returning();
  if (!row) throw new Error("Operation failed");

  await db.insert(audit_logs).values({
    mosque_id: mid,
    action: "insert",
    entity_type: "zakat_payments",
    entity_id: row.id,
    actor_id: profile.id,
    changes: data,
  });

  // Sync last_zakat_amount & last_zakat_year ke tabel muzzaki
  if (data.muzzaki_id) {
    await db
      .update(muzzaki)
      .set({
        last_zakat_amount: data.amount,
        last_zakat_year: data.zakat_year,
        updated_at: sql`NOW()`,
      })
      .where(eq(muzzaki.id, data.muzzaki_id));
  }

  revalidatePath(`/admin/muzzaki`);
  return row;
}

export async function verifyZakatPayment(id: string) {
  const profile = await requireAuth();
  const old = await getZakatPaymentById(id);
  if (!old) throw new Error("Pembayaran zakat tidak ditemukan");
  await requireRole(old.mosque_id, "superadmin", "admin_dkm", "finance_director");

  const [row] = await db
    .update(zakat_payments)
    .set({ is_verified: true, verified_by: profile.id })
    .where(eq(zakat_payments.id, id))
    .returning();

  revalidatePath(`/admin/muzzaki`);
  return row;
}
