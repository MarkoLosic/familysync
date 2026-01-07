#!/bin/bash

echo "🚀 Starting FamilySync with username fix..."

cd "$(dirname "$0")"

# Clean everything
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

echo "✅ Ready to start!"
echo ""
echo "📝 IMPORTANT: Make sure your Supabase 'profiles' table has 'username' column!"
echo ""
echo "Run this SQL in Supabase if needed:"
echo "  SELECT column_name FROM information_schema.columns WHERE table_name = 'profiles';"
echo ""
echo "Starting Expo..."
echo ""

npx expo start --clear
