"use server";

import { db } from "@/db/client";
import { wakaf_assets, audit_logs } from "@/db/schema";
import { requireAuth, requireRole } from "@/lib/auth/server";
import { resolveMosqueId } from "./_helpers";
import { eq, and, desc, isNull, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export type InsertWakafAsset = {
  asset_name: string;
  asset_type: string;
  description?: string | null;
  certificate_number?: string | null;
  certificate_date?: string | null;
  land_area?: number | null;
  location?: string | null;
  lat?: number | null;
  lng?: number | null;
  nazhir_name?: string | null;
  nazhir_type?: string;
  nazhir_phone?: string | null;
  nazhir_address?: string | null;
  wakif_name?: string | null;
  wakif_phone?: string | null;
  wakif_type?: string;
  beneficiary_type?: string;
  beneficiary_description?: string | null;
  acquisition_value?: number;
  current_value?: number;
  last_valuation_date?: string | null;
  status?: string;
  is_productive?: boolean;
  revenue_generated?: number;
  notes?: string | null;
};

export async function getWakafAssets(mosqueId?: string) {
  const mid = await resolveMosqueId(mosqueId);
  return db
    .select()
    .from(wakaf_assets)
    .where(and(eq(wakaf_assets.mosque_id, mid), isNull(wakaf_assets.deleted_at)))
    .orderBy(desc(wakaf_assets.created_at));
}

export async function getWakafAssetById(id: string) {
  const [row] = await db.select().from(wakaf_assets).where(eq(wakaf_assets.id, id)).limit(1);
  return row ?? null;
}

export async function createWakafAsset(data: InsertWakafAsset) {
  const profile = await requireAuth();
  const mid = await resolveMosqueId();
  await requireRole(mid, "superadmin", "admin_dkm", "finance_director", "business_lead");

  const [row] = await db
    .insert(wakaf_assets)
    .values({
      mosque_id: mid,
      asset_name: data.asset_name,
      asset_type: data.asset_type,
      description: data.description ?? null,
      certificate_number: data.certificate_number ?? null,
      certificate_date: data.certificate_date ?? null,
      land_area: data.land_area ?? null,
      location: data.location ?? null,
      lat: data.lat ?? null,
      lng: data.lng ?? null,
      nazhir_name: data.nazhir_name ?? null,
      nazhir_type: data.nazhir_type ?? "perorangan",
      nazhir_phone: data.nazhir_phone ?? null,
      nazhir_address: data.nazhir_address ?? null,
      wakif_name: data.wakif_name ?? null,
      wakif_phone: data.wakif_phone ?? null,
      wakif_type: data.wakif_type ?? "perseorangan",
      beneficiary_type: data.beneficiary_type ?? "umum",
      beneficiary_description: data.beneficiary_description ?? null,
      acquisition_value: data.acquisition_value ?? 0,
      current_value: data.current_value ?? 0,
      last_valuation_date: data.last_valuation_date ?? null,
      status: data.status ?? "aktif",
      is_productive: data.is_productive ?? false,
      revenue_generated: data.revenue_generated ?? 0,
      notes: data.notes ?? null,
      created_by: profile.id,
    })
    .returning();
  if (!row) throw new Error("Operation failed");

  await db.insert(audit_logs).values({
    mosque_id: mid,
    action: "insert",
    entity_type: "wakaf_assets",
    entity_id: row.id,
    actor_id: profile.id,
    changes: data,
  });

  revalidatePath(`/admin`);
  return row;
}

export async function updateWakafAsset(id: string, data: Partial<InsertWakafAsset>) {
  const profile = await requireAuth();
  const old = await getWakafAssetById(id);
  if (!old) throw new Error("Aset wakaf tidak ditemukan");
  await requireRole(old.mosque_id, "superadmin", "admin_dkm", "finance_director", "business_lead");

  const [row] = await db
    .update(wakaf_assets)
    .set({ ...data, updated_at: sql`NOW()` })
    .where(eq(wakaf_assets.id, id))
    .returning();
  if (!row) throw new Error("Operation failed");

  await db.insert(audit_logs).values({
    mosque_id: old.mosque_id,
    action: "update",
    entity_type: "wakaf_assets",
    entity_id: id,
    actor_id: profile.id,
    changes: { old, new: data },
  });

  revalidatePath(`/admin`);
  return row;
}

export async function deleteWakafAsset(id: string) {
  const profile = await requireAuth();
  const old = await getWakafAssetById(id);
  if (!old) throw new Error("Aset wakaf tidak ditemukan");
  await requireRole(old.mosque_id, "superadmin", "admin_dkm", "finance_director", "business_lead");

  await db
    .update(wakaf_assets)
    .set({ deleted_at: sql`NOW()` })
    .where(eq(wakaf_assets.id, id));

  await db.insert(audit_logs).values({
    mosque_id: old.mosque_id,
    action: "delete",
    entity_type: "wakaf_assets",
    entity_id: id,
    actor_id: profile.id,
    changes: old,
  });

  revalidatePath(`/admin`);
}
