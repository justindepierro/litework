# Hover Preview System Audit & Enhancement Plan

**Date:** November 10, 2025  
**Goal:** Create industry-leading hover previews (Discord-level quality) with proper data loading, animations, and reusability

---

## 🔍 Current Issues Identified

### 1. **Calendar Text Cut-Off** ⚠️ CRITICAL

**Problem:** Workout assignment names are truncated in month view calendar cells  
**Root Cause:**

- Month view uses `compact={true}` mode which applies `whitespace-nowrap` and `overflow-hidden`
- Container width is limited by calendar cell size
- No ellipsis or multi-line support

**Evidence:**

```tsx
// DraggableAssignment component (line 143)
<span className="font-semibold text-xs overflow-hidden text-ellipsis whitespace-nowrap">
  {assignment.workoutPlanName || "Workout"}
</span>
```

---

### 2. **No Hover Info Showing** ⚠️ CRITICAL

**Problem:** Hover preview is not displaying any workout information  
**Root Causes:**

#### A. API Response Structure Mismatch

- HoverCard expects: `{ success: true, data: { exercises, groups } }`
- API returns: `{ workout: { exercises, groups } }`

```tsx
// HoverCard.tsx line 253 - INCORRECT
if (workoutData.success) {
  setWorkoutDetails({
    exercises: workoutData.data.exercises || [],
    groups: workoutData.data.groups || [],
  });
}

// Should be:
if (workoutData.workout) {
  setWorkoutDetails({
    exercises: workoutData.workout.exercises || [],
    groups: workoutData.workout.groups || [],
  });
}
```

#### B. KPI Tags Not Being Fetched

- `kpiTags` are fetched separately but never connected to exercises
- `getKpiForExercise()` uses string matching instead of the `kpiTagIds` array from database

---

### 3. **KPI Badge Display Mismatch** ⚠️ HIGH PRIORITY

**Problem:** KPI tags not showing correctly - want "Key Lifts (Front Squat) (Squat)"  
**Root Causes:**

#### A. KPI Tag IDs Not Being Used

- Exercises have `kpiTagIds: string[]` from database
- HoverCard uses fuzzy string matching instead of these IDs
- Workout editor properly uses `kpiTagIds` array

```tsx
// CURRENT (HoverCard.tsx line 290) - WRONG APPROACH
const getKpiForExercise = (exerciseName: string): KPITag | null => {
  const nameLower = exerciseName.toLowerCase();
  for (const tag of kpiTags) {
    if (nameLower.includes(tag.displayName.toLowerCase())) {
      return tag;
    }
  }
  return null;
};

// SHOULD BE:
const getKpisForExercise = (exercise: WorkoutExercise): KPITag[] => {
  if (!exercise.kpiTagIds || exercise.kpiTagIds.length === 0) return [];
  return kpiTags.filter((tag) => exercise.kpiTagIds.includes(tag.id));
};
```

#### B. Multiple KPI Tags Not Supported

- Current code returns single `KPITag | null`
- Should support multiple tags per exercise (e.g., Front Squat → Squat + Leg Strength)

#### C. Display Format Issues

- Want: "Front Squat (Squat) (Leg Strength)"
- Current: Just shows "Front Squat" with one badge

---

### 4. **Group Color Mismatch** ⚠️ MEDIUM PRIORITY

**Problem:** Group badge colors in hover don't match dashboard/athlete pages  
**Root Cause:**

- Groups have a `color` field in database (hex code)
- HoverCard is not using this field
- Currently shows generic blue Badge with `variant="primary"`

```tsx
// Current (HoverCard.tsx line 399)
<Badge key={idx} variant="primary" size="sm">
  <Users className="w-3 h-3" />
  {groupName}
</Badge>

// Should use actual group color from database
```

---

### 5. **Sets Not Displaying Properly** ⚠️ MEDIUM PRIORITY

**Problem:** Set information is incomplete or confusing  
**Issues:**

- Shows `3×5` for individual exercises in groups, but group also shows "3 sets"
- Doesn't clarify if group sets multiply individual exercise sets
- No support for percentage-based weights or progressive schemes

---

### 6. **Performance & Loading Issues** ⚠️ MEDIUM PRIORITY

**Problems:**

- Fetches workout data on EVERY hover (no caching)
- Separate API call for KPI tags each time
- 150ms-300ms delay feels sluggish
- No loading skeleton - just shows "Loading..."

---

### 7. **Reusability Limitations** ⚠️ LOW PRIORITY

**Problems:**

- `WorkoutPreviewCard` is tightly coupled to calendar use case
- Hard-coded 400px width
- Can't easily reuse in other contexts (workout list, search results, etc.)

---

## 🎯 Discord-Level Hover Quality Standards

### What Makes Discord Hovers Great:

1. **Instant Data** - Pre-loaded, no loading states visible
2. **Rich Content** - Images, badges, status indicators, relationships
3. **Smooth Animations** - Fade in/out, smooth positioning
4. **Smart Positioning** - Never goes off-screen, adapts to viewport
5. **Contextual Actions** - Quick actions available in hover
6. **Consistent Design** - All hovers follow same design language
7. **Performance** - 60 FPS, no jank, cached data

---

## 🏗️ Proposed Solution Architecture

### Phase 1: Fix Critical Data Issues

#### 1.1 Fix API Response Handling

```typescript
// Update HoverCard.tsx WorkoutPreviewCard useEffect
Promise.all([
  fetch(`/api/workouts/${workoutPlanId}`).then((r) => r.json()),
  fetch("/api/kpi-tags").then((r) => r.json()),
]).then(([workoutData, kpiData]) => {
  if (workoutData.workout) {
    // FIX: Use .workout not .data
    setWorkoutDetails({
      exercises: workoutData.workout.exercises || [],
      groups: workoutData.workout.groups || [],
      kpiTags: kpiData.success ? kpiData.data : [],
    });
  }
});
```

#### 1.2 Use Proper KPI Tag IDs

```typescript
// Replace string matching with ID-based lookup
const getKpisForExercise = (exercise: WorkoutExercise): KPITag[] => {
  if (!exercise.kpiTagIds || exercise.kpiTagIds.length === 0) return [];
  return kpiTags.filter(tag => exercise.kpiTagIds.includes(tag.id));
};

// Update display to show all KPI tags
{kpiExercises.map(ex => {
  const tags = getKpisForExercise(ex);
  return (
    <div key={ex.id}>
      <span>{ex.exerciseName}</span>
      {tags.map(tag => (
        <KPITagBadge key={tag.id} {...tag} />
      ))}
    </div>
  );
})}
```

#### 1.3 Fix Group Colors

```typescript
// Pass full group objects, not just names
interface WorkoutPreviewCardProps {
  assignedGroups?: Array<{
    id: string;
    name: string;
    color: string;
  }>;
}

// Calendar passes full group objects
<WorkoutPreviewCard
  assignedGroups={assignment.groupId
    ? groups.filter(g => g.id === assignment.groupId)
    : []}
/>
```

---

### Phase 2: Performance Optimizations

#### 2.1 Data Pre-loading Strategy

```typescript
// Cache workout data at calendar level
const [workoutCache, setWorkoutCache] = useState<Map<string, WorkoutDetails>>(new Map());

// Pre-load visible workouts
useEffect(() => {
  const visibleWorkoutIds = assignments.map(a => a.workoutPlanId);
  preloadWorkouts(visibleWorkoutIds);
}, [assignments]);

// Pass cached data to HoverCard
<HoverCard
  content={
    <WorkoutPreviewCard
      workoutData={workoutCache.get(assignment.workoutPlanId)}
      // ...
    />
  }
/>
```

#### 2.2 Lazy Loading & Code Splitting

```typescript
// Only load hover system when needed
const WorkoutPreviewCard = lazy(
  () => import("@/components/ui/WorkoutPreviewCard")
);
```

#### 2.3 Memoization

```typescript
const groupedExercises = useMemo(
  () => groupExercisesByGroup(exercises, groups),
  [exercises, groups]
);
```

---

### Phase 3: Visual & UX Enhancements

#### 3.1 Smooth Animations

```tsx
// Add framer-motion or CSS transitions
<motion.div
  initial={{ opacity: 0, scale: 0.95 }}
  animate={{ opacity: 1, scale: 1 }}
  exit={{ opacity: 0, scale: 0.95 }}
  transition={{ duration: 0.15, ease: "easeOut" }}
>
  {/* Card content */}
</motion.div>
```

#### 3.2 Loading Skeleton

```tsx
// Replace "Loading..." with proper skeleton
{loading ? (
  <div className="animate-pulse">
    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
    <div className="h-3 bg-gray-200 rounded w-1/2" />
  </div>
) : (
  // Actual content
)}
```

#### 3.3 Rich Content Display

- Exercise thumbnails/icons
- Progress indicators (if athlete has completed before)
- Difficulty badges
- Estimated completion time
- Equipment requirements

#### 3.4 Context Actions

```tsx
// Quick actions in hover footer
<div className="border-t pt-2 flex gap-2">
  <Button size="sm" variant="ghost">
    View Full
  </Button>
  {isCoach && <Button size="sm">Edit</Button>}
</div>
```

---

### Phase 4: Reusability & Component Design

#### 4.1 Separate Concerns

```typescript
// Core hover mechanism (reusable)
<HoverCard trigger={...} content={...} />

// Workout-specific content (reusable)
<WorkoutPreviewContent workout={workout} />

// Calendar-specific wrapper
<CalendarWorkoutHover assignment={assignment} />
```

#### 4.2 Configuration Props

```typescript
interface WorkoutPreviewContentProps {
  workout: WorkoutDetails;
  showGroups?: boolean;
  showKPIs?: boolean;
  showStructure?: boolean;
  showActions?: boolean;
  compact?: boolean;
  maxHeight?: number;
  onAction?: (action: string) => void;
}
```

---

## 📋 Implementation Checklist

### Immediate Fixes (1-2 hours)

- [ ] Fix API response structure handling (`.workout` vs `.data`)
- [ ] Use `kpiTagIds` array instead of string matching
- [ ] Support multiple KPI tags per exercise
- [ ] Fix group color display using actual group objects
- [ ] Add proper null/empty state handling

### Short Term (2-4 hours)

- [ ] Implement workout data caching
- [ ] Add loading skeleton UI
- [ ] Improve set display clarity (group sets vs exercise sets)
- [ ] Add smooth fade animations
- [ ] Fix calendar text truncation with better overflow handling

### Medium Term (4-8 hours)

- [ ] Pre-load visible workout data
- [ ] Add rich content (thumbnails, badges, indicators)
- [ ] Implement quick actions in hover
- [ ] Create reusable component variants
- [ ] Add comprehensive TypeScript types
- [ ] Write component documentation

### Long Term (Nice to Have)

- [ ] Add exercise preview images
- [ ] Show athlete-specific data (previous attempts, PRs)
- [ ] Implement hover-to-edit for coaches
- [ ] Add workout comparison tool
- [ ] Create hover theme system
- [ ] Add accessibility features (keyboard navigation)

---

## 🎨 Proposed Visual Design

### Layout Structure

```
┌─────────────────────────────────────┐
│ 🎨 GRADIENT HEADER                   │
│ Monday 11/10 Football Workout        │
│ 12 exercises • 16:30 • Weight Room   │
├─────────────────────────────────────┤
│ ASSIGNED TO                          │
│ 🟦 Football - Linemen  🟧 JV Squad  │
├─────────────────────────────────────┤
│ KEY LIFTS                            │
│ 💪 Front Squat [Squat] [Leg]        │
│ 💪 Bench Press [Bench] [Push]       │
├─────────────────────────────────────┤
│ STRUCTURE                            │
│ ┌─ SUPERSET • 4 sets ─────────────┐│
│ │ 1. Back Squat 5×3 @ 225 lbs     ││
│ │ 2. Romanian Deadlift 5×8        ││
│ └─────────────────────────────────┘│
│ ┌─ CIRCUIT • 3 rounds ────────────┐│
│ │ 1. Box Jumps 3×10               ││
│ │ 2. Kettlebell Swings 3×15       ││
│ │ 3. Battle Ropes 3×30s           ││
│ └─────────────────────────────────┘│
├─────────────────────────────────────┤
│ COACH NOTES                          │
│ Focus on explosive power today       │
├─────────────────────────────────────┤
│ [View Full] [Edit] ───────────────►│
└─────────────────────────────────────┘
```

### Color System

- **Header Gradient**: Blue → Indigo → Purple (energy, professional)
- **Group Badges**: Use actual group colors from database
- **KPI Tags**: Use tag colors from database
- **Structure Badges**:
  - Superset: Purple (#9333ea)
  - Circuit: Orange (#ea580c)
  - Section: Blue (#2563eb)

---

## 🔧 Technical Implementation Details

### Data Flow

```
Calendar Component
  ↓ (assignments with workoutPlanId)
DraggableAthleteCalendar
  ↓ (pre-fetch workout data)
Workout Cache (Map<id, WorkoutDetails>)
  ↓ (pass cached data)
HoverCard Trigger
  ↓ (on hover, instant display)
WorkoutPreviewCard
  ↓ (render rich content)
User sees beautiful hover!
```

### Type Safety

```typescript
interface WorkoutPreviewData {
  workout: WorkoutPlan;
  groups: AthleteGroup[];
  kpiTags: KPITag[];
  assignmentGroups: AthleteGroup[];
  cached: boolean;
  cachedAt?: Date;
}

interface HoverCardCache {
  get(key: string): WorkoutPreviewData | undefined;
  set(key: string, data: WorkoutPreviewData): void;
  preload(keys: string[]): Promise<void>;
  clear(): void;
}
```

---

## 🚀 Success Metrics

### Performance Targets

- [ ] Hover appears in < 50ms (from cached data)
- [ ] Smooth 60 FPS animations
- [ ] Zero layout shift
- [ ] < 200KB additional bundle size

### UX Targets

- [ ] All workout info visible without clicking
- [ ] Group colors match dashboard 100%
- [ ] KPI tags show correctly with exercise names
- [ ] Sets/reps clearly distinguishable
- [ ] No truncated text in calendar
- [ ] Hover never goes off-screen

### Code Quality Targets

- [ ] Zero TypeScript errors
- [ ] 100% component reusability
- [ ] Full JSDoc documentation
- [ ] Comprehensive prop types
- [ ] Unit tests for data transformations

---

## 📚 References

### Similar Implementations

- Discord user hovers
- GitHub PR hovers
- Linear issue hovers
- Notion page hovers

### Design Resources

- Radix UI HoverCard
- Floating UI positioning
- Framer Motion animations
- Tailwind CSS shadows & gradients

---

## Next Steps

1. **Review this document** with team
2. **Prioritize fixes** based on user impact
3. **Start with immediate fixes** (API response, KPI IDs, colors)
4. **Iterate on design** with real data
5. **Test thoroughly** on mobile and desktop
6. **Document component** for future reuse

Would you like me to proceed with implementing these fixes?
