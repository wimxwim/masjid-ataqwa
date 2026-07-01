import { createServerSupabase } from "@/lib/supabase/server";
import { db } from "@/db/client";
import { profiles, memberships } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function requireAuth() {
  const supabase = await createServerSupabase();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) throw new Error("Unauthorized");

  const profile = await db.query.profiles.findFirst({
    where: eq(profiles.id, user.id),
  });
  if (!profile) throw new Error("Profile not found");

  return profile;
}

export async function requireRole(mosqueId: string, ...allowedRoles: string[]) {
  const profile = await requireAuth();

  const membership = await db.query.memberships.findFirst({
    where: and(
      eq(memberships.mosque_id, mosqueId),
      eq(memberships.profile_id, profile.id),
      eq(memberships.is_active, true),
    ),
  });

  if (!membership) throw new Error("Forbidden: no active membership at this mosque");
  if (!allowedRoles.includes(membership.role)) {
    throw new Error(`Forbidden: requires one of roles ${allowedRoles.join(", ")}`);
  }

  return { profile, membership };
}
