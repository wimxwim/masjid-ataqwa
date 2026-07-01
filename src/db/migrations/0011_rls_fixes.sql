-- Migration 0011: RLS fixes + auto-profile trigger
-- Fixes:
--   1. is_member_of() → SECURITY DEFINER (bypass RLS chicken-and-egg)
--   2. RLS policies untuk mosques, profiles, memberships
--   3. Auto-profile trigger for new signups

BEGIN;

-- ============================================================
-- 1. is_member_of → SECURITY DEFINER
-- Tanpa ini, RLS di memberships block fungsi itu sendiri
-- ============================================================
CREATE OR REPLACE FUNCTION public.is_member_of(mosque_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.memberships
    WHERE profile_id = auth.uid()
      AND mosque_id = is_member_of.mosque_id
      AND is_active = true
  );
$$;

-- ============================================================
-- 2. RLS untuk mosques — public SELECT
-- ============================================================
ALTER TABLE mosques ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS mosques_select_public ON mosques;
CREATE POLICY mosques_select_public ON mosques
  FOR SELECT
  USING (is_active = true OR public.is_member_of(id));

-- ============================================================
-- 3. RLS untuk profiles — self-read/insert/update
-- ============================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS profiles_select_self ON profiles;
CREATE POLICY profiles_select_self ON profiles
  FOR SELECT
  USING (id = auth.uid());

DROP POLICY IF EXISTS profiles_insert_self ON profiles;
CREATE POLICY profiles_insert_self ON profiles
  FOR INSERT
  WITH CHECK (id = auth.uid());

DROP POLICY IF EXISTS profiles_update_self ON profiles;
CREATE POLICY profiles_update_self ON profiles
  FOR UPDATE
  USING (id = auth.uid());

-- ============================================================
-- 4. RLS untuk memberships — self-read
-- ============================================================
ALTER TABLE memberships ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS memberships_select_self ON memberships;
CREATE POLICY memberships_select_self ON memberships
  FOR SELECT
  USING (profile_id = auth.uid());

-- ============================================================
-- 5. Auto-profile trigger
-- Setiap user baru di auth.users otomatis dapat profile
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.email
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

COMMIT;
