# 🎮 Reward Claiming System - Complete Implementation

## 📋 Summary

A secure, production-ready reward claiming system for FamilySync that uses Supabase RPC functions to handle transactions atomically on the backend.

## 🗂️ Files Created

### Core Service
- ✅ `src/services/gamification.ts` - Main service with `claimReward()` function
- ✅ `src/services/index.ts` - Service exports
- ✅ `src/services/supabase.ts` - Supabase client

### Examples & Documentation
- ✅ `src/features/rewards/RewardCard.example.tsx` - Complete UI component example
- ✅ `src/services/gamification.examples.ts` - 8 different usage patterns
- ✅ `src/services/README.md` - Comprehensive documentation
- ✅ `CLAIM_REWARD_QUICKSTART.md` - Quick reference guide

### Database
- ✅ `supabase/claim_reward.sql` - PostgreSQL RPC function

## 🚀 Quick Start

### 1. Setup Database (One-time)

Run the SQL in `supabase/claim_reward.sql` in your Supabase SQL Editor.

### 2. Basic Usage

```typescript
import { claimReward, RewardClaimError } from '@/services/gamification'
import { useAuthStore } from '@/store'

// In your button's onPress handler:
const handleClaim = async () => {
  try {
    // This ONE function does everything safely
    const newBalance = await claimReward(rewardId)
    
    // Refresh profile to see updated points
    await useAuthStore.getState().fetchProfileAndFamily()
    
    alert(`Success! New balance: ${newBalance} points`)
  } catch (error) {
    if (error instanceof RewardClaimError) {
      alert(error.message)
    }
  }
}
```

## ✨ Key Features

### Security
- ✅ **Atomic Transactions** - All-or-nothing database updates
- ✅ **Server-Side Validation** - Backend checks everything
- ✅ **No Client Manipulation** - Client never manually updates points
- ✅ **Race Condition Prevention** - Safe concurrent claims

### Developer Experience
- ✅ **One Function Call** - `claimReward(rewardId)` does everything
- ✅ **Type-Safe** - Full TypeScript support
- ✅ **Clear Error Codes** - Easy error handling
- ✅ **Comprehensive Docs** - Multiple examples and guides

### User Experience
- ✅ **Instant Feedback** - Returns new balance immediately
- ✅ **Clear Error Messages** - User-friendly error handling
- ✅ **Loading States** - Easy to implement
- ✅ **Confirmation Dialogs** - Prevent accidental claims

## 📚 Available Functions

### Primary Function
```typescript
claimReward(rewardId: string): Promise<number>
```
Calls the backend RPC function to claim a reward safely.

### Helper Functions
```typescript
canAffordReward(userPoints: number, rewardPoints: number): boolean
pointsNeeded(userPoints: number, rewardPoints: number): number
getActiveRewards(familyId: string): Promise<Reward[]>
awardPoints(userId: string, points: number): Promise<number>
```

### Error Class
```typescript
class RewardClaimError extends Error {
  code: 'INSUFFICIENT_POINTS' | 'REWARD_INACTIVE' | 'REWARD_NOT_FOUND' | 'UNKNOWN'
}
```

## 🎯 Usage Patterns

See `src/services/gamification.examples.ts` for 8 complete examples:

1. **Simple Handler** - Minimal implementation
2. **With Confirmation** - Dialog before claiming
3. **With Validation** - Pre-check before calling backend
4. **With Callbacks** - Loading states and callbacks
5. **Custom Errors** - User-friendly error messages
6. **Batch Claim** - Claim multiple rewards
7. **With Toast** - Toast notification integration
8. **With Analytics** - Track claim events

## 🛡️ Error Handling

```typescript
try {
  await claimReward(rewardId)
} catch (error) {
  if (error instanceof RewardClaimError) {
    switch (error.code) {
      case 'INSUFFICIENT_POINTS':
        // User needs more points
        break
      case 'REWARD_INACTIVE':
        // Reward is no longer active
        break
      case 'REWARD_NOT_FOUND':
        // Reward doesn't exist
        break
      default:
        // Other error
        break
    }
  }
}
```

## 🔍 How It Works

```
1. User clicks "Claim Reward" button
          ↓
2. Client calls claimReward(rewardId)
          ↓
3. Service calls supabase.rpc('claim_reward', {...})
          ↓
4. Backend (PostgreSQL function):
   • Validates reward exists and is active
   • Checks user has enough points
   • Deducts points atomically
   • Creates claim record (optional)
   • Returns new balance
          ↓
5. Client receives new balance
          ↓
6. Client calls fetchProfileAndFamily() to refresh UI
          ↓
7. User sees updated points in UI
```

## ✅ Best Practices

### DO:
- ✅ Always call `claimReward()` for claiming
- ✅ Refresh profile after successful claim
- ✅ Handle all error codes
- ✅ Show confirmation before expensive claims
- ✅ Display loading states
- ✅ Use `canAffordReward()` for UI state

### DON'T:
- ❌ Manually update `profile.points` on client
- ❌ Skip error handling
- ❌ Trust client-side calculations for security
- ❌ Allow claiming without confirmation
- ❌ Forget to refresh profile after claim

## 📖 Documentation

- **Quick Start**: `CLAIM_REWARD_QUICKSTART.md`
- **Full Documentation**: `src/services/README.md`
- **Usage Examples**: `src/services/gamification.examples.ts`
- **UI Component**: `src/features/rewards/RewardCard.example.tsx`
- **Database Setup**: `supabase/claim_reward.sql`

## 🔧 Testing

### Test the RPC Function
```sql
-- In Supabase SQL Editor
SELECT claim_reward(
  'reward-uuid'::uuid,
  'user-uuid'::uuid
);
```

### Test Error Cases
1. User with insufficient points
2. Inactive reward
3. Non-existent reward
4. Concurrent claims (race condition)

## 🚦 Next Steps

1. ✅ Run `supabase/claim_reward.sql` in Supabase
2. ✅ Review `CLAIM_REWARD_QUICKSTART.md`
3. ✅ Check out `RewardCard.example.tsx` for UI
4. ✅ Test with different scenarios
5. ✅ Customize error messages for your app

## 💡 Optional Enhancements

Future features you can add:
- Reward claim history screen
- Limited quantity rewards
- Cooldown periods
- Parental approval flow
- Push notifications
- Reward wishlists
- Gift rewards to family members

## 📦 Dependencies Required

```bash
npm install @supabase/supabase-js
npm install react-native-url-polyfill
```

## 🎓 Key Concepts

### Why RPC Function?
- **Atomic**: All database operations succeed or fail together
- **Secure**: Validation happens on backend, not client
- **Fast**: Single roundtrip to database
- **Safe**: No race conditions or double-claims

### Why Not Client-Side Updates?
- Race conditions (multiple users claiming same time)
- Points manipulation (malicious clients)
- Inconsistent state (failed updates)
- Complex error handling

## 📞 Support

If you encounter issues:
1. Check `TROUBLESHOOTING` section in `src/services/README.md`
2. Verify RPC function is created in Supabase
3. Check permissions: `GRANT EXECUTE ON FUNCTION claim_reward TO authenticated`
4. Review error codes and messages

---

**Ready to use!** 🎉 Just run the SQL setup and start claiming rewards securely.
