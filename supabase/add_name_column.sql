-- Quick Fix: Add missing 'name' column to existing profiles table
-- Run this if you get error: "Could not find the 'name' column of 'profiles'"

-- Add name column if it doesn't exist
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS name TEXT;

-- Set default value for existing rows (if any)
UPDATE profiles 
SET name = 'User' 
WHERE name IS NULL;

-- Make name column NOT NULL after setting defaults
ALTER TABLE profiles 
ALTER COLUMN name SET NOT NULL;

-- Verify the change
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'profiles';
