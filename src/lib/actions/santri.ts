"use server";

import { db } from "@/db/client";
import { santri, santri_attendance, santri_hafalan, audit_logs } from "@/db/schema";
import { requireAuth, requireRole } from "@/lib/auth/server";
import { resolveMosqueId } from "./_helpers";
import { eq, and, desc, asc, isNull, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export type InsertSantri = {
  mosque_id: string;
  program_id?: string | null;
  name: string;
  phone?: string | null;
  age?: number | null;
  parent_name?: string | null;
  parent_phone?: string | null;
  address?: string | null;
  level?: string;
  class_group?: string | null;
  join_date?: string | null;
  juz_terakhir?: number;
  surat_terakhir?: string | null;
};

export type InsertAttendance = {
  santri_id: string;
  date: string;
  status?: string;
  notes?: string | null;
};

export type InsertHafalan = {
  santri_id: string;
  date: string;
  surah: string;
  ayat_start?: number | null;
  ayat_end?: number | null;
  juz?: number | null;
  status?: string;
  notes?: string | null;
};

export async function getSantri(mosqueId?: string) {
  const mid = await resolveMosqueId(mosqueId);
  await requireRole(mid, "superadmin", "admin_dkm", "dakwah_lead");
  return db
    .select()
    .from(santri)
    .where(and(eq(santri.mosque_id, mid), isNull(santri.deleted_at)))
    .orderBy(desc(santri.created_at));
}

export async function getSantriById(id: string, mosqueId?: string) {
  const mid = mosqueId ?? await resolveMosqueId();
  const [row] = await db.select().from(santri).where(and(eq(santri.id, id), eq(santri.mosque_id, mid))).limit(1);
  return row ?? null;
}

export async function getSantriByProgram(mosqueId: string, programId: string) {
  const mid = await resolveMosqueId(mosqueId);
  await requireRole(mid, "superadmin", "admin_dkm", "dakwah_lead");
  return db
    .select()
    .from(santri)
    .where(
      and(
        eq(santri.mosque_id, mid),
        eq(santri.program_id, programId),
        isNull(santri.deleted_at),
      ),
    )
    .orderBy(desc(santri.created_at));
}

export async function createSantri(data: InsertSantri) {
  const profile = await requireAuth();
  const mosqueId = await resolveMosqueId(data.mosque_id);
  await requireRole(mosqueId, "superadmin", "admin_dkm", "dakwah_lead");

  const [row] = await db
    .insert(santri)
    .values({
      mosque_id: mosqueId,
      program_id: data.program_id ?? null,
      name: data.name,
      phone: data.phone ?? null,
      age: data.age ?? null,
      parent_name: data.parent_name ?? null,
      parent_phone: data.parent_phone ?? null,
      address: data.address ?? null,
      level: data.level ?? "tahsin",
      class_group: data.class_group ?? null,
      join_date: data.join_date ?? null,
      juz_terakhir: data.juz_terakhir ?? 0,
      surat_terakhir: data.surat_terakhir ?? null,
      created_by: profile.id,
    })
    .returning();
  if (!row) throw new Error("Operation failed");

  await db.insert(audit_logs).values({
    mosque_id: mosqueId,
    action: "insert",
    entity_type: "santri",
    entity_id: row.id,
    actor_id: profile.id,
    changes: data,
  });

  revalidatePath(`/admin/santri`);
  return row;
}

export async function updateSantri(id: string, data: Partial<InsertSantri>) {
  const profile = await requireAuth();
  const old = await getSantriById(id);
  if (!old) throw new Error("Santri tidak ditemukan");
  await requireRole(old.mosque_id, "superadmin", "admin_dkm", "dakwah_lead");

  const [row] = await db
    .update(santri)
    .set({ ...data, updated_at: sql`NOW()` })
    .where(eq(santri.id, id))
    .returning();
  if (!row) throw new Error("Operation failed");

  await db.insert(audit_logs).values({
    mosque_id: old.mosque_id,
    action: "update",
    entity_type: "santri",
    entity_id: id,
    actor_id: profile.id,
    changes: { old, new: data },
  });

  revalidatePath(`/admin/santri`);
  revalidatePath(`/admin/santri/${id}`);
  return row;
}

export async function deleteSantri(id: string) {
  const profile = await requireAuth();
  const old = await getSantriById(id);
  if (!old) throw new Error("Santri tidak ditemukan");
  await requireRole(old.mosque_id, "superadmin", "admin_dkm", "dakwah_lead");

  await db
    .update(santri)
    .set({ deleted_at: sql`NOW()` })
    .where(eq(santri.id, id));

  await db.insert(audit_logs).values({
    mosque_id: old.mosque_id,
    action: "delete",
    entity_type: "santri",
    entity_id: id,
    actor_id: profile.id,
    changes: old,
  });

  revalidatePath(`/admin/santri`);
}

/* ─── Attendance ─── */

export async function getAttendance(santriId: string) {
  return db
    .select()
    .from(santri_attendance)
    .where(eq(santri_attendance.santri_id, santriId))
    .orderBy(desc(santri_attendance.date));
}

export async function recordAttendance(data: InsertAttendance) {
  const profile = await requireAuth();
  const old = await getSantriById(data.santri_id);
  if (!old) throw new Error("Santri tidak ditemukan");

  const rows = await db
    .insert(santri_attendance)
    .values({
      santri_id: data.santri_id,
      date: data.date,
      status: data.status ?? "hadir",
      notes: data.notes ?? null,
      recorded_by: profile.id,
    })
    .onConflictDoUpdate({
      target: [santri_attendance.santri_id, santri_attendance.date],
      set: {
        status: data.status ?? "hadir",
        notes: data.notes ?? null,
        recorded_by: profile.id,
      },
    })
    .returning();

  const saved = rows[0];
  await db.insert(audit_logs).values({
    mosque_id: old.mosque_id,
    action: "upsert",
    entity_type: "santri_attendance",
    entity_id: saved?.id ?? "",
    actor_id: profile.id,
    changes: data,
  });

  revalidatePath(`/admin/santri/${data.santri_id}`);
  return saved;
}

/* ─── Hafalan ─── */

export async function getHafalan(santriId: string) {
  return db
    .select()
    .from(santri_hafalan)
    .where(eq(santri_hafalan.santri_id, santriId))
    .orderBy(desc(santri_hafalan.date));
}

export async function createHafalan(data: InsertHafalan) {
  const profile = await requireAuth();
  const old = await getSantriById(data.santri_id);
  if (!old) throw new Error("Santri tidak ditemukan");

  const [row] = await db
    .insert(santri_hafalan)
    .values({
      santri_id: data.santri_id,
      date: data.date,
      surah: data.surah,
      ayat_start: data.ayat_start ?? null,
      ayat_end: data.ayat_end ?? null,
      juz: data.juz ?? null,
      status: data.status ?? "baru",
      notes: data.notes ?? null,
      recorded_by: profile.id,
    })
    .returning();
  if (!row) throw new Error("Operation failed");

  await db.insert(audit_logs).values({
    mosque_id: old.mosque_id,
    action: "insert",
    entity_type: "santri_hafalan",
    entity_id: row.id,
    actor_id: profile.id,
    changes: data,
  });

  revalidatePath(`/admin/santri/${data.santri_id}`);
  return row;
}

export async function deleteHafalan(id: string) {
  const profile = await requireAuth();
  const [hafalan] = await db
    .select()
    .from(santri_hafalan)
    .where(eq(santri_hafalan.id, id))
    .limit(1);
  if (!hafalan) throw new Error("Hafalan tidak ditemukan");

  const [s] = await db.select({ mosque_id: santri.mosque_id }).from(santri).where(eq(santri.id, hafalan.santri_id)).limit(1);

  await db.delete(santri_hafalan).where(eq(santri_hafalan.id, id));

  await db.insert(audit_logs).values({
    mosque_id: s?.mosque_id ?? "",
    action: "delete",
    entity_type: "santri_hafalan",
    entity_id: id,
    actor_id: profile.id,
    changes: hafalan,
  });

  revalidatePath(`/admin/santri/${hafalan.santri_id}`);
}
