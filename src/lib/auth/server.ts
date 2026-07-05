import { createServerSupabase } from "@/lib/supabase/server";
import { db } from "@/db/client";
import { profiles, memberships, dkm_members } from "@/db/schema";
import type { Membership } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { cache } from "react";

/** Mapping role DKM (sidebar/admin) → role membership.enum (server). */
const DKM_TO_MEMBERSHIP: Record<string, string[]> = {
  ketua: ["superadmin", "admin_dkm"],
  wakil_ketua: ["admin_dkm"],
  sekretaris: ["admin_dkm", "people_culture"],
  bendahara: ["finance_director"],
  dakwah: ["dakwah_lead"],
  sosial: ["social_lead"],
  sarpras: ["people_culture", "business_lead"],
};

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

const getDkmRole = cache(async (mosqueId: string, userId: string) => {
  return db.query.dkm_members.findFirst({
    where: and(
      eq(dkm_members.user_id, userId),
      eq(dkm_members.mosque_id, mosqueId),
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

  // Direct membership role check.
  if (membership && allowedRoles.includes(membership.role)) {
    return { profile, membership };
  }

  // DKM role check (sync with admin sidebar).
  const dkm = await getDkmRole(mosqueId, profile.id);
  if (dkm?.role) {
    const mappedRoles = DKM_TO_MEMBERSHIP[dkm.role] ?? [];
    const granted = mappedRoles.some((r) => allowedRoles.includes(r)) || allowedRoles.includes(dkm.role);
    if (granted) {
      return {
        profile,
        membership: membership ?? {
          id: dkm.id,
          mosque_id: mosqueId,
          profile_id: profile.id,
          role: mappedRoles[0] ?? dkm.role,
          is_active: true,
          created_at: dkm.created_at,
        } as Membership,
      };
    }
  }

  throw new Error(`Forbidden: requires one of roles ${allowedRoles.join(", ")}`);
}
