-- Create regions table
CREATE TABLE regions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  country TEXT NOT NULL,
  lat DOUBLE PRECISION NOT NULL,
  lon DOUBLE PRECISION NOT NULL,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- Enable RLS
ALTER TABLE regions ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Public Read
CREATE POLICY "Public read access" ON regions
  FOR SELECT USING (true);

-- Seed Data: Jakarta and Bali
INSERT INTO regions (name, country, lat, lon) VALUES
('Jakarta', 'Indonesia', -6.2088, 106.8456),
('Bali', 'Indonesia', -8.4095, 115.1889);

-- Add region_id to outbreaks
ALTER TABLE outbreaks ADD COLUMN region_id UUID REFERENCES regions(id);

-- Backfill existing outbreaks to Jakarta
UPDATE outbreaks 
SET region_id = (SELECT id FROM regions WHERE name = 'Jakarta')
WHERE region_id IS NULL;

-- Make region_id mandatory
ALTER TABLE outbreaks ALTER COLUMN region_id SET NOT NULL;

-- Index for performance
CREATE INDEX idx_outbreaks_region_id ON outbreaks(region_id);
