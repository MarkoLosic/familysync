-- ============================================
-- KOMPLETNO REŠENJE ZA PROFILE
-- ============================================
-- Provera i kreiranje profila sa automatskim triggerom

-- KORAK 1: Proveri stvarnu strukturu tabele profiles
-- ============================================
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'profiles'
ORDER BY ordinal_position;

-- KORAK 2: Proveri postojeće korisnike
-- ============================================
SELECT 
  u.id, 
  u.email, 
  u.created_at,
  CASE WHEN p.id IS NULL THEN 'NEMA PROFIL' ELSE 'IMA PROFIL' END as status
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
ORDER BY u.created_at DESC;

-- KORAK 3: Kreiraj profil za korisnika sa ID-jem iz greške
-- ============================================
-- Pokušaj 1: Ako tabela koristi 'username' i 'points_balance'
INSERT INTO profiles (id, username, role, points_balance)
VALUES (
  '2153680a-8551-47a6-b356-9a0a8266f950',
  'Admin User',
  'admin',
  0
)
ON CONFLICT (id) DO UPDATE SET
  username = EXCLUDED.username,
  role = EXCLUDED.role,
  points_balance = COALESCE(profiles.points_balance, EXCLUDED.points_balance);

-- Pokušaj 2: Ako tabela koristi 'name', 'points', i 'level'
-- (Odkomentiraj ako gornji INSERT ne radi)
/*
INSERT INTO profiles (id, name, role, points, level)
VALUES (
  '2153680a-8551-47a6-b356-9a0a8266f950',
  'Admin User',
  'admin',
  0,
  1
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  role = EXCLUDED.role,
  points = COALESCE(profiles.points, EXCLUDED.points);
*/

-- KORAK 4: Kreiraj ili zameni funkciju za automatsko kreiranje profila
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Pokušaj da ubaciš sa kolonama username i points_balance
  BEGIN
    INSERT INTO public.profiles (id, username, role, points_balance)
    VALUES (
      NEW.id,
      COALESCE(
        NEW.raw_user_meta_data->>'username',
        NEW.raw_user_meta_data->>'name',
        split_part(NEW.email, '@', 1),
        'User'
      ),
      COALESCE(NEW.raw_user_meta_data->>'role', 'admin'),
      0
    )
    ON CONFLICT (id) DO NOTHING;
    
    RETURN NEW;
  EXCEPTION WHEN undefined_column THEN
    -- Ako ne postoje te kolone, pokušaj sa name, points, level
    INSERT INTO public.profiles (id, name, role, points, level)
    VALUES (
      NEW.id,
      COALESCE(
        NEW.raw_user_meta_data->>'name',
        NEW.raw_user_meta_data->>'username',
        split_part(NEW.email, '@', 1),
        'User'
      ),
      COALESCE(NEW.raw_user_meta_data->>'role', 'admin'),
      0,
      1
    )
    ON CONFLICT (id) DO NOTHING;
    
    RETURN NEW;
  END;
END;
$$ LANGUAGE plpgsql;

-- KORAK 5: Obriši stari trigger i kreiraj novi
-- ============================================
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW 
  EXECUTE FUNCTION public.handle_new_user();

-- KORAK 6: Kreiraj profile za SVE postojeće korisnike koji ih nemaju
-- ============================================
-- Pokušaj sa username i points_balance
DO $$
DECLARE
  user_record RECORD;
  username_val TEXT;
BEGIN
  FOR user_record IN 
    SELECT u.id, u.email, u.raw_user_meta_data
    FROM auth.users u
    LEFT JOIN profiles p ON u.id = p.id
    WHERE p.id IS NULL
  LOOP
    BEGIN
      username_val := COALESCE(
        user_record.raw_user_meta_data->>'username',
        user_record.raw_user_meta_data->>'name',
        split_part(user_record.email, '@', 1),
        'User'
      );
      
      INSERT INTO profiles (id, username, role, points_balance)
      VALUES (user_record.id, username_val, 'admin', 0)
      ON CONFLICT (id) DO NOTHING;
      
    EXCEPTION WHEN undefined_column THEN
      -- Pokušaj sa name, points, level
      INSERT INTO profiles (id, name, role, points, level)
      VALUES (user_record.id, username_val, 'admin', 0, 1)
      ON CONFLICT (id) DO NOTHING;
    END;
  END LOOP;
END $$;

-- KORAK 7: Finalna provera
-- ============================================
SELECT 
  u.id, 
  u.email,
  u.created_at as user_created,
  p.*
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
ORDER BY u.created_at DESC;

-- KORAK 8: Test da li trigger radi
-- ============================================
SELECT 
  t.tgname as trigger_name,
  t.tgenabled as enabled,
  p.proname as function_name
FROM pg_trigger t
JOIN pg_proc p ON t.tgfoid = p.oid
JOIN pg_class c ON t.tgrelid = c.oid
WHERE c.relname = 'users'
  AND t.tgname = 'on_auth_user_created';
