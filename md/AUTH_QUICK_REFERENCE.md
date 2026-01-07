# 🚀 Auth Flow Quick Reference

## Screens

### LoginScreen
```typescript
<LoginScreen onNavigateToRegister={() => {}} />
```
- Email + Password
- Gradient: Sky → Amber → Pink
- Button: Blue → Purple

### RegisterScreen
```typescript
<RegisterScreen onNavigateToLogin={() => {}} />
```
- Name + Email + Password + Confirm
- Gradient: Pink → Amber → Sky
- Button: Pink → Orange
- Creates profile automatically

### FamilyOnboardingScreen
```typescript
<FamilyOnboardingScreen />
```
- **Mode 1:** Select (Create or Join)
- **Mode 2:** Create family (enter name)
- **Mode 3:** Join family (enter 6-char code)

## Services

### Create Family
```typescript
import { createFamily } from '@/services/family'

const { family, inviteCode } = await createFamily('The Smiths', userId)
// Returns: family object + 6-char invite code
// User becomes admin
```

### Join Family
```typescript
import { joinFamily } from '@/services/family'

const family = await joinFamily('ABC123', userId)
// User becomes child
```

### Leave Family
```typescript
import { leaveFamily } from '@/services/family'

await leaveFamily(userId)
```

### Get Members
```typescript
import { getFamilyMembers } from '@/services/family'

const members = await getFamilyMembers(familyId)
```

## App Flow

```typescript
function App() {
  const isAuthenticated = useIsAuthenticated()
  const hasFamily = useHasFamily()
  
  if (!isAuthenticated) return <AuthScreens />
  if (!hasFamily) return <FamilyOnboardingScreen />
  return <MainApp />
}
```

## Database Setup

Run in Supabase SQL Editor:
```sql
-- See: supabase/family_invites.sql
```

Creates:
- `family_invites` table
- Auto-generate invite codes
- 30-day expiration
- RLS policies

## Install Dependencies

```bash
npm install expo-linear-gradient
```

## Super Design Colors

**Backgrounds:**
- Sky → Amber → Pink: `['#f0f9ff', '#fef3c7', '#fce7f3']`
- Pink → Amber → Sky: `['#fce7f3', '#fef3c7', '#e0f2fe']`

**Buttons:**
- Blue → Purple: `['#3b82f6', '#8b5cf6']`
- Pink → Orange: `['#ec4899', '#f97316']`
- Mint Green: `['#6ee7b7', '#34d399']`
- Sky Blue: `['#7dd3fc', '#3b82f6']`

## Key Features

✅ Email/password auth  
✅ Profile auto-creation  
✅ 6-char invite codes  
✅ Auto-assign roles (admin/child)  
✅ 30-day code expiration  
✅ Pastel gradients  
✅ Pill-shaped buttons  
✅ Large, friendly inputs  
✅ Complete error handling  

---

See `AUTH_FLOW_GUIDE.md` for full documentation.
