-- Sprint 9: transaction_type ENUM + partial indexes + loan_installments.due_date index

-- 1. Create ENUM for transactions.type
CREATE TYPE "transaction_type" AS ENUM ('Pemasukan', 'Pengeluaran');

-- 2. Convert transactions.type from text → ENUM
ALTER TABLE transactions ALTER COLUMN type TYPE "transaction_type"
  USING type::"transaction_type";

-- 3. Partial indexes for soft-delete (WHERE deleted_at IS NULL)
--    These tables have deleted_at and are frequently queried for active records
CREATE INDEX CONCURRENTLY IF NOT EXISTS mustahiks_active_idx
  ON mustahiks (mosque_id) WHERE deleted_at IS NULL;

CREATE INDEX CONCURRENTLY IF NOT EXISTS employees_active_idx
  ON employees (mosque_id) WHERE deleted_at IS NULL;

CREATE INDEX CONCURRENTLY IF NOT EXISTS programs_active_idx
  ON programs (mosque_id, is_active) WHERE deleted_at IS NULL;

CREATE INDEX CONCURRENTLY IF NOT EXISTS bumm_products_active_idx
  ON bumm_products (mosque_id) WHERE deleted_at IS NULL AND is_active = true;

CREATE INDEX CONCURRENTLY IF NOT EXISTS transactions_active_idx
  ON transactions (mosque_id, transaction_date) WHERE deleted_at IS NULL;

CREATE INDEX CONCURRENTLY IF NOT EXISTS donatur_tetap_active_idx
  ON donatur_tetap (mosque_id) WHERE deleted_at IS NULL;

CREATE INDEX CONCURRENTLY IF NOT EXISTS mushafir_aid_active_idx
  ON mushafir_aid (mosque_id) WHERE deleted_at IS NULL;

CREATE INDEX CONCURRENTLY IF NOT EXISTS testimonials_active_idx
  ON testimonials (mosque_id, is_active) WHERE deleted_at IS NULL;

CREATE INDEX CONCURRENTLY IF NOT EXISTS jamaah_active_idx
  ON jamaah (mosque_id) WHERE deleted_at IS NULL;

CREATE INDEX CONCURRENTLY IF NOT EXISTS wakaf_assets_active_idx
  ON wakaf_assets (mosque_id) WHERE deleted_at IS NULL;

CREATE INDEX CONCURRENTLY IF NOT EXISTS inventaris_active_idx
  ON inventaris (mosque_id) WHERE deleted_at IS NULL;

CREATE INDEX CONCURRENTLY IF NOT EXISTS loan_applications_active_idx
  ON loan_applications (mosque_id) WHERE deleted_at IS NULL;

-- 4. Index loan_installments.due_date (for overdue queries)
CREATE INDEX CONCURRENTLY IF NOT EXISTS loan_installments_due_date_idx
  ON loan_installments (loan_id, due_date);
