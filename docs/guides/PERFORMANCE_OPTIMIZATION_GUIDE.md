# Performance Optimization Quick Reference

**Last Updated**: November 21, 2025

## Current Performance Metrics

| Metric            | Current | Target | Priority  |
| ----------------- | ------- | ------ | --------- |
| Performance Score | 68%     | 90%+   | High      |
| Accessibility     | 95%     | 95%+   | ✅ Done   |
| Best Practices    | 96%     | 95%+   | ✅ Done   |
| SEO               | 100%    | 95%+   | ✅ Done   |
| FCP               | 0.9s    | <1.8s  | ✅ Done   |
| LCP               | 8.3s    | <2.5s  | ⚠️ High   |
| TBT               | 250ms   | <200ms | ⚠️ Medium |
| CLS               | 0       | <0.1   | ✅ Done   |

## Priority Optimizations

### 🔴 HIGH PRIORITY: Reduce Unused JavaScript (-2.1s)

**Impact**: ~2,140ms savings

**Action Items**:

```typescript
// 1. Lazy load heavy modals
// Before: Direct import
import WorkoutEditor from '@/components/WorkoutEditor';

// After: Dynamic import with loading state
const WorkoutEditor = dynamic(() => import('@/components/WorkoutEditor'), {
  loading: () => <LoadingSpinner />,
  ssr: false
});

// Apply to:
// - WorkoutEditor.tsx
// - GroupAssignmentModal.tsx
// - AthleteModificationModal.tsx
// - WorkoutView.tsx (if not needed immediately)
```

**Files to Update**:

- `src/app/dashboard/page.tsx`
- `src/app/workouts/page.tsx`
- Any page importing heavy modals

**Estimate**: 1-2 hours  
**Potential Gain**: Performance score 68% → 85%+

---

### 🟡 MEDIUM PRIORITY: Optimize LCP (8.3s → <2.5s)

**Current Issue**: Largest Contentful Paint at 8.3s

**Action Items**:

1. **Preload Critical Resources**:

```html
<!-- In app/layout.tsx or next.config.ts -->
<link
  rel="preload"
  as="font"
  href="/fonts/inter-var.woff2"
  crossorigin="anonymous"
/>
```

2. **Optimize Initial Paint**:

```typescript
// Use React Server Components for data-heavy pages
// Convert dashboard to RSC pattern
// Example: app/dashboard/page.tsx
export default async function DashboardPage() {
  // Fetch data server-side
  const data = await fetchDashboardData();
  return <DashboardClient data={data} />;
}
```

3. **Image Optimization**:

```typescript
// Use Next.js Image component with priority
import Image from 'next/image';

<Image
  src="/hero-image.jpg"
  alt="Dashboard"
  priority // Preload above-fold images
  width={1200}
  height={600}
/>
```

**Estimate**: 3-4 hours  
**Potential Gain**: LCP 8.3s → 3-4s

---

### 🟢 LOW PRIORITY: Reduce TBT (250ms → <200ms)

**Action Items**:

1. **Break Up Long Tasks**:

```typescript
// Use setTimeout to yield to browser
async function processLargeDataset(items: any[]) {
  for (let i = 0; i < items.length; i += 50) {
    const batch = items.slice(i, i + 50);
    processBatch(batch);

    // Yield every 50 items
    await new Promise((resolve) => setTimeout(resolve, 0));
  }
}
```

2. **Defer Non-Critical JavaScript**:

```typescript
// Use next/dynamic with loading: () => null for non-critical features
const Analytics = dynamic(() => import("@/lib/analytics"), {
  ssr: false,
  loading: () => null,
});
```

**Estimate**: 2-3 hours  
**Potential Gain**: TBT 250ms → 180ms

---

## Quick Wins (< 1 hour each)

### 1. Production Build Test

```bash
npm run build
npm run start
# Run Lighthouse on production build (more accurate)
npx lighthouse http://localhost:3000 --view
```

### 2. Font Display Strategy

```css
/* In globals.css or font definitions */
@font-face {
  font-family: "Inter";
  font-display: swap; /* Prevent invisible text */
  /* ... */
}
```

### 3. Remove Development-Only Code

```typescript
// Check for any dev-only code in production
if (process.env.NODE_ENV === "development") {
  // This should NOT run heavy operations
}
```

---

## Bundle Optimization Checklist

- [ ] Lazy load WorkoutEditor modal
- [ ] Lazy load GroupAssignmentModal
- [ ] Lazy load AthleteModificationModal
- [ ] Review and remove unused dependencies
- [ ] Test with `npm run build` (production mode)
- [ ] Run bundle analyzer when Turbopack supports it

---

## Testing Performance Improvements

### Before Making Changes

```bash
# 1. Build and serve production
npm run build && npm run start

# 2. Run Lighthouse
npx lighthouse http://localhost:3000 \
  --output=html \
  --output-path=./lighthouse-before.html

# 3. Note scores in checklist above
```

### After Making Changes

```bash
# 1. Rebuild
npm run build && npm run start

# 2. Run Lighthouse again
npx lighthouse http://localhost:3000 \
  --output=html \
  --output-path=./lighthouse-after.html

# 3. Compare results
open lighthouse-before.html lighthouse-after.html
```

---

## Resources

- [Next.js Performance Optimization](https://nextjs.org/docs/app/building-your-application/optimizing)
- [Web Vitals Guide](https://web.dev/vitals/)
- [Lighthouse Scoring Calculator](https://googlechrome.github.io/lighthouse/scorecalc/)
- [React Performance Optimization](https://react.dev/learn/render-and-commit)

---

## Notes

- **Dev vs Production**: Performance scores in development mode are ~30% lower than production
- **Bundle Analyzer**: Wait for Turbopack compatibility or temporarily disable Turbopack
- **LCP**: Current 8.3s likely due to dev mode overhead - test production build first
- **Progressive Enhancement**: Core functionality works, optimizations improve experience

---

**Next Review**: After implementing lazy loading (estimated 2 weeks)  
**Target Performance Score**: 90%+ in production build
