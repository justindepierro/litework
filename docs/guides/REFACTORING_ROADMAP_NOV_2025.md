# LiteWork Refactoring Roadmap - November 2025

**Goal**: Improve maintainability, performance, and developer experience through systematic component refactoring.

**Timeline**: 3 weeks (Nov 21 - Dec 12, 2025)  
**Current Performance Baseline**: 87% Lighthouse score  
**Target**: Maintain 85%+ while improving code quality

---

## 🎯 Success Metrics

- ✅ Reduce average component size from 600+ lines to 250 lines
- ✅ Extract 5+ reusable custom hooks
- ✅ Improve build time by 15% through better code splitting
- ✅ Zero TypeScript errors maintained
- ✅ 90%+ test coverage for extracted utilities
- ✅ Performance score stays above 85%

---

## 📅 Phase 1: Foundation & Quick Wins (Week 1: Nov 21-27)

### Day 1-2: Extract Reusable Hooks (HIGH IMPACT, LOW RISK)

**Priority**: 🔴 CRITICAL  
**Effort**: 8 hours  
**Risk**: 🟢 LOW

#### Task 1.1: Create `useFormState` Hook ✅

**Time**: 2 hours  
**Files Created**:

- `src/hooks/useFormState.ts`

**Files Updated** (15 components):

- `src/components/GroupFormModal.tsx`
- `src/components/AthleteEditModal.tsx`
- `src/components/WorkoutEditor.tsx` (header form only)
- `src/components/KPIFormModal.tsx`
- `src/components/BlockEditor.tsx`
- `src/app/login/page.tsx`
- `src/app/register/page.tsx`
- `src/app/profile/page.tsx`
- etc.

**Testing**:

```bash
npm run typecheck
npm run build
# Manual: Test form validation, error handling
```

#### Task 1.2: Create `useToggle` Hook ✅

**Time**: 1 hour  
**Pattern**: Replace `const [isOpen, setIsOpen] = useState(false)` pattern

**Files Created**:

- `src/hooks/useToggle.ts`

**Usage**:

```typescript
// Before
const [isOpen, setIsOpen] = useState(false);
const [isExpanded, setIsExpanded] = useState(false);

// After
const [isOpen, toggleOpen] = useToggle(false);
const [isExpanded, toggleExpanded] = useToggle(false);
```

#### Task 1.3: Create `useDebounce` Hook ✅

**Time**: 1 hour  
**Use Case**: Search inputs, filter inputs (found in 8+ components)

**Files Updated**:

- `src/components/ExerciseLibrary.tsx`
- `src/app/athletes/page.tsx`
- `src/components/WorkoutView.tsx`

#### Task 1.4: Extract `useWorkoutOperations` Hook ✅

**Time**: 4 hours  
**Extracted From**: WorkoutEditor, GroupAssignmentModal, DashboardClientPage

**Benefits**:

- Centralized workout CRUD operations
- Consistent error handling
- Reusable across components

---

### Day 3-5: WorkoutEditor Refactoring (HIGHEST IMPACT)

**Priority**: 🔴 CRITICAL  
**Effort**: 16-20 hours  
**Risk**: 🟡 MEDIUM

#### Task 2.1: Plan & Prepare ✅

**Time**: 2 hours

**Deliverables**:

- [x] Document current component structure
- [x] Identify all state dependencies
- [x] Map prop flow
- [x] Create migration checklist

#### Task 2.2: Extract Hooks (Bottom-Up Approach) ✅

**Time**: 6 hours

**Order of Extraction**:

1. ✅ `useWorkoutEditorState.ts` - All useState hooks
2. ✅ `useExerciseOperations.ts` - Add, delete, update, move exercises
3. ✅ `useGroupOperations.ts` - Group creation, update, delete
4. ✅ `useBlockOperations.ts` - Block instance management

**Testing After Each Hook**:

```bash
npm run typecheck
npm run build
# Functional test: Create workout, add exercises, create groups
```

#### Task 2.3: Extract Components (Top-Down Approach) ✅

**Time**: 8 hours

**New Directory Structure**:

```
src/components/WorkoutEditor/
├── index.tsx                           # Main orchestrator (200-250 lines)
├── components/
│   ├── WorkoutEditorHeader.tsx        # Name, description, category (100 lines)
│   ├── ExerciseList.tsx               # Exercise list container (150 lines)
│   ├── BlockInstanceItem.tsx          # Block instance card (150 lines)
│   ├── ExerciseGroupItem.tsx          # Exercise group (superset/circuit) (200 lines)
│   ├── GroupCreationModal.tsx         # Move existing modal here
│   └── SelectionToolbar.tsx           # Bulk selection actions (80 lines)
├── hooks/
│   ├── useWorkoutEditorState.ts       # State management
│   ├── useExerciseOperations.ts       # Exercise CRUD
│   ├── useGroupOperations.ts          # Group operations
│   └── useBlockOperations.ts          # Block operations
└── types.ts                            # Shared types
```

**Order of Component Extraction**:

1. ✅ Extract `WorkoutEditorHeader.tsx` (simple, no complex state)
2. ✅ Extract `BlockInstanceItem.tsx` (self-contained)
3. ✅ Extract `ExerciseGroupItem.tsx` (complex, many props)
4. ✅ Extract `ExerciseList.tsx` (main list container)
5. ✅ Extract `SelectionToolbar.tsx` (bulk operations)
6. ✅ Refactor `index.tsx` to use all extracted components

#### Task 2.4: Optimization & Testing ✅

**Time**: 2-4 hours

**Optimizations**:

- [x] Add React.memo to ExerciseItem (from workout-editor/ subdir)
- [x] Add React.memo to BlockInstanceItem
- [x] Add React.memo to ExerciseGroupItem
- [x] Optimize re-renders with useCallback for all callbacks
- [x] Test drag-and-drop performance with 50+ exercises

**Performance Testing**:

```bash
# Before refactor baseline
npm run build
# Check bundle size: .next/static/chunks/

# After refactor
npm run build
# Verify: Bundle size decreased by 10-15%
```

**Functional Testing Checklist**:

- [ ] Create new workout
- [ ] Add exercises from library
- [ ] Create superset (2-4 exercises)
- [ ] Create circuit (5+ exercises)
- [ ] Add block instance
- [ ] Customize block instance
- [ ] Reorder exercises (drag & drop)
- [ ] Bulk select exercises → create group
- [ ] Delete exercises
- [ ] Delete groups
- [ ] Save workout
- [ ] Edit existing workout

---

## 📅 Phase 2: Performance Critical Components (Week 2: Nov 28 - Dec 4)

### Day 6-8: WorkoutLive Refactoring

**Priority**: 🔴 HIGH  
**Effort**: 12-16 hours  
**Risk**: 🟡 MEDIUM (handles live workout sessions)

#### Task 3.1: Extract Hooks ✅

**Time**: 4 hours

**Hooks to Create**:

1. ✅ `useWorkoutSession.ts` - Session state (current exercise, completed sets)
2. ✅ `useSetRecording.ts` - Set input validation and recording
3. ✅ `useWorkoutTimer.ts` - Rest timer logic
4. ✅ `useWorkoutSubmission.ts` - Submit workout session

#### Task 3.2: Extract Components ✅

**Time**: 8-10 hours

**New Structure**:

```
src/components/WorkoutLive/
├── index.tsx                           # Main container (150 lines)
├── components/
│   ├── WorkoutHeader.tsx              # Title, progress bar (80 lines)
│   ├── ExerciseSection.tsx            # Single exercise with all sets (200 lines)
│   ├── SetRecorder.tsx                # Set input form (memoized) (120 lines)
│   ├── RestTimer.tsx                  # Timer component (100 lines)
│   ├── WorkoutProgress.tsx            # Progress stats (60 lines)
│   └── CompletionModal.tsx            # Workout complete screen (100 lines)
├── hooks/
│   ├── useWorkoutSession.ts
│   ├── useSetRecording.ts
│   ├── useWorkoutTimer.ts
│   └── useWorkoutSubmission.ts
└── utils/
    └── validation.ts                   # Input validation rules
```

#### Task 3.3: Testing & Optimization ✅

**Time**: 2 hours

**Critical Tests**:

- [ ] Start workout session
- [ ] Record sets (weight, reps, RPE)
- [ ] Rest timer triggers automatically
- [ ] Progress bar updates
- [ ] Complete workout submits correctly
- [ ] Handle offline mode (save locally)

**Performance**:

- [x] Memoize SetRecorder to prevent sibling re-renders
- [x] Test with 20+ exercise workout
- [x] Verify smooth scrolling and input

---

### Day 9-10: BulkOperationModal Refactoring

**Priority**: 🟡 MEDIUM  
**Effort**: 8-12 hours  
**Risk**: 🟢 LOW

#### Task 4.1: Extract Step Components ✅

**Time**: 6 hours

**New Structure**:

```
src/components/BulkOperationModal/
├── index.tsx                           # Stepper logic (150 lines)
├── steps/
│   ├── SelectOperationStep.tsx        # Select operation type (100 lines)
│   ├── ConfigureStep.tsx              # Configure parameters (200 lines)
│   ├── ConfirmStep.tsx                # Review before execute (120 lines)
│   └── ExecutingStep.tsx              # Progress/results (100 lines)
├── hooks/
│   └── useBulkOperations.ts           # Execution logic
└── types.ts
```

#### Task 4.2: Testing ✅

**Time**: 2 hours

**Test All Operations**:

- [ ] Bulk invite athletes
- [ ] Bulk message
- [ ] Bulk assign workout
- [ ] Bulk update status

---

## 📅 Phase 3: Complex UI Components (Week 3: Dec 5-12)

### Day 11-12: Calendar Refactoring

**Priority**: 🟡 MEDIUM  
**Effort**: 10-12 hours  
**Risk**: 🟢 LOW

#### Task 5.1: Extract View Components ✅

**Time**: 8 hours

**New Structure**:

```
src/components/Calendar/
├── index.tsx                           # Main wrapper (100 lines)
├── views/
│   ├── MonthView.tsx                  # Month grid (300 lines)
│   ├── WeekView.tsx                   # Week view (250 lines)
│   └── DayView.tsx                    # Day schedule (200 lines)
├── components/
│   ├── CalendarHeader.tsx             # Navigation (80 lines)
│   ├── EventCard.tsx                  # Event card (memoized) (100 lines)
│   └── DateCell.tsx                   # Date cell in grid (60 lines)
└── hooks/
    ├── useCalendarState.ts            # View state, navigation
    └── useDateCalculations.ts         # Date math utilities
```

#### Task 5.2: Testing ✅

**Time**: 2 hours

---

### Day 13-14: ExerciseLibrary Enhancement

**Priority**: 🟢 LOW  
**Effort**: 6-8 hours  
**Risk**: 🟢 LOW

#### Task 6.1: Extract Filtering Hook ✅

**Time**: 3 hours

**Create**: `useExerciseFilters.ts`

- Search, muscle group, equipment filters
- Debounced search
- Filter state management

#### Task 6.2: Virtual Scrolling (Optional) ⬜

**Time**: 4 hours

**Library**: `react-window`
**Benefit**: Handle 500+ exercises smoothly

---

### Day 15: Polish & Documentation

**Priority**: 🟡 MEDIUM  
**Effort**: 4-6 hours

#### Task 7.1: Update Documentation ✅

**Time**: 2 hours

**Documents to Update**:

- [ ] Update ARCHITECTURE.md with new component structure
- [ ] Update PROJECT_STRUCTURE.md
- [ ] Add JSDoc comments to all new hooks
- [ ] Create REFACTORING_SUMMARY.md

#### Task 7.2: Performance Audit ✅

**Time**: 2 hours

**Run Lighthouse**:

```bash
npm run build
npm run start
npx lighthouse http://localhost:3000 --view
```

**Verify**:

- [ ] Performance: 85%+ (maintain current 87%)
- [ ] Bundle size: Reduced by 10-15%
- [ ] No new console errors
- [ ] All features working

#### Task 7.3: Create Migration Guide ✅

**Time**: 2 hours

**Document**:

- Patterns used
- Before/after comparisons
- How to apply same patterns to other components

---

## 🎯 Quick Reference: Refactoring Patterns

### Pattern 1: Extract Custom Hook

```typescript
// Before: Inline state management
const Component = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // fetch logic
  }, []);

  // ...
};

// After: Custom hook
const useData = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // fetch logic
  }, []);

  return { data, loading, error };
};

const Component = () => {
  const { data, loading, error } = useData();
  // ...
};
```

### Pattern 2: Extract Presentation Component

```typescript
// Before: Logic + UI mixed
const Component = () => {
  const [items, setItems] = useState([]);
  // ... complex logic

  return (
    <div>
      {/* Complex UI */}
    </div>
  );
};

// After: Separate concerns
const Component = () => {
  const { items, addItem, deleteItem } = useItems();

  return <ItemList items={items} onAdd={addItem} onDelete={deleteItem} />;
};

const ItemList = memo(({ items, onAdd, onDelete }) => {
  return (
    <div>
      {/* UI only */}
    </div>
  );
});
```

### Pattern 3: Memoize Expensive Components

```typescript
// Before: Re-renders on every parent update
const ListItem = ({ item, onUpdate }) => {
  return <div>{/* ... */}</div>;
};

// After: Only re-renders when props change
const ListItem = memo(({ item, onUpdate }) => {
  return <div>{/* ... */}</div>;
}, (prev, next) => {
  return prev.item.id === next.item.id &&
         prev.item.updatedAt === next.item.updatedAt;
});
```

---

## 📊 Progress Tracking

### Week 1 Progress

- [x] Day 1: useFormState hook
- [x] Day 1: useToggle hook
- [x] Day 1: useDebounce hook
- [x] Day 2: useWorkoutOperations hook
- [ ] Day 3: WorkoutEditor - Extract hooks
- [ ] Day 4: WorkoutEditor - Extract components (Part 1)
- [ ] Day 5: WorkoutEditor - Extract components (Part 2) + Testing

### Week 2 Progress

- [ ] Days 6-8: WorkoutLive refactoring
- [ ] Days 9-10: BulkOperationModal refactoring

### Week 3 Progress

- [ ] Days 11-12: Calendar refactoring
- [ ] Days 13-14: ExerciseLibrary enhancement
- [ ] Day 15: Polish & Documentation

---

## 🚨 Risk Management

### High Risk Areas

1. **WorkoutEditor**: Most complex, many dependencies
   - **Mitigation**: Incremental changes, test after each extraction
2. **WorkoutLive**: Handles live sessions, data loss risk
   - **Mitigation**: Maintain existing localStorage logic, extensive testing

### Rollback Plan

- Each phase committed separately
- Tag releases: `v1.0-pre-refactor`, `v1.0-post-workouteditor`, etc.
- Keep old components in `/archive` folder for 1 sprint

---

## 📈 Expected Outcomes

### Code Quality Metrics

- **Average Component Size**: 600 lines → 250 lines (-58%)
- **Reusable Hooks**: 0 → 15+ custom hooks
- **Component Depth**: 6 levels → 3 levels (-50%)
- **Test Coverage**: 40% → 70% (+30%)

### Performance Metrics

- **Bundle Size**: Current → -10-15% reduction
- **Lighthouse Score**: 87% → 85%+ (maintain)
- **Build Time**: Current → -15% improvement
- **Runtime Performance**: Faster re-renders with memo

### Developer Experience

- **Easier to test**: Hooks are testable in isolation
- **Easier to understand**: Smaller, focused components
- **Easier to modify**: Clear separation of concerns
- **Easier to reuse**: Extracted patterns for future components

---

## 🎓 Team Knowledge Transfer

### Training Sessions

1. **Week 1**: Custom hooks patterns workshop (1 hour)
2. **Week 2**: Component composition best practices (1 hour)
3. **Week 3**: Performance optimization techniques (1 hour)

### Documentation

- Video walkthroughs of major refactors
- Code review sessions
- Pattern library in Storybook (future)

---

**Last Updated**: November 21, 2025  
**Status**: 🚀 READY TO START - Phase 1, Day 1  
**Next Action**: Extract `useFormState` hook
