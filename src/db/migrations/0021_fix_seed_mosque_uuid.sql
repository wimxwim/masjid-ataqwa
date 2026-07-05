-- Migration 0021: Fix seed mosque UUID
--
-- Masalah: Seed data menggunakan UUID 'a0000000-0000-0000-0000-000000000001'
-- yang bukan UUID v4 valid per RFC 4122/9562 (version nibble = 0, bukan 4).
-- Zod v4 menolak UUID ini karena validasi ketat.
--
-- Solusi: Ganti UUID tersebut dengan UUID v4 valid yang di-generate
-- gen_random_uuid() SEKALI dan dipakai konsisten di semua tabel.

DO $$
DECLARE
  new_uuid     uuid := gen_random_uuid();
  old_uuid     uuid := 'a0000000-0000-0000-0000-000000000001';
  r            record;
  n_affected   int;
BEGIN
  -- Langkah 1: Simpan definisi FK constraint ke temporary table
  CREATE TEMP TABLE _fk_backup ON COMMIT DROP AS
  SELECT
    con.conname AS constraint_name,
    conrelid::regclass::text AS table_name,
    a.attname AS column_name,
    CASE con.confdeltype
      WHEN 'c' THEN 'CASCADE'
      WHEN 'n' THEN 'SET NULL'
      WHEN 'd' THEN 'SET DEFAULT'
      WHEN 'r' THEN 'RESTRICT'
      WHEN 'a' THEN 'NO ACTION'
      ELSE 'NO ACTION'
    END AS on_delete,
    CASE con.confupdtype
      WHEN 'c' THEN 'CASCADE'
      WHEN 'n' THEN 'SET NULL'
      WHEN 'd' THEN 'SET DEFAULT'
      WHEN 'r' THEN 'RESTRICT'
      WHEN 'a' THEN 'NO ACTION'
      ELSE 'NO ACTION'
    END AS on_update
  FROM pg_constraint con
  JOIN pg_class cl ON con.conrelid = cl.oid
  JOIN pg_attribute a ON a.attrelid = con.conrelid
                      AND a.attnum = ANY(con.conkey)
  WHERE con.confrelid = 'mosques'::regclass
    AND con.contype = 'f';

  RAISE NOTICE 'Backed up % FK constraints referencing mosques(id)', (SELECT count(*) FROM _fk_backup);

  -- Langkah 2: Drop semua FK constraints
  FOR r IN SELECT * FROM _fk_backup LOOP
    EXECUTE format('ALTER TABLE %I DROP CONSTRAINT %I', r.table_name, r.constraint_name);
    RAISE NOTICE 'Dropped FK: % on %', r.constraint_name, r.table_name;
  END LOOP;

  -- Langkah 3: Update mosque record
  UPDATE mosques SET id = new_uuid WHERE id = old_uuid;
  GET DIAGNOSTICS n_affected = ROW_COUNT;
  RAISE NOTICE 'Updated mosques: % row(s)', n_affected;

  -- Langkah 4: Update semua child tables
  FOR r IN SELECT DISTINCT table_name, column_name FROM _fk_backup LOOP
    EXECUTE format('UPDATE %I SET %I = %L WHERE %I = %L',
      r.table_name, r.column_name, new_uuid, r.column_name, old_uuid);
    GET DIAGNOSTICS n_affected = ROW_COUNT;
    RAISE NOTICE 'Updated %( % ): % row(s)', r.table_name, r.column_name, n_affected;
  END LOOP;

  -- Langkah 5: Recreate semua FK constraints
  FOR r IN SELECT * FROM _fk_backup LOOP
    EXECUTE format(
      'ALTER TABLE %I ADD CONSTRAINT %I FOREIGN KEY (%I) REFERENCES mosques(id) ON DELETE %s ON UPDATE %s',
      r.table_name, r.constraint_name, r.column_name, r.on_delete, r.on_update
    );
    RAISE NOTICE 'Recreated FK: % on %', r.constraint_name, r.table_name;
  END LOOP;

  -- Temp table otomatis di-drop karena ON COMMIT DROP
  RAISE NOTICE 'Migration 0021 complete. New mosque UUID: %', new_uuid;
END $$;
