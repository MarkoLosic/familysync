# 🔧 Fix: Missing expo-asset Package

**Error:** `The required package 'expo-asset' cannot be found`

---

## ✅ Quick Fix

Dodao sam nedostajuće Expo pakete u `package.json`:

- ✅ `expo-asset` - Asset management
- ✅ `expo-constants` - Device constants
- ✅ `expo-file-system` - File system access
- ✅ `expo-font` - Custom fonts
- ✅ `expo-splash-screen` - Splash screen control

---

## 🚀 Kako Popraviti (Odaberi jedan način)

### **NAČIN 1: Automatski** ⭐ (Najbrži)

```bash
cd /Users/markolosic/Desktop/Bravo/familysync
./fix-packages.sh
```

Ova skripta će:
1. Očistiti `node_modules`
2. Instalirati sve pakete
3. Pokrenuti Expo sa čistim cache-om

---

### **NAČIN 2: Manualno**

```bash
cd /Users/markolosic/Desktop/Bravo/familysync

# 1. Očisti stare pakete
rm -rf node_modules
rm package-lock.json

# 2. Instaliraj nove
npm install

# 3. Pokreni Expo
npx expo start --clear
```

---

## 📦 Novi Paketi u package.json

```json
"expo-asset": "~10.0.10",
"expo-constants": "~17.0.3",
"expo-file-system": "~18.0.4",
"expo-font": "~13.0.1",
"expo-splash-screen": "~0.29.13"
```

---

## ⏱️ Koliko Traje?

- Čišćenje: 5 sekundi
- Instalacija: 1-2 minuta
- Expo start: 30 sekundi

**Ukupno: ~3 minuta**

---

## ✅ Provera - Da li Radi?

Kada završi instalacija i Expo se pokrene, trebalo bi da vidiš:

```
Starting Metro Bundler
› Metro waiting on exp://192.168.x.x:8081

› Press a │ open Android
› Press i │ open iOS simulator
› Press w │ open web
```

**Ako vidiš ovo - RADI! ✅**

---

## 🆘 Ako I Dalje Ne Radi

```bash
# Reinstaliraj Expo CLI
npm install -g expo-cli

# Koristi npx umesto globalnog
npx expo start --clear

# Ili reinstaliraj node_modules ponovo
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

---

## 🎯 Sada Pokreni:

**Automatski:**
```bash
./fix-packages.sh
```

**Ili Manualno:**
```bash
rm -rf node_modules && npm install && npx expo start --clear
```

---

**Javi mi kada završi instalacija!** 🚀
