# Phase 2 Quick Reference - Typography Migration

**Quick guide for implementing Phase 2 of the code audit**

---

## 🎯 Goal

Replace all hardcoded typography HTML elements with Typography components

---

## 📋 Pattern Reference

### Common Replacements

#### 1. Page/Section Headers (`<h2>`, `<h3>`)

```tsx
// ❌ BEFORE
<h2 className="text-xl font-semibold text-primary mb-4">Section Title</h2>;

// ✅ AFTER
import { Heading } from "@/components/ui/Typography";

<Heading level="h2" className="text-primary mb-4">
  Section Title
</Heading>;
```

#### 2. Subsection Headers (`<h3>`, `<h4>`)

```tsx
// ❌ BEFORE
<h3 className="text-lg font-semibold text-(--text-primary)">
  Subsection
</h3>

// ✅ AFTER
<Heading level="h3" className="text-(--text-primary)">
  Subsection
</Heading>
```

#### 3. Body Text (`<p>`, `<span>`)

```tsx
// ❌ BEFORE
<p className="text-sm text-(--text-secondary)">Description text</p>;

// ✅ AFTER
import { Body } from "@/components/ui/Typography";

<Body variant="secondary" className="text-sm">
  Description text
</Body>;
```

#### 4. Small Labels/Captions

```tsx
// ❌ BEFORE
<span className="text-sm text-(--text-tertiary)">Helper text</span>;

// ✅ AFTER
import { Caption } from "@/components/ui/Typography";

<Caption variant="muted">Helper text</Caption>;
```

---

## 📁 File Priority List

### High Priority (Do First)

1. **src/app/profile/page.tsx** - 8 violations
   - Lines: 388, 525, 587, 625, 669, 710, 776, 815
   - Mix of `<h2>`, `<h3>`, `<h4>`, `<span>`

2. **src/app/workouts/history/page.tsx** - 12 violations
   - Lines: 313, 403, 407, 417, 432, 480, 493, 536, 546, 550, 563, 566
   - Mix of `<h3>`, `<h4>`, `<p>`, `<span>`

3. **src/components/ProgressAnalyticsDashboard.tsx** - 10 violations
   - Lines: 195, 217, 239, 263, 281, 290, 299, 308, 319, 377
   - Mix of `<h3>`, `<p>`, `<span>`

### Medium Priority

4. **src/app/authenticated-home.tsx** - 2 violations
   - Lines: 33, 37
   - `<span>`, `<p>`

5. **src/app/settings/page.tsx** - 1 violation
   - Line: 40
   - `<h2>`

6. **src/app/athletes/page.tsx** - 4 violations
   - Lines: 463, 473, 483, 538
   - `<span>`, `<h3>`

7. **src/app/athletes/components/GroupsSection.tsx** - 2 violations
   - Lines: 48, 109
   - `<h3>`, `<h4>`

8. **src/components/TodayOverview.tsx** - 1 violation
   - Line: 73
   - `<h2>`

9. **src/components/WorkoutView.tsx** - 1 violation
   - Line: 264
   - `<span>`

10. **src/components/NotificationPreferences.tsx** - 2 violations
    - Lines: 144, 208
    - `<h3>`

11. **src/components/WorkoutHeader.tsx** - 1 violation
    - Line: 65
    - `<h1>`

12. **src/components/PerformanceDashboard.tsx** - 2 violations
    - Lines: 122, 374
    - `<h3>`

13. **src/components/BulkOperationHistory.tsx** - 1 violation
    - Line: 190
    - `<h3>`

---

## 🔧 Step-by-Step Process

### For Each File:

1. **Open file and locate violations**

   ```bash
   # Use line numbers from audit report
   ```

2. **Add Typography imports at top**

   ```tsx
   import {
     Display,
     Heading,
     Body,
     Label,
     Caption,
   } from "@/components/ui/Typography";
   ```

3. **Replace elements one by one**
   - Use pattern reference above
   - Keep className props that are design tokens
   - Remove size/weight classes (handled by component)

4. **Save and test**

   ```bash
   npm run typecheck
   ```

5. **Visual verification**
   - Check in browser
   - Verify responsive behavior
   - Test dark mode (if applicable)

---

## ⚡ Quick Tips

### Keep These Classes

- ✅ Design token colors: `text-primary`, `text-navy-700`
- ✅ Spacing: `mb-4`, `mt-2`, `gap-3`
- ✅ Layout: `flex`, `items-center`, `justify-between`
- ✅ Responsive: `sm:text-lg`, `md:mb-6`

### Remove These Classes

- ❌ Font sizes: `text-xl`, `text-lg`, `text-sm`
- ❌ Font weights: `font-bold`, `font-semibold`
- ❌ Generic colors: `text-gray-600` (shouldn't exist anyway)

### Special Cases

**When element has complex styling:**

```tsx
// Keep wrapper div for layout, use Typography inside
<div className="flex items-center gap-2 mb-4">
  <Icon className="w-5 h-5" />
  <Heading level="h3">Title</Heading>
</div>
```

**When using semantic HTML for SEO:**

```tsx
// Typography components render semantic HTML
<Heading level="h1">  // Renders <h1>
<Heading level="h2">  // Renders <h2>
<Body>                // Renders <p>
```

---

## ✅ Testing Checklist

After modifying each file:

- [ ] TypeScript compiles: `npm run typecheck`
- [ ] No visual regressions
- [ ] Text is readable
- [ ] Spacing looks correct
- [ ] Mobile responsive works
- [ ] Semantic HTML preserved
- [ ] Accessibility maintained

---

## 📊 Track Your Progress

```
Phase 2 Progress: [____________________] 0/13 files

High Priority (3 files):
[ ] profile/page.tsx
[ ] workouts/history/page.tsx
[ ] ProgressAnalyticsDashboard.tsx

Medium Priority (10 files):
[ ] authenticated-home.tsx
[ ] settings/page.tsx
[ ] athletes/page.tsx
[ ] GroupsSection.tsx
[ ] TodayOverview.tsx
[ ] WorkoutView.tsx
[ ] NotificationPreferences.tsx
[ ] WorkoutHeader.tsx
[ ] PerformanceDashboard.tsx
[ ] BulkOperationHistory.tsx
```

---

## 🚀 Estimated Timeline

- **High Priority (3 files):** 1.5-2 hours
- **Medium Priority (10 files):** 2-2.5 hours
- **Testing & Verification:** 30 minutes

**Total Phase 2:** 4-5 hours

---

## 💡 Common Issues & Solutions

### Issue: Typography component not styling correctly

**Solution:** Check if conflicting className overrides component defaults

### Issue: TypeScript error on level prop

**Solution:** Use `level="h1"` not `level={1}`, must be string literal

### Issue: Text looks different after change

**Solution:** Typography components use design tokens - this is expected and desired!

### Issue: Layout breaks after replacement

**Solution:** Wrap in div for layout, use Typography for text content only

---

**Ready to start Phase 2?** Pick a high-priority file and follow the patterns above!
