/**
 * Services exports
 */

export { supabase } from './supabase'

export {
  claimReward,
  getActiveRewards,
  canAffordReward,
  pointsNeeded,
  awardPoints,
  RewardClaimError,
  type ClaimRewardResponse,
} from './gamification'

export {
  createFamily,
  joinFamily,
  joinFamilyByInviteCode,
  leaveFamily,
  getFamilyMembers,
  generateInviteCode,
} from './family'

export {
  getFamilyEvents,
  getEventsInRange,
  createCalendarEvent,
  updateCalendarEvent,
  deleteCalendarEvent,
  getEventsForDate,
} from './calendar'

export {
  getFamilyShoppingItems,
  createShoppingItem,
  toggleShoppingItem,
  deleteShoppingItem,
  subscribeToShoppingList,
  unsubscribeFromShoppingList,
} from './shopping'
