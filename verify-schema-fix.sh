#!/bin/bash

# Schema Fix Verification Script
# Checks if all files use correct column names

echo "🔍 Verifying database schema fixes..."
echo ""

cd /Users/markolosic/Desktop/Bravo/familysync

# Check for any remaining references to user_id in TypeScript/TSX files
echo "1. Checking for 'user_id' references..."
USER_ID_COUNT=$(grep -r "user_id" --include="*.ts" --include="*.tsx" src/ | grep -v "// " | wc -l)
if [ "$USER_ID_COUNT" -eq 0 ]; then
  echo "   ✅ No user_id references found"
else
  echo "   ⚠️  Found $USER_ID_COUNT references to user_id:"
  grep -r "user_id" --include="*.ts" --include="*.tsx" src/ | grep -v "// "
fi
echo ""

# Check for any remaining references to username in TypeScript/TSX files
echo "2. Checking for '.username' references..."
USERNAME_COUNT=$(grep -r "\.username" --include="*.ts" --include="*.tsx" src/ | wc -l)
if [ "$USERNAME_COUNT" -eq 0 ]; then
  echo "   ✅ No .username references found"
else
  echo "   ⚠️  Found $USERNAME_COUNT references to .username:"
  grep -r "\.username" --include="*.ts" --include="*.tsx" src/
fi
echo ""

# Check if supabase.ts has user_id
echo "3. Checking src/types/supabase.ts..."
if grep -q "user_id" src/types/supabase.ts; then
  echo "   ❌ supabase.ts still contains 'user_id'"
  grep -n "user_id" src/types/supabase.ts
else
  echo "   ✅ supabase.ts is clean (no user_id)"
fi
echo ""

# Check if database.ts uses correct types
echo "4. Checking src/types/database.ts..."
if grep -q "user_id:" src/types/database.ts; then
  echo "   ❌ database.ts still uses 'user_id:'"
else
  echo "   ✅ database.ts uses 'id:'"
fi
if grep -q "username:" src/types/database.ts; then
  echo "   ❌ database.ts still uses 'username:'"
else
  echo "   ✅ database.ts uses 'name:'"
fi
echo ""

# Check authStore query
echo "5. Checking src/store/authStore.ts..."
if grep -q ".eq('user_id'" src/store/authStore.ts; then
  echo "   ❌ authStore.ts still queries by user_id"
else
  echo "   ✅ authStore.ts queries by id"
fi
echo ""

# Check for TypeScript errors
echo "6. Checking for TypeScript errors..."
if command -v npx &> /dev/null; then
  echo "   Running tsc --noEmit..."
  npx tsc --noEmit 2>&1 | head -20
else
  echo "   ⚠️  npx not available, skipping TypeScript check"
fi
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 SUMMARY"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "If all checks show ✅, your schema fix is complete!"
echo ""
echo "Next step: Run 'npx expo start --clear' to test"
echo ""
