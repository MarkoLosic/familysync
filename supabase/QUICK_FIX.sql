-- ⚡ BRZO REŠENJE - Samo kopiraj i pokreni u Supabase SQL Editor

-- Dodaj 'name' kolonu u profiles tabelu
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS name TEXT;

-- Postavi default vrednost za postojeće podatke
UPDATE profiles 
SET name = 'User' 
WHERE name IS NULL;

-- Učini kolonu obaveznom
ALTER TABLE profiles 
ALTER COLUMN name SET NOT NULL;

-- GOTOVO! Restartuj Expo i probaj ponovo. ✅
