"use server";

import { db } from "@/db/client";
import { donatur_tetap, audit_logs } from "@/db/schema";
import { requireAuth, requireRole } from "@/lib/auth/server";
import { resolveMosqueId } from "./_helpers";
import { eq, and, desc, isNull, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export type InsertDonatur = {
  mosque_id?: string;
  nama: string;
  phone?: string | null;
  alamat?: string | null;
  komitmen_bulanan?: number;
  aliran_dana?: string;
  program_spesifik?: string | null;
  frekuensi?: string;
  status?: string;
  riwayat_penerimaan?: unknown[];
};

export async function getDonaturTetap(mosqueId?: string) {
  const mid = await resolveMosqueId(mosqueId);
  await requireRole(mid, "superadmin", "admin_dkm", "finance_director");
  return db
    .select()
    .from(donatur_tetap)
    .where(and(eq(donatur_tetap.mosque_id, mid), isNull(donatur_tetap.deleted_at)))
    .orderBy(desc(donatur_tetap.created_at));
}

export async function getDonaturTetapById(id: string, mosqueId?: string) {
  const mid = mosqueId ?? await resolveMosqueId();
  const [row] = await db.select().from(donatur_tetap).where(and(eq(donatur_tetap.id, id), eq(donatur_tetap.mosque_id, mid))).limit(1);
  return row ?? null;
}

export async function createDonaturTetap(data: InsertDonatur) {
  const profile = await requireAuth();
  const mid = await resolveMosqueId(data.mosque_id);
  const [row] = await db
    .insert(donatur_tetap)
    .values({
      mosque_id: mid,
      nama: data.nama,
      phone: data.phone ?? null,
      alamat: data.alamat ?? null,
      komitmen_bulanan: data.komitmen_bulanan ?? 0,
      aliran_dana: data.aliran_dana ?? "Dana Operasional Masjid",
      program_spesifik: data.program_spesifik ?? null,
      frekuensi: data.frekuensi ?? "Bulanan",
      status: data.status ?? "Aktif",
      riwayat_penerimaan: data.riwayat_penerimaan ?? [],
      created_by: profile.id,
    })
    .returning();
  if (!row) throw new Error("Operation failed");

  await db.insert(audit_logs).values({
    mosque_id: mid,
    action: "insert",
    entity_type: "donatur_tetap",
    entity_id: row.id,
    actor_id: profile.id,
    changes: data,
  });

  revalidatePath(`/admin/donatur`);
  return row;
}

export async function updateDonaturTetap(id: string, data: Partial<InsertDonatur>) {
  const profile = await requireAuth();
  const old = await getDonaturTetapById(id);
  if (!old) throw new Error("Donatur tidak ditemukan");
  await requireRole(old.mosque_id, "superadmin", "admin_dkm", "finance_director");

  const [row] = await db
    .update(donatur_tetap)
    .set({ ...data, updated_at: sql`NOW()` })
    .where(eq(donatur_tetap.id, id))
    .returning();
  if (!row) throw new Error("Operation failed");

  await db.insert(audit_logs).values({
    mosque_id: old.mosque_id,
    action: "update",
    entity_type: "donatur_tetap",
    entity_id: id,
    actor_id: profile.id,
    changes: { old, new: data },
  });

  revalidatePath(`/admin/donatur`);
  return row;
}

export async function deleteDonaturTetap(id: string) {
  const profile = await requireAuth();
  const old = await getDonaturTetapById(id);
  if (!old) throw new Error("Donatur tidak ditemukan");
  await requireRole(old.mosque_id, "superadmin", "admin_dkm", "finance_director");

  await db
    .update(donatur_tetap)
    .set({ deleted_at: sql`NOW()` })
    .where(eq(donatur_tetap.id, id));

  await db.insert(audit_logs).values({
    mosque_id: old.mosque_id,
    action: "delete",
    entity_type: "donatur_tetap",
    entity_id: id,
    actor_id: profile.id,
    changes: old,
  });

  revalidatePath(`/admin/donatur`);
}
