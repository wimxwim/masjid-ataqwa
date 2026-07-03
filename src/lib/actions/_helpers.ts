import { db } from "@/db/client";
import { mosques } from "@/db/schema";
import { eq, and, isNull } from "drizzle-orm";

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

/** Ambil mosque_id default (masjid pertama yang aktif) kalau tidak ada yang dipilih. */
export async function resolveMosqueId(mosqueId?: string | null): Promise<string> {
  if (mosqueId) return mosqueId;
  const [row] = await db
    .select({ id: mosques.id })
    .from(mosques)
    .where(and(eq(mosques.is_active, true), isNull(mosques.deleted_at)))
    .limit(1);
  if (!row) throw new Error("Tidak ada masjid aktif. Hubungi admin.");
  return row.id;
}
