# Gamification Service

Complete reward claiming system with safe transaction handling using Supabase RPC functions.

## Overview

The gamification service provides a secure way to claim rewards by calling a backend RPC function that handles all the logic atomically. This prevents race conditions and ensures data consistency.

## Architecture

```
┌─────────────────┐
│  React Native   │
│   Component     │
└────────┬────────┘
         │
         │ claimReward(rewardId)
         ▼
┌─────────────────┐
│  Gamification   │
│    Service      │
└────────┬────────┘
         │
         │ supabase.rpc('claim_reward', {...})
         ▼
┌─────────────────┐
│   Supabase      │
│   RPC Function  │ ◄─ Atomic Transaction
└────────┬────────┘
         │
         │ 1. Validate reward
         │ 2. Check points
         │ 3. Deduct points
         │ 4. Create claim record
         ▼
┌─────────────────┐
│    Database     │
└─────────────────┘
```

## Files

```
src/services/
├── gamification.ts          # Main service with claimReward()
├── supabase.ts             # Supabase client

src/features/rewards/
├── RewardCard.example.tsx  # Complete UI example

supabase/
├── claim_reward.sql        # RPC function SQL
```

## Setup

### 1. Create the RPC Function

Run the SQL in `supabase/claim_reward.sql` in your Supabase SQL Editor. This creates:
- `claim_reward()` RPC function
- `reward_claims` table (optional, for tracking history)
- RLS policies

### 2. Import the Service

```typescript
import { claimReward, RewardClaimError } from '@/services/gamification'
```

## Core Function: `claimReward()`

### Function Signature

```typescript
async function claimReward(rewardId: string): Promise<number>
```

### Parameters

- `rewardId` (string) - The UUID of the reward to claim

### Returns

- `Promise<number>` - The user's new points balance after claiming

### Throws

- `RewardClaimError` - With specific error codes:
  - `INSUFFICIENT_POINTS` - User doesn't have enough points
  - `REWARD_INACTIVE` - Reward is no longer active
  - `REWARD_NOT_FOUND` - Reward doesn't exist
  - `UNKNOWN` - Other errors

### How It Works

1. ✅ Authenticates the current user
2. ✅ Calls Supabase RPC `claim_reward(p_reward_id, p_user_id)`
3. ✅ RPC function handles everything atomically:
   - Validates reward exists and is active
   - Checks user has enough points
   - Deducts points from user's balance
   - Creates claim record (optional)
4. ✅ Returns the new balance
5. ✅ Client does NOT manually update balance - relies on backend response

## Usage Examples

### Example 1: Basic Usage (Minimal)

```typescript
import { claimReward, RewardClaimError } from '@/services/gamification'
import { useAuthStore } from '@/store'

function ClaimButton({ rewardId }: { rewardId: string }) {
  const fetchProfileAndFamily = useAuthStore((state) => state.fetchProfileAndFamily)

  const handleClaim = async () => {
    try {
      // Call the RPC function - IT DOES EVERYTHING!
      const newBalance = await claimReward(rewardId)
      
      // Refresh profile to see updated points in UI
      await fetchProfileAndFamily()
      
      alert(`Success! New balance: ${newBalance} points`)
    } catch (error) {
      if (error instanceof RewardClaimError) {
        alert(error.message)
      }
    }
  }

  return <Button onPress={handleClaim} title="Claim" />
}
```

### Example 2: With Error Handling

```typescript
const handleClaim = async (rewardId: string) => {
  try {
    const newBalance = await claimReward(rewardId)
    
    // Success!
    Alert.alert('🎉 Success!', `New balance: ${newBalance} points`)
    
    // Refresh profile
    await useAuthStore.getState().fetchProfileAndFamily()
    
  } catch (error) {
    if (error instanceof RewardClaimError) {
      switch (error.code) {
        case 'INSUFFICIENT_POINTS':
          Alert.alert('Not Enough Points', 'Complete more tasks to earn points!')
          break
        case 'REWARD_INACTIVE':
          Alert.alert('Unavailable', 'This reward is no longer available')
          break
        case 'REWARD_NOT_FOUND':
          Alert.alert('Not Found', 'This reward no longer exists')
          break
        default:
          Alert.alert('Error', error.message)
      }
    } else {
      Alert.alert('Error', 'An unexpected error occurred')
    }
  }
}
```

### Example 3: Complete Component (See RewardCard.example.tsx)

The example file shows a full reward card component with:
- ✅ Points balance checking
- ✅ Visual feedback (disabled states)
- ✅ Confirmation dialog
- ✅ Loading states
- ✅ Error handling with user-friendly messages
- ✅ Success celebration
- ✅ Automatic profile refresh

## Helper Functions

### `canAffordReward()`

Check if user can afford a reward:

```typescript
const canAfford = canAffordReward(userPoints, rewardPoints)
// Example: canAffordReward(100, 75) => true
```

### `pointsNeeded()`

Calculate how many more points are needed:

```typescript
const needed = pointsNeeded(userPoints, rewardPoints)
// Example: pointsNeeded(50, 100) => 50
// Example: pointsNeeded(150, 100) => 0
```

### `getActiveRewards()`

Fetch all active rewards for a family:

```typescript
const rewards = await getActiveRewards(familyId)
```

### `awardPoints()`

Award points to a user (for task completion):

```typescript
const newBalance = await awardPoints(userId, 50)
```

## Error Handling

### RewardClaimError

Custom error class with typed error codes:

```typescript
try {
  await claimReward(rewardId)
} catch (error) {
  if (error instanceof RewardClaimError) {
    // Handle based on error.code
    console.log(error.code)    // 'INSUFFICIENT_POINTS' | 'REWARD_INACTIVE' | etc.
    console.log(error.message) // User-friendly message
  }
}
```

## Security Features

✅ **Atomic Transactions** - RPC function ensures all-or-nothing updates  
✅ **Server-Side Validation** - All checks happen on the backend  
✅ **No Client Balance Updates** - Client never manually updates points  
✅ **Race Condition Prevention** - Database handles concurrent claims  
✅ **RLS Policies** - Row Level Security enforced  
✅ **Type Safety** - Full TypeScript support  

## Best Practices

### ✅ DO:

- Always call `claimReward()` - never manually update points
- Refresh profile after successful claim
- Handle all error codes appropriately
- Show loading states during claim
- Confirm before claiming expensive rewards

### ❌ DON'T:

- Don't manually update `profile.points` on the client
- Don't skip error handling
- Don't allow claiming without user confirmation
- Don't trust client-side balance calculations for security

## Database Schema

### Reward Claims Table (Optional)

Track reward claim history:

```sql
CREATE TABLE reward_claims (
  id UUID PRIMARY KEY,
  profile_id UUID REFERENCES profiles(id),
  reward_id UUID REFERENCES rewards(id),
  points_spent INTEGER,
  claimed_at TIMESTAMP
)
```

### Query User's Claim History

```typescript
const { data } = await supabase
  .from('reward_claims')
  .select(`
    *,
    reward:rewards(title, points_required)
  `)
  .eq('profile_id', profileId)
  .order('claimed_at', { ascending: false })
```

## Testing

### Test the RPC Function

```sql
-- In Supabase SQL Editor
SELECT claim_reward(
  'reward-uuid-here'::uuid,
  'user-uuid-here'::uuid
);
```

### Test Cases

1. ✅ User has enough points - should succeed
2. ✅ User lacks points - should return insufficient points error
3. ✅ Reward is inactive - should return inactive error
4. ✅ Invalid reward ID - should return not found error
5. ✅ Concurrent claims - should handle atomically

## Troubleshooting

### Error: "function claim_reward does not exist"

**Solution:** Run the SQL in `supabase/claim_reward.sql` to create the function.

### Error: "permission denied for function claim_reward"

**Solution:** Grant execute permission:
```sql
GRANT EXECUTE ON FUNCTION claim_reward(UUID, UUID) TO authenticated;
```

### Points not updating in UI

**Solution:** Call `fetchProfileAndFamily()` after successful claim:
```typescript
await claimReward(rewardId)
await useAuthStore.getState().fetchProfileAndFamily()
```

### Error: "insufficient points" but user has enough

**Solution:** Check that the RPC function is reading the correct user profile:
- Verify `p_user_id` parameter is correct
- Check `profiles.user_id` matches `auth.uid()`

## Future Enhancements

Potential improvements:
- [ ] Support for limited quantity rewards
- [ ] Cooldown periods between claims
- [ ] Reward expiration dates
- [ ] Push notifications for new rewards
- [ ] Reward categories/tags
- [ ] Parental approval for certain rewards
- [ ] Reward wishlists
- [ ] Gift rewards to family members

## Dependencies

```json
{
  "@supabase/supabase-js": "^2.x"
}
```
