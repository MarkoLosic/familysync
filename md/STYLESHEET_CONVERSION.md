# Design Fix - Complete StyleSheet Conversion

## Problem
NativeWind v4 className styling is not working properly in the app. The design is broken despite correct configuration.

## Solution
Convert all screens to use **StyleSheet** instead of className. This is the guaranteed working approach.

## Files to Convert

### ✅ Already Converted (Working)
- `src/features/auth/LoginScreen.tsx`
- `src/features/auth/RegisterScreen.tsx`

### 🔄 Need to Convert
- `src/features/home/HomeScreen.tsx` - Main dashboard with Bento Grid
- `src/features/tasks/TaskList.tsx` - Task list component
- `src/features/tasks/TaskItem.tsx` - Individual task card

## Conversion Steps

1. **Remove all `className` props**
2. **Create StyleSheet.create() object with all styles**
3. **Replace className with style={styles.xxx}**
4. **Test and verify styling works**

## Next Actions

Run this script to backup and convert:

```bash
cd /Users/markolosic/Desktop/Bravo/familysync
npm run start
```

Then manually test each screen to confirm the design is working.
