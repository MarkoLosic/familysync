-- Fridge sticky notes table
CREATE TABLE IF NOT EXISTS fridge_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE fridge_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY fridge_notes_select_policy ON fridge_notes
  FOR SELECT
  USING (
    family_id IN (SELECT family_id FROM profiles WHERE id = auth.uid())
  );

CREATE POLICY fridge_notes_insert_policy ON fridge_notes
  FOR INSERT
  WITH CHECK (
    family_id IN (SELECT family_id FROM profiles WHERE id = auth.uid())
  );

CREATE POLICY fridge_notes_delete_policy ON fridge_notes
  FOR DELETE
  USING (
    family_id IN (SELECT family_id FROM profiles WHERE id = auth.uid())
  );

CREATE OR REPLACE FUNCTION update_fridge_notes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS fridge_notes_updated_at_trigger ON fridge_notes;
CREATE TRIGGER fridge_notes_updated_at_trigger
  BEFORE UPDATE ON fridge_notes
  FOR EACH ROW EXECUTE FUNCTION update_fridge_notes_updated_at();
