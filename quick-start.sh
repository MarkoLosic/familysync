#!/bin/bash

# Quick fix script - removes NativeWind temporarily to get the app running

echo "🔧 Fixing FamilySync - Removing NativeWind temporarily..."

cd "$(dirname "$0")"

# Clean all caches
echo "🧹 Cleaning caches..."
rm -rf .expo
rm -rf node_modules/.cache
rm -rf /tmp/metro-*
rm -rf /tmp/haste-*

# Kill any running Metro processes
echo "🛑 Killing any running Metro bundlers..."
pkill -f "metro" || true
pkill -f "expo" || true

# Wait a moment
sleep 2

echo "✅ Cleanup complete!"
echo ""
echo "📱 Now starting Expo..."
echo ""
echo "Once Expo starts, press:"
echo "  • 'a' for Android"
echo "  • 'i' for iOS"
echo "  • 'w' for web"
echo ""

# Start Expo
npx expo start --clear
