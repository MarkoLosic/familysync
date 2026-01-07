-- Fix profiles table schema to match application expectations
-- Run this in Supabase SQL Editor

-- 1. Check current schema
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'profiles'
ORDER BY ordinal_position;

-- 2. If the table uses 'id' instead of 'user_id', we need to understand the actual schema
-- Let's check what columns exist:
SELECT * FROM profiles LIMIT 1;

-- 3. The application expects this schema:
-- profiles (
--   user_id UUID PRIMARY KEY REFERENCES auth.users(id),
--   family_id UUID,
--   username TEXT NOT NULL,
--   avatar_url TEXT,
--   role TEXT CHECK (role IN ('admin', 'child')),
--   points INTEGER DEFAULT 0,
--   created_at TIMESTAMPTZ,
--   updated_at TIMESTAMPTZ
-- )

-- 4. If your table has 'id' instead of 'user_id', run:
-- ALTER TABLE profiles RENAME COLUMN id TO user_id;

-- 5. If your table has 'name' instead of 'username', run:
-- ALTER TABLE profiles RENAME COLUMN name TO username;

-- After running this script, please share the results so we can apply the correct fix.
