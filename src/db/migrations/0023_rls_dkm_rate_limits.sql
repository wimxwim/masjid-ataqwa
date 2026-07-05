-- 0023: RLS for dkm_members, rate_limits + asnaf DELETE policy + FK for dkm_members
-- ============================================================

-- 1. DKM_MEMBERS: add FK constraint for mosque_id
-- ============================================================
ALTER TABLE dkm_members
  ADD CONSTRAINT dkm_members_mosque_id_fkey
  FOREIGN KEY (mosque_id) REFERENCES mosques(id) ON DELETE CASCADE;

-- 2. DKM_MEMBERS: enable RLS
-- ============================================================
ALTER TABLE dkm_members ENABLE ROW LEVEL SECURITY;

-- Users can read their own memberships (needed for resolveMosqueId, role checks)
CREATE POLICY dkm_members_select_own ON dkm_members
  FOR SELECT
  USING (user_id = auth.uid());

-- Admins can read all members of their mosque
CREATE POLICY dkm_members_select_admin ON dkm_members
  FOR SELECT
  USING (public.is_member_of(mosque_id));

-- Admins can insert/update/delete members
CREATE POLICY dkm_members_insert_admin ON dkm_members
  FOR INSERT
  WITH CHECK (public.is_member_of(mosque_id));

CREATE POLICY dkm_members_update_admin ON dkm_members
  FOR UPDATE
  USING (public.is_member_of(mosque_id));

CREATE POLICY dkm_members_delete_admin ON dkm_members
  FOR DELETE
  USING (public.is_member_of(mosque_id));

-- 3. RATE_LIMITS: enable RLS (service-role only — no user policies)
-- ============================================================
ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;

-- 4. ASNAF: add DELETE policy (admin only)
-- ============================================================
CREATE POLICY asnaf_delete_admin ON asnaf
  FOR DELETE
  USING (public.is_member_of(mosque_id));
