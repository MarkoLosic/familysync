-- Calendar Events Table Migration
-- Creates the calendar_events table for storing family calendar events

CREATE TABLE IF NOT EXISTS calendar_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  event_date DATE NOT NULL,
  event_time TEXT,
  created_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  participants TEXT[] DEFAULT '{}',
  color TEXT DEFAULT '#6ee7b7',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_calendar_events_family_id ON calendar_events(family_id);
CREATE INDEX IF NOT EXISTS idx_calendar_events_event_date ON calendar_events(event_date);
CREATE INDEX IF NOT EXISTS idx_calendar_events_created_by ON calendar_events(created_by);

-- Add RLS policies
ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;

-- Users can view events from their family
CREATE POLICY calendar_events_select_policy ON calendar_events
  FOR SELECT
  USING (
    family_id IN (
      SELECT family_id FROM profiles WHERE user_id = auth.uid()
    )
  );

-- Users can create events in their family
CREATE POLICY calendar_events_insert_policy ON calendar_events
  FOR INSERT
  WITH CHECK (
    family_id IN (
      SELECT family_id FROM profiles WHERE user_id = auth.uid()
    )
  );

-- Users can update events they created or are admins in their family
CREATE POLICY calendar_events_update_policy ON calendar_events
  FOR UPDATE
  USING (
    created_by = (SELECT id FROM profiles WHERE user_id = auth.uid())
    OR
    (
      family_id IN (
        SELECT family_id FROM profiles WHERE user_id = auth.uid() AND role = 'admin'
      )
    )
  );

-- Users can delete events they created or are admins in their family
CREATE POLICY calendar_events_delete_policy ON calendar_events
  FOR DELETE
  USING (
    created_by = (SELECT id FROM profiles WHERE user_id = auth.uid())
    OR
    (
      family_id IN (
        SELECT family_id FROM profiles WHERE user_id = auth.uid() AND role = 'admin'
      )
    )
  );

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_calendar_events_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER calendar_events_updated_at_trigger
  BEFORE UPDATE ON calendar_events
  FOR EACH ROW
  EXECUTE FUNCTION update_calendar_events_updated_at();
