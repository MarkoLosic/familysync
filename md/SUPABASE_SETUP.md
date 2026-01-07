# 🔧 Supabase Baza - Setup Uputstvo

**Problem:** `Could not find the 'name' column of 'profiles' in the schema cache`

**Razlog:** Supabase baza nema kreiranu kompletnu šemu sa svim tabelama.

## ✅ Rešenje

### Korak 1: Otvori Supabase Dashboard

1. Idi na: https://supabase.com/dashboard
2. Uloguj se
3. Otvori svoj projekat: **familysync-czcxwyjrxzcuqapzcjup**

### Korak 2: Otvori SQL Editor

1. U levom meniju klikni na **"SQL Editor"**
2. Klikni **"New query"**

### Korak 3: Kopiraj i pokreni SQL

1. Otvori fajl: `/Users/markolosic/Desktop/Bravo/familysync/supabase/complete_schema.sql`
2. **Kopiraj SVE** iz tog fajla
3. **Nalepi** u SQL Editor
4. Klikni **"Run"** (ili pritisni Cmd/Ctrl + Enter)

### Korak 4: Proveri da li je uspelo

Nakon pokretanja SQL-a, trebalo bi da vidiš:

```
Success. No rows returned
```

### Korak 5: Proveri tabele

1. U levom meniju klikni na **"Table Editor"**
2. Trebalo bi da vidiš ove tabele:
   - ✅ **profiles** (sa kolonom `name`)
   - ✅ **families**
   - ✅ **tasks**
   - ✅ **rewards**
   - ✅ **reward_claims**
   - ✅ **calendar_events**
   - ✅ **shopping_items**
   - ✅ **achievements**

### Korak 6: Restartuj Expo

```bash
cd /Users/markolosic/Desktop/Bravo/familysync
npx expo start --clear
```

## 📊 Šta SQL radi

### Kreira tabele:

1. **profiles** - Korisnici (user_id, **name**, role, family_id, points, level)
2. **families** - Porodice (id, name, invite_code)
3. **tasks** - Zadaci (title, description, points, status, assigned_to)
4. **rewards** - Nagrade (title, cost, available_count)
5. **reward_claims** - Zatražene nagrade
6. **calendar_events** - Kalendar događaji
7. **shopping_items** - Shopping lista
8. **achievements** - Dostignuća

### Postavlja Row Level Security (RLS):

- Korisnici mogu videti samo svoje podatke
- Članovi porodice mogu videti podatke svoje porodice
- Admini mogu upravljati podacima

### Dodaje indexe:

Za brže query-je na često korišćenim kolonama

### Dodaje funkcije:

- `generate_invite_code()` - Generiše random invite code
- `update_updated_at_column()` - Automatski update timestamp

### Dodaje triggere:

- Automatski update `updated_at` na svim tabelama

## 🔐 Credentials Check

Proveri da `.env` fajl ima tačne podatke:

```bash
cat /Users/markolosic/Desktop/Bravo/familysync/.env
```

Trebalo bi da vidiš:
```
EXPO_PUBLIC_SUPABASE_URL=https://czcxwyjrxzcuqapzcjup.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## ❌ Ako ne radi

### Problem: "relation profiles does not exist"

**Rešenje:** SQL nije uspešno izvršen. Pokušaj ponovo:

1. Obriši sve tabele u Supabase Dashboard (Table Editor)
2. Pokreni `complete_schema.sql` ponovo

### Problem: "permission denied"

**Rešenje:** Proveri da li si ulogovan u pravi Supabase projekat.

### Problem: "duplicate key value violates unique constraint"

**Rešenje:** Tabele već postoje. Možeš:
- Obrisati stare tabele i pokrenuti SQL ponovo, ili
- Samo dodati nedostajuće kolone

**Dodavanje samo `name` kolone:**

```sql
-- Samo ako tabela profiles već postoji ali nema 'name' kolonu
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS name TEXT NOT NULL DEFAULT '';
```

## ✅ Posle Setup-a

Kada je baza spremna, probaj:

1. **Register** - Napravi novi account
2. **Login** - Uloguj se
3. **Create Family** - Napravi porodicu
4. **Invite Members** - Pozovi članove

## 📝 Struktura Profiles Tabele

```sql
CREATE TABLE profiles (
  user_id UUID PRIMARY KEY,
  name TEXT NOT NULL,              -- ⭐ Ovo je bilo nedostajalo!
  role TEXT NOT NULL DEFAULT 'child',
  family_id UUID,
  points INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

## 🎯 Next Steps

Nakon što je baza setup:

1. ✅ Restartuj Expo
2. ✅ Probaj da se registruješ
3. ✅ Proveri da li radi
4. ✅ Napravi porodicu
5. ✅ Dodaj zadatke i nagrade

---

**Javi mi kada pokreneš SQL i da li je uspelo!** 🚀
