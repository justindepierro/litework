# Design System Migration - Phases 1-3 Implementation Plan

**Status**: In Progress (Phase 1 Started)
**Date**: November 8, 2025
**Estimated Total Time**: 6-8 hours for complete implementation

---

## 🎯 Overview

Comprehensive design system overhaul covering:

1. **Color Token Migration** - 200+ hardcoded colors → design tokens
2. **Button Component System** - 100+ button replacements
3. **Card Component System** - 50+ card replacements

**Benefits**:

- Centralized theming (easy dark mode later)
- 100% design token coverage
- Consistent brand identity
- ~400+ total replacements
- Better accessibility
- Reduced bundle size (less duplicated styles)

---

## ✅ Phase 0: Foundation (COMPLETE)

### Created Components:

- ✅ `Alert.tsx` - Info, success, warning, error variants
- ✅ `Badge.tsx` - Primary, success, warning, error, neutral variants
- ✅ `Button.tsx` - Already exists with full variant support
- ✅ `Card.tsx` - Already exists with hover effects

### Added Semantic Utilities to design-tokens.css:

```css
.bg-success-lighter, .bg-warning-lighter, .bg-error-lighter, .bg-info-lighter
.text-success, .text-warning, .text-error, .text-info
.border-success-light, .border-warning-light, .border-error-light, .border-info-light
```

---

## 🔥 Phase 1: Color Token Migration (IN PROGRESS)

### Color Mapping Strategy

**Text Colors:**

- `text-gray-900` → `text-navy-900` or `text-[var(--color-text-primary)]`
- `text-gray-600` → `text-silver-700` or `text-[var(--color-text-secondary)]`
- `text-gray-500` → `text-silver-600` or `text-[var(--color-text-tertiary)]`
- `text-gray-400` → `text-silver-600`
- `text-blue-600` → `text-accent-blue` or `text-info`
- `text-green-600` → `text-accent-green` or `text-success`
- `text-red-600` → `text-accent-red` or `text-error`
- `text-yellow-600` → `text-accent-yellow` or `text-warning`

**Background Colors:**

- `bg-white` → `bg-[var(--color-bg-primary)]`
- `bg-gray-50` → `bg-silver-200` or `bg-[var(--color-bg-secondary)]`
- `bg-gray-100` → `bg-silver-300`
- `bg-blue-50` → `bg-info-lighter` (for info alerts/badges)
- `bg-green-50` → `bg-success-lighter` (for success states)
- `bg-red-50` → `bg-error-lighter` (for error states)
- `bg-yellow-50` → `bg-warning-lighter` (for warning states)

**Border Colors:**

- `border-gray-200` → `border-silver-400` or `border-[var(--color-border-primary)]`
- `border-gray-300` → `border-silver-500` or `border-[var(--color-border-secondary)]`
- `border-blue-200` → `border-info-light`
- `border-green-200` → `border-success-light`
- `border-red-200` → `border-error-light`
- `border-yellow-200` → `border-warning-light`

### Files to Update (Priority Order)

**High Priority - User-Facing Pages:**

1. `src/app/dashboard/page.tsx` - 30+ color replacements
2. `src/app/athletes/page.tsx` - 50+ color replacements
3. `src/app/workouts/page.tsx` - 25+ color replacements

**Medium Priority - Components:** 4. `src/components/AthleteCalendar.tsx` - 20+ replacements 5. `src/components/GroupAssignmentModal.tsx` - 10+ replacements 6. `src/components/ManageGroupMembersModal.tsx` - 15+ replacements 7. `src/components/DraggableAthleteCalendar.tsx` - 10+ replacements

**Low Priority - Misc:** 8. `src/components/optimized.tsx` - 15+ replacements 9. `src/components/AchievementBadge.tsx` - 8+ replacements 10. Other component files - Remaining replacements

**Estimated Time**: 2-3 hours

---

## 🚀 Phase 2: Button Component Migration

### Button Replacement Strategy

**Current State:**

```tsx
// Old - CSS classes
<button className="btn-primary px-4 py-2 rounded-lg">
  Click me
</button>

// Old - Custom styles
<button className="bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700">
  Submit
</button>
```

**New State:**

```tsx
import { Button } from "@/components/ui/Button";

// New - Component
<Button variant="primary" size="md">
  Click me
</Button>

<Button variant="primary" size="lg" isLoading={submitting}>
  Submit
</Button>
```

### Search & Replace Patterns

**Pattern 1: btn-primary**

- Search: `className="[^"]*btn-primary[^"]*"`
- Replace with: `<Button variant="primary">`

**Pattern 2: btn-secondary**

- Search: `className="[^"]*btn-secondary[^"]*"`
- Replace with: `<Button variant="secondary">`

**Pattern 3: Custom blue buttons**

- Search: `className="[^"]*bg-blue-600[^"]*text-white[^"]*"`
- Replace with: `<Button variant="primary">`

**Pattern 4: Custom red/danger buttons**

- Search: `className="[^"]*bg-red-[56]00[^"]*text-white[^"]*"`
- Replace with: `<Button variant="danger">`

**Pattern 5: Ghost/transparent buttons**

- Search: `className="[^"]*bg-transparent[^"]*hover:bg-gray[^"]*"`
- Replace with: `<Button variant="ghost">`

### Files with Most Buttons

1. `src/app/athletes/page.tsx` - 30+ buttons
2. `src/app/workouts/page.tsx` - 25+ buttons
3. `src/app/dashboard/page.tsx` - 15+ buttons
4. `src/components/WorkoutEditor.tsx` - 20+ buttons
5. `src/components/GroupFormModal.tsx` - 10+ buttons
6. `src/components/BulkOperationModal.tsx` - 10+ buttons

**Estimated Time**: 2-3 hours

---

## 🎨 Phase 3: Card Component Migration

### Card Replacement Strategy

**Current State:**

```tsx
// Old - card-primary
<div className="card-primary p-6 rounded-xl shadow-md">
  Content
</div>

// Old - card-stat
<div className="card-stat rounded-2xl border-2 border-green-200 bg-green-50">
  Stats
</div>
```

**New State:**

```tsx
import { Card, CardHeader, CardBody, CardFooter } from "@/components/ui/Card";

// New - structured card
<Card variant="default" padding="md" hoverable>
  <CardHeader>
    <h3>Title</h3>
  </CardHeader>
  <CardBody>
    Content
  </CardBody>
  <CardFooter>
    Actions
  </CardFooter>
</Card>

// New - stat card
<Card variant="elevated" padding="lg">
  Stats content
</Card>
```

### Search Patterns

**Pattern 1: card-primary**

- Search: `className="card-primary[^"]*"`
- Replace with: `<Card variant="default">`

**Pattern 2: card-secondary**

- Search: `className="card-secondary[^"]*"`
- Replace with: `<Card variant="flat">`

**Pattern 3: card-stat**

- Search: `className="card-stat[^"]*"`
- Replace with: `<Card variant="elevated">`

**Pattern 4: Custom cards**

- Search: `className="[^"]*bg-white[^"]*border[^"]*rounded-[^"]*shadow[^"]*"`
- Replace with: `<Card>`

### Files with Most Cards

1. `src/app/athletes/page.tsx` - 15+ cards
2. `src/app/dashboard/page.tsx` - 10+ cards
3. `src/app/workouts/page.tsx` - 10+ cards
4. `src/components/AthleteCalendar.tsx` - 8+ cards

**Estimated Time**: 2 hours

---

## 🧪 Phase 4: Testing & Validation

### Checklist

- [ ] Run `npm run typecheck` - 0 TypeScript errors
- [ ] Run `npm run build` - Successful production build
- [ ] Run `npm run lint` - No new warnings
- [ ] Visual regression test - All pages load correctly
- [ ] Test button interactions - Hover, focus, disabled states
- [ ] Test card hover effects - Elevation changes
- [ ] Test color contrast - WCAG AA compliance
- [ ] Test mobile responsive - All breakpoints
- [ ] Test dark mode prep - All colors use tokens

**Estimated Time**: 1 hour

---

## 📊 Progress Tracking

### Overall Progress

**Phase 1 - Color Tokens**: 0% (0/200+ replacements)
**Phase 2 - Buttons**: 0% (0/100+ replacements)
**Phase 3 - Cards**: 0% (0/50+ replacements)

**Total**: 0% (0/350+ replacements)

### Commits Strategy

- Commit after each page completion (incremental progress)
- Batch commits by phase
- Final commit with all phases complete

---

## 🚨 Potential Issues & Solutions

### Issue 1: Breaking Existing Styles

**Solution**: Test each replacement individually, commit frequently for easy rollback

### Issue 2: Button Size Mismatches

**Solution**: Adjust size prop (sm/md/lg) or add custom className

### Issue 3: Card Padding Differences

**Solution**: Use padding="none" and add custom padding classes if needed

### Issue 4: Color Token Not Matching Exactly

**Solution**: Use inline var() syntax: `text-[var(--color-text-primary)]`

---

## 📝 Next Steps

1. ✅ Create Alert, Badge components (DONE)
2. ✅ Add semantic color utilities (DONE)
3. ⏳ Start Phase 1: Dashboard page color migration
4. ⏳ Continue Phase 1: Athletes page
5. ⏳ Continue Phase 1: Workouts page
6. ⏳ Start Phase 2: Button migrations
7. ⏳ Start Phase 3: Card migrations
8. ⏳ Final validation and testing

**Ready to proceed with implementation!** 🚀
