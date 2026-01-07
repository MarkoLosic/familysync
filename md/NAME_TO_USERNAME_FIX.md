# ✅ name → username Migration Complete!

**Datum:** 4. januar 2026

## Problem

Aplikacija je koristila `name` polje, ali Supabase baza ima `username` kolonu.

## Rešenje

Promenili smo **SVE** reference sa `name` na `username` kroz celu aplikaciju.

## Popravljeni Fajlovi

### 1. **Types** (`src/types/database.ts`)
```typescript
// STARO
export interface Profile {
  name: string
}

// NOVO
export interface Profile {
  username: string
}
```

**Promene:**
- ✅ `Profile.name` → `Profile.username`
- ✅ `ProfileInsert.name` → `ProfileInsert.username`
- ✅ `Task.assigned_to_profile.name` → `Task.assigned_to_profile.username`
- ✅ `Task.created_by_profile.name` → `Task.created_by_profile.username`
- ✅ `CalendarEvent.created_by_profile.name` → `...username`
- ✅ `ShoppingItem.created_by_profile.name` → `...username`

### 2. **RegisterScreen** (`src/features/auth/RegisterScreen.tsx`)
```typescript
// STARO
const [name, setName] = useState('')
const profileData = { name: name.trim() }

// NOVO
const [username, setUsername] = useState('')
const profileData = { username: username.trim() }
```

**UI Promene:**
- Label: "Your Name" → "Username"
- Placeholder: "John Doe" → "johndoe"
- autoCapitalize: "words" → "none"
- autoComplete: "name" → "username"

### 3. **HomeScreen** (`src/features/home/HomeScreen.tsx`)
```typescript
// STARO
{userProfile?.name?.split(' ')[0] || 'Friend'}

// NOVO
{userProfile?.username || 'Friend'}
```

### 4. **TaskList** (`src/features/tasks/TaskList.tsx`)
```typescript
// STARO
{task.assigned_to_profile?.name || 'Unassigned'}

// NOVO
{task.assigned_to_profile?.username || 'Unassigned'}
```

### 5. **TaskItem** (`src/features/tasks/TaskItem.tsx`)
```typescript
// STARO
{task.assigned_to_profile.name[0]}
{task.assigned_to_profile.name}

// NOVO
{task.assigned_to_profile.username[0]}
{task.assigned_to_profile.username}
```

## Supabase Verifikacija

**Pokreni ovaj SQL u Supabase:**

```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'profiles' AND column_name = 'username';
```

**Očekivani rezultat:**
```
column_name | data_type | is_nullable
username    | text      | NO
```

**Ako `username` NE postoji**, pokreni:
```sql
ALTER TABLE profiles ADD COLUMN username TEXT NOT NULL DEFAULT '';
```

## Testiranje

1. ✅ Očisti cache i restartuj:
```bash
rm -rf .expo node_modules/.cache
npx expo start --clear
```

2. ✅ Testiraj registraciju:
   - Username: testuser
   - Email: test@example.com
   - Password: password123

3. ✅ Proveri da li se pojavljuje username na Home screen-u

4. ✅ Proveri TaskList da li prikazuje username

## Status

✅ **Sve promene su završene**

- ✅ Types ažurirani
- ✅ RegisterScreen koristi `username`
- ✅ HomeScreen prikazuje `username`
- ✅ TaskList prikazuje `username`
- ✅ TaskItem prikazuje `username`
- ✅ Nema TypeScript grešaka

## Next Steps

1. **Restartuj Expo** → `npx expo start --clear`
2. **Probaj registraciju** → Napravi novi account
3. **Proveri Supabase** → Da li ima `username` kolonu

---

**Aplikacija sada koristi `username` svuda umesto `name`!** 🎉
