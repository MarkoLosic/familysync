#!/bin/bash

# FamilySync - Quick Setup Script for SDK 52
# Run this after upgrading to SDK 52

echo "🚀 FamilySync - Expo SDK 52 Setup"
echo "=================================="
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found"
    echo "Please run this script from the project root directory"
    exit 1
fi

# Step 1: Clean old dependencies
echo "📦 Step 1/4: Cleaning old dependencies..."
rm -rf node_modules
rm -f package-lock.json
rm -f yarn.lock
echo "✅ Cleaned!"
echo ""

# Step 2: Install dependencies
echo "📦 Step 2/4: Installing dependencies..."
npm install
if [ $? -ne 0 ]; then
    echo "❌ Installation failed"
    exit 1
fi
echo "✅ Dependencies installed!"
echo ""

# Step 3: Check for .env file
echo "🔐 Step 3/4: Checking environment variables..."
if [ ! -f ".env" ]; then
    echo "⚠️  Warning: .env file not found"
    echo "Creating template .env file..."
    cat > .env << 'EOF'
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
EOF
    echo "✅ Created .env template"
    echo "⚠️  Please update .env with your Supabase credentials!"
else
    echo "✅ .env file exists"
fi
echo ""

# Step 4: Clear Expo cache
echo "🧹 Step 4/4: Clearing Expo cache..."
npx expo start --clear &
EXPO_PID=$!
sleep 5
kill $EXPO_PID 2>/dev/null
echo "✅ Cache cleared!"
echo ""

# Done!
echo "=================================="
echo "✅ Setup Complete!"
echo ""
echo "🚀 Ready to start:"
echo "  npx expo start"
echo ""
echo "📱 Or run directly:"
echo "  npx expo start --android   (for Android)"
echo "  npx expo start --ios       (for iOS)"
echo "  npx expo start --web       (for Web)"
echo ""
echo "📝 Don't forget to:"
echo "  1. Update .env with your Supabase credentials"
echo "  2. Set up Supabase database (see md/SUPABASE_SETUP_REWARDS.md)"
echo "  3. Test on a device or emulator"
echo ""
