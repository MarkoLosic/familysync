#!/bin/bash

# FamilySync - Fix Missing Packages
# Run this to install missing Expo packages

echo "🔧 Fixing missing Expo packages..."
echo "=================================="
echo ""

cd /Users/markolosic/Desktop/Bravo/familysync

# Step 1: Clean
echo "📦 Step 1/3: Cleaning..."
rm -rf node_modules
rm -f package-lock.json
echo "✅ Cleaned!"
echo ""

# Step 2: Install
echo "📦 Step 2/3: Installing packages..."
npm install
if [ $? -ne 0 ]; then
    echo "❌ Installation failed"
    exit 1
fi
echo "✅ Installed!"
echo ""

# Step 3: Start Expo
echo "🚀 Step 3/3: Starting Expo..."
npx expo start --clear

