-- Shopping Items Table Migration
-- Creates the shopping_items table for real-time collaborative shopping lists

CREATE TABLE IF NOT EXISTS shopping_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  category TEXT DEFAULT 'other' CHECK (category IN ('food', 'home', 'personal', 'other')),
  is_checked BOOLEAN DEFAULT FALSE,
  created_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_shopping_items_family_id ON shopping_items(family_id);
CREATE INDEX IF NOT EXISTS idx_shopping_items_created_by ON shopping_items(created_by);
CREATE INDEX IF NOT EXISTS idx_shopping_items_is_checked ON shopping_items(is_checked);
CREATE INDEX IF NOT EXISTS idx_shopping_items_category ON shopping_items(category);

-- Add RLS policies
ALTER TABLE shopping_items ENABLE ROW LEVEL SECURITY;

-- Users can view shopping items from their family
CREATE POLICY shopping_items_select_policy ON shopping_items
  FOR SELECT
  USING (
    family_id IN (
      SELECT family_id FROM profiles WHERE user_id = auth.uid()
    )
  );

-- Users can create shopping items in their family
CREATE POLICY shopping_items_insert_policy ON shopping_items
  FOR INSERT
  WITH CHECK (
    family_id IN (
      SELECT family_id FROM profiles WHERE user_id = auth.uid()
    )
  );

-- Users can update shopping items in their family
CREATE POLICY shopping_items_update_policy ON shopping_items
  FOR UPDATE
  USING (
    family_id IN (
      SELECT family_id FROM profiles WHERE user_id = auth.uid()
    )
  );

-- Users can delete shopping items in their family
CREATE POLICY shopping_items_delete_policy ON shopping_items
  FOR DELETE
  USING (
    family_id IN (
      SELECT family_id FROM profiles WHERE user_id = auth.uid()
    )
  );

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_shopping_items_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER shopping_items_updated_at_trigger
  BEFORE UPDATE ON shopping_items
  FOR EACH ROW
  EXECUTE FUNCTION update_shopping_items_updated_at();

-- Enable real-time for shopping_items table
ALTER PUBLICATION supabase_realtime ADD TABLE shopping_items;
