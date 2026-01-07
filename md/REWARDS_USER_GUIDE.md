# 🎁 Rewards Shop - User Guide

## Quick Navigation

### From Home Screen
1. Open the FamilySync app
2. On the Home screen, locate the quick action buttons at the bottom
3. Tap the **"Rewards"** button (orange/amber gradient with gift icon 🎁)
4. You'll be taken to the Rewards Shop

### From Navigation
The Rewards screen is also accessible via:
- Direct navigation: `navigation.navigate('Rewards')`
- Main stack navigator route: `'Rewards'`

---

## Rewards Shop Layout

```
┌─────────────────────────────────────┐
│  Rewards Shop                       │
│                                     │
│  ┌───────────────────────────────┐ │
│  │  🪙  Your Points              │ │
│  │      2,450                    │ │
│  └───────────────────────────────┘ │
│                                     │
│  ┌──────────┐  ┌──────────┐       │
│  │   🎬     │  │   🎮     │       │
│  │ Cinema   │  │  Gaming  │       │
│  │ Ticket   │  │   Time   │       │
│  │ 🪙500 XP │  │ 🪙800 XP │       │
│  │  [Buy]   │  │  [Buy]   │       │
│  └──────────┘  └──────────┘       │
│                                     │
│  ┌──────────┐  ┌──────────┐       │
│  │   🍦     │  │   📚     │       │
│  │   Ice    │  │  Book    │       │
│  │  Cream   │  │  Store   │       │
│  │ 🪙300 XP │  │ 🪙600 XP │       │
│  │  [Buy]   │  │ [Locked] │       │
│  └──────────┘  └──────────┘       │
└─────────────────────────────────────┘
```

---

## Features Overview

### 1. Points Display
**Location:** Top of screen, below title

**What it shows:**
- Large coin icon (🪙)
- "Your Points" label
- Your current point balance (big, bold number)
- Blue background with rounded corners

**Example:**
```
┌─────────────────────────┐
│  🪙  Your Points        │
│      2,450             │
└─────────────────────────┘
```

### 2. Reward Cards
**Layout:** 2-column grid

**Each card shows:**
- Icon or image (emoji or uploaded photo)
- Reward title (e.g., "Cinema Ticket")
- Price in XP (e.g., "500 XP")
- Buy button (blue when affordable, gray when locked)

**Card States:**

#### Affordable Reward
```
┌──────────────┐
│     🎬      │
│  Cinema     │
│  Ticket     │
│             │
│  🪙 500 XP  │
│   [Buy]     │
└──────────────┘
```

#### Locked (Not Enough Points)
```
┌──────────────┐
│     🎮      │
│   Gaming    │
│    Time     │
│             │
│  🪙 800 XP  │
│ Need 350 XP │
│  [Locked]   │
└──────────────┘
```

#### Unavailable
```
┌──────────────┐
│ Unavailable  │
│     📚      │
│    Book     │
│   Store     │
│  🪙 600 XP  │
│  [Locked]   │
└──────────────┘
```

---

## How to Buy a Reward

### Step-by-Step Process

#### 1. Browse Available Rewards
- Scroll through the 2-column grid
- Look at reward icons and prices
- Check your points balance at the top

#### 2. Check Affordability
**Can Afford:**
- Buy button is blue
- No lock icon
- Price shown in blue

**Can't Afford:**
- Buy button is gray with lock icon
- "Need X more XP" badge displayed
- Price shown in gray

#### 3. Tap the Buy Button
**If you have enough points:**
- Confirmation dialog appears
- Shows reward title and cost
- Two options: "Cancel" or "Claim"

**If you don't have enough points:**
- Alert appears immediately
- Message: "You need X more point(s) to claim this reward."
- No points are deducted

#### 4. Confirm Purchase
**In the confirmation dialog:**
```
┌──────────────────────────────┐
│  Claim Reward               │
│                             │
│  Do you want to claim       │
│  "Cinema Ticket" for        │
│  500 points?                │
│                             │
│   [Cancel]      [Claim]     │
└──────────────────────────────┘
```

Tap **"Claim"** to proceed, or **"Cancel"** to go back.

#### 5. Processing
- Button shows loading spinner
- Other buttons are temporarily disabled
- Screen stays responsive

#### 6. Success!
**Success alert appears:**
```
┌──────────────────────────────┐
│  Success! 🎉                │
│                             │
│  You've claimed "Cinema     │
│  Ticket"! Your parent will  │
│  be notified.               │
│                             │
│            [OK]             │
└──────────────────────────────┘
```

- Points are deducted from your balance
- Points display updates automatically
- Parent receives notification
- Reward moves to "pending fulfillment"

---

## Understanding Points

### How to Earn Points
Points are earned by:
- ✅ Completing tasks
- 📚 Finishing homework
- 🏠 Doing chores
- ⭐ Getting bonus achievements

### Point Balance
- Always visible at the top of the Rewards screen
- Also shown on the Home screen widget
- Updates in real-time after purchases
- Updates after completing tasks

### Spending Points
- Points are deducted when you claim a reward
- Transaction is instant
- Cannot be undone (choose carefully!)
- Balance updates immediately

---

## Reward States Explained

### 🟢 Active & Affordable
- **Green Buy Button**
- You have enough points
- Reward is available
- Can purchase immediately

### 🟡 Active But Locked
- **Gray Lock Button**
- Not enough points yet
- "Need X more XP" badge
- Keep earning to unlock!

### 🔴 Unavailable
- **Gray with "Unavailable" badge**
- Reward is temporarily disabled
- May come back later
- Check with your parents

---

## Tips & Best Practices

### 💡 Smart Spending
1. **Save for Big Rewards:** Don't spend all points on small items
2. **Check Prices:** Compare rewards before buying
3. **Plan Ahead:** Know what you're saving for
4. **Ask Questions:** Talk to parents about new rewards

### 🎯 Earning More Points
1. **Complete Tasks Early:** Finish tasks before deadline
2. **Quality Work:** Do tasks well to earn bonus points
3. **Daily Streaks:** Complete tasks daily for streak bonuses
4. **Help Others:** Volunteer for extra chores

### 📱 Using the App
1. **Pull to Refresh:** Swipe down to update rewards
2. **Check Often:** New rewards added regularly
3. **Plan Purchases:** Don't impulse buy
4. **Track Progress:** Watch your points grow

---

## Troubleshooting

### "Failed to load rewards"
**What to do:**
1. Check internet connection
2. Pull down to refresh
3. Close and reopen the app
4. Contact parent if issue persists

### "User profile not found"
**What to do:**
1. Log out and log back in
2. Check with parent that your account is set up
3. Restart the app

### "Reward not found"
**What to do:**
- Refresh the screen (pull down)
- Reward may have been removed by parent
- Try again in a moment

### Points Not Updating
**What to do:**
1. Pull down to refresh
2. Go back to Home screen and return
3. Check if task was actually approved
4. Wait a few seconds and check again

### Button Won't Respond
**What to do:**
- Make sure you have enough points
- Check if reward is active
- Wait for any ongoing purchases to complete
- Restart app if problem continues

---

## Parent Fulfillment

### What Happens After Purchase?

#### 1. Notification Sent
- Parent receives notification
- Shows reward name and child's name
- Includes timestamp

#### 2. Pending Status
- Reward is in "pending" state
- Points already deducted
- Cannot claim same reward twice

#### 3. Parent Action
**Parent can:**
- ✅ Mark as fulfilled (you get the reward!)
- ❌ Deny the claim (points refunded)
- 💬 Message you about it

#### 4. Fulfillment
- Parent physically gives you the reward
- They mark it as "fulfilled" in their app
- You receive confirmation
- Reward moves to history

---

## Reward Types

### 🎬 Entertainment
- Cinema tickets
- Movie rentals
- Game time
- TV show episodes

### 🍔 Food & Treats
- Ice cream
- Pizza night
- Favorite snack
- Restaurant visit

### 🎮 Gaming
- Extra gaming time
- New game
- In-game purchases
- Gaming accessories

### 🎨 Activities
- Art supplies
- Craft kits
- Sports equipment
- Music lessons

### 💰 Money
- Allowance bonus
- Piggy bank deposit
- Gift cards
- Cash reward

### 🎁 Special Privileges
- Later bedtime
- Sleepover
- Day trip
- Choose dinner

---

## Frequently Asked Questions

### Can I return a reward?
No, purchases are final. Choose carefully!

### What if my parents don't fulfill the reward?
Talk to them! They'll see the notification and should respond soon.

### Can I save points forever?
Yes! Points don't expire. Save for big rewards!

### What if a reward disappears?
Parents can remove or disable rewards. Your points are safe.

### Can I request new rewards?
Yes! Ask your parents to add rewards you'd like.

### Do points expire?
No, points stay in your account until you spend them.

### Can I give points to siblings?
Not currently, but ask your parents about family goals!

### What if I accidentally bought something?
Contact your parent immediately. They may be able to help.

---

## Visual Indicators Guide

### Icons
- 🪙 = Points/XP
- 🎁 = Reward/Gift
- 🔒 = Locked/Not affordable
- ✅ = Completed/Approved
- ❌ = Denied/Unavailable
- ⏳ = Pending/Processing
- 🔥 = Streak/Hot item

### Colors
- **Blue:** Affordable, can buy
- **Gray:** Locked, need more points
- **Red:** Unavailable/Error
- **Green:** Success/Completed
- **Orange:** Warning/Almost there
- **Purple:** Special/Premium

### Badges
- "Need X XP" - Points needed to unlock
- "Unavailable" - Reward disabled
- "Locked" - Not enough points
- "Processing" - Purchase in progress

---

## Example Shopping Session

### Sarah's Story 🎯

**Starting Points:** 1,200 XP

**Available Rewards:**
- Ice Cream (300 XP) ✅
- Cinema Ticket (500 XP) ✅
- Gaming Time (800 XP) ✅
- New Toy (1,500 XP) 🔒

**Sarah's Decision:**
1. Sees she can't afford the toy yet
2. Needs 300 more points
3. Decides to buy cinema ticket (500 XP)
4. Confirms purchase
5. New balance: 700 XP
6. Can now afford gaming time too!
7. Saves for the toy instead

**Outcome:**
- Smart saving decision
- Will complete 2 more tasks
- Can buy toy next time
- Parent will take her to cinema this weekend

---

## Quick Reference Card

```
═══════════════════════════════════════
     REWARDS SHOP QUICK GUIDE
═══════════════════════════════════════

🏠 HOME → TAP "REWARDS" BUTTON

📊 YOUR POINTS
   └─ Top of screen
   └─ Big number with coin icon

🎁 REWARD CARDS
   └─ 2 columns
   └─ Icon + Title + Price + Button

💰 TO BUY:
   1. Check points
   2. Tap "Buy"
   3. Confirm
   4. Wait for parent

🔒 LOCKED = Need more points
✅ BLUE = Can buy now
❌ GRAY = Unavailable

📱 REFRESH = Pull down
═══════════════════════════════════════
```

---

## Success! 🎉

You now know everything about the Rewards Shop:
- ✅ How to navigate there
- ✅ How to buy rewards
- ✅ How to earn more points
- ✅ What to do if something goes wrong
- ✅ How the system works

**Ready to shop? Start earning and spending those points!** 🚀

---

## Getting Help

### If You Need Support:
1. **Talk to your parents** - They manage your account
2. **Check this guide** - Most answers are here
3. **Restart the app** - Fixes many issues
4. **Wait and try again** - Some updates take time

### Parents Can:
- Add new rewards
- Remove rewards
- Adjust point values
- Fulfill claimed rewards
- Refund purchases
- View your history
- Help with issues

---

**Remember:** The Rewards Shop is designed to be fun and motivating! Work hard, earn points, and enjoy your rewards! 🌟
