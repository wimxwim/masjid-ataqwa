CREATE TABLE IF NOT EXISTS dkm_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  mosque_id UUID NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('ketua','wakil_ketua','sekretaris','bendahara','dakwah','sosial','sarpras')),
  full_name TEXT NOT NULL,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, mosque_id)
);

-- Seed: admin pertama (info.masjidataqwa@gmail.com) sebagai ketua
-- Note: user_id harus di-update setelah user pertama terdaftar di Supabase Auth
-- Gunakan query ini untuk mencari user_id:
-- SELECT id FROM auth.users WHERE email = 'info.masjidataqwa@gmail.com';

-- Index untuk query role lookup
CREATE INDEX IF NOT EXISTS dkm_members_user_mosque_idx ON dkm_members(user_id, mosque_id);
