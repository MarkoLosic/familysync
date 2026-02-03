# 👨‍👩‍👧‍👦 Spona

> A beautiful, gamified family task and reward management app built with **React Native Expo SDK 54** and **NativeWind v4**

## 🚀 Quick Start

**Najbrži način da pokreneš aplikaciju:**

```bash
cd /Users/markolosic/Desktop/Bravo/familysync
./start-with-nativewind.sh
```

Ili ručno:

```bash
rm -rf .expo node_modules/.cache
npx expo start --clear
```

Zatim pritisni:
- **`a`** za Android
- **`i`** za iOS  
- **`w`** za Web

## 🎨 Styling

Aplikacija koristi **NativeWind v4** (Tailwind CSS za React Native):

```tsx
<View className="bg-white rounded-3xl p-6 shadow-lg">
  <Text className="text-2xl font-bold text-purple-900">
    Styled with Tailwind! 🎨
  </Text>
</View>
```

## ✨ Features

- 🔐 **Secure Authentication** - Email/password login with Supabase
- 👪 **Family Management** - Create or join families with invite codes
- ✅ **Task Management** - Assign, complete, and approve tasks
- 🎁 **Rewards Shop** - Redeem points for rewards with real-time claiming
- 📅 **Family Calendar** - Shared calendar with events
- 🛒 **Shopping List** - Real-time collaborative shopping
- 📊 **Gamification** - Points, levels, and achievements
- 🎨 **Modern UI** - Bento grid layout, pastels, beautiful design
- 🤖 **Android Ready** - Full Android support with SDK 54amilySync

> A beautiful, gamified family task and reward management app built with **React Native Expo SDK 52**

## ✨ Features

- 🔐 **Secure Authentication** - Email/password login with Supabase
- 👪 **Family Management** - Create or join families with invite codes
- ✅ **Task Management** - Assign, complete, and approve tasks
- 🎁 **Rewards Shop** - Redeem points for rewards with real-time claiming
- � **Family Calendar** - Shared calendar with events
- 🛒 **Shopping List** - Real-time collaborative shopping
- �📊 **Gamification** - Points, levels, and achievements
- 🎨 **Modern UI** - Bento grid layout, pastels, beautiful design
- 🤖 **Android Ready** - Full Android support with SDK 52

## 🚀 Quick Start

### 1. Install Dependencies

**Automatic Setup (Recommended):**
```bash
./setup-sdk52.sh
```

**Manual Setup:**
```bash
npm install
```

### 2. Configure Environment

Create `.env` file:
```bash
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

Get credentials from [Supabase Dashboard](https://supabase.com) → Settings → API

### 3. Setup Supabase Database

Run SQL scripts from `md/SUPABASE_SETUP_REWARDS.md`

### 4. Start the App

```bash
npx expo start
```

Then press:
- `a` for Android
- `i` for iOS Simulator (Mac only)
- `w` for Web
- Or scan QR with Expo Go app

---

## 📱 What's New in SDK 54

✅ **Upgraded to Expo SDK 54**
- React Native 0.76.5
- React 18.3.1
- Better performance & stability

✅ **Android Optimizations**
- Android 15 beta support
- Enhanced permissions & edge-to-edge
- APK build profiles ready

✅ **Build System**
- EAS Build configured
- Development, Preview, Production profiles
- Ready for Play Store

See `md/UPGRADE_SDK_54.md` for full details.

---

## 📖 Documentation

### Setup & Configuration
- **[SDK 54 Upgrade](md/UPGRADE_SDK_54.md)** - Latest upgrade guide ⭐
- **[Supabase Connected](md/SUPABASE_CONNECTED.md)** - Supabase setup ⭐
- **[Supabase Setup](md/SUPABASE_SETUP_REWARDS.md)** - Database configuration
- **[Invite Code Setup](md/INVITE_CODE_SETUP.md)** - Implement invite codes

### Development Guides
- **[Current Status](md/CURRENT_STATUS.md)** - Project status & checklist
- **[Auth & Family Fixes](md/AUTH_AND_FAMILY_FIXES.md)** - Recent fixes
- **[Rewards User Guide](md/REWARDS_USER_GUIDE.md)** - Feature documentation
- **[Final Report](md/FINAL_REPORT_ALL_FIXED.md)** - All TypeScript fixes

### Legacy Documentation
- **[TYPES_QUICK_REFERENCE.md](./TYPES_QUICK_REFERENCE.md)** - TypeScript types
- **[COMPLETE_CHECKLIST.md](./COMPLETE_CHECKLIST.md)** - Implementation status

## 🏗️ Tech Stack

- **Frontend**: React Native (Expo 50)
- **Language**: TypeScript
- **Styling**: NativeWind (Tailwind CSS)
- **Navigation**: React Navigation 6
- **State**: Zustand
- **Backend**: Supabase (Auth, Database, RLS)
- **Icons**: Lucide React Native

## 📁 Project Structure

```
familysync/
├── App.tsx                    # Entry point
├── src/
│   ├── navigation/           # Navigation setup
│   │   ├── RootNavigator.tsx
│   │   ├── AuthNavigator.tsx
│   │   └── MainNavigator.tsx
│   ├── features/             # Feature modules
│   │   ├── auth/            # Login, Register, Onboarding
│   │   ├── tasks/           # Task management
│   │   └── rewards/         # Reward system
│   ├── services/            # API services
│   │   ├── supabase.ts
│   │   └── family.ts
│   ├── store/               # Zustand stores
│   │   └── authStore.ts
│   └── types/               # TypeScript types
│       ├── database.ts
│       └── app.ts
└── supabase/                # SQL migrations
    └── family_invites.sql
```

## 🎨 Design System

### Colors
- **Purple** (#8B5CF6): Primary brand color
- **Pink** (#EC4899): Accent color
- **Blue** (#3B82F6): Secondary color
- **Pastels**: Soft backgrounds (purple-50, pink-50, blue-50)

### Components
- **Rounded-3xl**: All cards and buttons (24px radius)
- **Shadow-md**: Soft shadows for depth
- **Large Inputs**: 56px+ height for accessibility
- **Bento Grid**: Asymmetric card layouts

## 🧪 Testing

### Test the Auth Flow
1. Register: `dad@test.com` / `password123`
2. Create family: "Test Family"
3. Note invite code
4. Logout
5. Register: `mom@test.com` / `password123`
6. Join with invite code
7. Both users now in same family! 🎉

### Test Accounts
- Email format: `name@test.com`
- Password: `password123`

## 🔐 Security

- ✅ Row Level Security (RLS) on all tables
- ✅ Supabase Auth for user management
- ✅ Invite codes expire after 30 days
- ✅ Family members can only see their own data

## 🛠️ Development

### Add a New Screen
1. Create component in `src/features/[feature]/[Name]Screen.tsx`
2. Add to navigator in `src/navigation/MainNavigator.tsx`
3. Define route type in param list

### Add a New Service
1. Create in `src/services/[name].ts`
2. Export from `src/services/index.ts`
3. Use in components or stores

### Add a New Type
1. Define in `src/types/database.ts` or `src/types/app.ts`
2. Export from `src/types/index.ts`
3. Import with `@/types`

## 📦 Scripts

```bash
npm start          # Start Expo dev server
npm run ios        # Open iOS simulator
npm run android    # Open Android emulator
npm run web        # Open in browser
```

## 🐛 Troubleshooting

### Module not found
```bash
npm install
npx expo start --clear
```

### Supabase errors
- Check `.env` file exists with correct credentials
- Verify `EXPO_PUBLIC_` prefix on variables
- Run database migrations

### Navigation errors
```bash
npm install @react-navigation/native @react-navigation/native-stack
npx expo start --clear
```

## 🎯 Roadmap

### Phase 1: MVP (Complete ✅)
- [x] Authentication (login/register)
- [x] Family onboarding (create/join)
- [x] Database schema & types
- [x] State management (Zustand)
- [x] Navigation setup

### Phase 2: Core Features
- [ ] Home dashboard
- [ ] Task creation & assignment
- [ ] Task completion flow
- [ ] Rewards catalog
- [ ] Points system

### Phase 3: Enhancements
- [ ] Profile photos (Supabase Storage)
- [ ] Push notifications
- [ ] Deep linking for invites
- [ ] Family calendar
- [ ] Chat messaging

### Phase 4: Polish
- [ ] Animations (Reanimated)
- [ ] Haptic feedback
- [ ] Toast notifications
- [ ] Offline mode
- [ ] App store release

## 🤝 Contributing

This is a family project. To add features:
1. Read the [ARCHITECTURE.md](./ARCHITECTURE.md)
2. Follow the existing patterns
3. Add TypeScript types
4. Test thoroughly

## 📄 License

MIT License - feel free to use this for your own family!

## 💜 Made with Love

Built for families who want to make household tasks fun and rewarding.

---

**Need help?** Check the documentation files or create an issue.

**Happy Family-ing!** 🎉
