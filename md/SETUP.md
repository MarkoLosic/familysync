# FamilySync Setup Guide

## Required Dependencies

To resolve the TypeScript errors and run the app, you need to install the following packages:

```bash
# Core dependencies
npm install @supabase/supabase-js zustand

# React Native URL polyfill (required for Supabase in React Native)
npm install react-native-url-polyfill

# UI & Icons
npm install @shopify/flash-list lucide-react-native
npm install nativewind
npm install --save-dev tailwindcss

# Type definitions
npm install --save-dev @types/node @types/react @types/react-native
```

## Environment Variables

Create a `.env` file in the root of your project:

```env
EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## TypeScript Configuration

Make sure your `tsconfig.json` includes path aliases:

```json
{
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    "strict": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  }
}
```

## Babel Configuration

Update your `babel.config.js` to support path aliases:

```javascript
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          root: ['./src'],
          alias: {
            '@': './src',
          },
        },
      ],
    ],
  };
};
```

And install the babel plugin:

```bash
npm install --save-dev babel-plugin-module-resolver
```

## NativeWind Configuration

### 1. Create `tailwind.config.js`:

```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

### 2. Create `global.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

### 3. Update `babel.config.js` to include NativeWind:

```javascript
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      'nativewind/babel',
      [
        'module-resolver',
        {
          root: ['./src'],
          alias: {
            '@': './src',
          },
        },
      ],
    ],
  };
};
```

### 4. Create `metro.config.js`:

```javascript
const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

module.exports = withNativeWind(config, { input: './global.css' });
```

### 5. Add type definitions - create `nativewind-env.d.ts` in root:

```typescript
/// <reference types="nativewind/types" />
```

## Usage Example

### Initialize Auth on App Start

```typescript
import { useEffect } from 'react'
import { useAuthStore } from '@/store'
import { supabase } from '@/services/supabase'

function App() {
  const fetchProfileAndFamily = useAuthStore((state) => state.fetchProfileAndFamily)
  const setUser = useAuthStore((state) => state.setUser)

  useEffect(() => {
    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user)
        fetchProfileAndFamily()
      }
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user)
        fetchProfileAndFamily()
      } else {
        useAuthStore.getState().reset()
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  // Your app components...
}
```

### Using the Store in Components

```typescript
import { useAuthStore, useIsAdmin, useHasFamily } from '@/store'

function MyComponent() {
  const { profile, family, isLoading } = useAuthStore()
  const isAdmin = useIsAdmin()
  const hasFamily = useHasFamily()

  if (isLoading) return <LoadingSpinner />

  if (!hasFamily) {
    return <CreateOrJoinFamily />
  }

  return (
    <View>
      <Text>Welcome, {profile?.name}!</Text>
      <Text>Family: {family?.name}</Text>
      <Text>Points: {profile?.points}</Text>
      {isAdmin && <AdminControls />}
    </View>
  )
}
```

### Sign Out

```typescript
import { useAuthStore } from '@/store'

function SignOutButton() {
  const signOut = useAuthStore((state) => state.signOut)

  const handleSignOut = async () => {
    try {
      await signOut()
      // Navigate to login screen
    } catch (error) {
      console.error('Sign out failed:', error)
    }
  }

  return <Button onPress={handleSignOut} title="Sign Out" />
}
```
