# TypeScript Types & Auth Store Guide

Complete guide to the FamilySync type system and authentication store.

## 📁 File Structure

```
src/types/
├── database.ts    # Exact Supabase table interfaces
├── app.ts         # Enums, constants, UI types
├── supabase.ts    # Generated Supabase types
└── index.ts       # Central exports

src/store/
├── authStore.ts   # Auth state management
└── index.ts       # Store exports
```

## 🗄️ Database Types (`src/types/database.ts`)

### Core Table Interfaces

Exact matches to your Supabase schema with snake_case fields:

```typescript
import type { Family, Profile, Task, Reward } from '@/types/database'

// Family
interface Family {
  id: string
  name: string
  created_by: string
  created_at: string
  updated_at: string
}

// Profile
interface Profile {
  id: string
  user_id: string
  family_id: string | null
  name: string
  avatar_url: string | null
  role: 'admin' | 'child'
  points: number
  created_at: string
  updated_at: string
}

// Task
interface Task {
  id: string
  family_id: string
  title: string
  description: string | null
  assigned_to: string | null
  created_by: string
  status: 'pending' | 'completed'
  points: number
  due_date: string | null
  completed_at: string | null
  created_at: string
  updated_at: string
}

// Reward
interface Reward {
  id: string
  family_id: string
  title: string
  description: string | null
  points_required: number
  image_url: string | null
  is_active: boolean
  created_by: string
  created_at: string
  updated_at: string
}
```

### Insert/Update Types

For creating and updating records:

```typescript
import type { ProfileInsert, ProfileUpdate } from '@/types/database'

// Creating a profile
const newProfile: ProfileInsert = {
  user_id: userId,
  name: 'John Doe',
  role: 'child',
  // Optional fields can be omitted
}

// Updating a profile
const updates: ProfileUpdate = {
  name: 'Jane Doe',
  points: 150,
}
```

### Extended Types with Relations

```typescript
import type { TaskWithProfiles, ProfileWithFamily } from '@/types/database'

// Task with joined profile data
const taskWithProfiles: TaskWithProfiles = {
  ...task,
  assigned_to_profile: profile,
  created_by_profile: creatorProfile,
}
```

## 🎯 App Types (`src/types/app.ts`)

### Enums

Strictly typed enums for better type safety:

```typescript
import { UserRole, TaskStatus, RewardStatus } from '@/types'

// User roles
UserRole.ADMIN   // 'admin'
UserRole.CHILD   // 'child'

// Task statuses
TaskStatus.PENDING    // 'pending'
TaskStatus.COMPLETED  // 'completed'

// Reward statuses
RewardStatus.ACTIVE   // 'active'
RewardStatus.INACTIVE // 'inactive'
```

### Type Guards

Runtime type checking:

```typescript
import { isUserRole, isAdmin, isTaskStatus } from '@/types'

// Check if value is valid role
if (isUserRole(value)) {
  // value is now typed as UserRole
}

// Check if user is admin
if (isAdmin(profile.role)) {
  // Show admin controls
}

// Check if task is completed
if (isTaskCompleted(task.status)) {
  // Task is completed
}
```

### Constants

Pre-defined values matching Super Design:

```typescript
import { COLORS, DEFAULT_POINTS, ROLE_LABELS, STATUS_COLORS } from '@/types'

// Colors
COLORS.mint.DEFAULT  // '#6ee7b7'
COLORS.coral.light   // '#fca5a5'
COLORS.sky.dark      // '#3b82f6'

// Default points
DEFAULT_POINTS.TASK_EASY     // 25
DEFAULT_POINTS.TASK_MEDIUM   // 50
DEFAULT_POINTS.REWARD_SMALL  // 50

// Labels
ROLE_LABELS[UserRole.ADMIN]  // 'Parent'
ROLE_LABELS[UserRole.CHILD]  // 'Child'

// Status colors
STATUS_COLORS[TaskStatus.PENDING].bg    // 'bg-amber-100'
STATUS_COLORS[TaskStatus.COMPLETED].text // 'text-green-700'
```

## 🏪 Auth Store (`src/store/authStore.ts`)

### State Structure

```typescript
interface AuthState {
  // Core Data
  session: Session | null           // Supabase session
  userProfile: Profile | null       // User profile from DB
  familyDetails: Family | null      // Family data
  
  // Loading States
  isLoading: boolean               // General loading
  isInitializing: boolean          // App initialization
  isFetchingProfile: boolean       // Loading profile
  isFetchingFamily: boolean        // Loading family
  
  // Error
  error: string | null
  
  // Methods
  setSession: (session: Session | null) => void
  setUserProfile: (profile: Profile | null) => void
  setFamilyDetails: (family: Family | null) => void
  fetchProfileAndFamily: () => Promise<void>
  initialize: () => Promise<void>
  signOut: () => Promise<void>
  reset: () => void
  
  // Computed
  isAuthenticated: () => boolean
  isAdmin: () => boolean
  hasFamily: () => boolean
}
```

### Basic Usage

```typescript
import { useAuthStore } from '@/store'

function MyComponent() {
  const { session, userProfile, familyDetails, isLoading } = useAuthStore()
  
  if (isLoading) return <LoadingSpinner />
  
  return (
    <View>
      <Text>Welcome, {userProfile?.name}!</Text>
      <Text>Family: {familyDetails?.name}</Text>
      <Text>Points: {userProfile?.points}</Text>
    </View>
  )
}
```

### Selector Hooks

Optimized hooks that only re-render when specific data changes:

```typescript
import {
  useSession,
  useUserProfile,
  useFamilyDetails,
  useAuthLoading,
  useIsAuthenticated,
  useIsAdmin,
  useHasFamily,
  useUserPoints,
  useUserRole,
} from '@/store'

function MyComponent() {
  // Only re-renders when profile changes
  const profile = useUserProfile()
  
  // Only re-renders when family changes
  const family = useFamilyDetails()
  
  // Get all loading states
  const { isLoading, isInitializing, isFetchingProfile } = useAuthLoading()
  
  // Boolean checks
  const isAuthenticated = useIsAuthenticated()
  const isAdmin = useIsAdmin()
  const hasFamily = useHasFamily()
  
  // Get specific values
  const points = useUserPoints()
  const role = useUserRole()
  
  return <View>...</View>
}
```

### Initialize Auth on App Start

```typescript
import { useEffect } from 'react'
import { useAuthStore } from '@/store'
import { supabase } from '@/services/supabase'

function App() {
  const initialize = useAuthStore((state) => state.initialize)
  const fetchProfileAndFamily = useAuthStore((state) => state.fetchProfileAndFamily)
  const setSession = useAuthStore((state) => state.setSession)

  useEffect(() => {
    // Initialize auth state
    initialize()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (session) {
        fetchProfileAndFamily()
      } else {
        useAuthStore.getState().reset()
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  return <YourApp />
}
```

### Actions

#### Initialize
```typescript
// Call once on app start
await useAuthStore.getState().initialize()
```

#### Fetch Profile & Family
```typescript
// Call after login or when data changes
await useAuthStore.getState().fetchProfileAndFamily()
```

#### Sign Out
```typescript
const signOut = useAuthStore((state) => state.signOut)

const handleSignOut = async () => {
  try {
    await signOut()
    // Navigate to login
  } catch (error) {
    console.error('Sign out failed:', error)
  }
}
```

## 💡 Usage Examples

### Example 1: Profile Display

```typescript
import { useUserProfile, useUserPoints } from '@/store'

function ProfileCard() {
  const profile = useUserProfile()
  const points = useUserPoints()

  if (!profile) return null

  return (
    <View className="bg-white rounded-3xl p-6">
      <Text className="text-2xl font-bold">{profile.name}</Text>
      <Text className="text-lg text-slate-600">{points} points</Text>
    </View>
  )
}
```

### Example 2: Role-Based UI

```typescript
import { useIsAdmin, useUserRole } from '@/store'
import { ROLE_LABELS } from '@/types'

function RoleBasedComponent() {
  const isAdmin = useIsAdmin()
  const role = useUserRole()

  return (
    <View>
      <Text>Role: {role ? ROLE_LABELS[role] : 'Unknown'}</Text>
      {isAdmin && <AdminControls />}
      {!isAdmin && <ChildView />}
    </View>
  )
}
```

### Example 3: Loading States

```typescript
import { useAuthLoading, useUserProfile } from '@/store'

function ProfileScreen() {
  const { isLoading, isFetchingProfile } = useAuthLoading()
  const profile = useUserProfile()

  if (isLoading || isFetchingProfile) {
    return <LoadingSpinner />
  }

  if (!profile) {
    return <CreateProfileScreen />
  }

  return <ProfileContent profile={profile} />
}
```

### Example 4: Family Check

```typescript
import { useHasFamily, useFamilyDetails } from '@/store'

function HomeScreen() {
  const hasFamily = useHasFamily()
  const family = useFamilyDetails()

  if (!hasFamily) {
    return <CreateOrJoinFamilyScreen />
  }

  return (
    <View>
      <Text className="text-3xl font-bold">{family!.name}</Text>
      <FamilyContent />
    </View>
  )
}
```

### Example 5: Task Creation

```typescript
import { useUserProfile, useFamilyDetails } from '@/store'
import type { TaskInsert } from '@/types/database'
import { TaskStatus } from '@/types'

function CreateTask() {
  const profile = useUserProfile()
  const family = useFamilyDetails()

  const createTask = async (formData: any) => {
    if (!profile || !family) return

    const newTask: TaskInsert = {
      family_id: family.id,
      title: formData.title,
      description: formData.description,
      assigned_to: formData.assignedTo,
      created_by: profile.id,
      status: TaskStatus.PENDING,
      points: formData.points,
      due_date: formData.dueDate?.toISOString() || null,
    }

    const { error } = await supabase.from('tasks').insert(newTask)
    
    if (error) {
      console.error('Error creating task:', error)
    }
  }

  return <TaskForm onSubmit={createTask} />
}
```

## 🎨 Integration with UI Components

### With TaskList

```typescript
import { TaskList } from '@/features/tasks'
import { useUserProfile, useIsAdmin } from '@/store'
import { TaskStatus } from '@/types'

function TasksScreen() {
  const profile = useUserProfile()
  const isAdmin = useIsAdmin()
  const [tasks, setTasks] = useState<Task[]>([])

  const handleCompleteTask = async (taskId: string) => {
    await supabase
      .from('tasks')
      .update({ 
        status: TaskStatus.COMPLETED,
        completed_at: new Date().toISOString(),
      })
      .eq('id', taskId)
    
    // Refresh profile for updated points
    await useAuthStore.getState().fetchProfileAndFamily()
  }

  return (
    <TaskList
      tasks={tasks}
      onCompleteTask={handleCompleteTask}
      onApproveTask={handleCompleteTask}
    />
  )
}
```

## 🔍 Type Checking Best Practices

1. **Use enums for status/role values**
   ```typescript
   // ✅ Good
   status: TaskStatus.COMPLETED
   
   // ❌ Bad
   status: 'completed'
   ```

2. **Use type guards for runtime checks**
   ```typescript
   // ✅ Good
   if (isAdmin(role)) { }
   
   // ❌ Bad
   if (role === 'admin') { }
   ```

3. **Use proper Insert/Update types**
   ```typescript
   // ✅ Good
   const updates: ProfileUpdate = { name: 'New Name' }
   
   // ❌ Bad
   const updates = { name: 'New Name' }
   ```

4. **Use selector hooks for performance**
   ```typescript
   // ✅ Good - only re-renders when profile changes
   const profile = useUserProfile()
   
   // ❌ Bad - re-renders on any store change
   const { userProfile } = useAuthStore()
   ```

## 📚 Summary

✅ **database.ts** - Exact Supabase table interfaces  
✅ **app.ts** - Enums, constants, type guards  
✅ **authStore.ts** - Session, profile, family state  
✅ **Granular loading states** - isLoading, isInitializing, etc.  
✅ **Selector hooks** - Optimized re-renders  
✅ **Type-safe** - Full TypeScript coverage  
✅ **Super Design ready** - Constants and colors included  

The type system is now complete and production-ready! 🎉
