import { db } from "@/db/client";
import { mosques, memberships } from "@/db/schema";
import { eq, and, isNull } from "drizzle-orm";
import { requireAuth } from "@/lib/auth/server";

/** Validasi URL gambar — hanya HTTPS yang diizinkan. */
export function validateImageUrl(url: string | null | undefined): void {
  if (!url) return;
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:") throw new Error();
  } catch {
    throw new Error("URL gambar tidak valid. Hanya URL HTTPS yang diizinkan.");
  }
}

/** Ambil mosque_id dari membership aktif user yang login. */
export async function resolveMosqueId(mosqueId?: string | null): Promise<string> {
  if (mosqueId) return mosqueId;

  const profile = await requireAuth();

  const userMemberships = await db
    .select({ mosque_id: memberships.mosque_id })
    .from(memberships)
    .where(and(eq(memberships.profile_id, profile.id), eq(memberships.is_active, true)))
    .limit(2);

  if (userMemberships.length === 0) throw new Error("Tidak ada masjid aktif. Hubungi admin.");
  if (userMemberships.length > 1) throw new Error("mosqueId wajib disebutkan eksplisit untuk user dengan multiple membership.");

  const membership = userMemberships[0];
  if (!membership) throw new Error("Tidak ada masjid aktif. Hubungi admin.");
  return membership.mosque_id;
}
