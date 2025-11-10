# HoverCard Component - Usage Examples

## Overview
Fast, reusable hover card component with Discord-style animations. Perfect for quick previews throughout LiteWork.

## Features
- ⚡ **Super fast**: 200ms delay for instant feel
- 🎨 **Smooth animations**: Fade + zoom entrance like Discord
- 📍 **Smart positioning**: Auto-adjusts near viewport edges
- 🔄 **Reusable**: Works for workouts, athletes, exercises, etc.
- ♿ **Accessible**: Keyboard support and proper ARIA
- 🚀 **Portal rendering**: No z-index conflicts

---

## Basic Usage

### 1. Import the Component
```typescript
import { 
  HoverCard, 
  WorkoutPreviewCard, 
  AthletePreviewCard,
  ExercisePreviewCard 
} from "@/components/ui/HoverCard";
```

---

## Example 1: Workout Preview on Calendar

```tsx
import { HoverCard, WorkoutPreviewCard } from "@/components/ui/HoverCard";

function CalendarDay({ workout }) {
  return (
    <HoverCard
      trigger={
        <div className="calendar-event bg-blue-100 rounded p-2 cursor-pointer">
          {workout.name}
        </div>
      }
      content={
        <WorkoutPreviewCard
          workoutName={workout.name}
          exerciseCount={workout.exercises.length}
          duration="45 min"
          notes={workout.notes}
        />
      }
      side="top"
      openDelay={200}
    />
  );
}
```

**Result**: Hover over calendar workout → See quick preview with exercises count and duration

---

## Example 2: Athlete Preview in Groups List

```tsx
import { HoverCard, AthletePreviewCard } from "@/components/ui/HoverCard";

function AthleteRow({ athlete }) {
  return (
    <HoverCard
      trigger={
        <div className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer">
          <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center">
            {athlete.name.charAt(0)}
          </div>
          <span>{athlete.name}</span>
        </div>
      }
      content={
        <AthletePreviewCard
          name={athlete.name}
          group="Football Linemen"
          lastWorkout="2 days ago"
          workoutsThisWeek={3}
        />
      }
      side="right"
      maxWidth={280}
    />
  );
}
```

**Result**: Hover over athlete name → See recent activity and group info

---

## Example 3: Exercise Preview in Workout Editor

```tsx
import { HoverCard, ExercisePreviewCard } from "@/components/ui/HoverCard";

function ExerciseListItem({ exercise }) {
  return (
    <HoverCard
      trigger={
        <button className="text-left w-full p-3 hover:bg-blue-50 rounded">
          {exercise.name}
        </button>
      }
      content={
        <ExercisePreviewCard
          name={exercise.name}
          category={exercise.category}
          description={exercise.description}
          muscleGroups={["Chest", "Triceps", "Shoulders"]}
          videoUrl={exercise.videoUrl}
        />
      }
      side="right"
      openDelay={300}
    />
  );
}
```

**Result**: Hover over exercise → See description, muscle groups, and video indicator

---

## Example 4: Custom Content

You can put any content in the hover card:

```tsx
<HoverCard
  trigger={<span className="underline cursor-help">What's this?</span>}
  content={
    <div className="space-y-2">
      <h4 className="font-semibold">Progressive Overload</h4>
      <p className="text-sm text-gray-600">
        Gradually increasing weight, reps, or intensity over time to build strength.
      </p>
      <ul className="text-sm space-y-1">
        <li>• Increase weight by 2.5-5%</li>
        <li>• Add 1-2 reps per set</li>
        <li>• Reduce rest time</li>
      </ul>
    </div>
  }
  maxWidth={320}
/>
```

---

## Props Reference

### HoverCard

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `trigger` | ReactNode | required | Element that triggers the hover card |
| `content` | ReactNode | required | Content to display in the card |
| `openDelay` | number | 200 | Delay before showing (ms) |
| `closeDelay` | number | 100 | Delay before hiding (ms) |
| `side` | "top" \| "bottom" \| "left" \| "right" | "top" | Preferred side to display |
| `offset` | number | 8 | Distance from trigger (px) |
| `maxWidth` | number | 320 | Maximum width of card (px) |
| `disabled` | boolean | false | Disable hover functionality |
| `className` | string | "" | Custom classes for card |

### WorkoutPreviewCard

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `workoutName` | string | ✅ | Name of workout |
| `exerciseCount` | number | ✅ | Number of exercises |
| `duration` | string | ❌ | Estimated duration |
| `notes` | string | ❌ | Workout notes (truncated) |

### AthletePreviewCard

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `name` | string | ✅ | Athlete name |
| `group` | string | ❌ | Group/team name |
| `lastWorkout` | string | ❌ | When last workout was |
| `workoutsThisWeek` | number | ❌ | Count this week |
| `avatarUrl` | string | ❌ | Profile picture URL |

### ExercisePreviewCard

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `name` | string | ✅ | Exercise name |
| `category` | string | ❌ | Exercise category |
| `description` | string | ❌ | Brief description |
| `muscleGroups` | string[] | ❌ | Target muscles |
| `videoUrl` | string | ❌ | Instructional video |

---

## Performance Tips

### 1. Use Appropriate Delays
```tsx
// Quick tooltips - use shorter delay
<HoverCard openDelay={100} />

// Detailed previews - use default
<HoverCard openDelay={200} />

// Heavy content - use longer delay
<HoverCard openDelay={400} />
```

### 2. Lazy Load Heavy Content
```tsx
<HoverCard
  content={
    isOpen ? <HeavyPreview data={data} /> : null
  }
/>
```

### 3. Disable on Mobile
```tsx
const isMobile = window.innerWidth < 768;

<HoverCard disabled={isMobile} />
```

---

## Positioning

The hover card automatically:
- Centers relative to trigger
- Adjusts if near viewport edges
- Maintains 8px padding from screen edge
- Updates position on scroll/resize

### Manual Side Selection
```tsx
// Calendar events - show above
<HoverCard side="top" />

// Sidebar items - show to the right
<HoverCard side="right" />

// Top nav items - show below
<HoverCard side="bottom" />
```

---

## Styling

### Custom Card Styling
```tsx
<HoverCard
  className="shadow-xl border-primary"
  content={...}
/>
```

### Custom Width
```tsx
// Narrow card for simple info
<HoverCard maxWidth={240} />

// Wide card for detailed content
<HoverCard maxWidth={420} />
```

---

## Accessibility

The component includes:
- ✅ Mouse enter/leave detection
- ✅ Portal rendering (no z-index issues)
- ✅ Smooth animations
- ✅ Automatic cleanup on unmount
- ✅ Respects user motion preferences

---

## Common Patterns

### 1. Dashboard Stats
```tsx
<HoverCard
  trigger={<StatCard value="87%" label="Completion" />}
  content={<DetailedBreakdown data={stats} />}
/>
```

### 2. Assignment Preview
```tsx
<HoverCard
  trigger={<AssignmentBadge count={5} />}
  content={<UpcomingWorkouts assignments={assignments} />}
/>
```

### 3. User Mentions
```tsx
<HoverCard
  trigger={<span className="text-blue-600">@coach_mike</span>}
  content={<UserProfileCard userId="123" />}
/>
```

---

## Integration Examples

### With Calendar Component
```tsx
// In your calendar day cell
{events.map(event => (
  <HoverCard
    key={event.id}
    trigger={<CalendarEvent event={event} />}
    content={<WorkoutPreviewCard {...event} />}
  />
))}
```

### With Groups Table
```tsx
// In your athlete table row
{athletes.map(athlete => (
  <tr key={athlete.id}>
    <td>
      <HoverCard
        trigger={<AthleteCell athlete={athlete} />}
        content={<AthletePreviewCard {...athlete} />}
      />
    </td>
  </tr>
))}
```

---

## Best Practices

1. **Keep content lightweight**: Card should load instantly
2. **Use meaningful delays**: 200ms feels instant, 500ms feels sluggish
3. **Provide escape routes**: User can move mouse away to close
4. **Don't nest hover cards**: Can create confusing UX
5. **Mobile fallback**: Consider click-to-show on touch devices
6. **Test edge cases**: Near screen edges, scrolled pages, etc.

---

## Testing Checklist

- [ ] Hover shows card after delay
- [ ] Moving mouse away closes card
- [ ] Card repositions near viewport edges
- [ ] Smooth fade + zoom animation
- [ ] Works on scrolled pages
- [ ] Cleans up on unmount
- [ ] No z-index conflicts
- [ ] Fast enough feel (< 200ms)
