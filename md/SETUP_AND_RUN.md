# 🚀 FamilySync - Setup & Run Guide

## Prerequisites

- **Node.js**: >= 18.x
- **npm** or **yarn**
- **Expo CLI**: `npm install -g expo-cli`
- **Supabase Account**: [supabase.com](https://supabase.com)
- **Mobile Device** or **Emulator** (iOS Simulator / Android Emulator)

---

## 🛠️ Installation

### 1. Clone & Install Dependencies

```bash
# Navigate to project directory
cd /Users/markolosic/Desktop/Bravo/familysync

# Install dependencies
npm install
```

---

## ⚙️ Configuration

### 2. Set Up Supabase

#### A. Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Wait for database to provision

#### B. Run SQL Migrations
In Supabase Dashboard → SQL Editor, run these migrations in order:

1. **Create Base Tables** (if not already created):
   - `families`, `profiles`, `tasks`, `rewards`

2. **Family Invites**:
   ```bash
   # Copy contents of:
   supabase/family_invites.sql
   ```

3. **Tasks Schema Update**:
   ```bash
   # Copy contents of:
   supabase/tasks_schema_update.sql
   ```

4. **Calendar Events**:
   ```bash
   # Copy contents of:
   supabase/calendar_events.sql
   ```

#### C. Get API Keys
1. Go to Settings → API
2. Copy:
   - **Project URL** (e.g., `https://xxx.supabase.co`)
   - **Anon Public Key** (starts with `eyJ...`)

### 3. Configure Environment Variables

Create `.env` file in project root:

```bash
# .env
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

---

## ▶️ Running the App

### Start Development Server

```bash
npm start
```

This opens Expo DevTools in your browser.

### Run on iOS Simulator (macOS only)

```bash
npm run ios
```

Or press `i` in the terminal after `npm start`.

### Run on Android Emulator

```bash
npm run android
```

Or press `a` in the terminal after `npm start`.

### Run on Physical Device

1. Install **Expo Go** app from App Store / Play Store
2. Scan QR code from terminal with your camera (iOS) or Expo Go (Android)

---

## 🧪 Testing the App

### 1. Create Account
- Open app → Register screen
- Enter email, password, name
- Tap "Create Account"

### 2. Create Family
- Enter family name (e.g., "Smith Family")
- Tap "Create Family"

### 3. Explore Features

#### Home Dashboard
- See greeting with your name
- View family avatars
- Check widgets (Today's Focus, Shopping List, Family Status)
- View Points and Streak

#### Tasks
- Tap "Tasks" button on HomeScreen
- View "My Tasks" tab
- Swipe task right to complete (if you're a child)
- See confetti animation
- Approve/reject tasks (if you're a parent)

#### Calendar
- Tap "Calendar" button on HomeScreen
- View monthly calendar
- Tap "+" button to add event
- Fill in title, time, participants
- Save and see event appear

---

## 🐛 Troubleshooting

### Issue: "Cannot find module 'react-native-calendars'"
**Solution**: Restart Expo server after installing dependencies
```bash
npm install
npm start -- --clear
```

### Issue: TypeScript errors
**Solution**: Ensure all dependencies are installed
```bash
npm install
npm install --save-dev @types/react-native-calendars
```

### Issue: Supabase connection fails
**Solution**: Check `.env` file:
- Variables start with `EXPO_PUBLIC_`
- URL and key are correct
- No extra spaces or quotes

### Issue: RLS policies blocking queries
**Solution**: Ensure SQL migrations ran successfully:
- Check Supabase Dashboard → Database → Tables
- Verify `calendar_events` table exists
- Check RLS is enabled and policies are created

---

## 📝 Notes

### Development Mode
- Hot reload enabled (changes reflect immediately)
- Debug console available (Cmd+D on iOS, Cmd+M on Android)

### Production Build
```bash
# iOS
eas build --platform ios

# Android
eas build --platform android
```

### Clear Cache
```bash
npm start -- --clear
expo start -c
```

---

## 📚 Documentation

- **Feature Guides**: See `docs/` folder
- **Phase Completion**: `FAZA_3_COMPLETE.md`, `FAZA_4_COMPLETE.md`, `FAZA_5_COMPLETE.md`
- **Visual Guides**: `BENTO_GRID_VISUAL.md`, `TASKS_VISUAL_GUIDE.md`, `CALENDAR_VISUAL_GUIDE.md`

---

## 🎉 You're Ready!

The FamilySync app should now be running. Create a family, add some tasks and events, and enjoy! 🚀

**Happy Family Syncing!** 👨‍👩‍👧‍👦
