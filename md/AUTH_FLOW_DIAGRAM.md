# 🔄 Authentication Flow Diagram

## User Journey Map

```
┌─────────────────────────────────────────────────────────────────┐
│                         APP LAUNCHES                             │
│                              │                                   │
│                              ▼                                   │
│                     ┌────────────────┐                          │
│                     │ RootNavigator  │                          │
│                     │  Initializing  │                          │
│                     └────────┬───────┘                          │
│                              │                                   │
│                     ┌────────▼────────┐                         │
│                     │  Check Session  │                         │
│                     └────────┬────────┘                         │
│                              │                                   │
│                 ┌────────────┴───────────┐                      │
│                 │                        │                      │
│          ┌──────▼──────┐         ┌──────▼──────┐               │
│          │ No Session  │         │   Session   │               │
│          │   (Guest)   │         │   Exists    │               │
│          └──────┬──────┘         └──────┬──────┘               │
│                 │                       │                       │
│                 ▼                       ▼                       │
│         ┌────────────┐          ┌────────────┐                 │
│         │    AUTH    │          │    MAIN    │                 │
│         │ NAVIGATOR  │          │ NAVIGATOR  │                 │
│         └─────┬──────┘          └────────────┘                 │
│               │                                                 │
└───────────────┼─────────────────────────────────────────────────┘
                │
                │
┌───────────────▼─────────────────────────────────────────────────┐
│                      AUTH FLOW                                   │
│                                                                  │
│  ┌─────────────┐                                                │
│  │   LOGIN     │                                                │
│  │   SCREEN    │                                                │
│  └──────┬──────┘                                                │
│         │                                                        │
│    ┌────┴────┐                                                  │
│    │         │                                                  │
│    ▼         ▼                                                  │
│  Login    Register                                              │
│    │         │                                                  │
│    │    ┌────▼────────┐                                        │
│    │    │  REGISTER   │                                        │
│    │    │   SCREEN    │                                        │
│    │    └────┬────────┘                                        │
│    │         │                                                  │
│    │         │ Sign Up (email, password, name)                 │
│    │         │                                                  │
│    └────┬────┘                                                  │
│         │                                                        │
│         ▼                                                        │
│  ┌──────────────┐                                              │
│  │ Check User   │                                              │
│  │ Profile      │                                              │
│  └──────┬───────┘                                              │
│         │                                                        │
│    ┌────┴────┐                                                  │
│    │         │                                                  │
│    ▼         ▼                                                  │
│ Has Family  No Family                                           │
│    │         │                                                  │
│    │         ▼                                                  │
│    │   ┌──────────────────┐                                    │
│    │   │    FAMILY        │                                    │
│    │   │   ONBOARDING     │                                    │
│    │   │     SCREEN       │                                    │
│    │   └────────┬─────────┘                                    │
│    │            │                                               │
│    │       ┌────┴────┐                                         │
│    │       │         │                                         │
│    │       ▼         ▼                                         │
│    │  ┌─────────┐ ┌─────────┐                                 │
│    │  │ CREATE  │ │  JOIN   │                                 │
│    │  │ FAMILY  │ │ FAMILY  │                                 │
│    │  └────┬────┘ └────┬────┘                                 │
│    │       │           │                                       │
│    │       │  Enter    │  Enter                                │
│    │       │  Name     │  Code                                 │
│    │       │           │                                       │
│    │       ▼           ▼                                       │
│    │  ┌──────────────────┐                                    │
│    │  │  Family Service  │                                    │
│    │  │  - createFamily  │                                    │
│    │  │  - joinFamily    │                                    │
│    │  └────────┬─────────┘                                    │
│    │           │                                               │
│    │           ▼                                               │
│    │    ┌──────────────┐                                      │
│    │    │ Update User  │                                      │
│    │    │  family_id   │                                      │
│    │    └──────┬───────┘                                      │
│    │           │                                               │
│    └───────────┘                                               │
│                │                                                │
└────────────────┼────────────────────────────────────────────────┘
                 │
                 ▼
┌────────────────────────────────────────────────────────────────┐
│                      MAIN APP                                   │
│                                                                 │
│   ┌─────────────┐  ┌─────────────┐  ┌─────────────┐          │
│   │    HOME     │  │    TASKS    │  │   REWARDS   │          │
│   └─────────────┘  └─────────────┘  └─────────────┘          │
│                                                                 │
│   ┌─────────────┐  ┌─────────────┐                            │
│   │   PROFILE   │  │   FAMILY    │                            │
│   └─────────────┘  └─────────────┘                            │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## 🔄 State Transitions

### 1. **Guest → Registered User**
```
LoginScreen → RegisterScreen
  ↓
authStore.signUp(email, password, fullName)
  ↓
Supabase creates auth.users + public.profiles
  ↓
authStore updates: { session, userProfile }
```

### 2. **Registered User → Family Member**
```
FamilyOnboardingScreen → Create/Join
  ↓
familyService.createFamily(name) OR familyService.joinFamily(code)
  ↓
Supabase updates profiles.family_id
  ↓
authStore.getUserProfile() refreshes
  ↓
Navigation switches to MainNavigator
```

### 3. **Login → App**
```
LoginScreen
  ↓
authStore.signIn(email, password)
  ↓
Check userProfile.family_id
  ↓
if (family_id) → MainNavigator
else → FamilyOnboardingScreen
```

## 🔐 Auth Store State Machine

```
┌─────────────────────────────────────────────────────────────┐
│                     Auth Store                               │
│                                                              │
│  State:                                                      │
│  ┌──────────────────────────────────────────────┐          │
│  │ session: Session | null                      │          │
│  │ userProfile: ExtendedProfile | null          │          │
│  │ familyDetails: ExtendedFamily | null         │          │
│  │ isLoading: boolean                           │          │
│  │ error: string | null                         │          │
│  └──────────────────────────────────────────────┘          │
│                                                              │
│  Actions:                                                    │
│  ┌──────────────────────────────────────────────┐          │
│  │ initialize()        → Load session on start  │          │
│  │ signIn()            → Login with email/pw    │          │
│  │ signUp()            → Register new user      │          │
│  │ signOut()           → Logout & clear state   │          │
│  │ getUserProfile()    → Fetch profile from DB  │          │
│  │ getFamilyDetails()  → Fetch family data      │          │
│  └──────────────────────────────────────────────┘          │
│                                                              │
│  Selectors (for performance):                               │
│  ┌──────────────────────────────────────────────┐          │
│  │ useSession()        → Just session           │          │
│  │ useUserProfile()    → Just profile           │          │
│  │ useIsAuthenticated()→ Boolean                │          │
│  │ useHasFamily()      → Boolean                │          │
│  └──────────────────────────────────────────────┘          │
└─────────────────────────────────────────────────────────────┘
```

## 📊 Database Relations

```
┌──────────────────┐
│   auth.users     │
│  (Supabase Auth) │
└────────┬─────────┘
         │
         │ id
         ▼
┌─────────────────────────────────┐
│     public.profiles             │
│  ┌──────────────────────────┐  │
│  │ id (uuid, FK to auth)    │  │
│  │ email                    │  │
│  │ full_name                │  │
│  │ family_id (FK)          │  │◄────┐
│  │ role (parent/child)      │  │     │
│  │ points                   │  │     │
│  └──────────────────────────┘  │     │
└─────────────────────────────────┘     │
                                        │
                                        │
┌───────────────────────────────────────┘
│
│         ┌─────────────────────────────┐
│         │    public.families          │
│         │  ┌────────────────────────┐ │
└─────────┼──┤ id (uuid, PK)          │ │
          │  │ name                   │ │
          │  │ created_by (FK)        │ │
          │  │ created_at             │ │
          │  └────────────────────────┘ │
          └──────────┬──────────────────┘
                     │
                     │ id
                     ▼
          ┌─────────────────────────────┐
          │  public.family_invites      │
          │  ┌────────────────────────┐ │
          │  │ id (uuid, PK)          │ │
          │  │ family_id (FK)         │ │
          │  │ code (6-char)          │ │
          │  │ created_at             │ │
          │  │ expires_at             │ │
          │  └────────────────────────┘ │
          └─────────────────────────────┘
```

## 🎯 Key Features

### ✅ Session Persistence
- Supabase automatically stores auth tokens
- `authStore.initialize()` restores session on app launch
- No manual token management needed

### ✅ Optimistic UI
- Show loading states during async operations
- Error messages displayed inline
- Smooth transitions between screens

### ✅ Type Safety
- Full TypeScript coverage
- Zustand selectors prevent unnecessary re-renders
- Type-safe navigation params

### ✅ Security
- Row Level Security (RLS) on all tables
- Invite codes expire after 30 days
- Family members can only see their own family data

---

**Your authentication flow is complete and production-ready! 🚀**
