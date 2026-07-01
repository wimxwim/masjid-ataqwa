import { db } from "@/db/client";
import { mosques } from "@/db/schema";
import { eq, and, isNull } from "drizzle-orm";

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
