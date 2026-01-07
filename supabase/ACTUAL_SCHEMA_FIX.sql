-- ACTUAL SCHEMA FIX for FamilySync
-- This script checks your actual schema and provides fixes

-- ==================================================
-- STEP 1: Check your actual profiles table structure
-- ==================================================
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'profiles'
ORDER BY ordinal_position;

-- ==================================================
-- STEP 2: Check if the table uses 'id' or 'user_id'
-- ==================================================
-- Run this and check the column names in the output

-- ==================================================
-- OPTION A: If your table has 'id' as PK (most likely)
-- ==================================================
-- The application needs to use 'id' to match your database
-- DO NOT run any ALTER statements yet!

-- ==================================================
-- OPTION B: If you want to change database to match app
-- ==================================================
-- Only run these if you want to change your database schema:

-- Rename id to user_id (if needed):
-- ALTER TABLE profiles RENAME COLUMN id TO user_id;

-- Rename name to username (if needed):
-- ALTER TABLE profiles RENAME COLUMN name TO username;

-- ==================================================
-- RECOMMENDED: Keep database as-is, fix application code
-- ==================================================
-- The safest approach is to update the TypeScript code
-- to match your existing database schema.
