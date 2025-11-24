# LiteWork Design System - Layout & Background Standards

**Last Updated**: November 23, 2025  
**Status**: ✅ Active Standard  
**Enforcement**: ESLint rules recommended

---

## 🎯 Core Principle

**All full-page containers MUST use opaque backgrounds** to prevent body gradient bleed-through.

---

## 📐 Layout Architecture

### Body Background (Global)

**File**: `src/app/globals.css`

```css
body {
  background: var(--page-gradient-energetic);
  background-attachment: fixed;
}
```

**What it is**: A subtle multi-color gradient with:

- Blue tint (top-left)
- Indigo tint (top-right)
- **Green tint (bottom-right)** ← Visible on tall pages
- Gray base gradient

**Why**: Provides visual interest and brand personality across the entire app.

**Problem**: Semi-transparent page backgrounds allow this gradient to show through, causing unwanted color tints (especially green on scrolling pages).

---

## 🏗️ PageContainer Component

**File**: `src/components/layout/PageContainer.tsx`

### Background Props

| Prop        | CSS Color                      | Opacity             | Use Case                 | Status             |
| ----------- | ------------------------------ | ------------------- | ------------------------ | ------------------ |
| `gradient`  | `#f9fafb` → `#f0f0f0` gradient | ✅ Opaque           | **DEFAULT - Most pages** | ✅ Recommended     |
| `white`     | `#ffffff`                      | ✅ Opaque           | Clean, minimal pages     | ✅ Safe            |
| `silver`    | `#ffffff` (via silver-100)     | ✅ Opaque           | Elevated content         | ✅ Safe            |
| `primary`   | `#ffffff` (via bg-primary)     | ✅ Opaque           | Main content areas       | ✅ Safe            |
| `secondary` | `#f9fafb` light gray           | ⚠️ Semi-transparent | **Components only**      | ⚠️ Avoid for pages |

### ✅ Correct Usage

```tsx
// ✅ RECOMMENDED: Default gradient background
<PageContainer maxWidth="7xl">
  {content}
</PageContainer>

// ✅ GOOD: Explicit white for clean pages
<PageContainer maxWidth="4xl" background="white">
  {content}
</PageContainer>

// ✅ GOOD: Silver for notifications/settings
<PageContainer maxWidth="4xl" background="silver">
  {content}
</PageContainer>
```

### ❌ Incorrect Usage

```tsx
// ❌ BAD: Secondary shows body gradient on tall pages
<PageContainer maxWidth="7xl" background="secondary">
  {longScrollingContent}
</PageContainer>

// ❌ BAD: No background specified relies on default (now fixed to 'gradient')
<PageContainer maxWidth="7xl">
  {content}
</PageContainer>
```

---

## 📋 Background Selection Matrix

### When to Use Each Background

| Page Type              | Background          | Reasoning                               |
| ---------------------- | ------------------- | --------------------------------------- |
| **Dashboards**         | `gradient`          | Standard content pages with cards/lists |
| **Workout Lists**      | `gradient`          | Content pages that scroll               |
| **History Pages**      | `gradient`          | Long scrolling lists                    |
| **Athletes List**      | `gradient`          | Data tables with many rows              |
| **Schedule/Calendar**  | `gradient`          | Standard content display                |
| **Progress/Analytics** | `gradient`          | Charts and data visualization           |
| **Notifications**      | `silver` or `white` | Clean, elevated UI                      |
| **Settings/Profile**   | `white`             | Minimal, form-focused                   |
| **Auth Pages**         | `gradient`          | Branded experience                      |
| **Error Pages**        | `gradient`          | Consistent with app                     |

### When to Use `secondary`

**ONLY use for**:

- Small UI components (cards, panels)
- Inline sections within pages
- Components that DON'T have `min-h-screen`

**NEVER use for**:

- Full-page containers
- PageContainer components
- Layouts with scrolling content

---

## 🎨 Design Token Reference

### Background Colors (from design-tokens-unified.css)

```css
/* Opaque Backgrounds - SAFE for full pages */
--color-bg-primary: #ffffff; /* Pure white */
--color-silver-100: #ffffff; /* White via silver scale */
--bg-gradient-primary: linear-gradient(
  135deg,
  #f9fafb 0%,
  #f5f5f5 25%,
  #f0f0f0 50%,
  #f5f5f5 75%,
  #fafafa 100%
); /* Gray gradient - OPAQUE */

/* Semi-transparent - AVOID for full pages */
--color-bg-secondary: #f9fafb; /* Light gray - shows body gradient */
--color-bg-tertiary: #f1f5f9; /* Slightly darker - still shows through */
```

### Body Gradient (The "Problem" Gradient)

```css
--page-gradient-energetic:
  radial-gradient(
    circle at 0% 0%,
    rgba(59, 130, 246, 0.025) 0px,
    transparent 65%
  ),
  /* Blue */
    radial-gradient(
      circle at 100% 0%,
      rgba(99, 102, 241, 0.025) 0px,
      transparent 65%
    ),
  /* Indigo */
    radial-gradient(
      circle at 100% 100%,
      rgba(16, 185, 129, 0.025) 0px,
      transparent 65%
    ),
  /* GREEN ← Problem */
    radial-gradient(
      circle at 0% 100%,
      rgba(59, 130, 246, 0.02) 0px,
      transparent 65%
    ),
  radial-gradient(
    ellipse at 50% 50%,
    rgba(148, 163, 184, 0.015) 0px,
    transparent 75%
  ),
  linear-gradient(135deg, #fafafa 0%, #f5f5f5 50%, #f0f0f0 100%);
```

**The green radial gradient at bottom-right becomes visible through light backgrounds on tall pages.**

---

## 🔧 Migration Guide

### Fixing Existing Pages

**Before (Problematic)**:

```tsx
<PageContainer maxWidth="7xl" background="secondary">
  {content}
</PageContainer>
```

**After (Fixed)**:

```tsx
<PageContainer maxWidth="7xl" background="gradient">
  {content}
</PageContainer>
```

### Search Pattern for Audits

```bash
# Find all PageContainer usage with secondary background
grep -r 'PageContainer.*background="secondary"' src/app/

# Find any component using bg-bg-secondary class
grep -r 'bg-bg-secondary' src/
```

---

## ✅ Checklist for New Pages

When creating a new page:

- [ ] Use `<PageContainer>` for layout consistency
- [ ] Choose appropriate `background` prop (default `gradient` is usually correct)
- [ ] If page scrolls beyond viewport, verify opaque background
- [ ] Test on tall content to ensure no body gradient shows through
- [ ] Avoid `background="secondary"` for full-page containers

---

## 🚨 Common Pitfalls

### 1. Default Background Trap (FIXED)

**Before**: PageContainer defaulted to `background="secondary"` causing issues.  
**Now**: PageContainer defaults to `background="gradient"` (opaque).  
**Action**: Always explicitly set background prop for clarity.

### 2. Copy-Paste Errors

Copying PageContainer from old pages may include `background="secondary"`.  
**Solution**: Use code snippets or templates with correct defaults.

### 3. Testing on Short Pages

Green tint only appears when content scrolls beyond viewport.  
**Solution**: Always test with realistic/long content amounts.

### 4. "It Looks Fine"

Light gray (#f9fafb) looks white until you scroll on a tall page.  
**Solution**: Scroll test every page during development.

---

## 🔍 Code Review Requirements

### Required Checks

When reviewing PRs:

- [ ] All `PageContainer` components use opaque backgrounds
- [ ] No `background="secondary"` on full-page containers
- [ ] Pages tested with scrolling content
- [ ] No hardcoded background colors (use design tokens)
- [ ] Consistent with Design System standards

### Automated Checks (Recommended)

```javascript
// ESLint rule suggestion
// Warn when PageContainer uses background="secondary"
{
  "rules": {
    "no-secondary-background-in-page-container": "warn"
  }
}
```

---

## 📊 Current Page Inventory

| Page                | Background                | Status                |
| ------------------- | ------------------------- | --------------------- |
| `/dashboard`        | Custom (no PageContainer) | ✅ OK                 |
| `/workouts`         | `gradient`                | ✅ Fixed Nov 23, 2025 |
| `/workouts/history` | `gradient`                | ✅ Fixed Nov 23, 2025 |
| `/athletes`         | `gradient`                | ✅ Fixed Nov 23, 2025 |
| `/schedule`         | `gradient`                | ✅ OK                 |
| `/progress`         | `gradient`                | ✅ OK                 |
| `/notifications`    | `silver`                  | ✅ OK                 |

---

## 🎓 Why This Matters

### User Experience Impact

- **Consistency**: All pages feel cohesive and professional
- **Readability**: Opaque backgrounds ensure text contrast
- **Brand**: Intentional use of gradient vs. solid colors
- **Performance**: No unexpected repaints from color changes

### Technical Impact

- **Maintainability**: Clear rules = fewer bugs
- **Scalability**: New pages follow established patterns
- **Testing**: Easier to validate consistency
- **Onboarding**: New developers understand system quickly

---

## 📚 Related Documentation

- `docs/reports/BACKGROUND_STYLING_AUDIT.md` - Historical issue and fix
- `src/components/layout/PageContainer.tsx` - Component implementation
- `src/styles/design-tokens-unified.css` - Color definitions
- `COMPONENT_USAGE_STANDARDS.md` - Broader component guidelines

---

## 🔄 Version History

| Date         | Change                                      | Reason                              |
| ------------ | ------------------------------------------- | ----------------------------------- |
| Nov 23, 2025 | PageContainer default changed to `gradient` | Prevent body gradient bleed-through |
| Nov 23, 2025 | Added comprehensive JSDoc to PageContainer  | Developer guidance                  |
| Nov 23, 2025 | Fixed WorkoutsClientPage background         | Consistency                         |
| Nov 23, 2025 | Created this standards document             | Long-term prevention                |

---

## 🎯 Success Metrics

**Goal**: Zero background-related bugs in production.

**Measures**:

- No user reports of unexpected colors
- All pages pass visual regression tests
- Code reviews catch issues before merge
- New pages follow standards from day one

---

## 💡 Best Practices Summary

1. **Always use PageContainer** for page layouts
2. **Default to `gradient` background** unless you have a reason not to
3. **Avoid `secondary` background** for full-page containers
4. **Test with scrolling content** to verify no bleed-through
5. **Use design tokens** instead of hardcoded colors
6. **Document exceptions** when deviating from standards

---

**Questions or issues?** Reference this document and the related component JSDoc.
