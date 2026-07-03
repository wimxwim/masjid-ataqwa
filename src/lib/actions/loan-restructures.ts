"use server";

import { db } from "@/db/client";
import { loan_restructures, audit_logs, loans } from "@/db/schema";
import { requireAuth, requireRole } from "@/lib/auth/server";
import { resolveMosqueId } from "./_helpers";
import { eq, and, desc, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export type InsertLoanRestructure = {
  loan_id: string;
  old_amount: number;
  new_amount: number;
  old_weekly_payment: number;
  new_weekly_payment: number;
  old_week_duration: number;
  new_week_duration: number;
  reason?: string | null;
};

export async function getLoanRestructures(mosqueId?: string) {
  const mid = await resolveMosqueId(mosqueId);
  await requireRole(mid, "superadmin", "admin_dkm", "finance_director");
  return db
    .select()
    .from(loan_restructures)
    .innerJoin(loans, eq(loan_restructures.loan_id, loans.id))
    .where(eq(loans.mosque_id, mid))
    .orderBy(desc(loan_restructures.restructured_at));
}

export async function getLoanRestructuresByLoan(loanId: string) {
  const profile = await requireAuth();
  const mid = await resolveMosqueId();
  const [loan] = await db.select({ id: loans.id }).from(loans)
    .where(and(eq(loans.id, loanId), eq(loans.mosque_id, mid))).limit(1);
  if (!loan) throw new Error("Loan tidak ditemukan");

  return db
    .select()
    .from(loan_restructures)
    .where(eq(loan_restructures.loan_id, loanId))
    .orderBy(desc(loan_restructures.restructured_at));
}

export async function createLoanRestructure(data: InsertLoanRestructure) {
  const profile = await requireAuth();

  /* bungkus dalam transaction atomic — insert restructure log + update loan status
     harus sukses semua atau gagal semua, hindari data inkonsisten */
  const result = await db.transaction(async (tx) => {
    const [row] = await tx
      .insert(loan_restructures)
      .values({
        loan_id: data.loan_id,
        old_amount: data.old_amount,
        new_amount: data.new_amount,
        old_weekly_payment: data.old_weekly_payment,
        new_weekly_payment: data.new_weekly_payment,
        old_week_duration: data.old_week_duration,
        new_week_duration: data.new_week_duration,
        reason: data.reason ?? null,
        approved_by: profile.id,
      })
      .returning();
    if (!row) throw new Error("Operation failed");

    const [loan] = await tx
      .update(loans)
      .set({
        status: "restructured",
        restructured: true,
        restructured_at: sql`NOW()`,
      })
      .where(eq(loans.id, data.loan_id))
      .returning();

    if (!loan) throw new Error("Loan not found");

    await tx.insert(audit_logs).values({
      mosque_id: loan.mosque_id,
      action: "insert",
      entity_type: "loan_restructures",
      entity_id: row.id,
      actor_id: profile.id,
      changes: data,
    });

    return { row, loan };
  });

  revalidatePath("/bank-infaq");
  return result.row;
}
