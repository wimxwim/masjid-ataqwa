import { createServerSupabase } from "@/lib/supabase/server";
import { db } from "@/db/client";
import { profiles, memberships } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { cache } from "react";

const getAuth = cache(async () => {
  const supabase = await createServerSupabase();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) throw new Error("Unauthorized");
  return user;
});

const getProfile = cache(async (userId: string) => {
  const profile = await db.query.profiles.findFirst({
    where: eq(profiles.id, userId),
  });
  if (!profile) throw new Error("Profile not found");
  return profile;
});

const getMembership = cache(async (mosqueId: string, profileId: string) => {
  return db.query.memberships.findFirst({
    where: and(
      eq(memberships.mosque_id, mosqueId),
      eq(memberships.profile_id, profileId),
      eq(memberships.is_active, true),
    ),
  });
});

export async function requireAuth() {
  const user = await getAuth();
  return getProfile(user.id);
}

export async function requireRole(mosqueId: string, ...allowedRoles: string[]) {
  const profile = await requireAuth();

  const membership = await getMembership(mosqueId, profile.id);

  if (!membership) throw new Error("Forbidden: no active membership at this mosque");
  if (!allowedRoles.includes(membership.role)) {
    throw new Error(`Forbidden: requires one of roles ${allowedRoles.join(", ")}`);
  }

  return { profile, membership };
}
