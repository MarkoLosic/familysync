# FamilySync Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         FAMILYSYNC APP                          │
│                    React Native + Expo + TS                     │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                        UI COMPONENTS                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │  TaskList    │  │  RewardCard  │  │  ProfileCard │          │
│  │  (Bento)     │  │  (Bento)     │  │  (Bento)     │          │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘          │
│         │                  │                  │                   │
│         └──────────────────┴──────────────────┘                   │
│                            ↓                                      │
├─────────────────────────────────────────────────────────────────┤
│                       STORE (Zustand)                            │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  Auth Store                                                 │ │
│  │  • session: Session | null                                 │ │
│  │  • userProfile: Profile | null                             │ │
│  │  • familyDetails: Family | null                            │ │
│  │  • isLoading, isInitializing, isFetchingProfile...         │ │
│  │                                                             │ │
│  │  Methods:                                                   │ │
│  │  • initialize()                                            │ │
│  │  • fetchProfileAndFamily()                                 │ │
│  │  • signOut()                                               │ │
│  │                                                             │ │
│  │  Hooks:                                                     │ │
│  │  • useUserProfile(), useIsAdmin(), useUserPoints()...      │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                             ↓
┌─────────────────────────────────────────────────────────────────┐
│                      SERVICES LAYER                              │
│  ┌──────────────────┐  ┌──────────────────┐                     │
│  │  supabase.ts     │  │  gamification.ts │                     │
│  │  • Client setup  │  │  • claimReward() │                     │
│  │  • Auth config   │  │  • awardPoints() │                     │
│  └────────┬─────────┘  └────────┬─────────┘                     │
│           │                      │                               │
│           └──────────────────────┘                               │
└─────────────────────────────────────────────────────────────────┘
                             ↓
┌─────────────────────────────────────────────────────────────────┐
│                       TYPE SYSTEM                                │
│  ┌──────────────────┐  ┌──────────────────┐                     │
│  │  database.ts     │  │  app.ts          │                     │
│  │  • Family        │  │  • UserRole      │                     │
│  │  • Profile       │  │  • TaskStatus    │                     │
│  │  • Task          │  │  • COLORS        │                     │
│  │  • Reward        │  │  • DEFAULT_POINTS│                     │
│  │  • Insert types  │  │  • Type guards   │                     │
│  │  • Update types  │  │  • Constants     │                     │
│  └────────┬─────────┘  └────────┬─────────┘                     │
│           │                      │                               │
│           └──────────┬───────────┘                               │
│                      ↓                                           │
│           ┌──────────────────┐                                   │
│           │  index.ts        │                                   │
│           │  Central exports │                                   │
│           └──────────────────┘                                   │
└─────────────────────────────────────────────────────────────────┘
                             ↓
┌─────────────────────────────────────────────────────────────────┐
│                      SUPABASE BACKEND                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │  Auth        │  │  Database    │  │  Realtime    │          │
│  │  • Sessions  │  │  • families  │  │  • Changes   │          │
│  │  • Users     │  │  • profiles  │  │  • Subscribe │          │
│  │  • Policies  │  │  • tasks     │  │              │          │
│  │              │  │  • rewards   │  │              │          │
│  │              │  │  • RLS       │  │              │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│                                                                  │
│  RPC Functions:                                                 │
│  • claim_reward(reward_id, user_id) → JSON                      │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                      STYLING & DESIGN                            │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  NativeWind (Tailwind CSS)                               │   │
│  │  • rounded-3xl, rounded-2xl                              │   │
│  │  • shadow-lg, elevation: 5                               │   │
│  │  • bg-white, p-4, mb-3                                   │   │
│  │                                                           │   │
│  │  Super Design:                                            │   │
│  │  • Soft Pastels: mint, coral, sky blue                   │   │
│  │  • Dark Slate text                                        │   │
│  │  • Bento Grid layouts                                     │   │
│  │  • Playful gradients                                      │   │
│  │  • Lots of whitespace                                     │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  Icons: Lucide React Native                                     │
│  Lists: FlashList (high performance)                            │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                         DATA FLOW                                │
└─────────────────────────────────────────────────────────────────┘

User Action
    ↓
UI Component (TaskList, RewardCard)
    ↓
Store Hook (useUserProfile, useIsAdmin)
    ↓
Store State (userProfile, familyDetails)
    ↓
Service Function (claimReward, fetchProfileAndFamily)
    ↓
Supabase Client
    ↓
Backend (Auth, Database, RPC)
    ↓
Response
    ↓
Store Update (setUserProfile, setFamilyDetails)
    ↓
UI Re-render (optimized with selector hooks)
    ↓
User sees updated data

┌─────────────────────────────────────────────────────────────────┐
│                      PROJECT STRUCTURE                           │
└─────────────────────────────────────────────────────────────────┘

familysync/
├── src/
│   ├── types/
│   │   ├── database.ts      # Exact DB schema (snake_case)
│   │   ├── app.ts           # Enums, constants, UI types
│   │   ├── supabase.ts      # Generated types
│   │   └── index.ts         # Central exports
│   │
│   ├── store/
│   │   ├── authStore.ts     # Auth state + hooks
│   │   └── index.ts         # Store exports
│   │
│   ├── services/
│   │   ├── supabase.ts      # Client config
│   │   ├── gamification.ts  # Reward logic
│   │   └── index.ts         # Service exports
│   │
│   └── features/
│       ├── tasks/
│       │   ├── TaskList.tsx
│       │   ├── TaskListHeader.tsx
│       │   └── index.ts
│       └── rewards/
│           ├── RewardCard.example.tsx
│           └── index.ts
│
├── supabase/
│   └── claim_reward.sql     # RPC function
│
└── docs/
    ├── SETUP.md
    ├── TYPES_AND_STORE_GUIDE.md
    ├── TYPES_QUICK_REFERENCE.md
    ├── TYPES_IMPLEMENTATION_SUMMARY.md
    ├── REWARD_SYSTEM_SUMMARY.md
    └── CLAIM_REWARD_QUICKSTART.md

┌─────────────────────────────────────────────────────────────────┐
│                      KEY TECHNOLOGIES                            │
└─────────────────────────────────────────────────────────────────┘

Frontend:
  • React Native (Expo)
  • TypeScript
  • NativeWind (Tailwind)
  • Zustand (State)
  • FlashList (Performance)
  • Lucide Icons

Backend:
  • Supabase Auth
  • Supabase Database (PostgreSQL)
  • Supabase Realtime
  • Row Level Security (RLS)
  • RPC Functions

Design:
  • Bento Grid layouts
  • Soft pastels (mint, coral, sky)
  • rounded-3xl shapes
  • Generous whitespace
  • Playful gradients

┌─────────────────────────────────────────────────────────────────┐
│                      TYPE SAFETY FLOW                            │
└─────────────────────────────────────────────────────────────────┘

Database Schema (Supabase)
    ↓
database.ts (Profile, Task, Reward with snake_case)
    ↓
app.ts (UserRole, TaskStatus enums + constants)
    ↓
index.ts (Central type exports)
    ↓
authStore.ts (Typed state: session, userProfile, familyDetails)
    ↓
Selector Hooks (useUserProfile, useIsAdmin, etc.)
    ↓
Components (Fully typed with autocomplete)
    ↓
Type-safe database operations (Insert, Update types)
    ↓
Runtime validation (Type guards: isAdmin, isTaskCompleted)

Result: End-to-end type safety from database to UI! ✅
