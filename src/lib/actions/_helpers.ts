import { db } from "@/db/client";
import { mosques, memberships } from "@/db/schema";
import { eq, and, isNull } from "drizzle-orm";
import { requireAuth } from "@/lib/auth/server";
import { cache } from "react";

/** Validasi URL gambar — hanya HTTPS yang diizinkan. data:/blob:/javascript: diblokir. */
export function validateImageUrl(url: string | null | undefined): void {
  if (!url) return;
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:") {
      throw new Error(`URL gambar harus HTTPS (diterima: ${parsed.protocol})`);
    }
    if (parsed.hostname.length < 1) throw new Error("Hostname kosong.");
  } catch (e) {
    if (e instanceof Error && e.message.startsWith("URL gambar")) throw e;
    throw new Error("URL gambar tidak valid. Hanya URL HTTPS yang diizinkan.");
  }
}

const getMosqueId = cache(async (profileId: string) => {
  const userMemberships = await db
    .select({ mosque_id: memberships.mosque_id })
    .from(memberships)
    .where(and(eq(memberships.profile_id, profileId), eq(memberships.is_active, true)))
    .limit(2);

  if (userMemberships.length === 0) throw new Error("Tidak ada masjid aktif. Hubungi admin.");
  if (userMemberships.length > 1) throw new Error("mosqueId wajib disebutkan eksplisit untuk user dengan multiple membership.");

  const membership = userMemberships[0];
  if (!membership) throw new Error("Tidak ada masjid aktif. Hubungi admin.");
  return membership.mosque_id;
});

/** Ambil mosque_id dari membership aktif user yang login. */
export async function resolveMosqueId(mosqueId?: string | null): Promise<string> {
  if (mosqueId) return mosqueId;
  const profile = await requireAuth();
  return getMosqueId(profile.id);
}
