"use server";

import { db } from "@/db/client";
import { loan_installments, loans, audit_logs } from "@/db/schema";
import { requireAuth, requireRole } from "@/lib/auth/server";
import { resolveMosqueId } from "./_helpers";
import { eq, and, desc, asc, sql, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export type InsertLoanInstallment = {
  loan_id: string;
  amount_due: number;
  amount_paid?: number;
  due_date?: string | null;
  paid_date?: string | null;
  week_number?: number | null;
  status?: string;
  notes?: string | null;
};

export async function getLoanInstallments(loanId: string) {
  const profile = await requireAuth();
  const mid = await resolveMosqueId();
  await requireRole(mid, "superadmin", "admin_dkm", "finance_director");
  const [loan] = await db.select({ id: loans.id }).from(loans)
    .where(and(eq(loans.id, loanId), eq(loans.mosque_id, mid))).limit(1);
  if (!loan) throw new Error("Loan tidak ditemukan");

  return db
    .select()
    .from(loan_installments)
    .where(eq(loan_installments.loan_id, loanId))
    .orderBy(asc(loan_installments.week_number));
}

export async function createLoanInstallment(data: InsertLoanInstallment) {
  const profile = await requireAuth();
  const [loan] = await db.select({ mosque_id: loans.mosque_id }).from(loans).where(eq(loans.id, data.loan_id)).limit(1);
  if (!loan) throw new Error("Loan tidak ditemukan");
  const mosque_id = loan.mosque_id;

  /* verifikasi akses — user harus punya membership aktif di masjid ini */
  await requireRole(mosque_id, "superadmin", "admin_dkm", "finance_director");

  const [row] = await db
    .insert(loan_installments)
    .values({
      loan_id: data.loan_id,
      amount_due: data.amount_due,
      amount_paid: data.amount_paid ?? 0,
      due_date: data.due_date ?? null,
      paid_date: data.paid_date ?? null,
      week_number: data.week_number ?? null,
      status: data.status ?? "pending",
      notes: data.notes ?? null,
    })
    .returning();
  if (!row) throw new Error("Operation failed");

  await db.insert(audit_logs).values({
    mosque_id,
    action: "insert",
    entity_type: "loan_installments",
    entity_id: row.id,
    actor_id: profile.id,
    changes: data,
  });

  revalidatePath(`/bank-infaq`);
  return row;
}

export async function payInstallment(id: string, amount_paid: number) {
  const profile = await requireAuth();
  const mid = await resolveMosqueId();
  await requireRole(mid, "superadmin", "admin_dkm", "finance_director");
  const old = await getLoanInstallmentById(id, mid);
  if (!old) throw new Error("Cicilan tidak ditemukan");

  const mosque_id = mid;

  /* validasi: jumlah bayar tidak boleh melebihi sisa cicilan */
  const alreadyPaid = old.amount_paid ?? 0;
  const remaining = old.amount_due - alreadyPaid;
  if (amount_paid > remaining) {
    throw new Error(
      `Jumlah bayar (Rp ${amount_paid.toLocaleString()}) melebihi sisa cicilan (Rp ${remaining.toLocaleString()})`,
    );
  }

  const isLunas = alreadyPaid + amount_paid >= old.amount_due;
  let row: typeof loan_installments.$inferSelect | undefined;

  await db.transaction(async (tx) => {
    /* atomic increment — bukan overwrite, hindari lost update */
    [row] = await tx
      .update(loan_installments)
      .set({
        amount_paid: sql`COALESCE(${loan_installments.amount_paid}, 0) + ${amount_paid}`,
        paid_date: sql`CURRENT_DATE`,
        status: isLunas ? "paid" : "late",
      })
      .where(eq(loan_installments.id, id))
      .returning();

    /* update total_paid di tabel loans — atomic increment */
    await tx
      .update(loans)
      .set({
        total_paid: sql`COALESCE(${loans.total_paid}, 0) + ${amount_paid}`,
        updated_at: sql`NOW()`,
      })
      .where(eq(loans.id, old.loan_id));

    await tx.insert(audit_logs).values({
      mosque_id,
      action: "pay",
      entity_type: "loan_installments",
      entity_id: id,
      actor_id: profile.id,
      changes: { old_amount: old.amount_paid, new_amount: amount_paid },
    });
  });

  if (!row) throw new Error("Gagal menyimpan pembayaran");

  revalidatePath(`/bank-infaq`);
  return row;
}

async function getLoanInstallmentById(id: string, mosqueId?: string) {
  const mid = mosqueId ?? await resolveMosqueId();
  const [row] = await db
    .select()
    .from(loan_installments)
    .where(
      and(
        eq(loan_installments.id, id),
        inArray(
          loan_installments.loan_id,
          db.select({ id: loans.id }).from(loans).where(eq(loans.mosque_id, mid))
        )
      )
    )
    .limit(1);
  return row ?? null;
}
