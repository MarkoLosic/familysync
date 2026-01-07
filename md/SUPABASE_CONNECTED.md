# ✅ Supabase Povezan!

**Date:** January 4, 2026  
**Status:** 🎉 Ready to Connect

---

## 🔗 Supabase Configuration

### ✅ Environment Variables Postavljene

```env
EXPO_PUBLIC_SUPABASE_URL=https://evfmtotuscitppawnkcs.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_LSKDyOcZfS33hAz-ZG4YMA_yjYWiW_I
```

**Fajl:** `.env` ✅

---

## 📋 Supabase Client Konfiguracija

**Fajl:** `src/services/supabase.ts` ✅

```typescript
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})
```

---

## ✅ Šta Je Spremno

1. ✅ `.env` fajl sa pravim credentials
2. ✅ Supabase client konfigurisan
3. ✅ TypeScript types definisani
4. ✅ Auth storage spremno

---

## 🚀 Sledeći Korak: Pokreni Aplikaciju

```bash
cd /Users/markolosic/Desktop/Bravo/familysync
npx expo start --clear
```

Aplikacija će se sada povezati sa tvojom Supabase bazom!

---

## 🗄️ Database Setup (Ako Nisi Već)

Trebaš da kreiraš tabele u Supabase:

### Quick Setup:

1. Idi na: https://supabase.com/dashboard/project/evfmtotuscitppawnkcs
2. Klikni **SQL Editor**
3. Pokreni SQL iz fajla: `md/SUPABASE_SETUP_REWARDS.md`

**Ili koristi ovaj quick setup SQL:**

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create families table
CREATE TABLE IF NOT EXISTS public.families (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  invite_code TEXT UNIQUE
);

-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'child')),
  points INTEGER DEFAULT 0,
  family_id UUID REFERENCES public.families(id) ON DELETE SET NULL,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create tasks table
CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT CHECK (category IN ('chore', 'homework', 'other')),
  points INTEGER DEFAULT 0,
  status TEXT NOT NULL CHECK (status IN ('active', 'pending_approval', 'completed', 'rejected')),
  assigned_to UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  family_id UUID REFERENCES public.families(id) ON DELETE CASCADE,
  due_date TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create rewards table
CREATE TABLE IF NOT EXISTS public.rewards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  points_required INTEGER NOT NULL,
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  family_id UUID REFERENCES public.families(id) ON DELETE CASCADE,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create reward_claims table
CREATE TABLE IF NOT EXISTS public.reward_claims (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reward_id UUID REFERENCES public.rewards(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  points_spent INTEGER NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'fulfilled', 'cancelled')),
  claimed_at TIMESTAMPTZ DEFAULT NOW(),
  fulfilled_at TIMESTAMPTZ
);

-- Enable RLS
ALTER TABLE public.families ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reward_claims ENABLE ROW LEVEL SECURITY;

-- Basic RLS Policies
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);
```

---

## 🧪 Test Connection

Kada pokreneš aplikaciju, testiraj:

### 1. Registration
```
Email: test@example.com
Password: password123
Name: Test User
```

### 2. Login
- Koristi iste credentials

### 3. Create Family
- Name: "Test Family"
- Dobićeš invite code

Ako sve radi, Supabase je uspešno povezan! 🎉

---

## 🔍 Verifikacija

Proveri da li tabele postoje:
1. Idi na: https://supabase.com/dashboard/project/evfmtotuscitppawnkcs
2. Klikni **Table Editor**
3. Trebalo bi da vidiš:
   - families
   - profiles
   - tasks
   - rewards
   - reward_claims

Ako ne vidiš tabele, pokreni SQL gore! ☝️

---

## ✅ Checklist

- [x] `.env` fajl kreiran sa pravim credentials
- [x] Supabase client konfigurisan
- [ ] SQL tabele kreirane u Supabase
- [ ] RLS policies postavljene
- [ ] Aplikacija pokrenuta
- [ ] Registration testiran
- [ ] Login testiran
- [ ] Family creation testiran

---

## 🚀 Sad Pokreni Aplikaciju!

```bash
npx expo start --clear
```

**Pritisni `a` za Android ili skeniraj QR kod!** 📱

---

**Javi mi kada pokreneš - testirajmo registraciju!** 🎉
