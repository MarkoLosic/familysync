# Rešenje problema sa Expo serverom

## Problem
Server se ne može pokrenuti zbog konflikta sa NativeWind v4 konfiguracijom.

## Rešenje 1: Privremeno ukloni NativeWind

Ako želiš da aplikacija odmah radi, možemo privremeno ukloniti NativeWind:

### Koraci:

1. **Obriši metro.config.js:**
```bash
rm metro.config.js
```

2. **Napravi novi metro.config.js bez NativeWind:**
```javascript
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

module.exports = config;
```

3. **Ukloni import iz App.tsx:**
Obriši liniju: `import './global.css';`

4. **Pokreni aplikaciju:**
```bash
rm -rf .expo node_modules/.cache
npx expo start --clear
```

## Rešenje 2: Kompletna NativeWind v4 instalacija

Ako želiš da zadržiš NativeWind, mora se instalirati sve:

```bash
npm install nativewind@^4.2.1 \
  react-native-css-interop \
  react-native-reanimated \
  react-native-safe-area-context
```

Zatim dodaj u `babel.config.js`:
```javascript
plugins: [
  'react-native-reanimated/plugin',
  // ... ostali plugins
]
```

## Rešenje 3: Alternativa - StyleSheet umesto Tailwind

Možeš koristiti React Native StyleSheet koji sigurno radi:

```javascript
import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF5FF',
  },
  // ...
});
```

## Preporuka

**Za sada preporučujem Rešenje 1** - jednostavno pokreni bez NativeWind-a kako bi video da aplikacija radi, pa onda možemo postepeno dodati styling.

## Brzi Fix

Pokreni ove komande u terminalu:

```bash
cd /Users/markolosic/Desktop/Bravo/familysync

# Napravi backup trenutnog metro.config.js
mv metro.config.js metro.config.js.backup

# Napravi novi jednostavan config
cat > metro.config.js << 'EOF'
const { getDefaultConfig } = require('expo/metro-config');
const config = getDefaultConfig(__dirname);
module.exports = config;
EOF

# Obriši cache
rm -rf .expo node_modules/.cache

# Pokreni
npx expo start --clear
```

Javi mi kada pokreneš ove komande pa ćemo videti da li radi!
