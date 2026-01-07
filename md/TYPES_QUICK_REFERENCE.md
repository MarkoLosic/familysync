# 🚀 Quick Reference: Types & Store

## Import Cheatsheet

```typescript
// Database types (snake_case - matches Supabase exactly)
import type { Family, Profile, Task, Reward } from '@/types/database'
import type { ProfileInsert, TaskUpdate } from '@/types/database'

// Enums & constants
import { UserRole, TaskStatus, COLORS, DEFAULT_POINTS } from '@/types'

// Type guards & helpers
import { isAdmin, isTaskCompleted, ROLE_LABELS } from '@/types'

// Store hooks
import {
  useAuthStore,
  useUserProfile,
  useFamilyDetails,
  useIsAdmin,
  useHasFamily,
  useUserPoints,
} from '@/store'
```

## Common Patterns

### 1. Get User Data
```typescript
const profile = useUserProfile()
const points = useUserPoints()
const role = useUserRole()
```

### 2. Check Permissions
```typescript
const isAdmin = useIsAdmin()
const hasFamily = useHasFamily()

if (isAdmin) {
  // Show admin controls
}
```

### 3. Handle Loading
```typescript
const { isLoading, isFetchingProfile } = useAuthLoading()

if (isLoading) return <Spinner />
```

### 4. Create Record
```typescript
const profile = useUserProfile()
const family = useFamilyDetails()

const newTask: TaskInsert = {
  family_id: family!.id,
  title: 'Task title',
  created_by: profile!.id,
  status: TaskStatus.PENDING,
  points: DEFAULT_POINTS.TASK_MEDIUM,
}

await supabase.from('tasks').insert(newTask)
```

### 5. Update Record
```typescript
const updates: ProfileUpdate = {
  points: profile.points + 50,
  updated_at: new Date().toISOString(),
}

await supabase
  .from('profiles')
  .update(updates)
  .eq('id', profile.id)

// Refresh store
await useAuthStore.getState().fetchProfileAndFamily()
```

### 6. Use Enums
```typescript
// Task status
task.status === TaskStatus.COMPLETED

// User role
profile.role === UserRole.ADMIN

// In UI
<Text className={STATUS_COLORS[task.status].text}>
  {STATUS_LABELS[task.status]}
</Text>
```

### 7. Type Guards
```typescript
if (isAdmin(profile.role)) {
  // TypeScript knows role is 'admin'
}

if (isTaskCompleted(task.status)) {
  // TypeScript knows status is 'completed'
}
```

### 8. Colors & Constants
```typescript
// Use predefined colors
backgroundColor: COLORS.mint.DEFAULT

// Use default points
points: DEFAULT_POINTS.TASK_EASY

// Use labels
<Text>{ROLE_LABELS[UserRole.ADMIN]}</Text> // "Parent"
```

## State Flow

```
1. App Start
   ↓
   useAuthStore.initialize()
   ↓
   Loads session, profile, family
   
2. After Login
   ↓
   useAuthStore.fetchProfileAndFamily()
   ↓
   Updates store with user data
   
3. In Components
   ↓
   useUserProfile(), useIsAdmin(), etc.
   ↓
   Access data with type safety
   
4. After Updates
   ↓
   useAuthStore.getState().fetchProfileAndFamily()
   ↓
   Refresh to show latest data
```

## Field Name Reference

| UI Display | Database Field | Type Import |
|------------|----------------|-------------|
| User ID | `user_id` | `Profile` |
| Family ID | `family_id` | `Profile, Task, Reward` |
| Avatar | `avatar_url` | `Profile` |
| Points | `points` | `Profile` |
| Assigned To | `assigned_to` | `Task` |
| Created By | `created_by` | `Task, Reward, Family` |
| Due Date | `due_date` | `Task` |
| Completed At | `completed_at` | `Task` |
| Points Required | `points_required` | `Reward` |
| Image URL | `image_url` | `Reward` |
| Is Active | `is_active` | `Reward` |

## Remember

✅ Database types use **snake_case** (matches Supabase)  
✅ Use **enums** instead of strings  
✅ Use **selector hooks** for better performance  
✅ **Refresh store** after database updates  
✅ Use **type guards** for runtime checks  
✅ Check **isLoading** before rendering data  
✅ Use **DEFAULT_POINTS** for consistency  
✅ Use **COLORS** for Super Design theme  

---

See `TYPES_AND_STORE_GUIDE.md` for full documentation.
