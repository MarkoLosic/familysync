# 🎁 REWARDS SYSTEM - QUICK START

## ✅ Status: Kod je spreman, samo pokreni SQL u Supabase-u!

---

## 📋 BRZE INSTRUKCIJE:

### 1️⃣ Otvori Supabase Dashboard
```
https://app.supabase.com/project/[tvoj-projekt]/sql
```

### 2️⃣ Kopiraj i pokreni ovaj SQL:

```sql
-- ============================================
-- REWARDS SISTEM - KOMPLETAN SETUP
-- ============================================

-- 1. REWARDS TABELA
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

CREATE INDEX IF NOT EXISTS idx_rewards_family_id ON rewards(family_id);
CREATE INDEX IF NOT EXISTS idx_rewards_active ON rewards(is_active);

ALTER TABLE rewards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view family rewards" ON rewards FOR SELECT
  USING (family_id IN (SELECT family_id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Admins can manage family rewards" ON rewards FOR ALL
  USING (EXISTS (
    SELECT 1 FROM profiles
    WHERE user_id = auth.uid() AND family_id = rewards.family_id AND role = 'admin'
  ));

-- 2. REWARD CLAIMS TABELA
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

CREATE INDEX IF NOT EXISTS idx_reward_claims_user ON reward_claims(user_id);
CREATE INDEX IF NOT EXISTS idx_reward_claims_family ON reward_claims(family_id);
CREATE INDEX IF NOT EXISTS idx_reward_claims_status ON reward_claims(status);

ALTER TABLE reward_claims ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own claims" ON reward_claims FOR SELECT
  USING (
    user_id IN (SELECT user_id FROM profiles WHERE user_id = auth.uid())
    OR family_id IN (SELECT family_id FROM profiles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- 3. CLAIM_REWARD RPC FUNKCIJA
CREATE OR REPLACE FUNCTION claim_reward(p_reward_id UUID, p_user_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_reward RECORD;
  v_profile RECORD;
  v_new_balance INTEGER;
BEGIN
  SELECT * INTO v_reward FROM rewards WHERE id = p_reward_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Reward not found';
  END IF;

  IF NOT v_reward.is_active THEN
    RAISE EXCEPTION 'Reward is not active';
  END IF;

  SELECT * INTO v_profile FROM profiles WHERE user_id = p_user_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'User profile not found';
  END IF;

  IF v_profile.points < v_reward.points_required THEN
    RAISE EXCEPTION 'Insufficient points: user has % points but reward requires %',
      v_profile.points, v_reward.points_required;
  END IF;

  UPDATE profiles
  SET points = points - v_reward.points_required, updated_at = NOW()
  WHERE user_id = p_user_id
  RETURNING points INTO v_new_balance;

  INSERT INTO reward_claims (reward_id, user_id, family_id, points_spent, status)
  VALUES (p_reward_id, p_user_id, v_profile.family_id, v_reward.points_required, 'pending');

  RETURN json_build_object('success', true, 'new_balance', v_new_balance, 'message', 'Reward claimed successfully');

EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object('success', false, 'new_balance', 0, 'message', SQLERRM);
END;
$$;

GRANT EXECUTE ON FUNCTION claim_reward(UUID, UUID) TO authenticated;

COMMENT ON FUNCTION claim_reward IS 'Atomically claims a reward for a user, deducting points and creating a claim record';
```

### 3️⃣ Dodaj test podatke:

```sql
-- Dodaj test nagrade (ZAMENI 'your-family-id' sa pravim ID-jem)
INSERT INTO rewards (family_id, title, description, points_required, is_active)
VALUES
  ('your-family-id', 'Cinema Ticket', 'Movie night at the cinema', 500, true),
  ('your-family-id', 'Ice Cream', 'Your favorite ice cream', 300, true),
  ('your-family-id', 'Gaming Time', '1 hour extra gaming', 800, true),
  ('your-family-id', 'Book Store', 'Buy a book from the store', 600, true),
  ('your-family-id', 'Pizza Night', 'Pizza for dinner', 400, true);

-- Dodaj poene test korisniku (ZAMENI 'your-user-id')
UPDATE profiles SET points = 2000 WHERE user_id = 'your-user-id';
```

### 4️⃣ Pokreni aplikaciju:

```bash
npm start
# ili
expo start
```

### 5️⃣ Testiraj:

1. Otvori aplikaciju
2. Na Home screenu klikni na **Rewards** dugme (narandžasto)
3. Trebalo bi da vidiš svoje nagrade
4. Klikni **Buy** na nagradi
5. Potvrdi kupovinu
6. Proveri da su poeni oduzeti

---

## 🐛 Ako nešto ne radi:

### Problem: "function claim_reward does not exist"
**Rešenje:** Pokreni SQL iz koraka 2

### Problem: "table rewards does not exist"
**Rešenje:** Pokreni SQL iz koraka 2

### Problem: Ne vidim nagrade
**Rešenje:** 
1. Dodaj test nagrade (korak 3)
2. Proveri da `family_id` u rewards odgovara tvom family_id

### Problem: "insufficient points"
**Rešenje:** Dodaj više poena korisniku (korak 3)

---

## 📁 Dokumentacija:

- **Setup:** `md/SUPABASE_SETUP_REWARDS.md` (detaljna)
- **User Guide:** `md/REWARDS_USER_GUIDE.md`
- **Technical:** `md/PHASE_7_REWARDS_SHOP.md`
- **Summary:** `md/FAZA_7_GOTOVO.md`

---

## ✅ Gotovo!

Kod je kompletan, samo treba pokrenuti SQL u Supabase-u! 🚀
