# DATABASE SCHEMA FIX - January 5, 2026

## Problem

The application code was using `user_id` and `username` columns, but the actual Supabase database has:
- `id` as the primary key in profiles table (not `user_id`)
- `name` as the name column (not `username`)

Error messages:
```
ERROR column profiles.user_id does not exist
ERROR Cannot read property 'includes' of undefined
```

## Solution

Updated all TypeScript types and code to match the **actual** database schema.

## Changes Made

### 1. Profile Type (`src/types/database.ts`)
```typescript
// BEFORE:
export interface Profile {
  user_id: string // ❌ Wrong
  username: string // ❌ Wrong
  role: 'admin' | 'child'
  // ...
}

// AFTER:
export interface Profile {
  id: string // ✅ Correct - matches database
  name: string // ✅ Correct - matches database
  role: 'admin' | 'child' | 'parent' // ✅ Added parent role
  level?: number // ✅ Added optional level field
  // ...
}
```

### 2. Task Relations (`src/types/database.ts`)
```typescript
// BEFORE:
assigned_to_profile?: {
  id: string
  username: string
  role: 'admin' | 'child'
}

// AFTER:
assigned_to_profile?: {
  id: string
  name: string // ✅ Changed from username
  role: 'admin' | 'child' | 'parent' // ✅ Added parent role
}
```

### 3. Supabase Queries (`src/store/authStore.ts`)
```typescript
// BEFORE:
.eq('user_id', session.user.id) // ❌ Wrong column name

// AFTER:
.eq('id', session.user.id) // ✅ Correct column name
```

### 4. Profile References in Components

#### HomeScreen.tsx
```typescript
// BEFORE:
{userProfile?.username || 'Friend'}

// AFTER:
{userProfile?.name || 'Friend'}
```

#### ProfileScreen.tsx
```typescript
// BEFORE:
{userProfile?.username || 'User'}

// AFTER:
{userProfile?.name || 'User'}
```

#### TaskList.tsx
```typescript
// BEFORE:
task.assigned_to === userProfile?.user_id
{task.assigned_to_profile?.username || 'Unassigned'}

// AFTER:
task.assigned_to === userProfile?.id
{task.assigned_to_profile?.name || 'Unassigned'}
```

#### TaskItem.tsx
```typescript
// BEFORE:
{task.assigned_to_profile.username[0]}
{task.assigned_to_profile.username}

// AFTER:
{task.assigned_to_profile.name[0]}
{task.assigned_to_profile.name}
```

#### TasksScreen.tsx
```typescript
// BEFORE:
tasks.filter(t => t.assigned_to === userProfile?.user_id)

// AFTER:
tasks.filter(t => t.assigned_to === userProfile?.id)
```

### 5. Supabase Query in TasksScreen (Already Correct)
```typescript
// This was already correct:
assigned_to_profile:profiles!tasks_assigned_to_fkey(
  id,
  name, // ✅ Using correct column name
  role
)
```

## Database Schema Reference

Your actual Supabase schema (from `complete_schema.sql`):

```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id), -- NOT user_id!
  name TEXT NOT NULL, -- NOT username!
  role TEXT NOT NULL DEFAULT 'child',
  family_id UUID,
  points INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Testing

After these changes, test:

1. ✅ Login should work without "user_id does not exist" error
2. ✅ Profile fetching should load correctly
3. ✅ User name should display in HomeScreen
4. ✅ Task assignments should show correct names
5. ✅ Profile screen should show user name

## Next Steps

1. Clear the app cache and restart: `npx expo start -c`
2. Test login with an existing user
3. Verify profile data loads correctly
4. Check all screens display user names correctly

## Important Notes

- **DO NOT** run database migration scripts that rename `id` to `user_id`
- **DO NOT** rename `name` to `username` in database
- The application code now matches your existing database schema
- All TypeScript types are now consistent with Supabase tables

## Files Modified

1. `src/types/database.ts` - Updated Profile and Task types
2. `src/store/authStore.ts` - Fixed query to use `id` instead of `user_id`
3. `src/features/home/HomeScreen.tsx` - Changed `username` to `name`
4. `src/features/profile/ProfileScreen.tsx` - Changed `username` to `name`
5. `src/features/tasks/TaskList.tsx` - Fixed `user_id` to `id` and `username` to `name`
6. `src/features/tasks/TaskItem.tsx` - Changed `username` to `name`
7. `src/features/tasks/TasksScreen.tsx` - Fixed `user_id` to `id`

## SQL Scripts Created

- `supabase/fix_profiles_schema.sql` - Diagnostic script to check schema
- `supabase/ACTUAL_SCHEMA_FIX.sql` - Reference for understanding the fix

---

**Status:** ✅ All code now matches actual database schema  
**Last Updated:** January 5, 2026
