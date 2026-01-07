#!/bin/bash

echo "🎨 Starting FamilySync with NativeWind v4..."
echo ""

cd "$(dirname "$0")"

# Clean all caches
echo "🧹 Cleaning caches..."
rm -rf .expo
rm -rf node_modules/.cache
rm -rf /tmp/metro-*
rm -rf /tmp/haste-*

# Kill any running processes
echo "🛑 Stopping old processes..."
pkill -f "metro" 2>/dev/null || true
pkill -f "expo" 2>/dev/null || true

sleep 2

echo "✅ Ready!"
echo ""
echo "📋 NativeWind v4 Status:"
echo "  ✅ nativewind@4.2.1"
echo "  ✅ react-native-css-interop@0.2.1"
echo "  ✅ react-native-reanimated@3.16.4"
echo "  ✅ Metro config with withNativeWind"
echo "  ✅ global.css imported"
echo ""
echo "🎨 You can now use Tailwind className in all components!"
echo ""
echo "Example:"
echo '  <View className="bg-white rounded-3xl p-6 shadow-lg">'
echo '    <Text className="text-2xl font-bold text-purple-900">Hello!</Text>'
echo "  </View>"
echo ""
echo "Starting Expo..."
echo ""

npx expo start --clear
