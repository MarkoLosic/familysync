# 🛒 Shopping List - Visual & Technical Guide

## Screen Layout

```
┌─────────────────────────────────────┐
│  Shopping List    [Real-time]   🛒3 │  ← Header
│  Real-time family shopping          │
├─────────────────────────────────────┤
│  🍎 Food (2)                        │  ← Category header
│  ┌─────────────────────────────────┐│
│  │ ○ 🍎 Milk                [🗑️] ││  ← Unchecked item
│  └─────────────────────────────────┘│
│  ┌─────────────────────────────────┐│
│  │ ○ 🥖 Bread               [🗑️] ││
│  └─────────────────────────────────┘│
│  ┌─────────────────────────────────┐│
│  │ ✓ 🧀 Cheese              [🗑️] ││  ← Checked (faded, strike)
│  └─────────────────────────────────┘│
│                                     │
│  🏠 Home (1)                        │
│  ┌─────────────────────────────────┐│
│  │ ○ 🧻 Paper Towels        [🗑️] ││
│  └─────────────────────────────────┘│
│                                     │
│  (scroll for more...)               │
├─────────────────────────────────────┤
│  [🍎][🏠][👤][📦]                    │  ← Category selector
│  ┌──────────────────────────┐  [+] │  ← Input + Add button
│  │ Add item...              │      │
│  └──────────────────────────┘      │
└─────────────────────────────────────┘
```

---

## Real-time Architecture

```
┌──────────────────────────────────────────────┐
│                  Supabase                    │
│  ┌────────────────────────────────────────┐  │
│  │      shopping_items Table              │  │
│  │  - id, family_id, title, category      │  │
│  │  - is_checked, created_by              │  │
│  └────────────────────────────────────────┘  │
│                     ↑                        │
│                     │ RLS Policies           │
│                     ↓                        │
│  ┌────────────────────────────────────────┐  │
│  │      Realtime Broadcast                │  │
│  │  Channel: shopping_items:{familyId}    │  │
│  │  Events: INSERT, UPDATE, DELETE        │  │
│  └────────────────────────────────────────┘  │
└──────────────────────────────────────────────┘
         ↓              ↓              ↓
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│ Mom's Device │ │ Dad's Device │ │ Kid's Device │
│   (Admin)    │ │   (Admin)    │ │   (Child)    │
└──────────────┘ └──────────────┘ └──────────────┘
```

---

## Category System

### Food 🍎 (Mint Green #6ee7b7)
- Groceries, ingredients, snacks
- Examples: Milk, Bread, Eggs, Cheese

### Home 🏠 (Sky Blue #60a5fa)
- Household supplies, cleaning products
- Examples: Paper Towels, Soap, Trash Bags

### Personal 👤 (Coral #fb7185)
- Personal care, hygiene products
- Examples: Shampoo, Toothpaste, Deodorant

### Other 📦 (Yellow #fbbf24)
- Miscellaneous items
- Examples: Batteries, Light Bulbs, Gifts

---

## Item Lifecycle

```
1. CREATED
   ┌────────────────────────────┐
   │ ○ 🍎 Milk            [🗑️] │  ← Unchecked, full opacity
   └────────────────────────────┘
   
2. CHECKED (Strike-through)
   ┌────────────────────────────┐
   │ ✓ 🍎 Milk            [🗑️] │  ← Checked, 50% opacity, strike
   └────────────────────────────┘
   Timer starts: 5 seconds
   
3. AUTO-DELETE (after 5s)
   Item disappears from all devices
   
4. MANUAL DELETE
   User taps 🗑️ → Item removed immediately
```

---

## Real-time Events

### INSERT Event:
```typescript
// User A adds "Milk"
await createShoppingItem({
  family_id: 'family-id',
  title: 'Milk',
  category: 'food',
  created_by: 'user-a-id',
})

// Supabase broadcasts INSERT event
// All subscribed devices receive:
{
  event: 'INSERT',
  payload: {
    new: {
      id: 'item-id',
      title: 'Milk',
      category: 'food',
      is_checked: false,
      // ...
    }
  }
}

// User B's screen updates INSTANTLY
onInsert: (newItem) => {
  setItems((prev) => [newItem, ...prev])
}
```

### UPDATE Event:
```typescript
// User A checks "Milk"
await toggleShoppingItem('item-id', true)

// Supabase broadcasts UPDATE event
{
  event: 'UPDATE',
  payload: {
    new: {
      id: 'item-id',
      is_checked: true,  // Changed!
      // ...
    }
  }
}

// User B sees strike-through INSTANTLY
onUpdate: (updatedItem) => {
  setItems((prev) =>
    prev.map((item) =>
      item.id === updatedItem.id ? updatedItem : item
    )
  )
}
```

### DELETE Event:
```typescript
// Auto-delete after 5 seconds OR manual delete
await deleteShoppingItem('item-id')

// Supabase broadcasts DELETE event
{
  event: 'DELETE',
  payload: {
    old: { id: 'item-id' }
  }
}

// Item disappears from all screens INSTANTLY
onDelete: (itemId) => {
  setItems((prev) => prev.filter((item) => item.id !== itemId))
}
```

---

## Subscription Setup

### Component Mount:
```typescript
useEffect(() => {
  // 1. Load initial data
  const fetchItems = async () => {
    const items = await getFamilyShoppingItems(familyId)
    setItems(items)
  }
  fetchItems()

  // 2. Subscribe to real-time updates
  const channel = subscribeToShoppingList(familyId, {
    onInsert: (item) => { /* ... */ },
    onUpdate: (item) => { /* ... */ },
    onDelete: (id) => { /* ... */ },
  })

  // 3. Cleanup on unmount
  return () => {
    unsubscribeFromShoppingList(channel)
  }
}, [familyId])
```

---

## UI States

### 1. Empty State
```
┌─────────────────────────────────┐
│                                 │
│      🛒 (Large cart icon)       │
│                                 │
│  Your shopping list is empty    │
│  Add items below to get started!│
│                                 │
└─────────────────────────────────┘
```

### 2. Loading State
```
┌─────────────────────────────────┐
│                                 │
│         ⊙ (Spinner)             │  ← Loading indicator
│                                 │
└─────────────────────────────────┘
```

### 3. Normal State (with items)
```
┌─────────────────────────────────┐
│  🍎 Food (3)                    │
│  ○ Milk    ○ Bread    ○ Eggs   │
│                                 │
│  🏠 Home (1)                    │
│  ○ Soap                         │
└─────────────────────────────────┘
```

---

## Input Bar Behavior

### Category Selection:
```
┌──────────────────────────────────────┐
│  [🍎 Food] [🏠 Home] [👤] [📦]      │  ← Unselected (gray)
│  Selected: Mint green background     │
│  Unselected: Light gray background   │
└──────────────────────────────────────┘
```

### Input States:
```
Empty:
┌────────────────────────┐  [➕]
│ Add item...            │  ↑ Disabled (gray)
└────────────────────────┘

With Text:
┌────────────────────────┐  [➕]
│ Milk                   │  ↑ Enabled (category color)
└────────────────────────┘
```

### Add Actions:
1. Tap "+" button
2. Press Enter/Return on keyboard
3. Item created, input cleared
4. Focus returns to input

---

## Optimistic UI

### Concept:
Update UI immediately, sync with server in background.

### Example:
```typescript
// User checks item
handleToggleItem(item) {
  // 1. Update UI immediately (Optimistic)
  setItems((prev) =>
    prev.map((i) =>
      i.id === item.id ? { ...i, is_checked: true } : i
    )
  )

  // 2. Sync with server (in background)
  try {
    await toggleShoppingItem(item.id, true)
  } catch (error) {
    // 3. Revert if server fails
    setItems((prev) =>
      prev.map((i) =>
        i.id === item.id ? item : i
      )
    )
    Alert.alert('Error', 'Failed to update item')
  }
}
```

### Benefits:
✅ Instant feedback (no waiting)  
✅ Feels fast and responsive  
✅ Graceful error handling  

---

## Auto-Delete Timer

### Flow:
```
Item Checked
     ↓
Timer Starts (5 seconds)
     ↓
User can uncheck to cancel
     ↓
After 5 seconds → Delete item
     ↓
DELETE event broadcast
     ↓
All devices see deletion
```

### Implementation:
```typescript
const deleteTimersRef = useRef<{ [key: string]: NodeJS.Timeout }>({})

// When checked:
const timer = setTimeout(async () => {
  await deleteShoppingItem(item.id)
  delete deleteTimersRef.current[item.id]
}, 5000)

deleteTimersRef.current[item.id] = timer

// If unchecked:
if (deleteTimersRef.current[item.id]) {
  clearTimeout(deleteTimersRef.current[item.id])
  delete deleteTimersRef.current[item.id]
}

// Cleanup on unmount:
useEffect(() => {
  return () => {
    Object.values(deleteTimersRef.current).forEach(clearTimeout)
  }
}, [])
```

---

## Sorting Logic

```typescript
items.sort((a, b) => {
  // 1. Unchecked items first
  if (a.is_checked !== b.is_checked) {
    return a.is_checked ? 1 : -1
  }
  
  // 2. Within same checked state, newest first
  return new Date(b.created_at) - new Date(a.created_at)
})
```

### Result:
```
✓ Unchecked items (newest first)
✓ Checked items at bottom (newest first)
```

---

## Performance Considerations

### 1. Duplicate Prevention:
```typescript
onInsert: (newItem) => {
  setItems((prev) => {
    // Don't add if already exists
    if (prev.some((item) => item.id === newItem.id)) {
      return prev
    }
    return [newItem, ...prev]
  })
}
```

### 2. Efficient Updates:
```typescript
onUpdate: (updatedItem) => {
  setItems((prev) =>
    prev.map((item) =>
      item.id === updatedItem.id ? updatedItem : item
    )
  )
}
```

### 3. Memory Cleanup:
```typescript
useEffect(() => {
  // Setup subscription
  const channel = subscribeToShoppingList(...)

  // Cleanup on unmount
  return () => {
    unsubscribeFromShoppingList(channel)
    Object.values(deleteTimersRef.current).forEach(clearTimeout)
  }
}, [])
```

---

## Keyboard Behavior

### iOS:
- Keyboard pushes input bar up
- Content scrollable above keyboard
- "Done" button closes keyboard

### Android:
- Keyboard overlays bottom
- Input bar moves above keyboard
- Back button closes keyboard

### Implementation:
```tsx
<KeyboardAvoidingView
  behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
  keyboardVerticalOffset={90}
>
  <InputBar />
</KeyboardAvoidingView>
```

---

## Error Handling

### Network Errors:
```typescript
try {
  await createShoppingItem(newItem)
} catch (error) {
  console.error('Error adding item:', error)
  Alert.alert('Error', 'Failed to add item')
  // UI remains unchanged, user can retry
}
```

### Subscription Errors:
```typescript
const channel = supabase
  .channel(`shopping_items:${familyId}`)
  .subscribe((status) => {
    if (status === 'SUBSCRIBED') {
      console.log('✅ Real-time connected')
    } else if (status === 'CHANNEL_ERROR') {
      console.error('❌ Real-time error')
      // Fallback to polling or show error
    }
  })
```

---

## Testing Real-time

### Manual Test:
1. Open app on 2 devices (or 2 simulators)
2. Login as different family members
3. Device A: Add "Milk" → Should appear on Device B **instantly**
4. Device B: Check "Milk" → Device A sees strike-through **instantly**
5. Wait 5 seconds → Both see item disappear **instantly**

### Logs:
```
Device A:
📥 Creating item: Milk

Device B:
📥 New item added: Milk  ← From real-time subscription

Device A:
🔄 Checking item: Milk

Device B:
🔄 Item updated: Milk, checked: true  ← From real-time subscription

(After 5 seconds)
Device A:
🗑️ Auto-deleting item: Milk

Device B:
🗑️ Item deleted: item-id  ← From real-time subscription
```

---

## Quick Reference

### Colors:
- Food: `#6ee7b7` (Mint)
- Home: `#60a5fa` (Sky)
- Personal: `#fb7185` (Coral)
- Other: `#fbbf24` (Yellow)

### Timings:
- Auto-delete: 5 seconds after check
- Real-time latency: ~50-200ms (typical)

### Animations:
- Strike-through: Instant (CSS property)
- Fade opacity: Instant (50%)
- Delete: Remove from list (no animation)

---

**Shopping Feature: COMPLETE** ✅  
**Real-time: ENABLED** 🔴🟢
