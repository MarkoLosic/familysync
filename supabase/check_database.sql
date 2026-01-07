-- ============================================
-- PROVERA TABELA I KOLONA
-- ============================================

-- 1. PROVERI DA LI TABELA 'profiles' POSTOJI
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'profiles';

-- Ako vraća 'profiles' → tabela postoji
-- Ako ne vraća ništa → tabela NE postoji


-- 2. PROVERI SVE KOLONE U 'profiles' TABELI
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'profiles'
ORDER BY ordinal_position;

-- Proveri da li postoji kolona 'name'


-- 3. PROVERI KOLIKO IMA REDOVA U 'profiles' TABELI
SELECT COUNT(*) as total_rows 
FROM profiles;


-- 4. PROVERI SVE PODATKE U 'profiles' TABELI (ako ima malo redova)
SELECT * FROM profiles LIMIT 10;


-- 5. PROVERI SVE TABELE U BAZI
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;


-- ============================================
-- NA OSNOVU REZULTATA:
-- ============================================

-- SCENARIO A: Ako 'profiles' NE POSTOJI
-- → Pokreni: complete_schema.sql

-- SCENARIO B: Ako 'profiles' POSTOJI ali nema kolonu 'name'
-- → Pokreni: add_name_column.sql

-- SCENARIO C: Ako 'profiles' POSTOJI i ima kolonu 'name'
-- → Proveri da li je NOT NULL:
ALTER TABLE profiles 
ALTER COLUMN name SET NOT NULL;

-- SCENARIO D: Ako 'profiles' ima podatke koji će praviti problem
-- → OBRIŠI podatke (PAŽNJA: Ovo briše sve!):
TRUNCATE TABLE profiles CASCADE;
-- Nakon toga pokreni complete_schema.sql ponovo
