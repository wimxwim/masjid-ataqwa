"use server";

import { db } from "@/db/client";
import { loans, sahabat_infaq_groups, audit_logs } from "@/db/schema";
import { resolveMosqueId } from "./_helpers";
import { eq, and, sql } from "drizzle-orm";
import { requireAuth, requireRole } from "@/lib/auth/server";

/**
 * NPF (Non-Performing Financing) Engine - Standar MRBJ 2026
 * Mengevaluasi seluruh pinjaman Qardhul Hasan yang aktif
 * Mengupdate status Kolektibilitas berdasarkan Keterlambatan (Weeks Overdue)
 */
export async function evaluateNPF(mosqueId?: string) {
  const profile = await requireAuth();
  const mid = await resolveMosqueId(mosqueId);
  
  // Pastikan hanya Direktur Keuangan / Superadmin yang bisa menjalankan mesin NPF
  await requireRole(mid, "superadmin", "finance_director");

  // 1. Ambil semua pinjaman aktif
  const activeLoans = await db
    .select()
    .from(loans)
    .where(and(eq(loans.mosque_id, mid), eq(loans.status, "active")));

  let updatedCount = 0;
  const changes = [];

  for (const loan of activeLoans) {
    const overdue = loan.weeks_overdue || 0;
    
    // Klasifikasi Kolektibilitas Standar Perbankan
    let newKolektibilitas: typeof loan.kolektibilitas = "1_lancar";
    if (overdue === 1 || overdue === 2) newKolektibilitas = "2_dpk";
    else if (overdue === 3 || overdue === 4) newKolektibilitas = "3_kurang_lancar";
    else if (overdue === 5 || overdue === 6) newKolektibilitas = "4_diragukan";
    else if (overdue >= 7) newKolektibilitas = "5_macet";

    if (loan.kolektibilitas !== newKolektibilitas) {
      await db
        .update(loans)
        .set({
          kolektibilitas: newKolektibilitas,
          last_assessment_at: sql`NOW()`,
          updated_at: sql`NOW()`,
        })
        .where(eq(loans.id, loan.id));
        
      changes.push({
        loan_id: loan.id,
        old_status: loan.kolektibilitas,
        new_status: newKolektibilitas,
        overdue_weeks: overdue,
      });
      updatedCount++;

      // Jika memburuk menjadi Macet (Tanggung Renteng Trigger)
      if (newKolektibilitas === "5_macet" && loan.group_id) {
        await db
          .update(sahabat_infaq_groups)
          .set({ npf_flag: true, updated_at: sql`NOW()` })
          .where(eq(sahabat_infaq_groups.id, loan.group_id));
      }
    }
  }

  // 2. Catat log investigasi ke sistem Audit (Sistem Mata Elang)
  if (updatedCount > 0) {
    await db.insert(audit_logs).values({
      mosque_id: mid,
      actor_id: profile.id,
      action: "evaluate_npf",
      entity_type: "loans",
      changes: changes,
      metadata: { total_evaluated: activeLoans.length, total_updated: updatedCount },
    });
  }

  return { success: true, evaluated: activeLoans.length, updated: updatedCount };
}
