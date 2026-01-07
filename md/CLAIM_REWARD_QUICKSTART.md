# Quick Reference: Claim Reward

## 🚀 TL;DR

```typescript
import { claimReward, RewardClaimError } from '@/services/gamification'
import { useAuthStore } from '@/store'

// In your button's onPress handler:
const handleClaimReward = async () => {
  try {
    // This ONE function does everything safely on the backend
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

## ✨ What `claimReward()` Does

1. ✅ Calls Supabase RPC function `claim_reward`
2. ✅ Backend validates everything atomically
3. ✅ Backend deducts points safely
4. ✅ Returns new balance
5. ✅ You refresh the profile to show updated UI

## 🎯 Key Points

- **DO NOT** manually update `profile.points` on the client
- **ALWAYS** call `fetchProfileAndFamily()` after successful claim
- **HANDLE** errors with `RewardClaimError`
- **TRUST** the backend - it handles all validation

## 📋 Setup Checklist

- [ ] Run SQL in `supabase/claim_reward.sql` to create RPC function
- [ ] Import `claimReward` from `@/services/gamification`
- [ ] Call function in button handler
- [ ] Handle errors appropriately
- [ ] Refresh profile after success

## 🔥 Complete Button Example

```typescript
import React, { useState } from 'react'
import { TouchableOpacity, Text, Alert } from 'react-native'
import { claimReward, RewardClaimError } from '@/services/gamification'
import { useAuthStore } from '@/store'

function ClaimRewardButton({ reward }) {
  const [isClaiming, setIsClaiming] = useState(false)
  const fetchProfileAndFamily = useAuthStore((state) => state.fetchProfileAndFamily)
  
  const handlePress = async () => {
    try {
      setIsClaiming(true)
      
      // Call the RPC function
      const newBalance = await claimReward(reward.id)
      
      // Refresh profile
      await fetchProfileAndFamily()
      
      // Show success
      Alert.alert('🎉 Success!', `New balance: ${newBalance} points`)
      
    } catch (error) {
      if (error instanceof RewardClaimError) {
        // Handle specific errors
        switch (error.code) {
          case 'INSUFFICIENT_POINTS':
            Alert.alert('Not Enough Points', error.message)
            break
          case 'REWARD_INACTIVE':
            Alert.alert('Unavailable', error.message)
            break
          default:
            Alert.alert('Error', error.message)
        }
      } else {
        Alert.alert('Error', 'Failed to claim reward')
      }
    } finally {
      setIsClaiming(false)
    }
  }
  
  return (
    <TouchableOpacity 
      onPress={handlePress}
      disabled={isClaiming}
    >
      <Text>{isClaiming ? 'Claiming...' : 'Claim Reward'}</Text>
    </TouchableOpacity>
  )
}
```

## 🛡️ Error Codes

```typescript
error.code === 'INSUFFICIENT_POINTS'  // User needs more points
error.code === 'REWARD_INACTIVE'      // Reward not available
error.code === 'REWARD_NOT_FOUND'     // Reward doesn't exist
error.code === 'UNKNOWN'              // Other error
```

## 📚 Full Documentation

See `src/services/README.md` for complete documentation.
