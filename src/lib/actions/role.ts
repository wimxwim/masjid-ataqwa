"use server";

import { createServerSupabase } from "@/lib/supabase/server";

/**
 * Get user role from dkm_members table.
 * Falls back to user_metadata.role, then "ketua" as default.
 * This is called from the admin layout server wrapper.
 */
export async function getUserRole(): Promise<string> {
  const supabase = await createServerSupabase();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return "ketua";

  // Try dkm_members first (DB-backed role system)
  const { data: dkm } = await supabase
    .from("dkm_members")
    .select("role")
    .eq("user_id", user.id)
    .limit(1)
    .single();

  if (dkm?.role) return dkm.role;

  // Fallback to user_metadata (legacy)
  const metaRole = user.user_metadata?.role;
  if (metaRole && ["ketua","wakil_ketua","sekretaris","bendahara","dakwah","sosial","sarpras"].includes(metaRole)) {
    return metaRole;
  }

  // Default
  return "ketua";
}
