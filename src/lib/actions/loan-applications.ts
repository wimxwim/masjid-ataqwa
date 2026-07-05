"use server";

import { db } from "@/db/client";
import { loan_applications, audit_logs } from "@/db/schema";
import { requireAuth, requireRole } from "@/lib/auth/server";
import { resolveMosqueId } from "./_helpers";
import { getDefaultMosque } from "./public";
import { encryptNik, hashNikServer } from "@/lib/nik-crypto";
import { verifyTurnstile } from "@/lib/turnstile";
import { eq, and, desc, sql, isNull } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { createLoanApplicationSchema } from "@/lib/validation";
import { rateLimit } from "@/lib/rate-limit";

export type InsertLoanApplication = {
  name: string;
  phone: string;
  nik: string;
  turnstileToken: string;
  home_status: string;
  business_name: string;
  business_type: string;
  business_age: string;
  business_address: string;
  amount: number;
  week_duration: number;
  purpose?: string | null;
};

export async function getLoanApplications(mosqueId?: string) {
  const mid = await resolveMosqueId(mosqueId);
  await requireRole(mid, "superadmin", "admin_dkm", "social_lead", "finance_director");
  return db
    .select()
    .from(loan_applications)
    .where(and(eq(loan_applications.mosque_id, mid), isNull(loan_applications.deleted_at)))
    .orderBy(desc(loan_applications.created_at));
}

export async function createLoanApplication(data: InsertLoanApplication) {
  createLoanApplicationSchema.parse(data);

  const rl = await rateLimit(data.phone);
  if (!rl.success) throw new Error("Terlalu banyak percobaan, coba lagi nanti.");

  const mosque = await getDefaultMosque();
  if (!mosque) throw new Error("Konfigurasi masjid belum tersedia.");
  const mid = mosque.id;

  const valid = await verifyTurnstile(data.turnstileToken);
  if (!valid) throw new Error("Verifikasi keamanan gagal. Refresh halaman dan coba lagi.");

  const [row] = await db
    .insert(loan_applications)
    .values({
      mosque_id: mid,
      name: data.name,
      phone: data.phone,
      nik_encrypted: encryptNik(data.nik),
      nik_hash: hashNikServer(data.nik),
      home_status: data.home_status,
      business_name: data.business_name,
      business_type: data.business_type,
      business_age: data.business_age,
      business_address: data.business_address,
      amount: data.amount,
      week_duration: data.week_duration,
      purpose: data.purpose ?? null,
      status: "pending",
    })
    .returning();
  if (!row) throw new Error("Gagal menyimpan pengajuan");

  revalidatePath(`/admin/sahabat-infaq`);
  return row;
}

export async function reviewLoanApplication(id: string, status: string, notes?: string | null) {
  const profile = await requireAuth();
  const [old] = await db
    .select()
    .from(loan_applications)
    .where(eq(loan_applications.id, id))
    .limit(1);
  if (!old) throw new Error("Pengajuan tidak ditemukan");
  await requireRole(old.mosque_id, "superadmin", "admin_dkm", "social_lead", "finance_director");

  const [row] = await db
    .update(loan_applications)
    .set({
      status,
      notes: notes ?? old.notes,
      reviewed_by: profile.id,
      reviewed_at: sql`NOW()`,
      updated_at: sql`NOW()`,
    })
    .where(eq(loan_applications.id, id))
    .returning();

  await db.insert(audit_logs).values({
    mosque_id: old.mosque_id,
    action: "review",
    entity_type: "loan_applications",
    entity_id: id,
    actor_id: profile.id,
    changes: { old_status: old.status, new_status: status },
  });

  revalidatePath(`/admin/sahabat-infaq`);
  return row;
}

export async function deleteLoanApplication(id: string) {
  const profile = await requireAuth();
  const [old] = await db
    .select()
    .from(loan_applications)
    .where(eq(loan_applications.id, id))
    .limit(1);
  if (!old) throw new Error("Pengajuan tidak ditemukan");
  await requireRole(old.mosque_id, "superadmin", "admin_dkm", "social_lead");

  await db
    .update(loan_applications)
    .set({ deleted_at: sql`NOW()` })
    .where(eq(loan_applications.id, id));

  await db.insert(audit_logs).values({
    mosque_id: old.mosque_id,
    action: "delete",
    entity_type: "loan_applications",
    entity_id: id,
    actor_id: profile.id,
    changes: old,
  });

  revalidatePath(`/admin/sahabat-infaq`);
}

