"use server";

import { db } from "@/db/client";
import { programs, audit_logs } from "@/db/schema";
import { requireAuth, requireRole } from "@/lib/auth/server";
import { resolveMosqueId } from "./_helpers";
import { eq, and, desc, asc, isNull, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export type InsertProgram = {
  name: string;
  slug: string;
  description?: string | null;
  category?: string;
  is_active?: boolean;
  is_featured?: boolean;
  sort_order?: number;
};

export async function getPrograms(mosqueId?: string) {
  const mid = await resolveMosqueId(mosqueId);
  await requireRole(mid, "superadmin", "admin_dkm", "dakwah_lead");
  return db
    .select()
    .from(programs)
    .where(and(eq(programs.mosque_id, mid), isNull(programs.deleted_at)))
    .orderBy(asc(programs.sort_order), desc(programs.created_at));
}

export async function getProgram(id: string, mosqueId?: string) {
  const mid = mosqueId ?? await resolveMosqueId();
  const [row] = await db.select().from(programs).where(and(eq(programs.id, id), eq(programs.mosque_id, mid))).limit(1);
  return row ?? null;
}

export async function createProgram(data: InsertProgram) {
  const profile = await requireAuth();
  const mid = await resolveMosqueId();
  const [row] = await db
    .insert(programs)
    .values({
      mosque_id: mid,
      name: data.name,
      slug: data.slug,
      description: data.description ?? null,
      category: data.category ?? "sosial",
      is_active: data.is_active ?? false,
      is_featured: data.is_featured ?? false,
      sort_order: data.sort_order ?? 0,
      config: { icon: "quran", color: "#10b981", target_beneficiaries: 0, target_budget: 0 },
    })
    .returning();
  if (!row) throw new Error("Operation failed");

  await db.insert(audit_logs).values({
    mosque_id: mid,
    action: "insert",
    entity_type: "programs",
    entity_id: row.id,
    actor_id: profile.id,
    changes: data,
  });

  revalidatePath(`/admin`);
  return row;
}

export async function updateProgram(id: string, data: Partial<InsertProgram>) {
  const profile = await requireAuth();
  const old = await getProgram(id);
  if (!old) throw new Error("Program tidak ditemukan");
  await requireRole(old.mosque_id, "superadmin", "admin_dkm", "dakwah_lead");

  const [row] = await db
    .update(programs)
    .set({ ...data, updated_at: sql`NOW()` })
    .where(eq(programs.id, id))
    .returning();
  if (!row) throw new Error("Operation failed");

  await db.insert(audit_logs).values({
    mosque_id: old.mosque_id,
    action: "update",
    entity_type: "programs",
    entity_id: id,
    actor_id: profile.id,
    changes: { old, new: data },
  });

  revalidatePath(`/admin`);
  return row;
}

export async function deleteProgram(id: string) {
  const profile = await requireAuth();
  const old = await getProgram(id);
  if (!old) throw new Error("Program tidak ditemukan");
  await requireRole(old.mosque_id, "superadmin", "admin_dkm", "dakwah_lead");

  await db
    .update(programs)
    .set({ deleted_at: sql`NOW()` })
    .where(eq(programs.id, id));

  await db.insert(audit_logs).values({
    mosque_id: old.mosque_id,
    action: "delete",
    entity_type: "programs",
    entity_id: id,
    actor_id: profile.id,
    changes: old,
  });

  revalidatePath(`/admin`);
}
