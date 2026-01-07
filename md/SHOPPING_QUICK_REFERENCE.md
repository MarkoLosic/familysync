# 🛒 Shopping List - Quick Reference

## ✨ Key Features

✅ **Real-time Sync** - Instant updates across all devices  
✅ **4 Categories** - Food 🍎, Home 🏠, Personal 👤, Other 📦  
✅ **Auto-Delete** - Checked items delete after 5 seconds  
✅ **Strike-through** - Visual feedback for completed items  
✅ **Floating Input** - Quick-add bar at bottom  
✅ **Optimistic UI** - Instant feedback, server confirms later  

---

## 🎯 User Actions

### Add Item:
1. Select category (Food/Home/Personal/Other)
2. Type item name
3. Tap "+" or press Enter
4. **Item appears on all devices instantly**

### Check Item:
1. Tap checkbox
2. Item gets strike-through, fades to 50%
3. Moves to bottom of category
4. Auto-deletes after 5 seconds
5. **All devices see update instantly**

### Uncheck Item:
1. Tap checkbox again (before 5 seconds)
2. Strike-through removed
3. Returns to full opacity
4. Deletion cancelled
5. **All devices see update instantly**

### Delete Item:
1. Tap trash icon 🗑️
2. Item removed immediately
3. **All devices see deletion instantly**

---

## 🔄 Real-time Events

| Event | Trigger | Result |
|-------|---------|--------|
| **INSERT** | User adds item | Appears on all screens |
| **UPDATE** | User checks/unchecks | Strike-through updates everywhere |
| **DELETE** | Auto-delete or manual | Disappears from all screens |

---

## 🎨 Category System

| Category | Emoji | Color | Use Case |
|----------|-------|-------|----------|
| **Food** | 🍎 | Mint `#6ee7b7` | Groceries, ingredients |
| **Home** | 🏠 | Sky `#60a5fa` | Household supplies |
| **Personal** | 👤 | Coral `#fb7185` | Personal care items |
| **Other** | 📦 | Yellow `#fbbf24` | Miscellaneous |

---

## ⏱️ Timings

- **Real-time latency**: ~50-200ms (typical)
- **Auto-delete delay**: 5 seconds after check
- **Optimistic UI**: Instant (0ms perceived)

---

## 📱 Screen Sections

```
┌─────────────────────────┐
│ Header                  │ ← Title + item counter
├─────────────────────────┤
│ Category Sections       │ ← Food, Home, Personal, Other
│ (Scrollable)            │
├─────────────────────────┤
│ Category Selector       │ ← 4 toggle chips
│ Input Bar               │ ← Text input + Add button
└─────────────────────────┘
```

---

## 🔧 Database

### Table: `shopping_items`
```sql
- id (UUID)
- family_id (UUID) → families.id
- title (TEXT)
- category ('food'|'home'|'personal'|'other')
- is_checked (BOOLEAN)
- created_by (UUID) → profiles.id
- created_at, updated_at (TIMESTAMPTZ)
```

### RLS Policies:
- SELECT: View items in your family
- INSERT: Add items to your family
- UPDATE: Update items in your family
- DELETE: Delete items in your family

---

## 🚀 Real-time Setup

### 1. Enable Realtime in Supabase:
```sql
ALTER PUBLICATION supabase_realtime ADD TABLE shopping_items;
```

### 2. Subscribe in App:
```typescript
const channel = subscribeToShoppingList(familyId, {
  onInsert: (item) => { /* Add to list */ },
  onUpdate: (item) => { /* Update in list */ },
  onDelete: (id) => { /* Remove from list */ },
})
```

### 3. Cleanup:
```typescript
unsubscribeFromShoppingList(channel)
```

---

## 🧪 Testing Real-time

### Quick Test:
1. Open app on Device A and Device B
2. Login as different family members
3. **Device A**: Add "Milk" (category: Food)
4. **Device B**: Should see "Milk" appear **instantly** ← Success!
5. **Device B**: Check "Milk"
6. **Device A**: Should see strike-through **instantly** ← Success!
7. Wait 5 seconds
8. **Both devices**: "Milk" disappears **instantly** ← Success!

---

## 📊 Item States

### Unchecked (Active):
- Circular checkbox (outlined)
- Category emoji
- Full opacity (100%)
- At top of category list

### Checked (Completed):
- Circular checkbox (filled with checkmark)
- Category emoji
- Faded opacity (50%)
- Strike-through text
- At bottom of category list
- **Auto-deletes after 5 seconds**

---

## 🎨 Styling

### Item Card:
- Background: White `#FFFFFF`
- Border radius: 16px
- Padding: 16px
- Shadow: Soft (opacity 0.05)

### Checkbox:
- Size: 24x24px
- Border: 2px solid (category color)
- Filled: Category color + white checkmark

### Input Bar:
- Background: White `#FFFFFF`
- Border top: 1px solid `#e2e8f0`
- Padding: 16px 24px

---

## 🔥 Pro Tips

💡 **Optimistic UI**: UI updates before server confirms (feels instant!)  
💡 **Auto-sort**: Unchecked items always at top  
💡 **Category colors**: Easy visual grouping  
💡 **5-second grace**: Uncheck before deletion if mistake  
💡 **Keyboard shortcuts**: Press Enter to add item  

---

## 🐛 Common Issues

### Item doesn't sync?
- Check internet connection
- Verify Supabase realtime is enabled
- Check RLS policies in Supabase

### Multiple items with same name?
- Allowed! Each has unique ID
- User can delete duplicates manually

### Item appears twice?
- Duplicate prevention logic in place
- Shouldn't happen, but check `onInsert` callback

---

## 📝 Navigation

### From HomeScreen:
- Tap Shopping widget (tall pink widget)
- Shows preview of first 3 items
- Opens full ShoppingScreen

### ShoppingScreen Path:
```
MainNavigator → Shopping
```

---

## 🎉 Summary

**FamilySync Shopping List** is a real-time, collaborative shopping experience that makes family grocery shopping effortless!

**Key Highlight:** Changes sync instantly across all family members' devices without any refresh! 🚀

---

**Phase 6: COMPLETE** ✅  
**Real-time: ENABLED** 🟢
