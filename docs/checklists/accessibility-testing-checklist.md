# Accessibility Testing Checklist - Final Verification

**Date**: November 12, 2025  
**Tester**: ******\_******  
**Environment**: ******\_******  
**Status**: ⏳ TO BE COMPLETED

---

## Quick Testing Guide (15-20 minutes)

This checklist covers the essential accessibility tests before production deployment.

---

## 1. Keyboard Navigation (5 minutes)

### Dashboard Page

- [ ] Tab through navigation (Logo → Skip → Dashboard → Athletes → Workouts → Schedule → Profile → Notifications)
- [ ] Press Enter on "Athletes" link → navigates to Athletes page
- [ ] Focus indicators visible on all elements
- [ ] Press Skip Link → focus jumps to main content

### Athletes Page

- [ ] Tab to "Add Athlete" button → press Enter → modal opens
- [ ] Modal: Tab through form fields (stays in modal, doesn't escape)
- [ ] Modal: Press Escape → modal closes, focus returns to trigger button
- [ ] Tab to athlete card → press Enter → athlete details open

### Workouts Page

- [ ] Tab to "Create Workout" button → press Enter → WorkoutEditor opens
- [ ] Modal: Tab through all fields and buttons
- [ ] Modal: Press Escape → modal closes
- [ ] Tab to workout card → open assignment modal
- [ ] Assignment modal: Tab through form, verify focus trap

### Forms

- [ ] Login page: Tab through email → password → submit
- [ ] Profile page: Tab through all 3 tabs and form fields
- [ ] All form labels visible and associated with inputs

**Result**: ✅ All keyboard navigation working | ❌ Issues found: ****\_\_****

---

## 2. Screen Reader Testing (5 minutes)

### VoiceOver (macOS)

**Enable**: Cmd + F5

**Test Flow**:

- [ ] Navigate to Dashboard
- [ ] VO+A (read all) → page content announced correctly
- [ ] VO+Right Arrow through navigation → all links announced
- [ ] Tab to "Add Athlete" button → VO announces "Add Athlete, button"
- [ ] Open modal → VO announces modal title
- [ ] Navigate form fields → VO announces labels before inputs
- [ ] Trigger error → VO announces error message
- [ ] Toast notification appears → VO announces message

### NVDA (Windows) - If available

**Enable**: Ctrl + Alt + N

**Test Flow**:

- [ ] Navigate to Dashboard
- [ ] Insert+Down Arrow (read all) → content announced
- [ ] Tab through navigation → links announced correctly
- [ ] Open modal → title announced
- [ ] Form fields announced with labels

**Result**: ✅ Screen reader working | ❌ Issues found: ****\_\_****

---

## 3. Focus Indicators (2 minutes)

### Visual Check

- [ ] Tab through Dashboard → orange outline visible on all focusable elements
- [ ] Navigation links → focus indicator visible
- [ ] Buttons → focus ring visible
- [ ] Form inputs → border color changes on focus
- [ ] Modal close button → focus indicator visible
- [ ] No invisible focus (always know where you are)

**Colors to Verify**:

- Focus ring: Orange (#ff6b35)
- Thickness: 2px
- Offset: 2px from element

**Result**: ✅ All focus indicators visible | ❌ Issues found: ****\_\_****

---

## 4. Color Contrast (3 minutes)

### Quick Visual Check

Open any page and verify text is readable:

- [ ] **Primary text** (dark on white) → clearly visible
- [ ] **Secondary text** (gray on white) → readable
- [ ] **Muted text** (light gray) → still legible
- [ ] **Links** (orange) → visible against white
- [ ] **Buttons** → text readable on all variants (primary, secondary, ghost)
- [ ] **Status badges** (success/warning/error) → text readable

### Automated Check (Optional)

Use browser DevTools:

1. Inspect text element
2. Look for contrast ratio in Styles panel
3. Verify: Normal text ≥ 4.5:1, Large text ≥ 3:1

**Result**: ✅ All contrast ratios pass | ❌ Issues found: ****\_\_****

---

## 5. ARIA Labels (2 minutes)

### Icon-Only Buttons

Open browser DevTools → Accessibility tab → inspect these:

- [ ] Modal close button (X) → has aria-label="Close modal"
- [ ] Toast close button (X) → has aria-label="Close notification"
- [ ] Notification delete (X) → has aria-label="Delete notification"
- [ ] Command palette close (X) → has aria-label="Close command palette"

### Other ARIA

- [ ] Navigation → has aria-label
- [ ] Skip link → has aria-label
- [ ] Form errors → have role="alert"
- [ ] Loading states → have aria-label or role="status"

**Result**: ✅ All ARIA labels present | ❌ Issues found: ****\_\_****

---

## 6. Modal Focus Management (3 minutes)

### Test Each Modal Type

For each modal:

1. Open modal (click or keyboard)
2. Verify first element receives focus
3. Tab through elements (should stay in modal)
4. Tab from last element → wraps to first
5. Press Escape → modal closes
6. Focus returns to trigger button

**Test Modals**:

- [ ] WorkoutEditor
- [ ] GroupAssignmentModal
- [ ] AthleteEditModal
- [ ] GroupFormModal
- [ ] BulkKPIAssignmentModal

**Result**: ✅ All modals trap focus correctly | ❌ Issues found: ****\_\_****

---

## 7. Form Accessibility (2 minutes)

### Login Form Test

- [ ] Tab to email field → label visible/announced
- [ ] Type invalid email → submit → error message appears
- [ ] Error has role="alert" (check DevTools)
- [ ] Error is announced by screen reader
- [ ] Field has aria-invalid="true" (check DevTools)
- [ ] Field has aria-describedby pointing to error (check DevTools)

### Profile Form Test

- [ ] All fields have visible labels
- [ ] Required fields marked with \*
- [ ] Tab order logical (follows visual order)
- [ ] Error messages appear below fields
- [ ] Success messages announced

**Result**: ✅ All forms accessible | ❌ Issues found: ****\_\_****

---

## 8. Mobile Touch Targets (2 minutes)

### Visual Inspection (or use mobile device)

**Buttons to Check**:

- [ ] Navigation links → tap area ≥ 44x44px
- [ ] Primary buttons → tap area ≥ 44x44px
- [ ] Icon-only buttons → tap area ≥ 44x44px (especially close buttons)
- [ ] Form inputs → height ≥ 44px
- [ ] Toast close button → 44x44px minimum

**Spacing Check**:

- [ ] Buttons in groups have adequate spacing (8px+ gap)
- [ ] No overlapping touch targets
- [ ] Easy to tap intended target

**Result**: ✅ All touch targets adequate | ❌ Issues found: ****\_\_****

---

## 9. Reduced Motion (1 minute)

### Test Reduced Motion Preference

**macOS**: System Preferences → Accessibility → Display → Reduce motion

**Windows**: Settings → Ease of Access → Display → Show animations

**Test**:

1. Enable "Reduce motion"
2. Navigate site
3. Verify animations are reduced/disabled:
   - [ ] Page transitions subtle or none
   - [ ] Toast animations reduced
   - [ ] Modal animations reduced
   - [ ] No motion-based information

**Result**: ✅ Reduced motion respected | ❌ Issues found: ****\_\_****

---

## 10. Skip Link (1 minute)

### Test Skip to Main Content

**Test Flow**:

1. Load Dashboard page
2. Press Tab once → Skip Link appears
3. Press Enter → focus jumps to main content
4. Verify: skipped over navigation
5. Next Tab → first interactive element in main content

**Visual**:

- [ ] Skip link visible when focused
- [ ] Skip link has clear text ("Skip to main content")
- [ ] Skip link works on all pages

**Result**: ✅ Skip link functional | ❌ Issues found: ****\_\_****

---

## Summary

### Pass Criteria

- ✅ All 10 sections marked as passing
- ✅ Zero critical issues found
- ✅ All keyboard functionality works
- ✅ Screen reader announces content correctly
- ✅ Focus indicators always visible
- ✅ Color contrast meets 4.5:1 minimum

### Results

- **Total Sections**: 10
- **Passed**: \_\_\_ / 10
- **Critical Issues**: \_\_\_
- **Minor Issues**: \_\_\_

### Overall Status

- [ ] ✅ PASS - Ready for production
- [ ] ⚠️ CONDITIONAL PASS - Minor issues to fix
- [ ] ❌ FAIL - Critical issues must be fixed

---

## Issues Found (if any)

### Critical Issues

(Issues that prevent accessibility - must fix before launch)

1. ***
2. ***

### Minor Issues

(Nice-to-have improvements - can fix post-launch)

1. ***
2. ***

---

## Automated Testing Results

### Lighthouse Accessibility Score

**Expected**: 100/100

To run:

1. Open Chrome DevTools
2. Go to Lighthouse tab
3. Select "Accessibility" only
4. Click "Analyze page load"

**Result**: \_\_\_ / 100

**Issues Found**: **********************\_\_\_**********************

---

### axe DevTools Results

**Expected**: 0 violations

To run:

1. Install axe DevTools Chrome extension
2. Open DevTools → axe tab
3. Click "Scan ALL of my page"

**Result**: \_\_\_ violations found

**Issues Found**: **********************\_\_\_**********************

---

## Tester Sign-Off

**Tested By**: ******\_\_\_******  
**Date**: ******\_\_\_******  
**Time Spent**: \_\_\_ minutes  
**Recommendation**: ☐ Approve for production | ☐ Requires fixes

**Notes**: **********************\_\_\_**********************

---

---
