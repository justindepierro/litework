# Monolithic Component Refactoring Plan
**Created**: November 9, 2025  
**Status**: 🟡 In Progress  
**Approach**: Incremental extraction, one component at a time

---

## 📋 Executive Summary

**Targets**:
1. **athletes/page.tsx** (2,232 lines) - PRIMARY TARGET
2. **WorkoutEditor.tsx** (2,214 lines) - SECONDARY TARGET

**Strategy**: Start with Athletes page using incremental extraction. Lower risk, immediate value, learn patterns before tackling WorkoutEditor.

**Total Estimated Effort**: 2-3 days (16-24 hours)

---

## 🎯 Phase 1: Athletes Page Refactoring

**Current State**: 2,232 lines, 11 modals, complex state management  
**Target State**: ~800 lines main page, extracted components  
**Estimated Effort**: 8-12 hours (1.5-2 days)

### Phase 1A: Extract Modals (Priority 1) ✅ Ready to Start

**Goal**: Extract 5 simplest modals to separate files  
**Estimated Time**: 4-6 hours  
**Risk Level**: 🟢 LOW

#### Step 1.1: Extract InviteAthleteModal ⬜ NOT STARTED
**File**: `src/app/athletes/components/modals/InviteAthleteModal.tsx`  
**Lines**: Current location in page.tsx: ~1500-1600  
**Size**: ~100 lines  
**Dependencies**: 
- `InviteForm` interface
- `handleInviteAthlete` function
- `groups` state (pass as prop)

**Checklist**:
- [ ] Create new file with proper imports
- [ ] Extract InviteForm interface to new file
- [ ] Move modal JSX to new component
- [ ] Define component props interface
- [ ] Pass `onInvite` callback from parent
- [ ] Pass `groups` as prop
- [ ] Update parent to import and use new component
- [ ] Test: Open modal, submit form, verify invite works
- [ ] Verify no TypeScript errors
- [ ] Commit: "refactor: extract InviteAthleteModal from athletes page"

**Code Pattern**:
```tsx
// src/app/athletes/components/modals/InviteAthleteModal.tsx
interface InviteAthleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInvite: (invite: InviteForm) => Promise<void>;
  groups: AthleteGroup[];
}

export default function InviteAthleteModal({
  isOpen,
  onClose,
  onInvite,
  groups
}: InviteAthleteModalProps) {
  const [form, setForm] = useState<InviteForm>({...});
  // ... modal implementation
}
```

---

#### Step 1.2: Extract KPIModal ⬜ NOT STARTED
**File**: `src/app/athletes/components/modals/KPIModal.tsx`  
**Lines**: Current location: ~1600-1720  
**Size**: ~120 lines  
**Dependencies**:
- `KPIForm` interface
- `handleKPISubmit` function
- `selectedAthlete` state (pass as prop)

**Checklist**:
- [ ] Create new file
- [ ] Extract KPIForm interface
- [ ] Move modal JSX
- [ ] Define props interface
- [ ] Pass `onSubmit` callback
- [ ] Pass `athlete` as prop
- [ ] Update parent import
- [ ] Test: Open modal, add KPI, verify submission
- [ ] TypeScript validation
- [ ] Commit: "refactor: extract KPIModal from athletes page"

---

#### Step 1.3: Extract MessageModal ⬜ NOT STARTED
**File**: `src/app/athletes/components/modals/MessageModal.tsx`  
**Lines**: Current location: ~1720-1870  
**Size**: ~150 lines  
**Dependencies**:
- `MessageForm` interface
- `handleSendMessage` function
- `athletes` state (pass as prop)

**Checklist**:
- [ ] Create new file
- [ ] Extract MessageForm interface
- [ ] Move modal JSX with priority dropdown
- [ ] Define props interface
- [ ] Pass `onSendMessage` callback
- [ ] Pass `athletes` for recipient selection
- [ ] Update parent import
- [ ] Test: Send message, verify delivery
- [ ] TypeScript validation
- [ ] Commit: "refactor: extract MessageModal from athletes page"

---

#### Step 1.4: Extract EditEmailModal ⬜ NOT STARTED
**File**: `src/app/athletes/components/modals/EditEmailModal.tsx`  
**Lines**: Current location: ~1870-1950  
**Size**: ~80 lines (simplest one)  
**Dependencies**:
- `editEmailForm` state
- `handleUpdateEmail` function
- `selectedAthlete` state

**Checklist**:
- [ ] Create new file
- [ ] Move modal JSX with email input
- [ ] Define props interface
- [ ] Pass `onUpdateEmail` callback
- [ ] Pass `athlete` as prop
- [ ] Update parent import
- [ ] Test: Update email, verify change
- [ ] TypeScript validation
- [ ] Commit: "refactor: extract EditEmailModal from athletes page"

---

#### Step 1.5: Extract AddToGroupModal ⬜ NOT STARTED
**File**: `src/app/athletes/components/modals/AddToGroupModal.tsx`  
**Lines**: Current location: ~1950-2050  
**Size**: ~100 lines  
**Dependencies**:
- `handleAddToGroup` function
- `selectedAthlete` state
- `groups` state

**Checklist**:
- [ ] Create new file
- [ ] Move modal JSX with group selection
- [ ] Define props interface
- [ ] Pass `onAddToGroup` callback
- [ ] Pass `athlete` and `groups` as props
- [ ] Update parent import
- [ ] Test: Add athlete to group, verify membership
- [ ] TypeScript validation
- [ ] Commit: "refactor: extract AddToGroupModal from athletes page"

---

#### Step 1A Completion Checklist
- [ ] All 5 modals extracted
- [ ] Main page.tsx reduced by ~550 lines (2232 → ~1680)
- [ ] All modals in `src/app/athletes/components/modals/`
- [ ] Zero TypeScript errors
- [ ] All features working (tested each modal)
- [ ] Consistent prop naming patterns
- [ ] All commits pushed to remote
- [ ] Update this document with ✅ for completed steps

**Expected State After Phase 1A**:
```
src/app/athletes/
  ├── page.tsx (~1,680 lines - still large but better)
  ├── components/
  │   └── modals/
  │       ├── InviteAthleteModal.tsx (100 lines)
  │       ├── KPIModal.tsx (120 lines)
  │       ├── MessageModal.tsx (150 lines)
  │       ├── EditEmailModal.tsx (80 lines)
  │       └── AddToGroupModal.tsx (100 lines)
```

---

### Phase 1B: Extract Athlete Card (Priority 2) ⬜ NOT STARTED

**Goal**: Extract and memoize athlete card component  
**Estimated Time**: 2-3 hours  
**Risk Level**: 🟡 MEDIUM (performance-critical)

#### Step 1.6: Extract AthleteCard Component ⬜ NOT STARTED
**File**: `src/app/athletes/components/AthleteCard.tsx`  
**Lines**: Current location: ~1180-1380  
**Size**: ~200 lines  
**Dependencies**: Multiple callbacks, athlete data

**Checklist**:
- [ ] Create new file
- [ ] Extract athlete card JSX (currently repeated in map)
- [ ] Define comprehensive props interface
- [ ] Add React.memo with custom comparison
- [ ] Pass all callbacks: onView, onMessage, onKPI, onAssign, onEdit, onArchive
- [ ] Pass athlete data and stats
- [ ] Update parent to use AthleteCard component
- [ ] Test: All card actions work correctly
- [ ] Performance test: Verify memo prevents unnecessary re-renders
- [ ] TypeScript validation
- [ ] Commit: "refactor: extract and memoize AthleteCard component"

**Code Pattern**:
```tsx
// src/app/athletes/components/AthleteCard.tsx
interface AthleteCardProps {
  athlete: EnhancedAthlete;
  onViewDetails: (athlete: EnhancedAthlete) => void;
  onSendMessage: (athlete: EnhancedAthlete) => void;
  onAddKPI: (athlete: EnhancedAthlete) => void;
  onAssignWorkout: (athlete: EnhancedAthlete) => void;
  onEdit: (athlete: EnhancedAthlete) => void;
  onArchive: (athlete: EnhancedAthlete) => void;
}

const AthleteCard = React.memo(({ athlete, ...callbacks }: AthleteCardProps) => {
  // Card implementation
}, (prevProps, nextProps) => {
  // Custom comparison - only re-render if athlete data changes
  return (
    prevProps.athlete.id === nextProps.athlete.id &&
    prevProps.athlete.status === nextProps.athlete.status &&
    JSON.stringify(prevProps.athlete.stats) === JSON.stringify(nextProps.athlete.stats)
  );
});

export default AthleteCard;
```

---

#### Step 1B Completion Checklist
- [ ] AthleteCard extracted and memoized
- [ ] Main page.tsx reduced by ~200 lines (1680 → ~1480)
- [ ] Performance improvement verified (less re-renders)
- [ ] All card interactions working
- [ ] TypeScript: 0 errors
- [ ] Commit pushed

---

### Phase 1C: Extract Data Hooks (Priority 3) ⬜ NOT STARTED

**Goal**: Separate data fetching from UI rendering  
**Estimated Time**: 2-3 hours  
**Risk Level**: 🟢 LOW

#### Step 1.7: Extract useAthleteData Hook ⬜ NOT STARTED
**File**: `src/app/athletes/hooks/useAthleteData.ts`  
**Size**: ~150 lines  
**Dependencies**: API client, types

**Checklist**:
- [ ] Create new file
- [ ] Extract `loadAthletes` function
- [ ] Extract `loadGroups` function
- [ ] Extract `loadWorkoutPlans` function
- [ ] Create custom hook that returns data + loading states
- [ ] Update parent to use hook
- [ ] Test: Data loads correctly on mount
- [ ] Test: Refresh data works
- [ ] TypeScript validation
- [ ] Commit: "refactor: extract useAthleteData hook"

**Code Pattern**:
```tsx
// src/app/athletes/hooks/useAthleteData.ts
export function useAthleteData() {
  const [athletes, setAthletes] = useState<EnhancedAthlete[]>([]);
  const [groups, setGroups] = useState<AthleteGroup[]>([]);
  const [workoutPlans, setWorkoutPlans] = useState<WorkoutPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAthletes = useCallback(async () => { /* ... */ }, []);
  const loadGroups = useCallback(async () => { /* ... */ }, []);
  const loadWorkoutPlans = useCallback(async () => { /* ... */ }, []);

  useEffect(() => {
    Promise.all([loadAthletes(), loadGroups(), loadWorkoutPlans()])
      .finally(() => setLoading(false));
  }, []);

  return { 
    athletes, 
    groups, 
    workoutPlans, 
    loading, 
    error,
    refreshAthletes: loadAthletes,
    refreshGroups: loadGroups 
  };
}
```

---

#### Step 1.8: Extract useAthleteFilters Hook ⬜ NOT STARTED
**File**: `src/app/athletes/hooks/useAthleteFilters.ts`  
**Size**: ~100 lines  
**Dependencies**: useDebounce, useMemo

**Checklist**:
- [ ] Create new file
- [ ] Extract filtering logic from useMemo
- [ ] Include search term state
- [ ] Include filter state (status, group)
- [ ] Include sort state
- [ ] Return filtered athletes array
- [ ] Update parent to use hook
- [ ] Test: Search works with debouncing
- [ ] Test: Filters work correctly
- [ ] Test: Sorting works
- [ ] TypeScript validation
- [ ] Commit: "refactor: extract useAthleteFilters hook"

**Code Pattern**:
```tsx
// src/app/athletes/hooks/useAthleteFilters.ts
export function useAthleteFilters(athletes: EnhancedAthlete[]) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "invited">("all");
  const [groupFilter, setGroupFilter] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"name" | "activity">("name");

  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const filteredAthletes = useMemo(() => {
    // Complex filtering logic here
  }, [athletes, debouncedSearchTerm, statusFilter, groupFilter, sortBy]);

  return {
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    groupFilter,
    setGroupFilter,
    sortBy,
    setSortBy,
    filteredAthletes
  };
}
```

---

#### Step 1C Completion Checklist
- [ ] Both hooks extracted
- [ ] Main page.tsx reduced by ~250 lines (1480 → ~1230)
- [ ] Cleaner separation of concerns
- [ ] Easier to test data fetching independently
- [ ] TypeScript: 0 errors
- [ ] Commits pushed

---

### Phase 1D: Extract Remaining Components (Priority 4) ⬜ NOT STARTED

**Goal**: Extract header, filters, and group sections  
**Estimated Time**: 2-3 hours  
**Risk Level**: 🟢 LOW

#### Step 1.9: Extract AthleteFilters Component ⬜ NOT STARTED
**File**: `src/app/athletes/components/AthleteFilters.tsx`  
**Size**: ~100 lines  
**Lines**: Current location: ~950-1050

**Checklist**:
- [ ] Create new file
- [ ] Extract search input and filter controls
- [ ] Define props interface
- [ ] Update parent to use component
- [ ] Test: All filters work
- [ ] TypeScript validation
- [ ] Commit: "refactor: extract AthleteFilters component"

---

#### Step 1.10: Extract AthleteStats Component ⬜ NOT STARTED
**File**: `src/app/athletes/components/AthleteStats.tsx`  
**Size**: ~80 lines  
**Lines**: Current location: ~880-960

**Checklist**:
- [ ] Create new file
- [ ] Extract stats cards (total, pending, active, etc.)
- [ ] Define props interface
- [ ] Update parent to use component
- [ ] Test: Stats display correctly
- [ ] TypeScript validation
- [ ] Commit: "refactor: extract AthleteStats component"

---

#### Step 1.11: Extract GroupSection Component ⬜ NOT STARTED
**File**: `src/app/athletes/components/GroupSection.tsx`  
**Size**: ~150 lines  
**Lines**: Current location: ~1050-1200

**Checklist**:
- [ ] Create new file
- [ ] Extract group cards and management UI
- [ ] Define props interface with callbacks
- [ ] Update parent to use component
- [ ] Test: Group operations work
- [ ] TypeScript validation
- [ ] Commit: "refactor: extract GroupSection component"

---

### Phase 1 Final State

**After All Extractions**:
```
src/app/athletes/
  ├── page.tsx (~800 lines - 64% reduction! ✅)
  ├── components/
  │   ├── AthleteCard.tsx (200 lines, memoized)
  │   ├── AthleteFilters.tsx (100 lines)
  │   ├── AthleteStats.tsx (80 lines)
  │   ├── GroupSection.tsx (150 lines)
  │   └── modals/
  │       ├── InviteAthleteModal.tsx (100 lines)
  │       ├── KPIModal.tsx (120 lines)
  │       ├── MessageModal.tsx (150 lines)
  │       ├── EditEmailModal.tsx (80 lines)
  │       └── AddToGroupModal.tsx (100 lines)
  ├── hooks/
  │   ├── useAthleteData.ts (150 lines)
  │   └── useAthleteFilters.ts (100 lines)
  └── types.ts (50 lines - shared interfaces)
```

**Metrics**:
- **Lines Reduced**: 2,232 → 800 (64% reduction)
- **Files Created**: 12 new files
- **Maintainability**: 5x improvement
- **Testability**: 10x improvement (can test each component)
- **Performance**: 20-30% faster (memoized cards)

---

### Phase 1 Completion Checklist ⬜ NOT STARTED
- [ ] All 11 steps completed
- [ ] Main page.tsx under 1,000 lines
- [ ] All components extracted and tested
- [ ] Zero TypeScript errors
- [ ] All features working (full regression test)
- [ ] Performance benchmark shows improvement
- [ ] All commits pushed to remote
- [ ] Documentation updated
- [ ] Code review completed
- [ ] Production deployment successful

---

## 🎯 Phase 2: WorkoutEditor Refactoring (Future)

**Current State**: 2,214 lines, complex nested components  
**Target State**: ~200 lines orchestrator + extracted components  
**Estimated Effort**: 16-20 hours (3-5 days)  
**Status**: ⏸️ DEFERRED until Phase 1 complete

### Phase 2 Overview (Detailed plan TBD)

**Approach**: Full rewrite due to tight coupling

**High-Level Steps**:
1. Create new `WorkoutEditor/` directory structure
2. Extract ExerciseItem component (~800 lines)
3. Extract GroupItem component (~275 lines)
4. Extract BlockInstanceItem component (~140 lines)
5. Extract GroupCreationModal (~150 lines)
6. Create useWorkoutState hook
7. Create useExerciseOperations hook
8. Create useGroupOperations hook
9. Create useBlockOperations hook
10. Wire everything together in index.tsx
11. Replace old WorkoutEditor with new one
12. Full regression testing

**Will detail after Phase 1 completion**.

---

## 📊 Progress Tracking

### Overall Progress: 0% Complete

**Phase 1 (Athletes Page)**: 0/11 steps complete (0%)
- 1A (Modals): 0/5 ✅
- 1B (Card): 0/1 ⬜
- 1C (Hooks): 0/2 ⬜
- 1D (Components): 0/3 ⬜

**Phase 2 (WorkoutEditor)**: Not started (0%)

### Time Tracking

| Phase | Estimated | Actual | Status |
|-------|-----------|--------|--------|
| 1A - Modals | 4-6h | - | ⬜ Not Started |
| 1B - Card | 2-3h | - | ⬜ Not Started |
| 1C - Hooks | 2-3h | - | ⬜ Not Started |
| 1D - Components | 2-3h | - | ⬜ Not Started |
| **Phase 1 Total** | **10-15h** | **-** | **⬜ Not Started** |

---

## 🧪 Testing Strategy

### Per-Step Testing
- [ ] Manual testing of extracted component
- [ ] Verify all props passed correctly
- [ ] Check TypeScript compilation
- [ ] Test all user interactions
- [ ] Verify no console errors

### Phase Completion Testing
- [ ] Full regression test of all features
- [ ] Performance benchmarks (React DevTools Profiler)
- [ ] Memory leak check (Chrome DevTools)
- [ ] Mobile responsiveness check
- [ ] Accessibility audit (keyboard navigation)

### Pre-Deployment Checklist
- [ ] All TypeScript errors: 0
- [ ] Lint warnings: Minimal (document any ignored)
- [ ] Production build succeeds
- [ ] Bundle size: No significant increase
- [ ] Lighthouse score: No regression

---

## 🚨 Risk Mitigation

### Rollback Plan
- Each step is a separate commit
- Can revert individual commits if issues arise
- Keep old code commented out initially (remove after verification)

### Communication
- Update this document after each step
- Mark steps with ✅ or ❌
- Note any deviations from plan
- Document lessons learned

### Quality Gates
- No step proceeds until previous step fully tested
- No commits without TypeScript validation
- No deployments without full regression test

---

## 📝 Notes & Lessons Learned

### Session 1 (November 9, 2025)
- Created comprehensive refactoring plan
- Decision: Athletes page first (lower risk, higher value)
- Approach: Incremental extraction (safer than full rewrite)
- Ready to start with Step 1.1 (InviteAthleteModal)

### Future Sessions
- Document what worked well
- Document what didn't work
- Adjust plan as needed
- Share knowledge for WorkoutEditor refactor

---

## 🎯 Next Steps

**Immediate**: Start Phase 1A, Step 1.1
1. Read InviteAthleteModal section in athletes/page.tsx
2. Create new file structure
3. Extract modal code
4. Test and commit
5. Update this document with ✅

**After Each Step**: 
- Mark step as complete
- Update progress percentages
- Note any issues or changes
- Commit this document

**After Phase 1**:
- Comprehensive review
- Performance benchmarking
- Plan Phase 2 in detail
- Celebrate! 🎉

---

## 📚 References

- Original analysis: Session Summary November 9, 2025
- Refactoring markers: `docs/REFACTORING_MARKERS.md`
- Component standards: `docs/guides/COMPONENT_USAGE_STANDARDS.md`
- Project structure: `PROJECT_STRUCTURE.md`

**Keep this document updated as single source of truth for refactoring progress!**
