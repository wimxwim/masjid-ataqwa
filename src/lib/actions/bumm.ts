"use server";

import { db } from "@/db/client";
import { bumm_products, audit_logs } from "@/db/schema";
import { requireAuth, requireRole } from "@/lib/auth/server";
import { resolveMosqueId } from "./_helpers";
import { eq, and, desc, sql, isNull } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export type InsertBummProduct = {
  product_name: string;
  category?: string | null;
  description?: string | null;
  price: number;
  commission_pct?: number | null;
  stock?: number | null;
  image_url?: string | null;
  is_active?: boolean | null;
};

export async function getBummProducts(mosqueId?: string) {
  const mid = await resolveMosqueId(mosqueId);
  await requireRole(mid, "superadmin", "admin_dkm", "business_lead");
  return db
    .select()
    .from(bumm_products)
    .where(and(eq(bumm_products.mosque_id, mid), isNull(bumm_products.deleted_at)))
    .orderBy(desc(bumm_products.created_at));
}

export async function createBummProduct(data: InsertBummProduct) {
  const profile = await requireAuth();
  const mid = await resolveMosqueId();
  await requireRole(mid, "superadmin", "admin_dkm", "business_lead");

  const [row] = await db
    .insert(bumm_products)
    .values({
      mosque_id: mid,
      product_name: data.product_name,
      category: data.category ?? null,
      description: data.description ?? null,
      price: data.price,
      commission_pct: data.commission_pct ?? 15,
      stock: data.stock ?? 0,
      image_url: data.image_url ?? null,
      is_active: data.is_active ?? true,
    })
    .returning();
  if (!row) throw new Error("Gagal menambah produk");

  await db.insert(audit_logs).values({
    mosque_id: mid,
    action: "insert",
    entity_type: "bumm_products",
    entity_id: row.id,
    actor_id: profile.id,
    changes: data,
  });

  revalidatePath(`/admin/bumm`);
  return row;
}

export async function updateBummProduct(id: string, data: Partial<InsertBummProduct>) {
  const profile = await requireAuth();
  const [old] = await db.select().from(bumm_products).where(eq(bumm_products.id, id)).limit(1);
  if (!old) throw new Error("Produk tidak ditemukan");
  await requireRole(old.mosque_id, "superadmin", "admin_dkm", "business_lead");

  const [row] = await db
    .update(bumm_products)
    .set({ ...data, updated_at: sql`NOW()` })
    .where(eq(bumm_products.id, id))
    .returning();
  if (!row) throw new Error("Operation failed");

  await db.insert(audit_logs).values({
    mosque_id: old.mosque_id,
    action: "update",
    entity_type: "bumm_products",
    entity_id: id,
    actor_id: profile.id,
    changes: { old, new: data },
  });

  revalidatePath(`/admin/bumm`);
  return row;
}

export async function deleteBummProduct(id: string) {
  const profile = await requireAuth();
  const [old] = await db.select().from(bumm_products).where(eq(bumm_products.id, id)).limit(1);
  if (!old) throw new Error("Produk tidak ditemukan");
  await requireRole(old.mosque_id, "superadmin", "admin_dkm", "business_lead");

  await db
    .update(bumm_products)
    .set({ deleted_at: sql`NOW()` })
    .where(eq(bumm_products.id, id));

  await db.insert(audit_logs).values({
    mosque_id: old.mosque_id,
    action: "delete",
    entity_type: "bumm_products",
    entity_id: id,
    actor_id: profile.id,
    changes: old,
  });

  revalidatePath(`/admin/bumm`);
}
