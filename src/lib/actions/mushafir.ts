"use server";

import { db } from "@/db/client";
import { mushafir_aid, audit_logs } from "@/db/schema";
import { requireAuth, requireRole } from "@/lib/auth/server";
import { resolveMosqueId, validateImageUrl } from "./_helpers";
import { eq, and, desc, isNull, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export type InsertMushafir = {
  name: string;
  phone?: string | null;
  nik_hash?: string | null;
  address?: string | null;
  photo_ktp_url?: string | null;
  lat?: number | null;
  lng?: number | null;
  aid_type: string;
  amount?: number | null;
  notes?: string | null;
  given_date: string;
};

export async function getMushafirAid(mosqueId?: string) {
  const mid = await resolveMosqueId(mosqueId);
  await requireRole(mid, "superadmin", "admin_dkm", "social_lead", "finance_director");
  return db
    .select()
    .from(mushafir_aid)
    .where(and(eq(mushafir_aid.mosque_id, mid), isNull(mushafir_aid.deleted_at)))
    .orderBy(desc(mushafir_aid.given_date));
}

export async function getMushafirById(id: string, mosqueId?: string) {
  const mid = mosqueId ?? await resolveMosqueId();
  const [row] = await db.select().from(mushafir_aid).where(and(eq(mushafir_aid.id, id), eq(mushafir_aid.mosque_id, mid))).limit(1);
  return row ?? null;
}

export async function checkDuplicateNik(nikHash: string, mosqueId?: string) {
  const mid = mosqueId ?? await resolveMosqueId();
  const existing = await db
    .select()
    .from(mushafir_aid)
    .where(and(eq(mushafir_aid.nik_hash, nikHash), eq(mushafir_aid.mosque_id, mid)))
    .limit(1);
  return existing[0] ?? null;
}

export async function createMushafir(data: InsertMushafir) {
  const profile = await requireAuth();
  const mid = await resolveMosqueId();

  if (data.nik_hash) {
    const dup = await checkDuplicateNik(data.nik_hash, mid);
    if (dup) {
      throw new Error(`DUPLICATE:NIK sudah terdaftar atas nama "${dup.name}" pada ${dup.given_date}`);
    }
  }

  validateImageUrl(data.photo_ktp_url);

  const [row] = await db
    .insert(mushafir_aid)
    .values({
      mosque_id: mid,
      name: data.name,
      phone: data.phone ?? null,
      nik_hash: data.nik_hash ?? null,
      address: data.address ?? null,
      photo_ktp_url: data.photo_ktp_url ?? null,
      lat: data.lat ?? null,
      lng: data.lng ?? null,
      aid_type: data.aid_type,
      amount: data.amount ?? 0,
      notes: data.notes ?? null,
      given_date: data.given_date,
      verified_by: profile.id,
    })
    .returning();
  if (!row) throw new Error("Operation failed");

  await db.insert(audit_logs).values({
    mosque_id: mid,
    action: "insert",
    entity_type: "mushafir_aid",
    entity_id: row.id,
    actor_id: profile.id,
    changes: data,
  });

  revalidatePath(`/admin/mushafir`);
  return row;
}

export async function updateMushafir(id: string, data: Partial<InsertMushafir>) {
  const profile = await requireAuth();
  const old = await getMushafirById(id);
  if (!old) throw new Error("Data tidak ditemukan");
  await requireRole(old.mosque_id, "superadmin", "admin_dkm", "social_lead", "finance_director");
  if (data.photo_ktp_url !== undefined) validateImageUrl(data.photo_ktp_url);

  const [row] = await db
    .update(mushafir_aid)
    .set({ ...data, updated_at: sql`NOW()` })
    .where(eq(mushafir_aid.id, id))
    .returning();
  if (!row) throw new Error("Operation failed");

  await db.insert(audit_logs).values({
    mosque_id: old.mosque_id,
    action: "update",
    entity_type: "mushafir_aid",
    entity_id: id,
    actor_id: profile.id,
    changes: { old, new: data },
  });

  revalidatePath(`/admin/mushafir`);
  return row;
}

export async function deleteMushafir(id: string) {
  const profile = await requireAuth();
  const old = await getMushafirById(id);
  if (!old) throw new Error("Data tidak ditemukan");
  await requireRole(old.mosque_id, "superadmin", "admin_dkm", "social_lead", "finance_director");

  await db
    .update(mushafir_aid)
    .set({ deleted_at: sql`NOW()` })
    .where(eq(mushafir_aid.id, id));

  await db.insert(audit_logs).values({
    mosque_id: old.mosque_id,
    action: "delete",
    entity_type: "mushafir_aid",
    entity_id: id,
    actor_id: profile.id,
    changes: old,
  });

  revalidatePath(`/admin/mushafir`);
}
