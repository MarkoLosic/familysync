# Task List Component

A beautiful Bento Grid-styled task list component with role-based actions for the FamilySync app.

## Features

✨ **Bento Grid Design** - Modern card-based layout with soft shadows and rounded corners  
🎨 **Gradient Accents** - Beautiful purple-pink gradients for points badges and buttons  
👥 **Role-Based UI** - Different actions for admins (parents) and children  
🚀 **FlashList** - High-performance scrolling with optimized rendering  
🎯 **Real-time Ready** - Designed to work with Supabase real-time subscriptions  
📱 **Native Feel** - Smooth animations and touch feedback  

## Component Structure

```
src/features/tasks/
├── TaskList.tsx           # Main task list component
├── TaskListScreen.example.tsx  # Complete screen example with data fetching
└── index.ts              # Exports
```

## TaskList Component

### Props

```typescript
interface TaskListProps {
  tasks: TaskWithProfile[]        // Array of tasks with profile data
  onCompleteTask?: (taskId: string) => void  // Child completes a task
  onApproveTask?: (taskId: string) => void   // Admin approves a task
  isLoading?: boolean             // Show loading indicator
  emptyMessage?: string           // Custom empty state message
}
```

### Task Card Features

Each task card displays:
- **Title & Description** - Task details with 2-line ellipsis
- **Points Badge** - Gradient badge showing XP reward (e.g., "+50 XP")
- **Assigned User** - Avatar and name of the assigned user
- **Status Badge** - "Completed" (green) or "Pending" (amber)
- **Due Date** - Formatted date display
- **Action Button** - Role-based:
  - **Children**: "Mark Complete" button (green gradient) for their assigned tasks
  - **Admins**: "Approve Task" button (blue gradient) for pending tasks

### Role-Based Logic

**For Children (UserRole.CHILD):**
- See "Mark Complete" button only for:
  - Tasks assigned to them
  - Tasks with "pending" status
- Cannot see admin controls

**For Admins (UserRole.ADMIN):**
- See "Approve Task" button for all pending tasks
- Can create new tasks (via TaskListHeader)
- Full visibility of all family tasks

## TaskListHeader Component

Optional header component with task count and add button.

### Props

```typescript
interface TaskListHeaderProps {
  onAddTask?: () => void   // Callback for add task button
  taskCount?: number       // Number of tasks to display
}
```

## Usage Examples

### Basic Usage

```tsx
import { TaskList } from '@/features/tasks'
import { useAuthStore } from '@/store'

function MyScreen() {
  const [tasks, setTasks] = useState<TaskWithProfile[]>([])

  const handleComplete = async (taskId: string) => {
    // Update task status and award points
    await supabase
      .from('tasks')
      .update({ status: 'completed' })
      .eq('id', taskId)
  }

  return (
    <TaskList
      tasks={tasks}
      onCompleteTask={handleComplete}
      onApproveTask={handleComplete}
    />
  )
}
```

### Complete Screen with Data Fetching

See `TaskListScreen.example.tsx` for a full implementation including:
- Fetching tasks with joined profile data
- Real-time subscriptions
- Points awarding logic
- Error handling

### Fetching Tasks with Profiles

```tsx
const { data } = await supabase
  .from('tasks')
  .select(`
    *,
    assignedToProfile:profiles!tasks_assigned_to_fkey(*),
    createdByProfile:profiles!tasks_created_by_fkey(*)
  `)
  .eq('family_id', familyId)
  .order('created_at', { ascending: false })
```

### Real-time Updates

```tsx
const subscription = supabase
  .channel('tasks')
  .on(
    'postgres_changes',
    {
      event: '*',
      schema: 'public',
      table: 'tasks',
      filter: `family_id=eq.${familyId}`,
    },
    () => {
      fetchTasks() // Refresh task list
    }
  )
  .subscribe()
```

## Styling

The component uses **NativeWind** (Tailwind CSS for React Native) for styling:

- **Cards**: `rounded-3xl` with soft shadows
- **Gradients**: Purple-pink for points, green for complete, blue for approve
- **Typography**: Bold headings, medium body text, small meta text
- **Spacing**: Consistent padding and margins using Tailwind scale
- **Colors**: Gray-scale for base, vibrant colors for accents

### Custom Styling

You can customize the appearance by:

1. **Modifying Tailwind classes** directly in the component
2. **Adjusting gradients** by changing `from-*` and `to-*` colors
3. **Changing shadow properties** in the inline `style` prop

## Icons

Uses **lucide-react-native** for crisp, consistent icons:
- `CheckCircle` - Complete/approve actions
- `Award` - Points badge
- `Clock` - Pending status
- `User` - Default avatar

## Performance

- Uses `FlashList` for optimal performance with large lists
- `estimatedItemSize={180}` for better scroll performance
- Memoization-ready (wrap in `React.memo` if needed)
- Efficient re-renders with proper key extraction

## Accessibility

Consider adding:
- `accessibilityLabel` to buttons
- `accessibilityHint` for actions
- `accessibilityRole` for semantic meaning
- Larger touch targets (minimum 44x44 points)

## Future Enhancements

Potential improvements:
- [ ] Swipe actions (complete, delete)
- [ ] Task filtering (pending, completed, by user)
- [ ] Sorting options (due date, points, status)
- [ ] Pull-to-refresh
- [ ] Skeleton loading state
- [ ] Animations (enter/exit)
- [ ] Task categories/tags
- [ ] Priority indicators

## Dependencies

```json
{
  "@shopify/flash-list": "^1.x",
  "lucide-react-native": "^0.x",
  "nativewind": "^4.x",
  "react-native": "^0.x"
}
```
