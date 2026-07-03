"use server";

import { db } from "@/db/client";
import { muzzaki, audit_logs } from "@/db/schema";
import { requireAuth, requireRole } from "@/lib/auth/server";
import { resolveMosqueId } from "./_helpers";
import { eq, and, desc, isNull, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export type InsertMuzzaki = {
  name: string;
  phone?: string | null;
  nik_encrypted?: string | null;
  nik_hash?: string | null;
  address?: string | null;
  muzzaki_type?: string;
  is_regular?: boolean;
  last_asset_value?: number;
  last_zakat_amount?: number;
  last_zakat_year?: number | null;
  notes?: string | null;
};

export async function getMuzzakiList(mosqueId?: string) {
  const mid = await resolveMosqueId(mosqueId);
  await requireRole(mid, "superadmin", "admin_dkm", "finance_director");
  return db
    .select()
    .from(muzzaki)
    .where(and(eq(muzzaki.mosque_id, mid), isNull(muzzaki.deleted_at)))
    .orderBy(desc(muzzaki.created_at));
}

export async function getMuzzakiById(id: string, mosqueId?: string) {
  const mid = mosqueId ?? await resolveMosqueId();
  const [row] = await db.select().from(muzzaki).where(and(eq(muzzaki.id, id), eq(muzzaki.mosque_id, mid))).limit(1);
  return row ?? null;
}

export async function createMuzzaki(data: InsertMuzzaki) {
  const profile = await requireAuth();
  const mid = await resolveMosqueId();
  await requireRole(mid, "superadmin", "admin_dkm", "finance_director");
  const [row] = await db
    .insert(muzzaki)
    .values({
      mosque_id: mid,
      name: data.name,
      phone: data.phone ?? null,
      nik_encrypted: data.nik_encrypted ?? null,
      nik_hash: data.nik_hash ?? null,
      address: data.address ?? null,
      muzzaki_type: data.muzzaki_type ?? "perseorangan",
      is_regular: data.is_regular ?? false,
      last_asset_value: data.last_asset_value ?? 0,
      last_zakat_amount: data.last_zakat_amount ?? 0,
      last_zakat_year: data.last_zakat_year ?? null,
      notes: data.notes ?? null,
      created_by: profile.id,
    })
    .returning();
  if (!row) throw new Error("Operation failed");

  await db.insert(audit_logs).values({
    mosque_id: mid,
    action: "insert",
    entity_type: "muzzaki",
    entity_id: row.id,
    actor_id: profile.id,
    changes: data,
  });

  revalidatePath(`/admin/muzzaki`);
  return row;
}

export async function updateMuzzaki(id: string, data: Partial<InsertMuzzaki>) {
  const profile = await requireAuth();
  const old = await getMuzzakiById(id);
  if (!old) throw new Error("Muzzaki tidak ditemukan");
  await requireRole(old.mosque_id, "superadmin", "admin_dkm", "finance_director");

  const [row] = await db
    .update(muzzaki)
    .set({ ...data, updated_at: sql`NOW()` })
    .where(eq(muzzaki.id, id))
    .returning();
  if (!row) throw new Error("Operation failed");

  await db.insert(audit_logs).values({
    mosque_id: old.mosque_id,
    action: "update",
    entity_type: "muzzaki",
    entity_id: id,
    actor_id: profile.id,
    changes: { old, new: data },
  });

  revalidatePath(`/admin/muzzaki`);
  return row;
}

export async function deleteMuzzaki(id: string) {
  const profile = await requireAuth();
  const old = await getMuzzakiById(id);
  if (!old) throw new Error("Muzzaki tidak ditemukan");
  await requireRole(old.mosque_id, "superadmin", "admin_dkm", "finance_director");

  await db
    .update(muzzaki)
    .set({ deleted_at: sql`NOW()` })
    .where(eq(muzzaki.id, id));

  await db.insert(audit_logs).values({
    mosque_id: old.mosque_id,
    action: "delete",
    entity_type: "muzzaki",
    entity_id: id,
    actor_id: profile.id,
    changes: old,
  });

  revalidatePath(`/admin/muzzaki`);
}
