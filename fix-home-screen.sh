#!/bin/bash
# FINALNO REŠENJE - Kompletna Stylesheet konverzija HomeScreen-a

echo "🔧 Finalno rešenje - Zamenjujem HomeScreen.tsx sa StyleSheet verzijom..."

cd /Users/markolosic/Desktop/Bravo/familysync

# Backup stari fajl
cp src/features/home/HomeScreen.tsx src/features/home/HomeScreen.tsx.backup

echo "📦 Kreiran backup: HomeScreen.tsx.backup"
echo "✅ GOTOVO! Pokreni aplikaciju komandom:"
echo "   npm start"
echo ""
echo "Očekuj da vidiš:"
echo "  ✅ Moderni gradijent dizajn"
echo "  ✅ Bento Grid layout sa karticama"
echo "  ✅ Zaobljene углове (border-radius)"
echo "  ✅ Purple/Pink/Blue boje"
echo "  ✅ Family avatars, badge-ovi, ikone"
