# 🎟️ Invite Code Setup Guide

## Status: ⚠️ Implementation Required

The family service currently has **placeholder implementation** for invite code functionality. To enable invite codes, you need to set up the database properly.

---

## 📋 Current State

### ✅ What Works
- `generateInviteCode()` - Generates random 6-character codes
- `createFamily(name, userId)` - Creates family and returns invite code
- `joinFamily(familyId, userId)` - Joins family by ID directly

### ⚠️ What Needs Implementation
- **Storing invite codes** in database
- **Looking up families by invite code**
- `joinFamilyByInviteCode(code, userId)` - Currently throws helpful error

---

## 🛠️ Implementation Options

Choose **one** of these approaches:

### Option 1: Add Column to Families Table (Simplest)

**Pros:** Simple, no extra table  
**Cons:** Less flexibility, no expiration

```sql
-- Add invite_code column to families table
ALTER TABLE families 
ADD COLUMN invite_code TEXT UNIQUE;

-- Generate codes for existing families
UPDATE families 
SET invite_code = upper(substr(md5(random()::text), 1, 6))
WHERE invite_code IS NULL;

-- Make it required for new families
ALTER TABLE families 
ALTER COLUMN invite_code SET NOT NULL;
```

**Update Code:**
```typescript
// In createFamily function (family.ts)
const { data: family, error: familyError } = await supabase
  .from('families')
  .insert({
    name,
    created_by: profile.id,
    invite_code: inviteCode, // Add this
  })
  .select()
  .single()

// In joinFamilyByInviteCode function
const { data: family, error } = await supabase
  .from('families')
  .select('*')
  .eq('invite_code', inviteCode.toUpperCase())
  .single()

if (error || !family) {
  throw new Error('Invalid invite code')
}

return await joinFamily(family.id, userId)
```

---

### Option 2: Create Family Invites Table (Recommended)

**Pros:** Flexible, supports expiration, multiple codes per family  
**Cons:** More complex, extra table

```sql
-- Create family_invites table
CREATE TABLE family_invites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  code TEXT UNIQUE NOT NULL,
  created_by UUID NOT NULL REFERENCES profiles(id),
  is_active BOOLEAN DEFAULT true,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Index for fast lookups
CREATE INDEX idx_family_invites_code ON family_invites(code);
CREATE INDEX idx_family_invites_family ON family_invites(family_id);

-- Enable RLS
ALTER TABLE family_invites ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read active codes (for joining)
CREATE POLICY "Anyone can read active invite codes"
  ON family_invites FOR SELECT
  USING (is_active = true AND (expires_at IS NULL OR expires_at > now()));

-- Policy: Family admins can create codes
CREATE POLICY "Family admins can create invite codes"
  ON family_invites FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.family_id = family_invites.family_id
      AND profiles.role = 'admin'
    )
  );
```

**Update Code:**
```typescript
// In createFamily function (family.ts)
// After creating family, create invite code entry
const { error: inviteError } = await supabase
  .from('family_invites')
  .insert({
    family_id: family.id,
    code: inviteCode,
    created_by: profile.id,
  })

// In joinFamilyByInviteCode function
const { data: inviteData, error: inviteError } = await supabase
  .from('family_invites')
  .select('family_id')
  .eq('code', inviteCode.toUpperCase())
  .eq('is_active', true)
  .single()

if (inviteError || !inviteData) {
  throw new Error('Invalid or expired invite code')
}

return await joinFamily(inviteData.family_id, userId)
```

---

### Option 3: Supabase RPC Function (Most Secure)

**Pros:** Server-side validation, most secure  
**Cons:** Most complex

```sql
-- Create RPC function
CREATE OR REPLACE FUNCTION get_family_by_invite_code(code TEXT)
RETURNS TABLE (
  id UUID,
  name TEXT,
  created_by UUID,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Option 1: Using families.invite_code column
  RETURN QUERY
  SELECT f.id, f.name, f.created_by, f.created_at, f.updated_at
  FROM families f
  WHERE f.invite_code = upper(code);
  
  -- Option 2: Using family_invites table
  -- RETURN QUERY
  -- SELECT f.id, f.name, f.created_by, f.created_at, f.updated_at
  -- FROM families f
  -- JOIN family_invites fi ON f.id = fi.family_id
  -- WHERE fi.code = upper(code)
  -- AND fi.is_active = true
  -- AND (fi.expires_at IS NULL OR fi.expires_at > now());
END;
$$;
```

**Update Code:**
```typescript
// In joinFamilyByInviteCode function
const { data: familyData, error } = await supabase
  .rpc('get_family_by_invite_code', { code: inviteCode })

if (error || !familyData || familyData.length === 0) {
  throw new Error('Invalid invite code')
}

return await joinFamily(familyData[0].id, userId)
```

**Don't forget to update Supabase types:**
```typescript
// src/types/supabase.ts
Functions: {
  claim_reward: { /* existing */ },
  get_family_by_invite_code: {
    Args: { code: string }
    Returns: Array<{
      id: string
      name: string
      created_by: string
      created_at: string
      updated_at: string
    }>
  }
}
```

---

## 📝 Recommendation

**Start with Option 1** (add column) for quick MVP, then migrate to **Option 2** (separate table) when you need:
- Multiple invite codes per family
- Expiration dates
- Invite analytics
- Revoking codes

---

## ✅ After Implementation Checklist

1. [ ] Choose and implement one of the options above
2. [ ] Update `createFamily()` to store invite codes
3. [ ] Update `joinFamilyByInviteCode()` to look up families
4. [ ] Update Supabase types if using RPC
5. [ ] Test invite code flow end-to-end
6. [ ] Add error handling for expired/invalid codes
7. [ ] Document the chosen approach in README

---

## 🧪 Testing Invite Codes

After implementation, test:

1. **Create Family** → Should return invite code
2. **Join with Valid Code** → Should join successfully
3. **Join with Invalid Code** → Should show error
4. **Join with Expired Code** (if implemented) → Should show error
5. **Regenerate Code** (if implemented) → Old code should stop working

---

## 📚 Related Files

- `/src/services/family.ts` - Family service functions
- `/src/features/auth/FamilyOnboardingScreen.tsx` - UI that uses invite codes
- `/src/types/supabase.ts` - Type definitions (if using RPC)
- `/md/SUPABASE_SETUP_REWARDS.md` - Similar setup guide for rewards

---

**Current Error Message:**
```
Invite code feature requires database setup.
Please add invite code storage to Supabase (see INVITE_CODE_SETUP.md).
For now, use joinFamily(familyId, userId) directly.
```

Once you implement any of the options above, users will be able to join families using invite codes! 🎉
