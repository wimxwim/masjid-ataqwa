-- Add lat/lng columns to mushafir_aid for GPS coordinate tracking
ALTER TABLE mushafir_aid ADD COLUMN IF NOT EXISTS lat double precision;
ALTER TABLE mushafir_aid ADD COLUMN IF NOT EXISTS lng double precision;
