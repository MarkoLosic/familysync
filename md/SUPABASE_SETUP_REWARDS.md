# 🗄️ Supabase Setup za Rewards System

## Status: ✅ Kod je spreman, potrebno je samo pokrenuti SQL u Supabase-u

---

## Šta je urađeno u kodu:

### 1. TypeScript Tipovi ✅
**Fajl:** `src/types/supabase.ts`

Dodao sam `claim_reward` funkciju u Supabase tipove:

```typescript
Functions: {
  claim_reward: {
    Args: {
      p_reward_id: string
      p_user_id: string
    }
    Returns: Json
  }
}
```

### 2. Gamification Service ✅
**Fajl:** `src/services/gamification.ts`

- ✅ Funkcija `claimReward()` koristi `supabase.rpc('claim_reward', ...)`
- ✅ Error handling je implementiran
- ✅ Type casting je popravljan (`as unknown as ClaimRewardResponse`)
- ✅ Sve TypeScript greške su otklonjene

### 3. RewardsScreen ✅
**Fajl:** `src/features/rewards/RewardsScreen.tsx`

- ✅ Poziva `gamificationService.claimReward()`
- ✅ Prikazuje greške korisniku
- ✅ Refresh-uje profile nakon kupovine
- ✅ UI je kompletan

---

## Šta treba uraditi u Supabase-u:

### Korak 1: Kreiraj Rewards tabelu

Otvori Supabase SQL Editor i pokreni:

```sql
-- Create rewards table if it doesn't exist
CREATE TABLE IF NOT EXISTS rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  points_required INTEGER NOT NULL CHECK (points_required > 0),
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL
);

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_rewards_family_id ON rewards(family_id);
CREATE INDEX IF NOT EXISTS idx_rewards_active ON rewards(is_active);

-- Enable Row Level Security
ALTER TABLE rewards ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view rewards for their family
CREATE POLICY "Users can view family rewards"
  ON rewards FOR SELECT
  USING (
    family_id IN (
      SELECT family_id FROM profiles WHERE user_id = auth.uid()
    )
  );

-- Policy: Admins can manage rewards
CREATE POLICY "Admins can manage family rewards"
  ON rewards FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE user_id = auth.uid()
        AND family_id = rewards.family_id
        AND role = 'admin'
    )
  );
```

### Korak 2: Kreiraj Reward Claims tabelu

```sql
-- Create reward_claims table
CREATE TABLE IF NOT EXISTS reward_claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reward_id UUID NOT NULL REFERENCES rewards(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
  family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'fulfilled', 'denied')),
  claimed_at TIMESTAMPTZ DEFAULT NOW(),
  fulfilled_at TIMESTAMPTZ,
  fulfilled_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  points_spent INTEGER NOT NULL,
  notes TEXT
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_reward_claims_user ON reward_claims(user_id);
CREATE INDEX IF NOT EXISTS idx_reward_claims_family ON reward_claims(family_id);
CREATE INDEX IF NOT EXISTS idx_reward_claims_status ON reward_claims(status);

-- Enable RLS
ALTER TABLE reward_claims ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own claims
CREATE POLICY "Users can view own claims"
  ON reward_claims FOR SELECT
  USING (
    user_id IN (SELECT user_id FROM profiles WHERE user_id = auth.uid())
    OR
    family_id IN (
      SELECT family_id FROM profiles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );
```

### Korak 3: Pokreni claim_reward RPC funkciju

**Ovaj fajl već postoji:** `supabase/claim_reward.sql`

Kopiraj kompletan sadržaj iz fajla `supabase/claim_reward.sql` i pokreni ga u Supabase SQL Editor-u.

Ili direktno kopiraj ovo:

```sql
-- Supabase RPC Function for Claiming Rewards
CREATE OR REPLACE FUNCTION claim_reward(
  p_reward_id UUID,
  p_user_id UUID
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_reward RECORD;
  v_profile RECORD;
  v_new_balance INTEGER;
BEGIN
  -- Get reward details
  SELECT * INTO v_reward
  FROM rewards
  WHERE id = p_reward_id;

  -- Check if reward exists
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Reward not found';
  END IF;

  -- Check if reward is active
  IF NOT v_reward.is_active THEN
    RAISE EXCEPTION 'Reward is not active';
  END IF;

  -- Get user profile
  SELECT * INTO v_profile
  FROM profiles
  WHERE user_id = p_user_id;

  -- Check if profile exists
  IF NOT FOUND THEN
    RAISE EXCEPTION 'User profile not found';
  END IF;

  -- Check if user has enough points
  IF v_profile.points < v_reward.points_required THEN
    RAISE EXCEPTION 'Insufficient points: user has % points but reward requires %',
      v_profile.points, v_reward.points_required;
  END IF;

  -- Deduct points from user
  UPDATE profiles
  SET points = points - v_reward.points_required,
      updated_at = NOW()
  WHERE user_id = p_user_id
  RETURNING points INTO v_new_balance;

  -- Create reward claim record
  INSERT INTO reward_claims (
    reward_id,
    user_id,
    family_id,
    points_spent,
    status
  ) VALUES (
    p_reward_id,
    p_user_id,
    v_profile.family_id,
    v_reward.points_required,
    'pending'
  );

  -- Return success response
  RETURN json_build_object(
    'success', true,
    'new_balance', v_new_balance,
    'message', 'Reward claimed successfully'
  );

EXCEPTION
  WHEN OTHERS THEN
    -- Return error response
    RETURN json_build_object(
      'success', false,
      'new_balance', 0,
      'message', SQLERRM
    );
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION claim_reward(UUID, UUID) TO authenticated;

-- Add comment
COMMENT ON FUNCTION claim_reward IS 'Atomically claims a reward for a user, deducting points and creating a claim record';
```

### Korak 4: Dodaj Test podatke (opciono)

```sql
-- Insert sample rewards (zameni family_id sa svojim)
INSERT INTO rewards (family_id, title, description, points_required, is_active)
VALUES
  ('your-family-id-here', 'Cinema Ticket', 'Movie night at the cinema', 500, true),
  ('your-family-id-here', 'Ice Cream', 'Your favorite ice cream', 300, true),
  ('your-family-id-here', 'Gaming Time', '1 hour extra gaming', 800, true),
  ('your-family-id-here', 'Book Store', 'Buy a book from the store', 600, true),
  ('your-family-id-here', 'Pizza Night', 'Pizza for dinner', 400, true),
  ('your-family-id-here', 'New Toy', 'Choose a toy from the store', 1500, true);
```

---

## Provera da li sve radi:

### Test 1: Proveri tabele
```sql
-- Proveri da li postoje tabele
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('rewards', 'reward_claims');
```

### Test 2: Proveri funkciju
```sql
-- Proveri da li funkcija postoji
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name = 'claim_reward';
```

### Test 3: Test poziv funkcije
```sql
-- Test poziv (zameni sa realnim ID-jevima)
SELECT claim_reward(
  'reward-uuid-here'::UUID,
  'user-uuid-here'::UUID
);
```

---

## Kako testirati u aplikaciji:

### 1. Dodaj testne podatke
U Supabase Table Editor-u:
- Otvori `rewards` tabelu
- Dodaj nekoliko nagrada sa svojim `family_id`
- Postavi različite vrednosti za `points_required`

### 2. Dodaj poene test korisniku
```sql
UPDATE profiles 
SET points = 2000 
WHERE user_id = 'tvoj-user-id';
```

### 3. Testiraj aplikaciju
1. Pokreni aplikaciju
2. Navigate to Rewards screen
3. Trebalo bi da vidiš svoje nagrade
4. Klikni "Buy" na nagradi koju možeš priuštiti
5. Potvrdi kupovinu
6. Proveri da su poeni oduzeti

### 4. Proveri u bazi
```sql
-- Vidi sve claims
SELECT * FROM reward_claims;

-- Vidi poene korisnika
SELECT name, points FROM profiles WHERE user_id = 'tvoj-user-id';
```

---

## Troubleshooting:

### Error: "function claim_reward does not exist"
**Rešenje:** Pokreni SQL iz `supabase/claim_reward.sql`

### Error: "permission denied for function claim_reward"
**Rešenje:** Pokreni:
```sql
GRANT EXECUTE ON FUNCTION claim_reward(UUID, UUID) TO authenticated;
```

### Error: "table rewards does not exist"
**Rešenje:** Pokreni Korak 1 SQL

### Error: "insufficient points"
**Rešenje:** Dodaj poene korisniku:
```sql
UPDATE profiles SET points = 5000 WHERE user_id = 'tvoj-user-id';
```

### Nagrade se ne prikazuju
**Rešenje:** 
1. Proveri da li user ima `family_id`
2. Proveri da li rewards imaju isti `family_id`
3. Proveri RLS policies

---

## Quick Start Checklist:

- [ ] 1. Otvori Supabase SQL Editor
- [ ] 2. Kopiraj i pokreni SQL za `rewards` tabelu
- [ ] 3. Kopiraj i pokreni SQL za `reward_claims` tabelu
- [ ] 4. Kopiraj i pokreni `claim_reward` funkciju iz `supabase/claim_reward.sql`
- [ ] 5. Dodaj test rewards (zameni `family_id`)
- [ ] 6. Dodaj poene test korisniku
- [ ] 7. Pokreni aplikaciju
- [ ] 8. Navigiraj na Rewards screen
- [ ] 9. Testiraj kupovinu
- [ ] 10. Proveri u bazi da su poeni oduzeti

---

## SQL Fajlovi u projektu:

```
supabase/
├── claim_reward.sql        ✅ RPC funkcija (već postoji)
├── calendar_events.sql     ✅ Calendar tabela
├── family_invites.sql      ✅ Family sistem
├── shopping_items.sql      ✅ Shopping lista
└── tasks_schema_update.sql ✅ Tasks sistem
```

**Napomena:** Samo treba pokrenuti SQL fajlove u Supabase-u. Kod je već kompletan!

---

## Dodatne funkcije za budućnost:

### Fulfill Reward (za roditelje)
```sql
CREATE OR REPLACE FUNCTION fulfill_reward_claim(
  p_claim_id UUID,
  p_admin_user_id UUID
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Proveri da je korisnik admin
  -- Ažuriraj claim status na 'fulfilled'
  -- Vrati success
END;
$$;
```

### Get Pending Claims (za roditelje)
```sql
CREATE OR REPLACE FUNCTION get_pending_claims(
  p_family_id UUID
)
RETURNS TABLE (
  claim_id UUID,
  reward_title TEXT,
  child_name TEXT,
  points_spent INTEGER,
  claimed_at TIMESTAMPTZ
)
LANGUAGE plpgsql
AS $$
BEGIN
  -- Return all pending claims for family
END;
$$;
```

---

**Status:** ✅ Kod je spreman i bez grešaka!  
**Sledeći korak:** Pokreni SQL u Supabase-u i testiraj aplikaciju!
