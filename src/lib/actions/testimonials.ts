"use server";

import { db } from "@/db/client";
import { testimonials, audit_logs } from "@/db/schema";
import { requireAuth, requireRole } from "@/lib/auth/server";
import { resolveMosqueId, validateImageUrl } from "./_helpers";
import { eq, and, desc, isNull, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export type InsertTestimonial = {
  mosque_id: string;
  mustahik_id?: string | null;
  nama: string;
  usia?: number | null;
  title?: string | null;
  story: string;
  ring?: string | null;
  durasi_bulan?: number | null;
  image_url?: string | null;
  is_active?: boolean;
};

export async function getTestimonials(mosqueId: string, activeOnly = false) {
  await requireRole(mosqueId, "superadmin", "admin_dkm", "finance_director");
  const conditions = [eq(testimonials.mosque_id, mosqueId), isNull(testimonials.deleted_at)];
  if (activeOnly) conditions.push(eq(testimonials.is_active, true));

  return db
    .select()
    .from(testimonials)
    .where(and(...conditions))
    .orderBy(desc(testimonials.created_at));
}

export async function getTestimonialById(id: string, mosqueId?: string) {
  const mid = mosqueId ?? await resolveMosqueId();
  await requireRole(mid, "superadmin", "admin_dkm", "finance_director");
  const [row] = await db.select().from(testimonials).where(and(eq(testimonials.id, id), eq(testimonials.mosque_id, mid))).limit(1);
  return row ?? null;
}

export async function createTestimonial(data: InsertTestimonial) {
  const profile = await requireAuth();
  const mid = await resolveMosqueId();
  await requireRole(mid, "superadmin", "admin_dkm", "finance_director");
  validateImageUrl(data.image_url);
  const [row] = await db
    .insert(testimonials)
    .values({
      mosque_id: mid,
      mustahik_id: data.mustahik_id ?? null,
      nama: data.nama,
      usia: data.usia ?? null,
      title: data.title ?? null,
      story: data.story,
      ring: data.ring ?? null,
      durasi_bulan: data.durasi_bulan ?? null,
      image_url: data.image_url ?? null,
      is_active: data.is_active ?? true,
      created_by: profile.id,
    })
    .returning();
  if (!row) throw new Error("Operation failed");

  await db.insert(audit_logs).values({
    mosque_id: mid,
    action: "insert",
    entity_type: "testimonials",
    entity_id: row.id,
    actor_id: profile.id,
    changes: data,
  });

  revalidatePath(`/admin/${mid}/testimonials`);
  return row;
}

export async function updateTestimonial(id: string, data: Partial<InsertTestimonial>) {
  const profile = await requireAuth();
  const old = await getTestimonialById(id);
  if (!old) throw new Error("Testimonial tidak ditemukan");
  await requireRole(old.mosque_id, "superadmin", "admin_dkm", "finance_director");
  if (data.image_url !== undefined) validateImageUrl(data.image_url);

  const [row] = await db
    .update(testimonials)
    .set({ ...data })
    .where(eq(testimonials.id, id))
    .returning();
  if (!row) throw new Error("Operation failed");

  await db.insert(audit_logs).values({
    mosque_id: old.mosque_id,
    action: "update",
    entity_type: "testimonials",
    entity_id: id,
    actor_id: profile.id,
    changes: { old, new: data },
  });

  revalidatePath(`/admin/${old.mosque_id}/testimonials`);
  return row;
}

export async function deleteTestimonial(id: string) {
  const profile = await requireAuth();
  const old = await getTestimonialById(id);
  if (!old) throw new Error("Testimonial tidak ditemukan");
  await requireRole(old.mosque_id, "superadmin", "admin_dkm", "finance_director");

  await db
    .update(testimonials)
    .set({ deleted_at: sql`NOW()` })
    .where(eq(testimonials.id, id));

  await db.insert(audit_logs).values({
    mosque_id: old.mosque_id,
    action: "delete",
    entity_type: "testimonials",
    entity_id: id,
    actor_id: profile.id,
    changes: old,
  });

  revalidatePath(`/admin/${old.mosque_id}/testimonials`);
}
