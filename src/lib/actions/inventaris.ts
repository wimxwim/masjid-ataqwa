"use server";

import { db } from "@/db/client";
import { inventaris, audit_logs } from "@/db/schema";
import { requireAuth, requireRole } from "@/lib/auth/server";
import { eq, and, desc, isNull, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export type InsertInventaris = {
  mosque_id: string;
  nama_barang: string;
  jumlah?: number;
  satuan?: string;
  kondisi?: string;
  asal?: string;
};

export async function getInventaris(mosqueId: string) {
  await requireRole(mosqueId, "superadmin", "admin_dkm");
  return db
    .select()
    .from(inventaris)
    .where(and(eq(inventaris.mosque_id, mosqueId), isNull(inventaris.deleted_at)))
    .orderBy(desc(inventaris.created_at));
}

export async function getInventarisById(id: string) {
  const [row] = await db.select().from(inventaris).where(eq(inventaris.id, id)).limit(1);
  return row ?? null;
}

export async function createInventaris(data: InsertInventaris) {
  const profile = await requireAuth();
  await requireRole(data.mosque_id, "superadmin", "admin_dkm");
  const [row] = await db
    .insert(inventaris)
    .values({
      mosque_id: data.mosque_id,
      nama_barang: data.nama_barang,
      jumlah: data.jumlah ?? 1,
      satuan: data.satuan ?? "Unit",
      kondisi: data.kondisi ?? "Baik",
      asal: data.asal ?? "Wakaf",
      created_by: profile.id,
    })
    .returning();
  if (!row) throw new Error("Operation failed");

  await db.insert(audit_logs).values({
    mosque_id: data.mosque_id,
    action: "insert",
    entity_type: "inventaris",
    entity_id: row.id,
    actor_id: profile.id,
    changes: data,
  });

  revalidatePath(`/admin/${data.mosque_id}/inventaris`);
  return row;
}

export async function updateInventaris(id: string, data: Partial<InsertInventaris>) {
  const profile = await requireAuth();
  const old = await getInventarisById(id);
  if (!old) throw new Error("Barang tidak ditemukan");
  await requireRole(old.mosque_id, "superadmin", "admin_dkm");

  const [row] = await db
    .update(inventaris)
    .set({ ...data, updated_at: sql`NOW()` })
    .where(eq(inventaris.id, id))
    .returning();
  if (!row) throw new Error("Operation failed");

  await db.insert(audit_logs).values({
    mosque_id: old.mosque_id,
    action: "update",
    entity_type: "inventaris",
    entity_id: id,
    actor_id: profile.id,
    changes: { old, new: data },
  });

  revalidatePath(`/admin/${old.mosque_id}/inventaris`);
  return row;
}

export async function deleteInventaris(id: string) {
  const profile = await requireAuth();
  const old = await getInventarisById(id);
  if (!old) throw new Error("Barang tidak ditemukan");
  await requireRole(old.mosque_id, "superadmin", "admin_dkm");

  await db
    .update(inventaris)
    .set({ deleted_at: sql`NOW()` })
    .where(eq(inventaris.id, id));

  await db.insert(audit_logs).values({
    mosque_id: old.mosque_id,
    action: "delete",
    entity_type: "inventaris",
    entity_id: id,
    actor_id: profile.id,
    changes: old,
  });

  revalidatePath(`/admin/${old.mosque_id}/inventaris`);
}
