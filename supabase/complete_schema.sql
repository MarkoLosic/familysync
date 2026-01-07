-- FamilySync Complete Database Schema
-- Run this in Supabase SQL Editor to set up the complete database

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- PROFILES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS profiles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'child' CHECK (role IN ('admin', 'parent', 'child')),
  family_id UUID,
  points INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Family members can view each other"
  ON profiles FOR SELECT
  USING (
    family_id IS NOT NULL AND 
    family_id IN (
      SELECT family_id FROM profiles WHERE user_id = auth.uid()
    )
  );

-- ============================================
-- FAMILIES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS families (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  invite_code TEXT UNIQUE NOT NULL,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on families
ALTER TABLE families ENABLE ROW LEVEL SECURITY;

-- Families policies
CREATE POLICY "Family members can view their family"
  ON families FOR SELECT
  USING (
    id IN (
      SELECT family_id FROM profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Authenticated users can create families"
  ON families FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Family admins can update family"
  ON families FOR UPDATE
  USING (
    id IN (
      SELECT family_id FROM profiles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================
-- TASKS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  points INTEGER NOT NULL DEFAULT 10,
  assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'approved')),
  due_date TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  approved_at TIMESTAMPTZ,
  approved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on tasks
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Tasks policies
CREATE POLICY "Family members can view family tasks"
  ON tasks FOR SELECT
  USING (
    family_id IN (
      SELECT family_id FROM profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Family members can create tasks"
  ON tasks FOR INSERT
  WITH CHECK (
    family_id IN (
      SELECT family_id FROM profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Assigned users and admins can update tasks"
  ON tasks FOR UPDATE
  USING (
    family_id IN (
      SELECT family_id FROM profiles WHERE user_id = auth.uid()
    )
    AND (
      assigned_to = auth.uid() OR
      EXISTS (
        SELECT 1 FROM profiles 
        WHERE user_id = auth.uid() 
        AND family_id = tasks.family_id 
        AND role IN ('admin', 'parent')
      )
    )
  );

-- ============================================
-- REWARDS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS rewards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  cost INTEGER NOT NULL,
  icon TEXT,
  available_count INTEGER,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on rewards
ALTER TABLE rewards ENABLE ROW LEVEL SECURITY;

-- Rewards policies
CREATE POLICY "Family members can view family rewards"
  ON rewards FOR SELECT
  USING (
    family_id IN (
      SELECT family_id FROM profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Family admins can manage rewards"
  ON rewards FOR ALL
  USING (
    family_id IN (
      SELECT family_id FROM profiles 
      WHERE user_id = auth.uid() AND role IN ('admin', 'parent')
    )
  );

-- ============================================
-- REWARD CLAIMS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS reward_claims (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reward_id UUID NOT NULL REFERENCES rewards(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'denied')),
  claimed_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Enable RLS on reward_claims
ALTER TABLE reward_claims ENABLE ROW LEVEL SECURITY;

-- Reward claims policies
CREATE POLICY "Users can view own claims"
  ON reward_claims FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Family admins can view all family claims"
  ON reward_claims FOR SELECT
  USING (
    family_id IN (
      SELECT family_id FROM profiles 
      WHERE user_id = auth.uid() AND role IN ('admin', 'parent')
    )
  );

CREATE POLICY "Users can create own claims"
  ON reward_claims FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Family admins can update claims"
  ON reward_claims FOR UPDATE
  USING (
    family_id IN (
      SELECT family_id FROM profiles 
      WHERE user_id = auth.uid() AND role IN ('admin', 'parent')
    )
  );

-- ============================================
-- CALENDAR EVENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS calendar_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  location TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on calendar_events
ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;

-- Calendar events policies
CREATE POLICY "Family members can view family events"
  ON calendar_events FOR SELECT
  USING (
    family_id IN (
      SELECT family_id FROM profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Family members can create events"
  ON calendar_events FOR INSERT
  WITH CHECK (
    family_id IN (
      SELECT family_id FROM profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Event creators and admins can update events"
  ON calendar_events FOR UPDATE
  USING (
    created_by = auth.uid() OR
    family_id IN (
      SELECT family_id FROM profiles 
      WHERE user_id = auth.uid() AND role IN ('admin', 'parent')
    )
  );

-- ============================================
-- SHOPPING ITEMS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS shopping_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  quantity INTEGER DEFAULT 1,
  category TEXT,
  is_purchased BOOLEAN DEFAULT FALSE,
  added_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  purchased_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  purchased_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on shopping_items
ALTER TABLE shopping_items ENABLE ROW LEVEL SECURITY;

-- Shopping items policies
CREATE POLICY "Family members can view family shopping items"
  ON shopping_items FOR SELECT
  USING (
    family_id IN (
      SELECT family_id FROM profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Family members can manage shopping items"
  ON shopping_items FOR ALL
  USING (
    family_id IN (
      SELECT family_id FROM profiles WHERE user_id = auth.uid()
    )
  );

-- ============================================
-- ACHIEVEMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  earned_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on achievements
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;

-- Achievements policies
CREATE POLICY "Users can view own achievements"
  ON achievements FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Family members can view each other's achievements"
  ON achievements FOR SELECT
  USING (
    user_id IN (
      SELECT user_id FROM profiles 
      WHERE family_id IN (
        SELECT family_id FROM profiles WHERE user_id = auth.uid()
      )
    )
  );

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX IF NOT EXISTS idx_profiles_family_id ON profiles(family_id);
CREATE INDEX IF NOT EXISTS idx_tasks_family_id ON tasks(family_id);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_rewards_family_id ON rewards(family_id);
CREATE INDEX IF NOT EXISTS idx_reward_claims_user_id ON reward_claims(user_id);
CREATE INDEX IF NOT EXISTS idx_reward_claims_family_id ON reward_claims(family_id);
CREATE INDEX IF NOT EXISTS idx_calendar_events_family_id ON calendar_events(family_id);
CREATE INDEX IF NOT EXISTS idx_shopping_items_family_id ON shopping_items(family_id);
CREATE INDEX IF NOT EXISTS idx_achievements_user_id ON achievements(user_id);

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function to generate invite code
CREATE OR REPLACE FUNCTION generate_invite_code()
RETURNS TEXT AS $$
DECLARE
  chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  result TEXT := '';
  i INTEGER;
BEGIN
  FOR i IN 1..6 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- TRIGGERS
-- ============================================

-- Profiles updated_at trigger
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Families updated_at trigger
DROP TRIGGER IF EXISTS update_families_updated_at ON families;
CREATE TRIGGER update_families_updated_at
  BEFORE UPDATE ON families
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Tasks updated_at trigger
DROP TRIGGER IF EXISTS update_tasks_updated_at ON tasks;
CREATE TRIGGER update_tasks_updated_at
  BEFORE UPDATE ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Rewards updated_at trigger
DROP TRIGGER IF EXISTS update_rewards_updated_at ON rewards;
CREATE TRIGGER update_rewards_updated_at
  BEFORE UPDATE ON rewards
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Calendar events updated_at trigger
DROP TRIGGER IF EXISTS update_calendar_events_updated_at ON calendar_events;
CREATE TRIGGER update_calendar_events_updated_at
  BEFORE UPDATE ON calendar_events
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Shopping items updated_at trigger
DROP TRIGGER IF EXISTS update_shopping_items_updated_at ON shopping_items;
CREATE TRIGGER update_shopping_items_updated_at
  BEFORE UPDATE ON shopping_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- COMPLETE!
-- ============================================
-- Schema setup complete!
-- Now you can use the FamilySync app with full database support.
