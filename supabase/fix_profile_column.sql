-- ============================================
-- FIX PROFILES TABLE COLUMN NAME
-- ============================================
-- Problem: Tabela koristi 'user_id' ali TypeScript kod očekuje 'id'
-- Rešenje: Preimenuj kolonu ili dodaj trigger za automatsko kreiranje profila

-- OPTION 1: Preimenuj 'user_id' u 'id' (PREPORUČENO)
-- ============================================

-- Prvo ukloni postojeći primary key constraint
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_pkey;

-- Preimenuj kolonu
ALTER TABLE profiles RENAME COLUMN user_id TO id;

-- Dodaj nazad primary key constraint
ALTER TABLE profiles ADD PRIMARY KEY (id);

-- Proveri promene
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'profiles'
ORDER BY ordinal_position;


-- ============================================
-- OPTION 2: Dodaj Trigger za Auto-kreiranje Profila
-- ============================================
-- Ovo će automatski kreirati profil kada se kreira novi auth user

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, role, points, level)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    'admin',
    0,
    1
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Obriši postojeći trigger ako postoji
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Kreiraj novi trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- ============================================
-- PROVERA: Kreiraj profil za postojećeg korisnika ako ne postoji
-- ============================================

-- Pronađi korisnike koji nemaju profile
SELECT u.id, u.email, u.created_at
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
WHERE p.id IS NULL;

-- Kreiraj profile za korisnike bez profila
INSERT INTO profiles (id, name, role, points, level)
SELECT 
  u.id,
  COALESCE(u.raw_user_meta_data->>'name', u.email, 'User'),
  'admin',
  0,
  1
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
WHERE p.id IS NULL
ON CONFLICT (id) DO NOTHING;
