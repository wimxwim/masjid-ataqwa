"use server";

import { db } from "@/db/client";
import { jamaah, audit_logs } from "@/db/schema";
import { requireAuth, requireRole } from "@/lib/auth/server";
import { resolveMosqueId } from "./_helpers";
import { eq, and, desc, isNull, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { createJamaahSchema } from "@/lib/validation";

export type InsertJamaah = {
  mosque_id: string;
  nama: string;
  phone?: string | null;
  alamat?: string | null;
  rt_rw?: string | null;
  peran?: string;
};

export async function getJamaah(mosqueId: string) {
  await requireRole(mosqueId, "superadmin", "admin_dkm");
  return db
    .select()
    .from(jamaah)
    .where(and(eq(jamaah.mosque_id, mosqueId), isNull(jamaah.deleted_at)))
    .orderBy(desc(jamaah.created_at));
}

export async function getJamaahById(id: string, mosqueId?: string) {
  const mid = mosqueId ?? await resolveMosqueId();
  const [row] = await db
    .select()
    .from(jamaah)
    .where(and(eq(jamaah.id, id), eq(jamaah.mosque_id, mid)))
    .limit(1);
  return row ?? null;
}

export async function createJamaah(data: InsertJamaah) {
  createJamaahSchema.parse(data);
  const profile = await requireAuth();
  await requireRole(data.mosque_id, "superadmin", "admin_dkm");
  const [row] = await db
    .insert(jamaah)
    .values({
      mosque_id: data.mosque_id,
      nama: data.nama,
      phone: data.phone ?? null,
      alamat: data.alamat ?? null,
      rt_rw: data.rt_rw ?? null,
      peran: data.peran ?? "Warga",
      created_by: profile.id,
    })
    .returning();
  if (!row) throw new Error("Operation failed");

  await db.insert(audit_logs).values({
    mosque_id: data.mosque_id,
    action: "insert",
    entity_type: "jamaah",
    entity_id: row.id,
    actor_id: profile.id,
    changes: data,
  });

  revalidatePath(`/admin/${data.mosque_id}/jamaah`);
  return row;
}

export async function updateJamaah(id: string, data: Partial<InsertJamaah>) {
  const profile = await requireAuth();
  const old = await getJamaahById(id);
  if (!old) throw new Error("Jamaah tidak ditemukan");
  await requireRole(old.mosque_id, "superadmin", "admin_dkm");

  const [row] = await db
    .update(jamaah)
    .set({ ...data, updated_at: sql`NOW()` })
    .where(eq(jamaah.id, id))
    .returning();
  if (!row) throw new Error("Operation failed");

  await db.insert(audit_logs).values({
    mosque_id: old.mosque_id,
    action: "update",
    entity_type: "jamaah",
    entity_id: id,
    actor_id: profile.id,
    changes: { old, new: data },
  });

  revalidatePath(`/admin/${old.mosque_id}/jamaah`);
  return row;
}

export async function deleteJamaah(id: string) {
  const profile = await requireAuth();
  const old = await getJamaahById(id);
  if (!old) throw new Error("Jamaah tidak ditemukan");
  await requireRole(old.mosque_id, "superadmin", "admin_dkm");

  await db
    .update(jamaah)
    .set({ deleted_at: sql`NOW()` })
    .where(eq(jamaah.id, id));

  await db.insert(audit_logs).values({
    mosque_id: old.mosque_id,
    action: "delete",
    entity_type: "jamaah",
    entity_id: id,
    actor_id: profile.id,
    changes: old,
  });

  revalidatePath(`/admin/${old.mosque_id}/jamaah`);
}
