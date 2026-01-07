-- ============================================
-- BRZO REŠENJE: Kreiraj profil za korisnika
-- ============================================

-- Prvo proveri koje kolone postoje u tabeli
SELECT column_name 
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'profiles'
ORDER BY ordinal_position;

-- Zatim odaberi jedan od sledećih INSERT-a koji odgovara strukturi:

-- OPCIJA A: Ako imaš kolone: id, username, role, points_balance
INSERT INTO profiles (id, username, role, points_balance)
VALUES (
  '2153680a-8551-47a6-b356-9a0a8266f950',
  'Admin',
  'admin',
  0
)
ON CONFLICT (id) DO NOTHING;

-- OPCIJA B: Ako imaš kolone: id, name, role, points, level  
INSERT INTO profiles (id, name, role, points, level)
VALUES (
  '2153680a-8551-47a6-b356-9a0a8266f950',
  'Admin',
  'admin',
  0,
  1
)
ON CONFLICT (id) DO NOTHING;

-- Proveri da li je kreiran
SELECT * FROM profiles WHERE id = '2153680a-8551-47a6-b356-9a0a8266f950';
