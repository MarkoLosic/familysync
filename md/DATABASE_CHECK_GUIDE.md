# 🔍 Provera i Čišćenje Supabase Baze

## KORAK PO KORAK

### Korak 1: Proveri šta postoji u bazi

**Idi na Supabase Dashboard:**
1. https://supabase.com/dashboard
2. Otvori projekat
3. Klikni **SQL Editor**
4. Klikni **New query**

**Kopiraj i pokreni ovaj upit:**

```sql
-- Proveri da li tabela profiles postoji
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'profiles';
```

---

## SCENARIO A: Tabela NE POSTOJI ❌

**Rezultat:** Nema rezultata (prazan)

**Šta da uradiš:**
1. Kopiraj SVE iz `supabase/complete_schema.sql`
2. Nalepi u SQL Editor
3. Klikni **Run**
4. ✅ Gotovo!

---

## SCENARIO B: Tabela POSTOJI ✅

**Rezultat:** Vidiš "profiles"

**Proveri koje kolone ima:**

```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'profiles'
ORDER BY ordinal_position;
```

### Ako NEMA kolonu `name`:

**Pokreni:**
```sql
ALTER TABLE profiles ADD COLUMN name TEXT NOT NULL DEFAULT 'User';
```

### Ako IMA kolonu `name`:

**Proveri da li je NOT NULL:**
```sql
ALTER TABLE profiles ALTER COLUMN name SET NOT NULL;
```

---

## SCENARIO C: Imam podatke u tabeli koji prave problem 🗑️

**Proveri koliko ima podataka:**

```sql
SELECT COUNT(*) FROM profiles;
```

**Ako ima podataka i praviš probleme:**

### PAŽNJA: Ovo briše SVE podatke! ⚠️

```sql
-- OBRIŠI SVE iz profiles
TRUNCATE TABLE profiles CASCADE;

-- OBRIŠI SVE tabele ako želiš čist start
DROP TABLE IF EXISTS achievements CASCADE;
DROP TABLE IF EXISTS shopping_items CASCADE;
DROP TABLE IF EXISTS calendar_events CASCADE;
DROP TABLE IF EXISTS reward_claims CASCADE;
DROP TABLE IF EXISTS rewards CASCADE;
DROP TABLE IF EXISTS tasks CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;
DROP TABLE IF EXISTS families CASCADE;
```

**Posle brisanja:**
1. Kopiraj SVE iz `supabase/complete_schema.sql`
2. Pokreni u SQL Editor
3. Kreiraće sve tabele ispočetka

---

## PREPORUKA 🎯

### Za produkciju (ako imaš korisničke podatke):

**NE BRIŠI podatke!** Samo dodaj kolonu:

```sql
-- Dodaj name kolonu ako ne postoji
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS name TEXT;

-- Postavi default vrednost za postojeće redove
UPDATE profiles 
SET name = COALESCE(name, 'User') 
WHERE name IS NULL OR name = '';

-- Napravi kolonu obaveznom
ALTER TABLE profiles 
ALTER COLUMN name SET NOT NULL;
```

### Za development (test app):

**Obriši sve i kreiraj ispočetka:**

```sql
-- 1. Obriši sve tabele
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;

-- 2. Pokreni complete_schema.sql
-- (kopiraj i nalepi sve)
```

---

## Quick Check Upiti 📊

### Proveri sve tabele:
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;
```

### Proveri profiles strukturu:
```sql
\d profiles
-- ili
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'profiles';
```

### Proveri koliko ima korisnika:
```sql
SELECT COUNT(*) as total_users FROM profiles;
SELECT * FROM profiles LIMIT 5;
```

---

## Moja Preporuka za Tebe 💡

Pošto imaš grešku `Could not find the 'name' column`, najverovatnije:

1. **Tabela profiles postoji**
2. **Ali nema kolonu `name`**

### Jednostavno rešenje:

**Pokreni ovo u SQL Editor:**

```sql
-- Dodaj name kolonu
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS name TEXT NOT NULL DEFAULT 'User';

-- Proveri da li je uspelo
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'profiles' AND column_name = 'name';
```

**Ako vidiš "name" u rezultatu → Uspelo je!** ✅

---

## Posle SQL-a

**Restartuj Expo:**
```bash
cd /Users/markolosic/Desktop/Bravo/familysync
npx expo start --clear
```

**Probaj registraciju ponovo!** 🎉

---

## Ako i dalje ne radi

**Obriši SVE i kreiraj ispočetka:**

```sql
-- 1. Obriši sve (PAŽNJA!)
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;

-- 2. Kopiraj i pokreni complete_schema.sql
```

---

**Javi mi šta si našao kada pokreneš check upite!** 🔍
