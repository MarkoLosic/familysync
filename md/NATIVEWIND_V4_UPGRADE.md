# NativeWind v4 Upgrade - SDK 54 Compatibility Fix

**Date:** January 4, 2026  
**Issue:** PostCSS async plugin error with NativeWind v2 on Expo SDK 54

## Problems Fixed

### 1. Missing Assets
- **Error:** `Unable to resolve asset "./assets/icon.png"`
- **Solution:** Removed icon references from `app.json` temporarily. Assets folder created but icons need to be added later.

### 2. NativeWind v2 Incompatibility
- **Error:** `Use process(css).then(cb) to work with async plugins`
- **Root Cause:** NativeWind v2 is not compatible with Expo SDK 54
- **Solution:** Upgraded to NativeWind v4.2.1

## Changes Made

### 1. Upgraded NativeWind
```bash
npm install nativewind@^4.2.1 tailwindcss@^3.4.19
```

### 2. Updated Configuration Files

#### `tailwind.config.js`
- Added `presets: [require('nativewind/preset')]` for v4 support

#### `babel.config.js`
- Updated preset to: `['babel-preset-expo', { jsxImportSource: 'nativewind' }]`

#### `metro.config.js` (NEW)
- Created with NativeWind v4 configuration
- Uses `withNativeWind` wrapper with `global.css` input

#### `global.css` (NEW)
- Created with Tailwind directives:
  ```css
  @tailwind base;
  @tailwind components;
  @tailwind utilities;
  ```

#### `App.tsx`
- Added `import './global.css';` at the top

#### `nativewind-env.d.ts` (NEW)
- Added TypeScript types reference for NativeWind

### 3. Updated `app.json`
- Removed icon, splash image, adaptive-icon, and favicon references
- Kept backgroundColor settings
- TODO: Add proper app icons later

## Migration Notes: NativeWind v2 → v4

### Key Differences:
1. **v4 uses CSS imports** instead of babel-only transformation
2. **Requires `global.css`** file with Tailwind directives
3. **Uses Metro config** with `withNativeWind` wrapper
4. **jsxImportSource** must be set in babel config
5. **preset** must be added to tailwind.config.js

### Breaking Changes:
- If you were using custom Tailwind plugins, they may need updates
- Some utility classes might have changed - check NativeWind v4 docs

## Current Status

✅ **NativeWind v4 installed and configured**  
✅ **Metro bundler starting successfully**  
✅ **PostCSS error resolved**  
✅ **Assets folder created**  
⚠️ **App icons need to be added**  

## Next Steps

1. **Add App Icons:**
   - Create or download app icons
   - Add to `/assets/` folder:
     - `icon.png` (1024x1024)
     - `splash.png` (2048x2732)
     - `adaptive-icon.png` (1024x1024, Android)
     - `favicon.png` (48x48, web)
   - Uncomment icon references in `app.json`

2. **Test the App:**
   - Press `a` for Android
   - Press `i` for iOS
   - Test all screens with NativeWind v4 styles

3. **Verify Tailwind Classes:**
   - Check that all existing Tailwind utilities still work
   - Test responsive classes
   - Verify custom colors from config

## Resources

- [NativeWind v4 Documentation](https://www.nativewind.dev/v4/overview)
- [NativeWind v4 Migration Guide](https://www.nativewind.dev/v4/migration-guide)
- [Expo SDK 54 Release Notes](https://expo.dev/changelog/2024/12-12-sdk-54)

## Files Modified

- `package.json` - Updated NativeWind and Tailwind versions
- `tailwind.config.js` - Added NativeWind v4 preset
- `babel.config.js` - Added jsxImportSource
- `metro.config.js` - NEW - Metro config for NativeWind v4
- `global.css` - NEW - Tailwind directives
- `App.tsx` - Added global.css import
- `nativewind-env.d.ts` - NEW - TypeScript types
- `app.json` - Removed asset references temporarily
- `assets/` - Created directory

---

**Upgrade completed successfully! The app should now work with Expo SDK 54 and NativeWind v4.**
