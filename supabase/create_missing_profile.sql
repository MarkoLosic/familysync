-- ============================================
-- KREIRAJ PROFIL ZA POSTOJEĆEG KORISNIKA
-- ============================================

-- Proveri da li korisnik postoji u auth.users
SELECT id, email, created_at 
FROM auth.users 
WHERE id = '2153680a-8551-47a6-b356-9a0a8266f950';

-- Proveri da li profil već postoji
SELECT * 
FROM profiles 
WHERE id = '2153680a-8551-47a6-b356-9a0a8266f950';

-- Kreiraj profil ako ne postoji
INSERT INTO profiles (id, username, role, points_balance)
VALUES (
  '2153680a-8551-47a6-b356-9a0a8266f950',
  'User',  -- Promeni ovo u željeno korisničko ime
  'admin',
  0
)
ON CONFLICT (id) DO NOTHING;

-- Proveri da li je profil kreiran
SELECT * 
FROM profiles 
WHERE id = '2153680a-8551-47a6-b356-9a0a8266f950';


-- ============================================
-- DODAJ TRIGGER ZA AUTO-KREIRANJE PROFILA
-- ============================================

-- Ova funkcija će automatski kreirati profil kada se kreira novi korisnik
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, role, points_balance)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', NEW.email, 'User'),
    'admin',
    0
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Obriši postojeći trigger ako postoji
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Kreiraj novi trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW 
  EXECUTE FUNCTION public.handle_new_user();

-- Proveri sve korisnike koji nemaju profile
SELECT u.id, u.email, u.created_at
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
WHERE p.id IS NULL;

-- Kreiraj profile za sve korisnike koji nemaju profile
INSERT INTO profiles (id, username, role, points_balance)
SELECT 
  u.id,
  COALESCE(u.raw_user_meta_data->>'username', u.email, 'User'),
  'admin',
  0
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
WHERE p.id IS NULL
ON CONFLICT (id) DO NOTHING;

-- Finalna provera
SELECT 
  u.id, 
  u.email, 
  p.username, 
  p.role, 
  p.points_balance,
  p.created_at
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
ORDER BY u.created_at DESC;
