"use server";

import { db } from "@/db/client";
import { jadwal_imam, audit_logs } from "@/db/schema";
import { requireAuth, requireRole } from "@/lib/auth/server";
import { resolveMosqueId } from "./_helpers";
import { eq, and, desc, isNull, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export type InsertJadwal = {
  mosque_id: string;
  tanggal: string;
  hari?: string | null;
  imam_subuh?: string | null;
  imam_maghrib_isya?: string | null;
  khatib_jumat?: string | null;
  muazin_subuh?: string | null;
  muazin_maghrib_isya?: string | null;
};

export async function getJadwalImam(mosqueId: string) {
  await requireRole(mosqueId, "superadmin", "admin_dkm");
  return db
    .select()
    .from(jadwal_imam)
    .where(and(eq(jadwal_imam.mosque_id, mosqueId), isNull(jadwal_imam.deleted_at)))
    .orderBy(desc(jadwal_imam.tanggal));
}

export async function getJadwalById(id: string, mosqueId?: string) {
  const mid = mosqueId ?? await resolveMosqueId();
  const [row] = await db
    .select()
    .from(jadwal_imam)
    .where(and(eq(jadwal_imam.id, id), eq(jadwal_imam.mosque_id, mid)))
    .limit(1);
  return row ?? null;
}

export async function createJadwal(data: InsertJadwal) {
  const profile = await requireAuth();
  await requireRole(data.mosque_id, "superadmin", "admin_dkm");
  const [row] = await db
    .insert(jadwal_imam)
    .values({
      mosque_id: data.mosque_id,
      tanggal: data.tanggal,
      hari: data.hari ?? null,
      imam_subuh: data.imam_subuh ?? null,
      imam_maghrib_isya: data.imam_maghrib_isya ?? null,
      khatib_jumat: data.khatib_jumat ?? null,
      muazin_subuh: data.muazin_subuh ?? null,
      muazin_maghrib_isya: data.muazin_maghrib_isya ?? null,
      created_by: profile.id,
    })
    .returning();
  if (!row) throw new Error("Operation failed");

  await db.insert(audit_logs).values({
    mosque_id: data.mosque_id,
    action: "insert",
    entity_type: "jadwal_imam",
    entity_id: row.id,
    actor_id: profile.id,
    changes: data,
  });

  revalidatePath(`/admin/${data.mosque_id}/jadwal`);
  return row;
}

export async function updateJadwal(id: string, data: Partial<InsertJadwal>) {
  const profile = await requireAuth();
  const old = await getJadwalById(id);
  if (!old) throw new Error("Jadwal tidak ditemukan");
  await requireRole(old.mosque_id, "superadmin", "admin_dkm");

  const [row] = await db
    .update(jadwal_imam)
    .set({ ...data, updated_at: sql`NOW()` })
    .where(eq(jadwal_imam.id, id))
    .returning();
  if (!row) throw new Error("Operation failed");

  await db.insert(audit_logs).values({
    mosque_id: old.mosque_id,
    action: "update",
    entity_type: "jadwal_imam",
    entity_id: id,
    actor_id: profile.id,
    changes: { old, new: data },
  });

  revalidatePath(`/admin/${old.mosque_id}/jadwal`);
  return row;
}

export async function deleteJadwal(id: string) {
  const profile = await requireAuth();
  const old = await getJadwalById(id);
  if (!old) throw new Error("Jadwal tidak ditemukan");
  await requireRole(old.mosque_id, "superadmin", "admin_dkm");

  await db
    .update(jadwal_imam)
    .set({ deleted_at: sql`NOW()` })
    .where(eq(jadwal_imam.id, id));

  await db.insert(audit_logs).values({
    mosque_id: old.mosque_id,
    action: "delete",
    entity_type: "jadwal_imam",
    entity_id: id,
    actor_id: profile.id,
    changes: old,
  });

  revalidatePath(`/admin/${old.mosque_id}/jadwal`);
}
