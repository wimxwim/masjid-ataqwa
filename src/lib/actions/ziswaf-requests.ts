"use server";

import { db } from "@/db/client";
import { ziswaf_requests, audit_logs } from "@/db/schema";
import { requireAuth, requireRole } from "@/lib/auth/server";
import { resolveMosqueId } from "./_helpers";
import { eq, and, desc, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export type InsertZiswafRequest = {
  requestor_name: string;
  requestor_phone?: string | null;
  type: string;
  amount?: number | null;
  description?: string | null;
  status?: string;
  notes?: string | null;
};

export async function getZiswafRequests(mosqueId?: string) {
  const mid = await resolveMosqueId(mosqueId);
  await requireRole(mid, "superadmin", "admin_dkm", "social_lead");
  return db
    .select()
    .from(ziswaf_requests)
    .where(eq(ziswaf_requests.mosque_id, mid))
    .orderBy(desc(ziswaf_requests.created_at));
}

export async function getZiswafRequestById(id: string) {
  const [row] = await db.select().from(ziswaf_requests).where(eq(ziswaf_requests.id, id)).limit(1);
  return row ?? null;
}

export async function createZiswafRequest(data: InsertZiswafRequest) {
  const profile = await requireAuth();
  const mid = await resolveMosqueId();
  await requireRole(mid, "superadmin", "admin_dkm", "social_lead");

  const [row] = await db
    .insert(ziswaf_requests)
    .values({
      mosque_id: mid,
      requestor_name: data.requestor_name,
      requestor_phone: data.requestor_phone ?? null,
      type: data.type,
      amount: data.amount ?? null,
      description: data.description ?? null,
      status: data.status ?? "pending",
      notes: data.notes ?? null,
    })
    .returning();
  if (!row) throw new Error("Operation failed");

  await db.insert(audit_logs).values({
    mosque_id: mid,
    action: "insert",
    entity_type: "ziswaf_requests",
    entity_id: row.id,
    actor_id: profile.id,
    changes: data,
  });

  revalidatePath(`/admin`);
  return row;
}

export async function reviewZiswafRequest(id: string, status: string, notes?: string | null) {
  const profile = await requireAuth();
  const old = await getZiswafRequestById(id);
  if (!old) throw new Error("Permohonan tidak ditemukan");
  await requireRole(old.mosque_id, "superadmin", "admin_dkm", "social_lead");

  const [row] = await db
    .update(ziswaf_requests)
    .set({
      status,
      notes: notes ?? old.notes,
      reviewed_by: profile.id,
      reviewed_at: sql`NOW()`,
      updated_at: sql`NOW()`,
    })
    .where(eq(ziswaf_requests.id, id))
    .returning();

  await db.insert(audit_logs).values({
    mosque_id: old.mosque_id,
    action: "review",
    entity_type: "ziswaf_requests",
    entity_id: id,
    actor_id: profile.id,
    changes: { old_status: old.status, new_status: status },
  });

  revalidatePath(`/admin`);
  return row;
}
