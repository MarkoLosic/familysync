-- Family locations table
CREATE TABLE IF NOT EXISTS family_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'away' CHECK (status IN ('home', 'school', 'work', 'away')),
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (family_id, user_id)
);

ALTER TABLE family_locations ENABLE ROW LEVEL SECURITY;

CREATE POLICY family_locations_select_policy ON family_locations
  FOR SELECT
  USING (
    family_id IN (SELECT family_id FROM profiles WHERE id = auth.uid())
  );

CREATE POLICY family_locations_upsert_policy ON family_locations
  FOR INSERT
  WITH CHECK (
    family_id IN (SELECT family_id FROM profiles WHERE id = auth.uid())
  );

CREATE POLICY family_locations_update_policy ON family_locations
  FOR UPDATE
  USING (
    family_id IN (SELECT family_id FROM profiles WHERE id = auth.uid())
  );

CREATE OR REPLACE FUNCTION update_family_locations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS family_locations_updated_at_trigger ON family_locations;
CREATE TRIGGER family_locations_updated_at_trigger
  BEFORE UPDATE ON family_locations
  FOR EACH ROW EXECUTE FUNCTION update_family_locations_updated_at();
