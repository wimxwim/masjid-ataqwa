"use server";

import { db } from "@/db/client";
import { activity_feed, audit_logs } from "@/db/schema";
import { requireAuth, requireRole } from "@/lib/auth/server";
import { resolveMosqueId } from "./_helpers";
import { eq, and, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export type InsertActivity = {
  type: string;
  nama: string;
  alamat?: string | null;
  detail?: string | null;
  jumlah?: number | null;
};

export async function getActivityFeed(mosqueId?: string) {
  const mid = mosqueId ?? await resolveMosqueId();
  return db
    .select()
    .from(activity_feed)
    .where(eq(activity_feed.mosque_id, mid))
    .orderBy(desc(activity_feed.created_at));
}

export async function createActivity(data: InsertActivity) {
  const profile = await requireAuth();
  const mid = await resolveMosqueId();
  const [row] = await db
    .insert(activity_feed)
    .values({
      mosque_id: mid,
      type: data.type,
      nama: data.nama,
      alamat: data.alamat ?? null,
      detail: data.detail ?? null,
      jumlah: data.jumlah ?? null,
    })
    .returning();
  if (!row) throw new Error("Operation failed");

  await db.insert(audit_logs).values({
    mosque_id: mid,
    actor_id: profile.id,
    action: "insert",
    entity_type: "activity_feed",
    entity_id: row.id,
    changes: data,
  });

  revalidatePath("/admin/activity");
  revalidatePath("/", "layout");
  return row;
}

export async function updateActivity(id: string, data: Partial<InsertActivity>) {
  const profile = await requireAuth();
  const mid = await resolveMosqueId();
  await requireRole(mid, "superadmin", "admin_dkm");

  const [row] = await db
    .update(activity_feed)
    .set({
      type: data.type,
      nama: data.nama,
      alamat: data.alamat ?? null,
      detail: data.detail ?? null,
      jumlah: data.jumlah ?? null,
    })
    .where(and(eq(activity_feed.id, id), eq(activity_feed.mosque_id, mid)))
    .returning();
  if (!row) throw new Error("Operation failed");

  await db.insert(audit_logs).values({
    mosque_id: mid,
    actor_id: profile.id,
    action: "update",
    entity_type: "activity_feed",
    entity_id: id,
    changes: data,
  });

  revalidatePath("/admin/activity");
  revalidatePath("/", "layout");
  return row;
}

export async function deleteActivity(id: string) {
  const profile = await requireAuth();
  const mid = await resolveMosqueId();
  await requireRole(mid, "superadmin", "admin_dkm");

  const [row] = await db
    .delete(activity_feed)
    .where(and(eq(activity_feed.id, id), eq(activity_feed.mosque_id, mid)))
    .returning();
  if (!row) throw new Error("Operation failed");

  await db.insert(audit_logs).values({
    mosque_id: mid,
    actor_id: profile.id,
    action: "delete",
    entity_type: "activity_feed",
    entity_id: id,
    changes: row,
  });

  revalidatePath("/admin/activity");
  revalidatePath("/", "layout");
}
