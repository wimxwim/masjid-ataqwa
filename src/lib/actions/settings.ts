"use server";

import { db } from "@/db/client";
import { mosques } from "@/db/schema";
import { requireAuth, requireRole } from "@/lib/auth/server";
import { resolveMosqueId } from "./_helpers";
import { eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export type MosqueSettings = {
  name: string;
  address: string;
  phone: string;
  email: string;
  bank_name: string;
  bank_account: string;
  bank_holder: string;
  default_infaq: number;
  data_public: string;
};

export async function getMosqueSettings(): Promise<MosqueSettings> {
  const mosqueId = await resolveMosqueId();
  const [row] = await db
    .select()
    .from(mosques)
    .where(eq(mosques.id, mosqueId))
    .limit(1);

  if (!row) throw new Error("Masjid tidak ditemukan");
  const cfg = (row.config ?? {}) as Record<string, unknown>;

  return {
    name: row.name ?? "",
    address: row.address ?? "",
    phone: (cfg.phone as string) ?? "",
    email: (cfg.email as string) ?? "",
    bank_name: row.bank_name ?? "",
    bank_account: row.bank_account_number ?? "",
    bank_holder: row.bank_account_name ?? "",
    default_infaq: (cfg.infaq_weekly_default as number) ?? 50000,
    data_public: (cfg.data_public as string) ?? "Publik",
  };
}

export async function updateMosqueSettings(formData: FormData): Promise<{ success: boolean; error?: string }> {
  await requireAuth();
  const mosqueId = await resolveMosqueId();
  await requireRole(mosqueId, "superadmin", "admin_dkm");

  const name = formData.get("name") as string;
  const address = formData.get("address") as string;
  const phone = formData.get("phone") as string;
  const email = formData.get("email") as string;
  const bank_name = formData.get("bank_name") as string;
  const bank_account = formData.get("bank_account") as string;
  const bank_holder = formData.get("bank_holder") as string;
  const default_infaq = formData.get("default_infaq") as string;
  const data_public = formData.get("data_public") as string;

  const [row] = await db
    .select({ config: mosques.config })
    .from(mosques)
    .where(eq(mosques.id, mosqueId))
    .limit(1);
  const cfg = { ...((row?.config ?? {}) as Record<string, unknown>) };

  cfg.phone = phone;
  cfg.email = email;
  cfg.infaq_weekly_default = default_infaq ? parseInt(default_infaq) : 50000;
  cfg.data_public = data_public || "Publik";

  await db
    .update(mosques)
    .set({
      name,
      address,
      bank_name: bank_name || null,
      bank_account_number: bank_account || null,
      bank_account_name: bank_holder || null,
      config: cfg,
      updated_at: sql`NOW()`,
    })
    .where(eq(mosques.id, mosqueId));

  revalidatePath("/admin/settings", "layout");
  revalidatePath("/admin", "layout");
  return { success: true };
}
