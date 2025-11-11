# Component Audit & Replacement Progress

**Goal**: Replace all hardcoded form inputs with custom UI components  
**Started**: November 8, 2025  
**Status**: 🚧 In Progress

## Custom Components Available

### ✅ Created & Ready to Use

1. **Input Component** (`@/components/ui/Input`)
   - Props: `label`, `helperText`, `error`, `success`, `leftIcon`, `rightIcon`, `inputSize`, `fullWidth`
   - Features: Focus rings, error states, password toggle, design tokens
   - Types: text, email, password, number, etc.

2. **Textarea Component** (`@/components/ui/Input`)
   - Props: `label`, `helperText`, `error`, `fullWidth`, `autoResize`
   - Features: Auto-resize, focus rings, error states, design tokens

3. **Select Component** (`@/components/ui/Input`)
   - Props: `label`, `helperText`, `error`, `fullWidth`, `options`
   - Features: Focus rings, error states, design tokens
   - Options format: `Array<{ value: string; label: string }>`

4. **Button Component** (`@/components/ui/Button`)
   - Props: `variant`, `size`, `isLoading`, `showSuccessState`, `disabled`, `leftIcon`, `rightIcon`
   - Variants: primary, secondary, danger, ghost, success
   - Features: Ripple effect, hover lift, loading states

5. **Card Component** (`@/components/ui/Card`)
   - Props: `variant`, `hoverable`, `padding`, `onClick`
   - Variants: default, elevated, flat, bordered
   - Features: Hover lift, shadow expansion

6. **EmptyState Component** (`@/components/ui/EmptyState`)
   - Pre-built templates: EmptyWorkouts, EmptyAthletes, EmptyAssignments, etc.
   - Features: Icon, title, description, action buttons

## Hardcoded Input Audit Results

### Summary

- **Total Hardcoded Inputs Found**: 50+
- **Locations**: 12 files
- **Priority Files**: WorkoutEditor, Athletes page, GroupFormModal, ExerciseLibrary

### Files with Hardcoded Inputs

#### 🎯 High Priority (User-Facing Forms)

1. **src/components/WorkoutEditor.tsx** - 13 inputs
   - Sets/Reps number inputs (2)
   - Weight/Distance inputs (4)
   - Tempo/Rest inputs (2)
   - Video URL input (1)
   - Notes textarea (1)
   - Exercise name input (1)
   - Workout name/description inputs (2)
   - **Status**: ✅ Import added, ⏳ Replacement in progress

2. **src/app/athletes/page.tsx** - 10+ inputs
   - Edit email modal (1) - ✅ REPLACED
   - Invite athlete form (3) - ⏳ Pending
   - Message textarea (1) - ⏳ Pending
   - KPI entry inputs (5+) - ⏳ Pending
   - **Status**: ✅ Input import added, 🔧 Partial replacement

3. **src/components/GroupFormModal.tsx** - 4 inputs
   - Group name input - ✅ REPLACED
   - Sport select - ✅ REPLACED
   - Category input - ✅ REPLACED
   - Description textarea - ✅ REPLACED
   - **Status**: ✅ COMPLETE

4. **src/components/ExerciseLibrary.tsx** - 5 inputs
   - Exercise name input
   - Description textarea
   - Video URL input
   - Category select
   - Muscle group selects
   - **Status**: ⏳ Pending

5. **src/components/BulkOperationModal.tsx** - 9 inputs
   - Message subject/body
   - Notification inputs
   - Assignment date/time
   - **Status**: ⏳ Pending

#### 📋 Medium Priority (Assignment/Scheduling)

6. **src/components/IndividualAssignmentModal.tsx** - 2 inputs
   - Date picker inputs
   - **Status**: ⏳ Pending

7. **src/components/GroupAssignmentModal.tsx** - 3 inputs
   - Group select
   - Date/time inputs
   - **Status**: ⏳ Pending

8. **src/components/DateTimePicker.tsx** - 2 inputs
   - Date input
   - Time input
   - **Status**: ⏳ Pending

9. **src/components/AthleteModificationModal.tsx** - 6 inputs
   - Sets/Reps modifications
   - Weight/Distance modifications
   - Notes textarea
   - **Status**: ⏳ Pending

#### 🔧 Lower Priority (Internal/Admin)

10. **src/components/DraggableAthleteCalendar.tsx** - 1 input
    - Info banner (not a form input)
    - **Status**: ⏳ Review needed

11. **src/components/WorkoutAssignmentDetailModal.tsx** - 1 input
    - Status display (not a form input)
    - **Status**: ⏳ Review needed

## Replacement Pattern

### Before (Hardcoded)

```tsx
<div>
  <label className="block text-sm font-medium text-gray-700 mb-2">
    Email Address *
  </label>
  <input
    type="email"
    value={formData.email}
    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
    placeholder="athlete@email.com"
  />
  {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
</div>
```

### After (Component)

```tsx
<Input
  label="Email Address *"
  type="email"
  value={formData.email}
  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
  placeholder="athlete@email.com"
  fullWidth
  required
  error={error}
/>
```

### Benefits

- **-7 lines** per input (average 30% code reduction)
- **100% design token** usage (no hardcoded colors/spacing)
- **Consistent** focus rings, error states, disabled states
- **Accessible** with proper ARIA labels
- **Maintainable** - change once, affects all

## Progress Tracking

### Completed Files

- [x] src/components/GroupFormModal.tsx (4/4 inputs)
- [x] src/app/athletes/page.tsx (1/10 inputs) - Partial

### In Progress

- [ ] src/components/WorkoutEditor.tsx (0/13 inputs)
- [ ] src/app/athletes/page.tsx (9 remaining inputs)

### Pending

- [ ] src/components/ExerciseLibrary.tsx (5 inputs)
- [ ] src/components/BulkOperationModal.tsx (9 inputs)
- [ ] src/components/IndividualAssignmentModal.tsx (2 inputs)
- [ ] src/components/GroupAssignmentModal.tsx (3 inputs)
- [ ] src/components/DateTimePicker.tsx (2 inputs)
- [ ] src/components/AthleteModificationModal.tsx (6 inputs)

## Estimated Impact

### Code Reduction

- **Current**: ~500 lines of hardcoded input HTML
- **After**: ~350 lines of component usage
- **Reduction**: ~150 lines (30%)

### Design Token Coverage

- **Before**: 50% (btn/card classes used tokens, inputs didn't)
- **After**: 100% (all form elements use tokens)

### Consistency Improvements

- ✅ Unified focus ring styles
- ✅ Consistent error state display
- ✅ Uniform input sizing
- ✅ Standardized spacing/padding
- ✅ Cohesive color palette

## Next Steps

1. **Complete WorkoutEditor** (13 inputs) - Highest priority, most visible
2. **Complete Athletes Page** (9 remaining inputs) - User onboarding
3. **Replace ExerciseLibrary** (5 inputs) - Exercise management
4. **Bulk Operations** (9 inputs) - Coach productivity
5. **Assignment Modals** (7 inputs) - Scheduling
6. **Date/Time Pickers** (2 inputs) - Reusable utility

## Testing Checklist

After each file is updated:

- [ ] TypeScript check passes (0 errors)
- [ ] Visual regression test (forms look correct)
- [ ] Keyboard navigation works
- [ ] Tab order is logical
- [ ] Error states display correctly
- [ ] Focus rings are visible
- [ ] Disabled states work
- [ ] Mobile touch targets are adequate (44px+)

## Notes

### Challenges Encountered

1. **Number Inputs**: Need to handle empty string while typing, validate on blur
2. **Date/Time Inputs**: Custom DateTimePicker uses native inputs, may need wrapper
3. **Autocomplete Inputs**: ExerciseAutocomplete component needs special handling
4. **Select Options**: Need to convert string arrays to `{value, label}` format

### Solutions Applied

1. Created helper function for number input handling
2. Will wrap DateTimePicker's native inputs
3. Keep autocomplete as-is (already custom)
4. Use `.map()` to convert arrays: `sportOptions.map(s => ({value: s, label: s}))`

## Rollback Plan

If issues arise:

1. All changes are in version control
2. Each file updated independently (easy to revert)
3. Component library is additive (doesn't break existing code)
4. Can incrementally adopt (mix old/new during transition)

## Success Criteria

✅ **Complete** when:

1. All 50+ hardcoded inputs replaced with components
2. TypeScript 0 errors
3. Production build successful
4. All forms function identically to before
5. No visual regressions
6. 100% design token coverage
7. Documentation updated
