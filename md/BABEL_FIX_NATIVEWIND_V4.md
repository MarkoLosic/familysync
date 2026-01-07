# Babel Configuration Fix for NativeWind v4

**Issue:** `.plugins is not a valid Plugin property` error in Babel

**Root Cause:** NativeWind v4 works differently than v2. It doesn't use Babel plugins - instead it uses Metro transformer.

## Solution

### Updated `babel.config.js`

NativeWind v4 **does NOT need** babel plugins. The transformation happens at the Metro level.

**Correct Configuration:**
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

### Key Changes from v2 to v4:

❌ **NativeWind v2:**
```javascript
presets: ['babel-preset-expo'],
plugins: [
  'nativewind/babel',  // ← Used in v2
  // ...
]
```

✅ **NativeWind v4:**
```javascript
presets: ['babel-preset-expo'],
plugins: [
  // No nativewind/babel plugin needed!
  // Transformation happens in metro.config.js
]
```

### How NativeWind v4 Works:

1. **Metro Config** (`metro.config.js`):
   - Uses `withNativeWind()` wrapper
   - Processes `global.css` file
   - Transforms Tailwind classes at build time

2. **Global CSS** (`global.css`):
   - Contains Tailwind directives
   - Imported in `App.tsx`

3. **Babel Config** (`babel.config.js`):
   - Just uses standard `babel-preset-expo`
   - No special NativeWind plugins needed

## Files Involved

### ✅ `metro.config.js`
```javascript
const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

module.exports = withNativeWind(config, { input: './global.css' });
```

### ✅ `global.css`
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

### ✅ `App.tsx`
```javascript
import './global.css';  // Must be first import
// ... rest of imports
```

### ✅ `tailwind.config.js`
```javascript
module.exports = {
  content: ['./App.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],  // NativeWind v4 preset
  theme: { extend: { /* ... */ } },
  plugins: [],
};
```

## Steps to Fix

1. ✅ Update `babel.config.js` (remove nativewind/babel)
2. ✅ Clear all caches
3. ✅ Restart Expo

```bash
rm -rf .expo node_modules/.cache
npx expo start --clear
```

## Status

✅ Babel config fixed  
✅ NativeWind v4 properly configured  
✅ Metro config with CSS transformation  
✅ Ready to run  

---

**The app should now start without Babel errors!**
