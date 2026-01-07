# ✅ Quick Checklist - Get Your App Running

## Step 1: Environment Setup (2 minutes)

- [ ] Create `.env` file
  ```bash
  cp .env.example .env
  ```

- [ ] Add your Supabase credentials to `.env`
  ```env
  EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
  EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
  ```
  
  **Get these from:** [Supabase Dashboard](https://supabase.com/dashboard) → Settings → API

## Step 2: Database Migration (1 minute)

- [ ] Open [Supabase SQL Editor](https://supabase.com/dashboard)
- [ ] Copy contents of `supabase/family_invites.sql`
- [ ] Paste and run in SQL Editor
- [ ] Verify tables exist:
  - [ ] `public.profiles`
  - [ ] `public.families`
  - [ ] `public.family_invites`

## Step 3: Start the App (30 seconds)

- [ ] Run the dev server
  ```bash
  npm start
  ```

- [ ] Open on device
  - [ ] Press `i` for iOS Simulator
  - [ ] Press `a` for Android Emulator
  - [ ] Scan QR with Expo Go app

## Step 4: Test the Flow (3 minutes)

### Test 1: Create Family
- [ ] App opens on **LoginScreen**
- [ ] Tap "Create Account"
- [ ] Fill in:
  - Email: `dad@test.com`
  - Password: `password123`
  - Name: `John Smith`
- [ ] Tap "Create Account"
- [ ] Should redirect to **FamilyOnboardingScreen**
- [ ] Tap "Create a Family"
- [ ] Enter family name: `Test Family`
- [ ] Tap "Create Family"
- [ ] **Write down the invite code** (e.g., `XY7K2M`)
- [ ] Should redirect to **Home screen** ✅

### Test 2: Join Family
- [ ] On Home screen, tap your profile/settings
- [ ] Tap "Logout" (or restart app)
- [ ] On **LoginScreen**, tap "Create Account"
- [ ] Fill in:
  - Email: `mom@test.com`
  - Password: `password123`
  - Name: `Jane Smith`
- [ ] Tap "Create Account"
- [ ] Should redirect to **FamilyOnboardingScreen**
- [ ] Tap "Join a Family"
- [ ] Enter the invite code from Test 1 (e.g., `XY7K2M`)
- [ ] Tap "Join Family"
- [ ] Should redirect to **Home screen** ✅

### Test 3: Verify in Supabase
- [ ] Open Supabase Table Editor
- [ ] Check `profiles` table:
  - [ ] Both users (dad@test.com, mom@test.com) exist
  - [ ] Both have same `family_id`
- [ ] Check `families` table:
  - [ ] One family exists ("Test Family")
- [ ] Check `family_invites` table:
  - [ ] One invite code exists (linked to family)

## 🎉 Success Criteria

If all tests pass:
- ✅ Authentication works (login/register)
- ✅ Family creation works (generates codes)
- ✅ Family joining works (validates codes)
- ✅ Navigation works (routes based on state)
- ✅ Database integration works (Supabase)
- ✅ State management works (Zustand)

**YOU'RE READY TO BUILD!** 🚀

---

## 🐛 Troubleshooting

### Issue: App won't start
```bash
rm -rf node_modules
npm install
npx expo start --clear
```

### Issue: "Cannot find module"
```bash
npm install
npx expo start --clear
```

### Issue: Supabase connection error
- Check `.env` file exists
- Verify credentials are correct
- Check `EXPO_PUBLIC_` prefix on env vars
- Restart Metro: `npx expo start --clear`

### Issue: Invite code doesn't work
- Run `supabase/family_invites.sql` migration
- Check trigger `generate_invite_code` exists in Supabase
- Verify RLS policies are enabled

### Issue: Can't see other family members
- Check both users have same `family_id` in Supabase
- Verify RLS policies allow family members to see each other

---

## 📚 Need Help?

Check these docs:
- **QUICK_START.md** - Detailed setup guide
- **AUTH_SETUP_COMPLETE.md** - Full auth documentation
- **PROJECT_OVERVIEW.md** - Visual summary
- **README.md** - Project info

---

**Good luck!** 💜

*Print this checklist and check off each step as you go!*
