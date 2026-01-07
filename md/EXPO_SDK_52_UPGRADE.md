# 🚀 Upgrade Guide - Expo SDK 50 → 52

**Date:** January 4, 2026  
**Status:** ✅ Upgraded to Expo SDK 52 with Android Support

---

## 📦 Šta je Promenjeno

### Package.json Updates

| Package | Before (SDK 50) | After (SDK 52) |
|---------|----------------|----------------|
| expo | ~50.0.0 | ~52.0.0 |
| react | 18.2.0 | 18.3.1 |
| react-native | 0.73.2 | 0.76.5 |
| expo-linear-gradient | ~12.7.2 | ~13.0.2 |
| expo-status-bar | ~1.11.1 | ~2.0.0 |
| react-native-safe-area-context | 4.8.2 | 4.12.0 |
| react-native-screens | ~3.29.0 | ~4.1.0 |
| react-native-svg | 14.1.0 | 15.8.0 |
| @react-navigation/native | ^6.1.9 | ^6.1.18 |
| @supabase/supabase-js | ^2.39.0 | ^2.45.4 |
| lucide-react-native | ^0.309.0 | ^0.454.0 |
| zustand | ^4.4.7 | ^4.5.5 |

---

## 🤖 Android Configuration

### app.json - New Android Settings

```json
"android": {
  "package": "com.familysync.app",
  "versionCode": 1,
  "permissions": [
    "CAMERA",
    "READ_EXTERNAL_STORAGE",
    "WRITE_EXTERNAL_STORAGE"
  ],
  "adaptiveIcon": {
    "foregroundImage": "./assets/adaptive-icon.png",
    "backgroundColor": "#FAF5FF"
  }
}
```

### EAS Build Configuration

Created `eas.json` with 3 build profiles:

- **development** - Debug APK for testing
- **preview** - Internal distribution APK
- **production** - Production APK

---

## 🔧 Instalacija

### Korak 1: Očisti prethodne pakete

```bash
cd /Users/markolosic/Desktop/Bravo/familysync
rm -rf node_modules
rm package-lock.json
```

### Korak 2: Instaliraj nove pakete

```bash
npm install
```

### Korak 3: Očisti Expo cache

```bash
npx expo start --clear
```

---

## 📱 Pokretanje

### Development Mode

```bash
# Start Metro bundler
npx expo start

# Za Android
npx expo start --android

# Za iOS (samo Mac)
npx expo start --ios

# Za Web
npx expo start --web
```

### Build za Android

```bash
# Development build (Debug APK)
npx eas build --platform android --profile development

# Preview build (Internal APK)
npx eas build --platform android --profile preview

# Production build
npx eas build --platform android --profile production
```

---

## ✅ Nove Funkcionalnosti (SDK 52)

### 1. **Poboljšana Performance**
- Brži Metro bundler
- Optimizovani native moduli
- Bolja memorijska efikasnost

### 2. **Android Enhancements**
- Podrška za Android 14
- Novi Gradle build sistem
- Poboljšane permissions handling

### 3. **React Native 0.76.5**
- Nova arhitektura (Fabric & TurboModules)
- Poboljšan Hermes engine
- Bolja TypeScript integracija

### 4. **Expo Router Ready**
- SDK 52 je spreman za Expo Router (ako želiš da migriraš kasnije)
- Trenutno koristimo React Navigation (radi odlično)

---

## 🐛 Breaking Changes & Fixes

### 1. **React Navigation Types**
Updated navigation types kompatibilne sa novom verzijom.

### 2. **Expo Status Bar**
Nova verzija `~2.0.0` - API ostao isti.

### 3. **Safe Area Context**
Verzija `4.12.0` - Edge-to-edge Android support.

### 4. **React Native SVG**
Verzija `15.8.0` - Bolja iOS 18 podrška.

---

## 📋 Checklist - Posle Instalacije

- [ ] Pokreni `npm install`
- [ ] Pokreni `npx expo start --clear`
- [ ] Testiraj na Android emulatoru
- [ ] Testiraj na iOS simulatoru (ako imaš Mac)
- [ ] Testiraj na fizičkom uređaju
- [ ] Proveri da sve funkcionalnosti rade:
  - [ ] Login/Register
  - [ ] Family creation
  - [ ] Tasks CRUD
  - [ ] Rewards shop
  - [ ] Calendar
  - [ ] Shopping list
  - [ ] Realtime updates

---

## 🚀 Build APK za Testiranje

```bash
# Install EAS CLI (ako nemaš)
npm install -g eas-cli

# Login to Expo account
eas login

# Configure project (first time only)
eas build:configure

# Build Android APK
eas build --platform android --profile preview
```

Posle build-a, dobijaš link za download APK fajla koji možeš instalirati na bilo koji Android uređaj!

---

## 📚 Resursi

- **Expo SDK 52 Release Notes**: https://expo.dev/changelog/2024/11-12-sdk-52
- **React Native 0.76 Release**: https://reactnative.dev/blog/2024/11/13/release-0.76
- **EAS Build Docs**: https://docs.expo.dev/build/introduction/
- **Android Permissions**: https://docs.expo.dev/guides/permissions/

---

## 🎯 Sledeći Koraci

1. **Test thoroughly** - Proveri sve feature-ove
2. **Build APK** - Kreiraj testni APK
3. **Test on devices** - Instaliraj na real Android uređaj
4. **Optimize** - Measure performance, add analytics
5. **Deploy** - Submit to Play Store kada je spremno

---

## 💡 Tips

### Faster Development

```bash
# Use tunnel for testing on different networks
npx expo start --tunnel

# Clear cache if weird errors appear
npx expo start --clear

# Check for outdated packages
npx expo-doctor
```

### Android Debugging

```bash
# View Android logs
npx react-native log-android

# View connected devices
adb devices

# Install APK manually
adb install path/to/app.apk
```

---

**Status:** ✅ Ready for SDK 52!  
**Android Support:** ✅ Configured!  
**Build System:** ✅ EAS Ready!

🚀 **Sada instaliraj pakete i pokreni aplikaciju!**
