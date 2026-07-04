CREATE TABLE IF NOT EXISTS rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  identifier TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS rate_limits_identifier_idx ON rate_limits(identifier);
CREATE INDEX IF NOT EXISTS rate_limits_created_at_idx ON rate_limits(created_at);
