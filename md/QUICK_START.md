# 🚀 Quick Start Guide

## Get Your FamilySync App Running in 3 Steps

### Step 1: Configure Supabase

Create a `.env` file in the project root:

```bash
# In /Users/markolosic/Desktop/Bravo/familysync/
touch .env
```

Add your Supabase credentials:

```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

**Where to find these:**
1. Go to [supabase.com](https://supabase.com)
2. Open your project
3. Click "Settings" → "API"
4. Copy "Project URL" and "anon/public" key

### Step 2: Run Database Migrations

In your Supabase SQL Editor, run these migrations:

#### A. Family Invites Table
```bash
# Copy and paste the contents of:
supabase/family_invites.sql
```

#### B. Verify Tables Exist
Check that you have these tables:
- ✅ `public.profiles`
- ✅ `public.families`
- ✅ `public.family_invites`
- ✅ `public.tasks`
- ✅ `public.rewards`

### Step 3: Start the App

```bash
# Make sure you're in the project directory
cd /Users/markolosic/Desktop/Bravo/familysync

# Start Expo dev server
npm start
```

Then:
- Press **`i`** for iOS Simulator
- Press **`a`** for Android Emulator
- Scan QR code with Expo Go app on your phone

## 🧪 Test the Complete Flow

### Scenario 1: Create a New Family

1. **Register Dad**
   - Email: `dad@smith.com`
   - Password: `password123`
   - Name: `John Smith`
   - Click "Create Account"

2. **Create Family**
   - Tap "Create a Family"
   - Enter: `Smith Family`
   - Click "Create Family"
   - **Note the invite code** (e.g., `XY7K2M`)

3. **You're in!** 🎉
   - Now at the Home screen
   - Dad is the family owner

### Scenario 2: Mom Joins the Family

1. **Register Mom**
   - Email: `mom@smith.com`
   - Password: `password123`
   - Name: `Jane Smith`
   - Click "Create Account"

2. **Join Family**
   - Tap "Join a Family"
   - Enter the invite code: `XY7K2M`
   - Click "Join Family"

3. **Success!** 🎉
   - Mom is now part of Smith Family
   - Both users share the same family_id

### Scenario 3: Login Existing User

1. **On Login Screen**
   - Email: `dad@smith.com`
   - Password: `password123`
   - Click "Log In"

2. **Direct to Home**
   - Automatically loads family data
   - Shows "Welcome to FamilySync!"

## 🔍 Verify It Works

### Check Auth Store State

After login, you should see in the app state:
```typescript
{
  session: { user: {...}, access_token: "..." },
  userProfile: {
    id: "uuid",
    email: "dad@smith.com",
    full_name: "John Smith",
    family_id: "family-uuid",
    role: "parent",
    points: 0
  },
  familyDetails: {
    id: "family-uuid",
    name: "Smith Family",
    created_by: "uuid",
    member_count: 2
  }
}
```

### Check Supabase Database

In Supabase Table Editor:

**profiles table:**
| id | email | full_name | family_id | role | points |
|----|-------|-----------|-----------|------|--------|
| ... | dad@smith.com | John Smith | xyz | parent | 0 |
| ... | mom@smith.com | Jane Smith | xyz | parent | 0 |

**families table:**
| id | name | created_by |
|----|------|-----------|
| xyz | Smith Family | ... |

**family_invites table:**
| id | family_id | code | expires_at |
|----|-----------|------|-----------|
| ... | xyz | XY7K2M | 2026-02-03 |

## 🐛 Common Issues

### Issue: "Cannot find module 'react'"
**Fix:**
```bash
rm -rf node_modules
npm install
npx expo start --clear
```

### Issue: "Supabase client error"
**Fix:**
- Check `.env` file exists
- Verify `EXPO_PUBLIC_` prefix on env vars
- Restart Metro: `npx expo start --clear`

### Issue: "Navigation error"
**Fix:**
```bash
npm install @react-navigation/native @react-navigation/native-stack
npx expo start --clear
```

### Issue: "Invite code not working"
**Fix:**
- Run `supabase/family_invites.sql` migration
- Check RLS policies are enabled
- Verify trigger `generate_invite_code` exists

### Issue: "ClassNameList is undefined" (NativeWind)
**Fix:**
- Make sure `tailwind.config.js` exists
- Check `babel.config.js` has `nativewind/babel`
- Restart: `npx expo start --clear`

## 📱 Next Steps

### 1. Customize the Home Screen
Replace the placeholder in `src/navigation/MainNavigator.tsx`:
```typescript
import { HomeScreen } from '@/features/home/HomeScreen';
// Replace HomeScreen component
```

### 2. Add More Screens
Create these features:
- **Tasks**: Create/assign/complete tasks
- **Rewards**: Create/claim rewards
- **Profile**: Edit profile, manage family
- **Calendar**: View family events

### 3. Enhance UI
- Add avatars using Supabase Storage
- Add animations with Reanimated
- Add haptic feedback
- Add toast notifications

### 4. Add Features
- Push notifications
- Deep linking for invite codes
- Family chat
- Photo sharing
- Calendar integration

## 📚 Documentation

- **[AUTH_SETUP_COMPLETE.md](./AUTH_SETUP_COMPLETE.md)**: Full setup guide
- **[AUTH_FLOW_DIAGRAM.md](./AUTH_FLOW_DIAGRAM.md)**: Visual flow diagrams
- **[TYPES_QUICK_REFERENCE.md](./TYPES_QUICK_REFERENCE.md)**: TypeScript types
- **[ARCHITECTURE.md](./ARCHITECTURE.md)**: System architecture

## 🎉 You're Ready!

Your authentication system is **100% complete**:
- ✅ Login/Register screens
- ✅ Family create/join flow
- ✅ Invite code system
- ✅ Supabase integration
- ✅ Type-safe state management
- ✅ Beautiful Super Design UI

**Start building your app features now!** 🚀

---

**Questions?** Check the documentation or Supabase dashboard for debugging.

**Happy coding!** 💜
