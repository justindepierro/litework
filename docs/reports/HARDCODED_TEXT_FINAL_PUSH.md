# Hardcoded HTML Text Elements - Final Push to 100%

**Date**: November 24, 2025
**Status**: 🔄 IN PROGRESS
**Completion**: ~77% (52 violations remaining)

## Executive Summary

This document tracks the **final push to achieve 100% compliance** with the Component Usage Standards, eliminating all hardcoded HTML text elements (`<h1-h6>`, `<p>`, `<span>` with text content) from the codebase.

### Progress Overview

- **Total Violations Fixed**: ~172 (batches 1-14 complete)
- **Remaining Violations**: 52 (all in `/src`)
- **Estimated Completion**: 1-2 hours
- **Target**: Zero violations, zero TypeScript errors

## Violations Breakdown by File

### Layout & Dashboard (6 violations)

**PageHeader.tsx** (2):

- Line 81: Breadcrumb span
- Line 164: Section title h2

**DashboardClientPage.tsx** (3):

- Line 99: Icon wrapper span
- Line 329: Desktop button text span
- Line 332: Mobile button text span

**RecentWorkouts.tsx** (1):

- Line 182: Bullet separator span

### Component Files (35 violations)

**ProgressAnalyticsDashboard.tsx** (1):

- Line 306: Success message span

**PWAInstallBanner.tsx** (1):

- Line 111: Banner title h3

**YouTubeEmbed.tsx** (2):

- Line 65: Error message p
- Line 83: Loading message p

**MobileOptimization.tsx** (3):

- Line 163: Modal title h2
- Line 167: Close button span
- Line 208: Required asterisk span

**NotificationPreferences.tsx** (3):

- Line 133: Description p
- Line 154: Option description p
- Line 170: Option description p

**NotificationPreferencesSettings.tsx** (4):

- Line 171: Description p
- Line 207: Helper text p
- Line 251: Description p
- Line 275: Description p

**CommandPalette.tsx** (2):

- Line 133: Command label span
- Line 140: Command label span

**RestTimer.tsx** (1):

- Line 168: Completion message span

**WorkoutEditor/ActionToolbar.tsx** (1):

- Line 185: Loading spinner span (emoji)

**ExerciseLibrary.tsx** (1):

- Line 141: No results message p

**WorkoutAssignmentForm.tsx** (1):

- Line 65: Required asterisk span

**GroupCompletionStats.tsx** (4):

- Line 129: Name span (truncate)
- Line 144: Count span
- Line 162: Label p
- Line 176: Label p

**goals/AchievementBadges.tsx** (1):

- Line 223: Icon span

**progress/ProgressPhotos.tsx** (2):

- Line 197: Badge span (before)
- Line 202: Badge span (after)

**Calendar/DraggableAssignment.tsx** (1):

- Line 177: Badge span

**AthleteDetailModal.tsx** (1):

- Line 582: Label span

### UI Components (7 violations)

**ErrorBoundary.tsx** (1):

- Line 45: Error description p (NOTE: Already fixed in batch 13, may be false positive)

**Input.tsx** (1):

- Line 88: Required asterisk span (NOTE: Already fixed in batch 14, may be false positive)

**RateLimitError.tsx** (1):

- Line 68: Error message p (NOTE: Already fixed in batch 13, may be false positive)

**Dropdown.tsx** (2):

- Line 294: Keyboard shortcut badge span
- Line 321: Group label span

**SectionHeader.tsx** (2):

- Line 98: Icon wrapper span (dynamic styles)
- Line 138: Icon wrapper span (static primary)

**StepperInput.tsx** (1):

- Line 76: Unit label span

**Typography.tsx** (1):

- Line 255: Required asterisk span

### Utility Files (1 violation)

**lib/accessibility-utils.tsx** (1):

- Line 223: Screen reader only span (KEEP - accessibility utility)

### Page Files (4 violations)

**app/static-home.tsx** (2):

- Line 17: Title span (block)
- Line 18: Subtitle span (accent)

**app/design-system/page.tsx** (1):

- Line 668: Color name span (KEEP - design system demo)

**app/reset-password/page.tsx** (2):

- Line 46: Instructions p
- Line 60: Form intro p

**app/update-password/page.tsx** (1):

- Line 80: Error message p

**app/workouts/live/[assignmentId]/page.tsx** (1):

- Line 84: Loading message p

## Exceptions (DO NOT FIX)

These are intentionally excluded:

1. **lib/accessibility-utils.tsx line 223**: Screen reader utility function
2. **app/design-system/page.tsx line 668**: Design system demo page

## Batch Execution Plan

### Batch 15: Layout & Dashboard (6 violations)

- PageHeader.tsx
- DashboardClientPage.tsx
- RecentWorkouts.tsx

### Batch 16: High-Priority Components (12 violations)

- ProgressAnalyticsDashboard.tsx
- PWAInstallBanner.tsx
- YouTubeEmbed.tsx
- MobileOptimization.tsx
- WorkoutEditor/ActionToolbar.tsx
- ExerciseLibrary.tsx
- WorkoutAssignmentForm.tsx

### Batch 17: Notification & Settings (7 violations)

- NotificationPreferences.tsx
- NotificationPreferencesSettings.tsx
- CommandPalette.tsx
- RestTimer.tsx

### Batch 18: Stats & Progress (8 violations)

- GroupCompletionStats.tsx
- goals/AchievementBadges.tsx
- progress/ProgressPhotos.tsx
- Calendar/DraggableAssignment.tsx
- AthleteDetailModal.tsx

### Batch 19: UI Components (4 violations - NEW ONLY)

- Dropdown.tsx (2 violations)
- SectionHeader.tsx (2 violations)
- StepperInput.tsx (1 violation)
- Typography.tsx (1 violation)
- NOTE: Skip ErrorBoundary, Input, RateLimitError (already fixed in batches 13-14)

### Batch 20: Page Components (4 violations)

- app/static-home.tsx
- app/reset-password/page.tsx
- app/update-password/page.tsx
- app/workouts/live/[assignmentId]/page.tsx

## Verification Steps

After completing all batches:

1. **Comprehensive Grep Search**:

   ```bash
   grep -r '<h[1-6].*className' src/ --include="*.tsx" --include="*.ts"
   grep -r '<p .*className' src/ --include="*.tsx" --include="*.ts"
   grep -r '<span .*className.*>' src/ --include="*.tsx" --include="*.ts" | grep -v 'accessibility-utils' | grep -v 'design-system/page'
   ```

2. **TypeScript Validation**:

   ```bash
   npm run typecheck
   ```

   - Expected: 0 errors

3. **Production Build**:

   ```bash
   npm run build
   ```

   - Expected: Successful build

4. **Manual Review**:
   - Check exception files are still excluded
   - Verify Typography component usage is correct
   - Confirm no Caption weight props

## Success Criteria

- ✅ Zero hardcoded HTML text elements in source code
- ✅ Zero TypeScript compilation errors
- ✅ Successful production build
- ✅ All Typography components used correctly
- ✅ Design system exceptions preserved

## Timeline

- **Start**: November 24, 2025 (current session)
- **Expected Completion**: Within 1-2 hours
- **Batches**: 15-20 (6 batches remaining)
- **Average Time**: 10-15 minutes per batch

---

**Last Updated**: November 24, 2025
**Next Steps**: Begin batch 15 execution
