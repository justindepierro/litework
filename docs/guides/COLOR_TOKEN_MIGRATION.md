# Design Token Migration Guide - Priority 4

**Status**: IN PROGRESS  
**Date**: November 2025  
**Priority**: 4 of 7

## Overview

This document tracks the migration from hardcoded Tailwind colors to our semantic design token system. The project's `COMPONENT_USAGE_STANDARDS.md` mandates:

> **NEVER hardcode colors. Use design tokens from `design-tokens.css`.**

## Problem

Found **150+ violations** across **25+ components**:
- Blue colors (`text-blue-*`, `bg-blue-*`): ~60 instances
- Gray colors (`text-gray-*`, `bg-gray-*`): ~50 instances  
- Red colors (`text-red-*`, `bg-red-*`): ~15 instances
- Green colors (`text-green-*`, `bg-green-*`): ~20 instances
- Purple colors (`text-purple-*`, `bg-purple-*`): ~10 instances
- Yellow colors (`text-yellow-*`): ~5 instances

## Color Mapping Reference

### Primary/Info Colors (Blue → Primary/Info)

**Semantic Meaning**: Primary brand actions, informational content

```css
/* BEFORE - Hardcoded */
text-blue-600    → text-primary or text-info
text-blue-700    → text-info-dark
text-blue-800    → text-info-darker
bg-blue-50       → bg-info-lightest
bg-blue-100      → bg-info-lighter
bg-blue-600      → bg-primary or bg-info
border-blue-200  → border-info-lighter
border-blue-300  → border-info-light
border-blue-500  → border-info
```

**Tailwind Classes** (from `design-tokens.css` via `tailwind.config.ts`):

```tsx
// ✅ CORRECT - Using design tokens
className="text-primary bg-info-lightest border-info-lighter"
className="hover:bg-info-light hover:text-info-dark"
```

### Neutral/Gray Colors (Gray → Neutral/Silver)

**Semantic Meaning**: Text, backgrounds, borders, UI structure

```css
/* BEFORE - Hardcoded */
text-gray-400    → text-neutral or text-silver-600
text-gray-500    → text-neutral-dark or text-silver-700
text-gray-600    → text-neutral-dark or text-silver-700
text-gray-700    → text-neutral-darker or text-silver-800
text-gray-800    → text-navy-800
text-gray-900    → text-navy-900 or text-neutral-darkest
bg-gray-50       → bg-silver-200 or bg-neutral-lighter
bg-gray-100      → bg-silver-300 or bg-neutral-light
bg-gray-200      → bg-silver-400 or bg-neutral
border-gray-200  → border-silver-400
border-gray-300  → border-silver-500
```

**Important**: For **TEXT**, prefer **Typography components**:

```tsx
// ❌ FORBIDDEN
<p className="text-gray-600">Description</p>
<h3 className="text-gray-900">Title</h3>

// ✅ REQUIRED
<Body variant="secondary">Description</Body>
<Heading size="sm">Title</Heading>
```

### Success Colors (Green → Success/Accent-Green)

**Semantic Meaning**: Success states, completed actions, positive feedback

```css
/* BEFORE - Hardcoded */
text-green-500   → text-success or text-accent-green
text-green-600   → text-success-dark
text-green-700   → text-success-darker
bg-green-50      → bg-success-lightest
bg-green-100     → bg-success-lighter
bg-green-500     → bg-success
bg-green-600     → bg-success-dark
border-green-200 → border-success-lighter
border-green-300 → border-success-light
```

### Error Colors (Red → Error/Accent-Red)

**Semantic Meaning**: Error states, destructive actions, critical alerts

```css
/* BEFORE - Hardcoded */
text-red-500     → text-error or text-accent-red
text-red-600     → text-error-dark
text-red-800     → text-error-darker
bg-red-50        → bg-error-lightest
bg-red-500       → bg-error
border-red-300   → border-error-light
```

### Warning Colors (Yellow → Warning/Accent-Amber)

**Semantic Meaning**: Warning states, attention-needed, caution

```css
/* BEFORE - Hardcoded */
text-yellow-500  → text-warning or text-accent-amber
text-yellow-600  → text-warning-dark
bg-yellow-50     → bg-warning-lightest
bg-yellow-400    → bg-warning
```

### Premium/Achievement Colors (Purple → Accent-Purple)

**Semantic Meaning**: Premium features, achievements, special content

```css
/* BEFORE - Hardcoded */
text-purple-500  → text-accent-purple
text-purple-600  → text-accent-purple-600
text-purple-800  → text-accent-purple-800
bg-purple-50     → bg-accent-purple-50
bg-purple-500    → bg-accent-purple
border-purple-300→ border-accent-purple-300
```

## Component-Specific Patterns

### Buttons (Use Button Component!)

```tsx
// ❌ FORBIDDEN - Hardcoded button
<button className="bg-blue-600 text-white hover:bg-blue-700">
  Click Me
</button>

// ✅ REQUIRED - Button component
<Button variant="primary" onClick={handleClick}>
  Click Me
</Button>
```

### Badges/Status Indicators

```tsx
// ❌ FORBIDDEN
<span className="bg-green-100 text-green-800 px-2 py-1 rounded">
  Active
</span>

// ✅ REQUIRED - Badge component
<Badge variant="success">Active</Badge>
```

### Alerts/Notifications

```tsx
// ❌ FORBIDDEN
<div className="bg-red-50 border border-red-200 text-red-800">
  Error occurred
</div>

// ✅ CORRECT - Using design tokens
<div className="bg-error-lightest border border-error-lighter text-error-dark">
  Error occurred
</div>

// ✅ BETTER - Alert component (if exists)
<Alert variant="error">Error occurred</Alert>
```

### Typography/Text

```tsx
// ❌ FORBIDDEN - Hardcoded text colors
<h1 className="text-gray-900">Title</h1>
<p className="text-gray-600">Body text</p>
<span className="text-blue-600">Link</span>

// ✅ REQUIRED - Typography components
<Heading size="lg">Title</Heading>
<Body variant="secondary">Body text</Body>
<Link href="/path">Link</Link>
```

## Migration Strategy

### Phase 1: High-Visibility Components (Start Here)

Priority order for maximum impact:

1. **WorkoutView.tsx** (~35 violations)
   - Blue borders/backgrounds on workout sections
   - Gray text throughout
   - Green success indicators
   - Purple/blue accent colors

2. **BlockLibrary.tsx** (~25 violations)
   - Type config object with hardcoded colors
   - Gray text and backgrounds
   - Blue primary colors

3. **NotificationPreferences.tsx** (~20 violations)
   - Blue toggle switches
   - Gray text labels
   - Green/red status indicators

4. **NotificationBell.tsx** (~15 violations)
   - Red unread badge
   - Blue action buttons
   - Gray text

5. **BulkOperationHistory.tsx** (~15 violations)
   - Status icons with hardcoded colors
   - Gray text throughout
   - Progress bars

### Phase 2: Medium-Visibility Components

6. **ProgressAnalyticsDashboard.tsx** (~12 violations)
7. **GroupCompletionStats.tsx** (~10 violations)
8. **NotificationPreferencesSettings.tsx** (~18 violations)
9. **ExerciseGroupDisplay.tsx** (~12 violations)
10. **QuickActions.tsx** (~8 violations)

### Phase 3: Lower-Impact Components

11. **BlockEditor.tsx** (~10 violations)
12. **WorkoutEditor.tsx** (~3 violations)
13. **AthleteEditModal.tsx** (~6 violations)
14. **GroupFormModal.tsx** (~2 violations)
15. **TodayOverview.tsx** (~4 violations)
16. **NotificationPermission.tsx** (~6 violations)
17. **BulkKPIAssignmentModal.tsx** (~6 violations)
18. **WorkoutAssignmentDetailModal.tsx** (~2 violations)

## Replacement Checklist (Per Component)

- [ ] Read component file to understand current color usage
- [ ] Identify semantic meaning of each color (primary, success, error, etc.)
- [ ] **Check if text should use Typography components** (Body, Heading, Label, etc.)
- [ ] Replace hardcoded colors with appropriate design tokens
- [ ] For buttons/badges/modals, consider using UI components instead
- [ ] Test visual appearance (colors should look identical)
- [ ] Run `npm run typecheck` to verify no errors
- [ ] Commit with descriptive message

## Success Criteria

- [ ] **Zero hardcoded color classes** in components
- [ ] All semantic colors use design token system
- [ ] Text elements use Typography components where appropriate
- [ ] Buttons use Button component
- [ ] Badges use Badge component
- [ ] TypeScript compilation: 0 errors
- [ ] Visual appearance unchanged

## Estimated Impact

- **Lines Changed**: ~150 class names across 25+ components
- **Files Modified**: 25+ component files
- **Time Estimate**: 1.5-2 hours
- **Maintenance Benefit**: Centralized color management, easier theme updates
- **Consistency**: Enforces design system adherence

## Reference Files

- **Design Tokens**: `src/styles/design-tokens.css` (1010 lines)
- **Tailwind Config**: `tailwind.config.ts` (integrates design tokens)
- **Component Standards**: `docs/guides/COMPONENT_USAGE_STANDARDS.md`
- **Typography Components**: `src/components/ui/Typography.tsx`
- **Button Component**: `src/components/ui/Button.tsx`
- **Badge Component**: `src/components/ui/Badge.tsx`

## Notes

- Some components may already use design tokens partially
- Focus on semantic meaning, not just color replacement
- Prefer UI components over manual styling when available
- Maintain WCAG AA contrast standards throughout
