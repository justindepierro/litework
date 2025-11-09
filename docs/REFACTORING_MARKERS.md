# Files Marked for Future Refactoring

**Last Updated**: November 9, 2025  
**Purpose**: Track technical debt and performance optimization opportunities

---

## 🔴 HIGH PRIORITY - Refactor When Opportunity Arises

### 1. WorkoutEditor.tsx (2,218 lines)
**Location**: `src/components/WorkoutEditor.tsx`  
**Complexity**: Very High  
**Estimated Effort**: 2-3 days

**Issues**:
- Monolithic component with 4+ sub-components inline
- 15+ useState hooks in single component
- Heavy re-renders on any state change
- Poor separation of concerns

**Recommended Split**:
```
src/components/WorkoutEditor/
  ├── index.tsx                      # Main orchestrator (200 lines)
  ├── WorkoutEditorHeader.tsx        # Header with name/description
  ├── WorkoutExerciseList.tsx        # Exercise list container
  ├── ExerciseItem.tsx               # Individual exercise (memoized)
  ├── GroupCreationModal.tsx         # Already separated, move to subdir
  ├── hooks/
  │   ├── useWorkoutState.ts         # Workout CRUD operations
  │   ├── useExerciseOperations.ts   # Add/edit/delete exercises
  │   └── useGroupOperations.ts      # Superset/circuit management
  └── types.ts                       # Local type definitions
```

**Benefits**:
- 70% complexity reduction
- React.memo optimization for exercise items
- Easier testing and maintenance
- Better code reusability

**Trigger**: When adding new workout features or exercise types

---

### 2. athletes/page.tsx (2,223 lines)
**Location**: `src/app/athletes/page.tsx`  
**Complexity**: High  
**Estimated Effort**: 2 days

**Issues**:
- 8 modals in single file (though using Modal system)
- Multiple data fetching operations mixed with UI
- Complex filtering and sorting logic inline
- Difficult to test individual features

**Recommended Split**:
```
src/app/athletes/
  ├── page.tsx                       # Main route (300 lines)
  ├── components/
  │   ├── AthleteGrid.tsx            # Grid layout + cards
  │   ├── AthleteCard.tsx            # Individual athlete (memoized)
  │   ├── AthleteFilters.tsx         # Search + filter UI
  │   ├── modals/
  │   │   ├── InviteAthleteModal.tsx
  │   │   ├── AddToGroupModal.tsx
  │   │   ├── EditEmailModal.tsx
  │   │   ├── MessageAthleteModal.tsx
  │   │   └── KPIManagementModal.tsx
  ├── hooks/
  │   ├── useAthleteData.ts          # Data fetching
  │   └── useAthleteFilters.ts       # Filter logic
  └── types.ts
```

**Benefits**:
- Cleaner separation of concerns
- Easier modal maintenance
- Better performance (memoized cards)
- Testable filtering logic

**Trigger**: When adding new athlete management features

---

## 🟡 MEDIUM PRIORITY - Consider for Next Sprint

### 3. BulkOperationModal.tsx (945 lines)
**Location**: `src/components/BulkOperationModal.tsx`  
**Complexity**: High  
**Estimated Effort**: 1-2 days

**Issues**:
- Multi-step wizard with complex state machine
- All 4 steps in single file
- Heavy render on state changes
- Difficult to add new operation types

**Recommended Split**:
```
src/components/BulkOperationModal/
  ├── index.tsx                      # Main modal wrapper
  ├── steps/
  │   ├── SelectOperationStep.tsx    # Operation type selection
  │   ├── ConfigureStep.tsx          # Configure parameters
  │   ├── ConfirmStep.tsx            # Review before execute
  │   └── ExecutingStep.tsx          # Progress/results
  ├── hooks/
  │   ├── useBulkOperations.ts       # Operation logic
  │   └── useStepNavigation.ts       # Step management
  └── types.ts
```

**Benefits**:
- Easier to add new operations
- Better step isolation
- Cleaner state management
- More testable

**Trigger**: When adding new bulk operation types

---

### 4. workouts/page.tsx (~1,200 lines)
**Location**: `src/app/workouts/page.tsx`  
**Complexity**: Medium  
**Estimated Effort**: 1 day

**Issues**:
- Multiple modals mixed with main logic
- Data fetching spread throughout component
- Complex filter/sort logic

**Recommended Split**:
```
src/app/workouts/
  ├── page.tsx
  ├── components/
  │   ├── WorkoutGrid.tsx
  │   ├── WorkoutCard.tsx
  │   ├── WorkoutFilters.tsx
  │   └── modals/
  ├── hooks/
  │   └── useWorkoutData.ts
  └── types.ts
```

**Trigger**: When adding workout templates or bulk operations

---

## 🟢 LOW PRIORITY - Nice to Have

### 5. CalendarView.tsx (~800 lines)
**Location**: `src/components/CalendarView.tsx`  
**Complexity**: Medium  
**Estimated Effort**: 1 day

**Issues**:
- Calendar logic mixed with assignment display
- 30+ CalendarDay components rendered each month
- Could benefit from virtualization

**Recommended Improvements**:
- Extract CalendarDay to separate memoized component
- Extract assignment popup to separate component
- Consider react-window for large date ranges

**Trigger**: When adding calendar features or performance issues

---

### 6. ExerciseLibrary.tsx (806 lines)
**Location**: `src/components/ExerciseLibrary.tsx`  
**Complexity**: Medium  
**Estimated Effort**: 4-6 hours

**Status**: Recently refactored with Modal system (Nov 9, 2025)

**Future Improvements**:
- Extract filtering logic to `useExerciseFilters` hook
- Memoize ExerciseCard component (500+ exercises in grid)
- Add debouncing to search input (200ms)

**Trigger**: When adding new exercise features

---

## Performance Optimizations (Quick Wins)

### React.memo Candidates
**Impact**: 30-50% render performance improvement  
**Effort**: 2-3 hours total

1. **WorkoutEditor.tsx** - `ExerciseItem` component (line ~200)
   ```typescript
   const ExerciseItem = memo(({ exercise, onUpdate, onDelete }) => {
     // ...
   });
   ```

2. **athletes/page.tsx** - Athlete cards in grid
   ```typescript
   const AthleteCard = memo(({ athlete, onSelect }) => {
     // ...
   });
   ```

3. **CalendarView.tsx** - `CalendarDay` component
   ```typescript
   const CalendarDay = memo(({ date, assignments }) => {
     // ...
   });
   ```

4. **ExerciseLibrary.tsx** - `ExerciseCard` in grid
   ```typescript
   const ExerciseCard = memo(({ exercise, onSelect }) => {
     // ...
   });
   ```

---

### Search/Filter Debouncing
**Impact**: Reduce unnecessary renders by 80%  
**Effort**: 1 hour

**Files**:
1. `ExerciseLibrary.tsx` - Search input (line ~285)
2. `athletes/page.tsx` - Athlete search

**Implementation**:
```typescript
import { useMemo, useState } from 'react';
import { useDebounce } from '@/hooks/useDebounce';

const [searchInput, setSearchInput] = useState('');
const debouncedSearch = useDebounce(searchInput, 200);

const filteredItems = useMemo(() => {
  return items.filter(item => 
    item.name.toLowerCase().includes(debouncedSearch.toLowerCase())
  );
}, [items, debouncedSearch]);
```

---

### useMemo for Expensive Filters
**Impact**: Prevent unnecessary recalculations  
**Effort**: 1 hour

**Files**:
1. `ExerciseLibrary.tsx` - Exercise filtering
2. `athletes/page.tsx` - Athlete filtering
3. `workouts/page.tsx` - Workout filtering

**Pattern**:
```typescript
const filteredAndSortedItems = useMemo(() => {
  let result = items;
  
  // Apply filters
  if (searchTerm) {
    result = result.filter(/* ... */);
  }
  
  // Apply sorting
  result = result.sort(/* ... */);
  
  return result;
}, [items, searchTerm, sortBy, filters]);
```

---

## Refactoring Guidelines

### Before Starting Any Refactor:

1. **Ensure Stability**
   - [ ] No active feature development in target file
   - [ ] No pending schema changes affecting component
   - [ ] All tests passing

2. **Create Safety Net**
   - [ ] Document current behavior
   - [ ] Add tests for critical paths (if missing)
   - [ ] Create feature branch

3. **Incremental Approach**
   - [ ] Extract one piece at a time
   - [ ] Test after each extraction
   - [ ] Commit frequently

4. **Validation**
   - [ ] TypeScript: 0 errors
   - [ ] Lint: No new warnings
   - [ ] Functionality: Manual testing
   - [ ] Performance: Compare before/after metrics

---

## Dependencies & Blockers

### WorkoutEditor Refactor Prerequisites:
- [ ] Workout data structure stabilized (no schema changes planned)
- [ ] Exercise grouping behavior documented
- [ ] Integration tests for workout operations

### BulkOperationModal Refactor Prerequisites:
- [ ] Bulk operation flows documented
- [ ] State machine diagram created
- [ ] Unit tests for state transitions

### Athletes Page Refactor Prerequisites:
- [ ] Athlete management flows documented
- [ ] Modal interactions mapped
- [ ] Data fetching patterns established

---

## Success Metrics

### Code Quality
- **Before**: 5 files >1000 lines, average complexity: Medium-High
- **Target**: 0 files >1000 lines, average complexity: Low-Medium

### Performance
- **Before**: List rendering: baseline
- **Target**: 30-50% improvement in list/grid rendering

### Maintainability
- **Before**: Difficult to locate features, high coupling
- **Target**: Clear file structure, low coupling, high cohesion

### Testing
- **Before**: Low test coverage (<30%)
- **Target**: >70% coverage for refactored components

---

## Notes

- All marked files are **fully functional** - refactoring is for quality/performance only
- No changes required for production deployment
- Refactor during feature development opportunities
- Document any additional complexity discovered during refactoring

---

**Next Review**: After next major feature addition  
**Owner**: Development Team  
**Priority**: Technical debt backlog
