# ✅ NativeWind v4 - Kompletna Instalacija

**Datum:** 4. januar 2026  
**Status:** ✅ ZAVRŠENO

## 📦 Instalirani Paketi

```bash
npm install nativewind@^4.2.1
npm install react-native-css-interop@^0.2.1
npm install react-native-reanimated@~3.16.4
```

### Verzije:
- ✅ **nativewind**: 4.2.1
- ✅ **react-native-css-interop**: 0.2.1
- ✅ **react-native-reanimated**: 3.16.4
- ✅ **tailwindcss**: 3.4.19

## ⚙️ Konfiguracija

### 1. **metro.config.js** ✅
```javascript
const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

module.exports = withNativeWind(config, { input: './global.css' });
```

### 2. **babel.config.js** ✅
```javascript
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      'react-native-reanimated/plugin', // ⭐ VAŽNO - Mora biti prvi!
      [
        'module-resolver',
        {
          root: ['./src'],
          alias: { '@': './src' },
        },
      ],
    ],
  };
};
```

### 3. **tailwind.config.js** ✅
```javascript
module.exports = {
  content: [
    './App.{js,jsx,ts,tsx}',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')], // ⭐ NativeWind v4 preset
  theme: {
    extend: {
      colors: {
        // Custom colors...
      },
    },
  },
  plugins: [],
};
```

### 4. **global.css** ✅
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

### 5. **App.tsx** ✅
```tsx
import './global.css'; // ⭐ MORA biti prva linija!
import React from 'react';
// ...rest of imports
```

### 6. **nativewind-env.d.ts** ✅
```typescript
/// <reference types="nativewind/types" />
```

## 🎯 Kako Radi NativeWind v4

### Staro (v2):
❌ Koristilo Babel plugin za transformaciju

### Novo (v4):
✅ Koristi **Metro** transformer  
✅ Obrađuje CSS na build time  
✅ Nema runtime overhead  
✅ Bolje performanse  

### Proces:
1. **global.css** → Tailwind direktivе
2. **Metro** (sa `withNativeWind`) → Procesira CSS
3. **Runtime** → Primenjuje stilove

## 📱 Korišćenje

```tsx
// Jednostavno koristi className!
<View className="bg-white rounded-3xl p-6 shadow-lg">
  <Text className="text-2xl font-bold text-purple-900">
    Hello NativeWind v4!
  </Text>
</View>

// Conditional classes
<View className={`p-4 ${isActive ? 'bg-purple-500' : 'bg-gray-200'}`}>
  <Text>Dynamic styling</Text>
</View>

// Responsive design
<View className="w-full md:w-1/2 lg:w-1/3">
  <Text>Responsive</Text>
</View>
```

## 🚀 Pokretanje

```bash
# 1. Obriši sve cache-ove
rm -rf .expo node_modules/.cache

# 2. Pokreni Expo
npx expo start --clear

# 3. Testiranje
# Press 'a' for Android
# Press 'i' for iOS
```

## ✅ Provera

### 1. Proveri da li su paketi instalirani:
```bash
npm list nativewind react-native-reanimated
```

### 2. Proveri da li Metro vidi CSS:
```bash
# Kada pokreneš expo, trebalo bi da vidiš:
# Metro bundler starting...
# No errors related to CSS
```

### 3. Testiranje u app-u:
```tsx
// U bilo kom screen-u:
<View className="bg-red-500 p-4">
  <Text className="text-white">Test</Text>
</View>

// Ako vidiš crvenu pozadinu i beli tekst = RADI! ✅
```

## 🔧 Troubleshooting

### Problem: "Cannot find module 'nativewind/metro'"
**Rešenje:**
```bash
rm -rf node_modules package-lock.json
npm install
```

### Problem: "Use process(css).then(cb)"
**Rešenje:**
- Proveri da li je `react-native-reanimated/plugin` PRVI u babel plugins
- Obriši cache: `rm -rf .expo node_modules/.cache`

### Problem: Stilovi se ne primenjuju
**Rešenje:**
1. Proveri da li je `import './global.css'` na vrhu App.tsx
2. Proveri tailwind.config.js `content` paths
3. Restartuj Metro sa `--clear`

### Problem: TypeScript greške
**Rešenje:**
- Proveri da li postoji `nativewind-env.d.ts`
- Dodaj u `tsconfig.json`: `"include": ["nativewind-env.d.ts"]`

## 📊 Pre vs Posle

### PRE (bez NativeWind):
```tsx
import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
});

<View style={styles.container}>...</View>
```

### POSLE (sa NativeWind v4):
```tsx
<View className="bg-white rounded-3xl p-6 shadow-lg">...</View>
```

**Rezultat:**
- 🎯 90% manje koda
- ⚡ Brže pisanje
- 🎨 Konzistentan design
- 📱 Responsive ready

## 🎉 Status

✅ **NativeWind v4 instaliran i konfigurisan**  
✅ **Svi potrebni paketi instalirani**  
✅ **Konfiguracija kompletna**  
✅ **Spremno za korišćenje**  

## 📚 Dokumentacija

- [NativeWind v4 Docs](https://www.nativewind.dev/v4/overview)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [React Native Reanimated](https://docs.swmansion.com/react-native-reanimated/)

---

**Pokreni aplikaciju i uživaj u Tailwind CSS! 🎨**

```bash
npx expo start --clear
```
