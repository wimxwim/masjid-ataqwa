"use server";

import { db } from "@/db/client";
import { asnaf, audit_logs } from "@/db/schema";
import { requireAuth, requireRole } from "@/lib/auth/server";
import { resolveMosqueId } from "./_helpers";
import { eq, and, asc, isNull, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export type InsertAsnaf = {
  code: string;
  name: string;
  description?: string | null;
  arabic_name?: string | null;
  quran_ayat?: string | null;
  priority?: number;
  is_active?: boolean;
};

export async function getAsnafList(mosqueId?: string) {
  const mid = await resolveMosqueId(mosqueId);
  await requireRole(mid, "superadmin", "admin_dkm", "mustahik", "finance_director");

  let rows = await db
    .select()
    .from(asnaf)
    .where(and(eq(asnaf.mosque_id, mid), eq(asnaf.is_active, true)))
    .orderBy(asc(asnaf.priority));

  if (rows.length === 0) {
    try {
      await seedDefaultAsnaf(mid);
      rows = await db
        .select()
        .from(asnaf)
        .where(and(eq(asnaf.mosque_id, mid), eq(asnaf.is_active, true)))
        .orderBy(asc(asnaf.priority));
    } catch {
      // user role may not have seed permission — return empty gracefully
    }
  }

  return rows;
}

export async function getAsnafById(id: string, mosqueId?: string) {
  const mid = await resolveMosqueId(mosqueId);
  await requireRole(mid, "superadmin", "admin_dkm", "mustahik");
  const [row] = await db
    .select()
    .from(asnaf)
    .where(and(eq(asnaf.id, id), eq(asnaf.mosque_id, mid)))
    .limit(1);
  return row ?? null;
}

export async function seedDefaultAsnaf(mosqueId: string) {
  const profile = await requireAuth();
  await requireRole(mosqueId, "superadmin", "admin_dkm");

  const defaultAsnaf: InsertAsnaf[] = [
    { code: "fakir", name: "Fakir", arabic_name: "الفقراء", description: "Orang yang tidak memiliki harta dan pekerjaan untuk memenuhi kebutuhan pokok", priority: 1 },
    { code: "miskin", name: "Miskin", arabic_name: "المساكين", description: "Orang yang memiliki harta/pekerjaan tetapi tidak mencukupi kebutuhan pokok", priority: 2 },
    { code: "amil", name: "Amil", arabic_name: "العاملين عليها", description: "Pengelola zakat (panitia UPZ, LAZ, BAZNAS)", priority: 3 },
    { code: "muallaf", name: "Muallaf", arabic_name: "المؤلفة قلوبهم", description: "Orang yang baru masuk Islam atau yang hatinya perlu dikuatkan dalam Islam", priority: 4 },
    { code: "riqab", name: "Riqab", arabic_name: "الرقاب", description: "Hamba sahaya atau budak yang ingin merdeka", priority: 5 },
    { code: "gharim", name: "Gharim", arabic_name: "الغارمين", description: "Orang yang berutang untuk kebutuhan halal dan tidak mampu membayar", priority: 6 },
    { code: "fisabilillah", name: "Fisabilillah", arabic_name: "في سبيل الله", description: "Pejuang di jalan Allah termasuk dakwah, pendidikan, kesehatan", priority: 7 },
    { code: "ibnusabil", name: "Ibnu Sabil", arabic_name: "ابن السبيل", description: "Musafir yang kehabisan bekal di perjalanan", priority: 8 },
  ];

  for (const a of defaultAsnaf) {
    const [existing] = await db
      .select({ id: asnaf.id })
      .from(asnaf)
      .where(and(eq(asnaf.mosque_id, mosqueId), eq(asnaf.code, a.code)))
      .limit(1);
    if (existing) continue;
    await db.insert(asnaf).values({ mosque_id: mosqueId, ...a, is_active: true });
  }

  await db.insert(audit_logs).values({
    mosque_id: mosqueId,
    action: "insert",
    entity_type: "asnaf",
    entity_id: "bulk-seed",
    actor_id: profile.id,
    changes: { count: defaultAsnaf.length },
  });

  revalidatePath(`/admin/mustahik`);
}

export async function updateAsnaf(id: string, data: Partial<InsertAsnaf>) {
  const profile = await requireAuth();
  const old = await getAsnafById(id);
  if (!old) throw new Error("Asnaf tidak ditemukan");
  await requireRole(old.mosque_id, "superadmin", "admin_dkm");

  await db
    .update(asnaf)
    .set(data)
    .where(eq(asnaf.id, id));

  await db.insert(audit_logs).values({
    mosque_id: old.mosque_id,
    action: "update",
    entity_type: "asnaf",
    entity_id: id,
    actor_id: profile.id,
    changes: { old, new: data },
  });

  revalidatePath(`/admin/mustahik`);
}
