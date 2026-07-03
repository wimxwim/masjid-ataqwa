"use server";

import { db } from "@/db/client";
import { mustahiks } from "@/db/schema";
import type { MustahikDb } from "@/types";
import { requireAuth, requireRole } from "@/lib/auth/server";
import { resolveMosqueId } from "./_helpers";
import { eq, and, isNull, desc, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";

function serializeRow(row: Record<string, unknown>): Record<string, unknown> {
  const out = { ...row };
  for (const key of ["created_at", "updated_at", "deleted_at"] as const) {
    const val = out[key];
    if (val instanceof Date) out[key] = val.toISOString();
  }
  return out;
}

function serializeRows(rows: Record<string, unknown>[]): Record<string, unknown>[] {
  return rows.map(serializeRow);
}

export async function getMustahiks(mosqueId?: string): Promise<MustahikDb[]> {
  const mid = await resolveMosqueId(mosqueId);
  const rows = await db
    .select()
    .from(mustahiks)
    .where(and(eq(mustahiks.mosque_id, mid), isNull(mustahiks.deleted_at)))
    .orderBy(desc(mustahiks.created_at));
  return serializeRows(rows as unknown as Record<string, unknown>[]) as unknown as MustahikDb[];
}

export async function getMustahikById(id: string, mosqueId?: string): Promise<MustahikDb | null> {
  const mid = await resolveMosqueId(mosqueId);
  const [row] = await db
    .select()
    .from(mustahiks)
    .where(and(eq(mustahiks.id, id), eq(mustahiks.mosque_id, mid)))
    .limit(1);
  return row ? (serializeRow(row as unknown as Record<string, unknown>) as unknown as MustahikDb) : null;
}

export async function createMustahik(formData: FormData) {
  const profile = await requireAuth();
  const mosqueId = await resolveMosqueId();
  await requireRole(mosqueId, "superadmin", "admin_dkm");

  const name = formData.get("name") as string;
  const phone = formData.get("phone") as string;
  const address = formData.get("address") as string;
  const desil_level = formData.get("desil_level") as string;
  const ring_number = formData.get("ring_number") as string;
  const monthly_income = formData.get("monthly_income") as string;
  const dependents = formData.get("dependents") as string;
  const usaha_type = formData.get("usaha_type") as string;
  const lat = formData.get("lat") as string;
  const lng = formData.get("lng") as string;
  const nik_hash = formData.get("nik_hash") as string;
  const notes = formData.get("notes") as string;

  const asnaf_id = formData.get("asnaf_id") as string;
  const sub_asnaf = formData.get("sub_asnaf") as string;
  const had_kifayah_score = formData.get("had_kifayah_score") as string;
  const nomor_induk_mustahik = formData.get("nomor_induk_mustahik") as string;
  const program_type = formData.get("program_type") as string;

  if (!name || !address) return { error: "Nama dan alamat wajib diisi." };

  const [row] = await db
    .insert(mustahiks)
    .values({
      mosque_id: mosqueId,
      name,
      phone: phone || null,
      address,
      desil_level: (desil_level as "1" | "2" | "3" | "4") || null,
      ring_number: ring_number ? parseInt(ring_number) : null,
      monthly_income: monthly_income ? parseInt(monthly_income) : null,
      dependents: dependents ? parseInt(dependents) : null,
      usaha_type: usaha_type || null,
      lat: lat ? parseFloat(lat) : null,
      lng: lng ? parseFloat(lng) : null,
      nik_hash: nik_hash || null,
      notes: notes || null,
      created_by: profile.id,
      asnaf_id: asnaf_id || null,
      sub_asnaf: sub_asnaf || null,
      had_kifayah_score: had_kifayah_score ? parseFloat(had_kifayah_score) : null,
      nomor_induk_mustahik: nomor_induk_mustahik || null,
      program_type: (program_type as "zakat" | "infaq" | "qardhul_hasan" | "beasiswa" | "pemberdayaan") || null,
    })
    .returning();

  if (!row) return { error: "Gagal menyimpan data." };
  revalidatePath("/admin", "layout");
  revalidatePath("/admin/mustahik", "layout");
  return { success: true };
}

export async function updateMustahik(id: string, formData: FormData) {
  await requireAuth();
  const old = await getMustahikById(id);
  if (!old) return { error: "Mustahik tidak ditemukan." };
  await requireRole(old.mosque_id, "superadmin", "admin_dkm");

  const name = formData.get("name") as string;
  const phone = formData.get("phone") as string;
  const address = formData.get("address") as string;
  const desil_level = formData.get("desil_level") as string;
  const ring_number = formData.get("ring_number") as string;
  const monthly_income = formData.get("monthly_income") as string;
  const dependents = formData.get("dependents") as string;
  const usaha_type = formData.get("usaha_type") as string;
  const lat = formData.get("lat") as string;
  const lng = formData.get("lng") as string;
  const notes = formData.get("notes") as string;
  const is_active = formData.get("is_active") as string;

  const asnaf_id = formData.get("asnaf_id") as string;
  const sub_asnaf = formData.get("sub_asnaf") as string;
  const had_kifayah_score = formData.get("had_kifayah_score") as string;
  const nomor_induk_mustahik = formData.get("nomor_induk_mustahik") as string;
  const program_type = formData.get("program_type") as string;

  if (!name || !address) return { error: "Nama dan alamat wajib diisi." };

  const [row] = await db
    .update(mustahiks)
    .set({
      name,
      phone: phone || null,
      address,
      desil_level: (desil_level as "1" | "2" | "3" | "4") || null,
      ring_number: ring_number ? parseInt(ring_number) : null,
      monthly_income: monthly_income ? parseInt(monthly_income) : null,
      dependents: dependents ? parseInt(dependents) : null,
      usaha_type: usaha_type || null,
      lat: lat ? parseFloat(lat) : null,
      lng: lng ? parseFloat(lng) : null,
      notes: notes || null,
      is_active: is_active === "true",
      asnaf_id: asnaf_id || null,
      sub_asnaf: sub_asnaf || null,
      had_kifayah_score: had_kifayah_score ? parseFloat(had_kifayah_score) : null,
      nomor_induk_mustahik: nomor_induk_mustahik || null,
      program_type: (program_type as "zakat" | "infaq" | "qardhul_hasan" | "beasiswa" | "pemberdayaan") || null,
      updated_at: sql`NOW()`,
    })
    .where(and(eq(mustahiks.id, id), eq(mustahiks.mosque_id, old.mosque_id)))
    .returning();

  if (!row) return { error: "Gagal memperbarui data." };
  revalidatePath("/admin", "layout");
  revalidatePath("/admin/mustahik", "layout");
  return { success: true };
}

export async function deleteMustahik(id: string) {
  await requireAuth();
  const old = await getMustahikById(id);
  if (!old) return { error: "Mustahik tidak ditemukan." };
  await requireRole(old.mosque_id, "superadmin", "admin_dkm");

  await db
    .update(mustahiks)
    .set({ deleted_at: sql`NOW()` })
    .where(and(eq(mustahiks.id, id), eq(mustahiks.mosque_id, old.mosque_id)));

  revalidatePath("/admin", "layout");
  revalidatePath("/admin/mustahik", "layout");
  return { success: true };
}
