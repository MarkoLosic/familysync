# 📅 Calendar Screen - Visual Guide

## Component Structure

```
CalendarScreen
├── Header (White Background)
│   ├── Title "Calendar"
│   ├── Subtitle "Family events & activities"
│   └── Floating Action Button (+) → Opens EventModal
│
├── Agenda Calendar Component
│   ├── Month View (Top)
│   │   ├── Month/Year Header
│   │   ├── Day Grid (7 columns)
│   │   ├── Selected Day (Mint Green Circle)
│   │   └── Event Dots (Colored, Multi-Dot)
│   │
│   └── Agenda List (Bottom, Scrollable)
│       ├── Date Headers
│       └── Event Cards
│           ├── Colored Left Border (4px)
│           ├── Title (Bold, 18px)
│           ├── Time (14px, 🕐 emoji)
│           ├── Description (14px, 2 lines max)
│           └── Participants (12px, 👥 emoji)
│
└── EventModal (Bottom Sheet)
    ├── Header ("New Event" / "Edit Event")
    ├── Form Fields
    │   ├── Title Input (Required)
    │   ├── Description Input (Optional, Multiline)
    │   ├── Date Display (Read-only, formatted)
    │   ├── Time Input (Optional)
    │   └── Participant Chips (Multi-select)
    └── Footer (Cancel / Save)
```

---

## Color System

### Participant Colors (Cycle):
```typescript
const colors = [
  '#6ee7b7', // Mint Green (Primary)
  '#fb7185', // Coral (Secondary)
  '#34d399', // Green (Success)
  '#fbbf24', // Yellow (Warning)
  '#f87171', // Red (Error)
]
```

Each event's left border and calendar dot match the first participant's color.

---

## Agenda Format

### Items Structure:
```typescript
{
  '2026-01-08': [
    {
      name: 'Soccer Practice',
      height: 80,
      event: {
        id: 'uuid',
        title: 'Soccer Practice',
        event_date: '2026-01-08',
        event_time: '3:00 PM',
        participants: ['profile-id-1', 'profile-id-2'],
        // ...more fields
      }
    }
  ],
  '2026-01-10': [ /* ... */ ],
}
```

### Marked Dates:
```typescript
{
  '2026-01-08': {
    dots: [
      { key: 'event-id-1', color: '#6ee7b7' },
      { key: 'event-id-2', color: '#fb7185' },
    ]
  },
  '2026-01-10': { /* ... */ },
}
```

---

## Event Card Layout

```
┌─────────────────────────────────────────┐
│ ║  Soccer Practice          (Bold 18px) │  ← 4px colored border
│ ║  🕐 3:00 PM              (Gray 14px)  │
│ ║  Practice at the park... (Gray 14px)  │
│ ║  👥 Emma, Liam          (Gray 12px)   │
└─────────────────────────────────────────┘
  ^
  Colored by first participant
```

---

## Modal Field Styling

### Input Fields:
- Background: `#f8fafc` (Light gray)
- Border Radius: 16px
- Padding: 12px 16px
- Font Size: 16px
- Placeholder Color: `#94a3b8` (Tertiary text)

### Participant Chips:
- **Unselected**: Gray background, dark text
- **Selected**: Mint green background, white text
- Border Radius: 9999px (fully rounded)
- Padding: 8px 16px

### Buttons:
- **Cancel**: Gray background, dark text
- **Save**: Mint green background, white text
- Border Radius: 16px
- Height: 48px
- Font Weight: 600

---

## User Interactions

### 1. View Events:
- **Action**: Scroll agenda list
- **Result**: See all events grouped by date

### 2. Select Date:
- **Action**: Tap date in calendar
- **Result**: Agenda jumps to that date, shows events

### 3. Add Event:
- **Action**: Tap floating "+" button
- **Result**: EventModal slides up from bottom

### 4. Fill Form:
- **Actions**: 
  - Type title (required)
  - Type description (optional)
  - Type time (optional, e.g., "3:00 PM")
  - Tap participants to toggle selection
- **Result**: Form updates in real-time

### 5. Save Event:
- **Action**: Tap "Save Event" button
- **Result**: 
  - Creates event in Supabase
  - Modal closes
  - Calendar reloads
  - Success alert shown

### 6. Delete Event:
- **Action**: Long-press event card
- **Result**: Confirmation dialog appears
- **If Confirmed**: 
  - Deletes event from Supabase
  - Calendar reloads
  - Success alert shown

---

## Empty States

### No Events for Selected Day:
```
┌─────────────────────────────────┐
│                                 │
│         📅 (48px gray icon)     │
│                                 │
│    No events for this day       │
│         (Gray text)             │
│                                 │
└─────────────────────────────────┘
```

---

## Loading State

```
┌─────────────────────────────────┐
│                                 │
│         ⊙ (Spinner)             │  ← Mint green spinner
│                                 │
└─────────────────────────────────┘
```

---

## Theme Configuration

```typescript
theme={{
  backgroundColor: '#f8fafc',           // Screen background
  calendarBackground: '#FFFFFF',        // Calendar card
  textSectionTitleColor: '#64748b',     // Month header
  selectedDayBackgroundColor: '#6ee7b7', // Selected day bg
  selectedDayTextColor: '#FFFFFF',      // Selected day text
  todayTextColor: '#6ee7b7',            // Today's number
  dayTextColor: '#1e293b',              // Regular day text
  textDisabledColor: '#94a3b8',         // Disabled days
  dotColor: '#6ee7b7',                  // Dot color
  selectedDotColor: '#FFFFFF',          // Dot on selected day
  arrowColor: '#6ee7b7',                // Month arrows
  monthTextColor: '#1e293b',            // Month name
  indicatorColor: '#6ee7b7',            // Loading indicator
  textDayFontSize: 16,                  // Day number size
  textMonthFontSize: 18,                // Month name size
  textDayHeaderFontSize: 13,            // Weekday header size
  agendaDayTextColor: '#1e293b',        // Agenda date text
  agendaDayNumColor: '#1e293b',         // Agenda date number
  agendaTodayColor: '#6ee7b7',          // Today in agenda
  agendaKnobColor: '#6ee7b7',           // Drag knob color
}}
```

---

## Responsive Behavior

### Event Card Height:
- Fixed: 80px
- Allows consistent spacing in agenda list

### Modal Max Height:
- 90% of screen height
- Content scrollable if too tall

### Calendar:
- Responsive width (fills screen)
- Month view collapses on scroll
- Agenda expands to show more events

---

## Accessibility

✅ **Touch Targets**: Minimum 44x44pt  
✅ **Color Contrast**: WCAG AA compliant  
✅ **Text Sizing**: Supports dynamic type  
✅ **Tap Feedback**: Opacity changes on press  
✅ **Error Messages**: Clear, actionable alerts  
✅ **Loading States**: Visual feedback during async operations  

---

## Performance Optimizations

✅ **Memoized Callbacks**: useCallback for render functions  
✅ **Efficient Queries**: Index on family_id, event_date  
✅ **Local State**: Cache events, only reload when needed  
✅ **Lazy Loading**: Agenda loads events as user scrolls  
✅ **Debounced Inputs**: Wait for user to finish typing  

---

## Database Queries

### Load Events:
```typescript
// On mount: Load all family events
const events = await getFamilyEvents(familyId)

// Process into Agenda format
const items = {
  '2026-01-08': [{ name: 'Soccer Practice', ... }],
  '2026-01-10': [{ name: 'Piano Lesson', ... }],
}
```

### Create Event:
```typescript
const event = {
  family_id: 'family-uuid',
  title: 'Soccer Practice',
  description: 'Practice at the park',
  event_date: '2026-01-08',
  event_time: '3:00 PM',
  created_by: 'profile-uuid',
  participants: ['profile-id-1', 'profile-id-2'],
  color: '#6ee7b7',
}

await createCalendarEvent(event)
```

### Delete Event:
```typescript
await deleteCalendarEvent(eventId)
```

---

## RLS Policies

### SELECT:
Users can view events from their family:
```sql
family_id IN (
  SELECT family_id FROM profiles WHERE user_id = auth.uid()
)
```

### INSERT:
Users can create events in their family:
```sql
family_id IN (
  SELECT family_id FROM profiles WHERE user_id = auth.uid()
)
```

### UPDATE/DELETE:
Users can modify events they created OR if they're admins:
```sql
created_by = (SELECT id FROM profiles WHERE user_id = auth.uid())
OR
(
  family_id IN (
    SELECT family_id FROM profiles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
)
```

---

## Error Handling

### Load Errors:
- Show alert: "Failed to load calendar events"
- Retry button available

### Create Errors:
- Show alert: "Failed to create event"
- Form stays open, user can retry

### Delete Errors:
- Show alert: "Failed to delete event"
- Event remains in list

### Validation Errors:
- Title required: Save button disabled
- No family: Redirect to onboarding

---

## Testing Checklist

- [ ] Load events on mount
- [ ] Display events grouped by date
- [ ] Show colored dots on calendar dates
- [ ] Select date shows events for that day
- [ ] Open modal with "+" button
- [ ] Fill form and save event
- [ ] Event appears in calendar
- [ ] Long-press to delete event
- [ ] Confirmation dialog appears
- [ ] Event deleted successfully
- [ ] Empty state shows when no events
- [ ] Loading state shows during fetch
- [ ] Participant colors cycle correctly
- [ ] Modal closes on cancel
- [ ] Modal closes on save
- [ ] Navigate to calendar from HomeScreen
- [ ] RLS prevents unauthorized access

---

## Quick Reference

### Colors:
- Primary: `#6ee7b7` (Mint Green)
- Secondary: `#fb7185` (Coral)
- Background: `#f8fafc` (Light Gray)
- Text Primary: `#1e293b` (Slate)
- Text Secondary: `#64748b` (Gray)

### Spacing:
- xs: 4px
- sm: 8px
- md: 16px
- lg: 24px
- xl: 32px

### Border Radius:
- sm: 8px
- md: 16px
- lg: 24px
- xl: 32px
- full: 9999px

---

**Calendar Feature: COMPLETE** ✅
