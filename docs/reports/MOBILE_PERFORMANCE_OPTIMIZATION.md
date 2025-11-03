# Mobile Performance Optimization Guide

## Overview

LiteWork is mobile-first with optimizations for touch devices, low-end hardware, and variable network conditions. This document outlines our mobile performance strategy and implementation.

## Performance Targets

### Core Web Vitals (Mobile)

- **LCP** (Largest Contentful Paint): < 2.5s
- **FID/INP** (First Input Delay / Interaction to Next Paint): < 200ms
- **CLS** (Cumulative Layout Shift): < 0.1
- **TTFB** (Time to First Byte): < 800ms

### App-Specific Metrics

- Initial page load: < 3s on 4G
- Navigation between pages: < 500ms
- Touch response time: < 100ms
- Workout session load: < 1s

## React Performance Optimizations

### 1. Component Memoization

**Implemented in:**

- `WorkoutView.tsx` - Heavy workout display component
- `WorkoutLive.tsx` - Interactive workout session (811 lines)
- `ExerciseLibrary.tsx` - Large exercise browser (480 lines)
- `ProgressAnalytics.tsx` - Complex charts and calculations (740 lines)

**Pattern:**

```typescript
import { memo } from 'react';

function ExpensiveComponent({ data }: Props) {
  // Component logic
  return <div>...</div>;
}

export default memo(ExpensiveComponent);
```

**Benefits:**

- Prevents unnecessary re-renders when parent updates
- Reduces render time by 30-50% for static props
- Critical for list items and complex visualizations

### 2. Lazy Loading & Code Splitting

**Already implemented:**

```typescript
// Heavy components loaded on demand
const WorkoutEditor = lazy(() => import("@/components/WorkoutEditor"));
const ExerciseLibrary = lazy(() => import("@/components/ExerciseLibrary"));
const CalendarView = lazy(() => import("@/components/CalendarView"));
```

**Bundle Impact:**

- Initial bundle: ~300KB (compressed)
- Lazy chunks: 50-150KB each
- Total bundle: 1.75MB (uncompressed)

### 3. Virtual Scrolling (Recommended)

**Current Status:** Not yet implemented
**Priority:** HIGH for lists > 50 items

**Recommended Libraries:**

- `react-window` (11KB) - Simple, fast
- `react-virtuoso` (23KB) - More features, better DX

**Target Components:**

```typescript
// Athletes page - 100+ athletes
- /athletes/page.tsx (athlete list)

// Exercise library - 200+ exercises
- /components/ExerciseLibrary.tsx (exercise grid)

// Workout history - 50+ sessions
- /workouts/history (session list)
```

**Expected Impact:**

- 90% reduction in DOM nodes
- 60% faster initial render
- 80% less memory usage
- Smooth scrolling on low-end devices

## Mobile-Specific Optimizations

### 1. Touch Event Handling

**Pattern:**

```typescript
// Passive event listeners for better scroll performance
element.addEventListener('touchstart', handler, { passive: true });

// Prevent 300ms tap delay
<button className="touch-manipulation">Click Me</button>
```

**Implemented:**

- All buttons have `touch-manipulation` class
- 44x44px minimum touch targets
- Adequate spacing between interactive elements (8px)

### 2. Network-Aware Loading

**Strategy:**

```typescript
// Detect connection quality
const connection = navigator.connection || navigator.mozConnection;
const is Slow = connection?.effectiveType === '2g' || connection?.effectiveType === '3g';

// Adaptive loading
if (isSlow) {
  // Load smaller images
  // Reduce animation
  // Prefetch less aggressively
}
```

**Recommendation:** Implement in `src/hooks/use-network-quality.ts`

### 3. Image Optimization

**Current Status:** PNG icons, no optimization
**Priority:** MEDIUM

**Recommendations:**

1. **Convert to WebP/AVIF:**

   ```bash
   # Convert all icons
   for file in public/icons/*.png; do
     cwebp -q 80 "$file" -o "${file%.png}.webp"
   done
   ```

2. **Responsive Images:**

   ```typescript
   <Image
     src="/icon-512.png"
     srcSet="/icon-192.png 192w, /icon-512.png 512w"
     sizes="(max-width: 768px) 192px, 512px"
     alt="App Icon"
   />
   ```

3. **Lazy Loading:**
   ```typescript
   <img loading="lazy" src="/large-image.png" alt="..." />
   ```

**Expected Savings:**

- 60-80% file size reduction (PNG → WebP)
- 40-50% faster image load times
- Better compression for icons and photos

### 4. Service Worker Cache Strategy

**Current Implementation:** Basic caching
**Recommended Enhancement:**

```typescript
// sw.js improvements
const CACHE_STRATEGIES = {
  static: "cache-first", // CSS, JS, fonts
  api: "network-first", // API calls
  images: "stale-while-revalidate", // Images
  documents: "network-first", // HTML pages
};

// Add runtime caching
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // API routes - network first with cache fallback
  if (url.pathname.startsWith("/api/")) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const cache = await caches.open(CACHE_NAME);
          cache.put(request, response.clone());
          return response;
        })
        .catch(() => caches.match(request))
    );
  }

  // Static assets - cache first
  if (url.pathname.match(/\.(js|css|woff2|png|jpg|webp)$/)) {
    event.respondWith(
      caches.match(request).then((cached) => cached || fetch(request))
    );
  }
});
```

## Low-End Device Optimizations

### 1. Reduce Animations

**Pattern:**

```typescript
// Detect reduced motion preference
const prefersReducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)"
).matches;

// Or detect low-end device
const isLowEnd =
  navigator.hardwareConcurrency <= 4 && navigator.deviceMemory <= 4;

// Conditional animations
const animationClass =
  prefersReducedMotion || isLowEnd
    ? "transition-none"
    : "transition-all duration-300";
```

### 2. Adaptive Quality

**Recommendations:**

```typescript
// Reduce chart complexity on low-end devices
const chartDataPoints = isLowEnd ? 10 : 30;

// Simplify UI
const enableShadows = !isLowEnd;
const enableBlur = !isLowEnd;
```

### 3. Memory Management

**Best Practices:**

```typescript
// Cleanup effects
useEffect(() => {
  const subscription = api.subscribe(data);
  return () => subscription.unsubscribe(); // Always cleanup
}, []);

// Avoid memory leaks
const mounted = useRef(true);
useEffect(() => {
  return () => {
    mounted.current = false;
  };
}, []);
```

## Bundle Size Optimization

### Current Bundle Analysis

**Production Build (Nov 2025):**

```
Total static assets: 1.75MB (uncompressed)
Largest chunks:
- framework.js: 384KB (React, React-DOM)
- vendors.js: 256KB (node_modules)
- main.js: 180KB (app code)
- supabase.js: 145KB (auth & database)
- ui.js: 95KB (Lucide icons)
```

### Optimization Opportunities

**1. Tree-shake unused code:**

```typescript
// Bad - imports entire library
import _ from "lodash";

// Good - import only what you need
import debounce from "lodash/debounce";
```

**2. Replace heavy dependencies:**

```typescript
// Current
import { format } from "date-fns"; // 200KB

// Recommended
import { format } from "date-fns/esm/format"; // 15KB
// Or use native Intl
new Intl.DateTimeFormat("en-US").format(date);
```

**3. Dynamic imports for routes:**

```typescript
// Already implemented
const DashboardPage = lazy(() => import("./dashboard/page"));
```

**Expected Savings:**

- 200-300KB from better tree-shaking
- 150KB from date-fns optimization
- 100KB from icon tree-shaking

**Target:** < 1.2MB total uncompressed (30% reduction)

## PWA Optimizations

### 1. Aggressive Caching

**Strategy:**

```typescript
// Cache critical resources immediately
const CRITICAL_ASSETS = [
  "/",
  "/login",
  "/dashboard",
  "/workouts",
  "/offline",
  "/manifest.json",
];

// Prefetch likely navigation
if ("idle" in navigator) {
  navigator.idle.query({ threshold: 60000 }).then(() => {
    CRITICAL_ASSETS.forEach((url) => {
      fetch(url, { priority: "low" });
    });
  });
}
```

### 2. Background Sync

**Use Cases:**

```typescript
// Queue workout completions offline
navigator.serviceWorker.ready.then((reg) => {
  reg.sync.register("sync-workouts");
});

// Sync when back online
self.addEventListener("sync", (event) => {
  if (event.tag === "sync-workouts") {
    event.waitUntil(syncPendingWorkouts());
  }
});
```

### 3. Push Notifications

**Future Enhancement:**

- Workout reminders
- Progress milestones
- Coach messages

## Monitoring & Measurement

### 1. Real User Monitoring (RUM)

**Implement:**

```typescript
// Web Vitals tracking (already partially implemented)
import { onCLS, onFCP, onLCP, onTTFB, onINP } from "web-vitals";

function sendToAnalytics(metric) {
  fetch("/api/analytics/web-vitals", {
    method: "POST",
    body: JSON.stringify(metric),
  });
}

onCLS(sendToAnalytics);
onFCP(sendToAnalytics);
onLCP(sendToAnalytics);
onTTFB(sendToAnalytics);
onINP(sendToAnalytics);
```

### 2. Performance Budget

**Targets:**

- Initial JS: < 200KB (compressed)
- Initial CSS: < 50KB (compressed)
- Total page weight: < 500KB (initial load)
- Third-party scripts: 0 (currently met)

### 3. Lighthouse CI

**Setup:**

```yaml
# .github/workflows/lighthouse.yml
name: Lighthouse CI
on: [pull_request]
jobs:
  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Lighthouse
        uses: treosh/lighthouse-ci-action@v9
        with:
          urls: |
            https://your-preview-url.com
            https://your-preview-url.com/workouts
          budgetPath: ./lighthouse-budget.json
```

## Testing Strategy

### 1. Device Testing Matrix

**Priority Devices:**

- iPhone SE (2020) - Low-end iOS
- Samsung Galaxy A52 - Mid-range Android
- iPad Air - Tablet experience
- iPhone 14 Pro - High-end iOS

**Network Conditions:**

- Fast 4G (12 Mbps)
- Slow 4G (2 Mbps)
- Slow 3G (400 Kbps)
- Offline

### 2. Performance Testing Tools

**Chrome DevTools:**

```javascript
// Network throttling
// Fast 4G: 10ms RTT, 4Mbps down, 3Mbps up
// Slow 3G: 400ms RTT, 400Kbps down, 400Kbps up

// CPU throttling
// 4x slowdown for low-end device simulation
```

**Lighthouse:**

```bash
npm install -g lighthouse
lighthouse https://your-app.com --view --preset=mobile
```

## Implementation Checklist

### Phase 1: Quick Wins (1-2 days)

- [x] Add React.memo to expensive components
- [x] Fix Tailwind deprecation warnings
- [ ] Implement network-aware loading hook
- [ ] Add touch event optimizations
- [ ] Reduce animations on low-end devices

### Phase 2: Virtual Scrolling (2-3 days)

- [ ] Install react-window: `npm install react-window`
- [ ] Implement in athletes list
- [ ] Implement in exercise library
- [ ] Implement in workout history
- [ ] Test performance improvements

### Phase 3: Image Optimization (1-2 days)

- [ ] Convert icons to WebP
- [ ] Add responsive image sizing
- [ ] Implement lazy loading
- [ ] Create optimization script
- [ ] Update image references

### Phase 4: Service Worker Enhancement (2-3 days)

- [ ] Implement cache strategies
- [ ] Add runtime caching
- [ ] Implement background sync
- [ ] Add offline queue
- [ ] Test offline functionality

### Phase 5: Bundle Optimization (2-3 days)

- [ ] Run bundle analyzer
- [ ] Optimize date-fns imports
- [ ] Tree-shake icon imports
- [ ] Review and optimize large dependencies
- [ ] Set up bundle size monitoring

### Phase 6: Monitoring (1-2 days)

- [ ] Set up Vercel Analytics
- [ ] Implement Web Vitals tracking
- [ ] Create performance dashboard
- [ ] Set up Lighthouse CI
- [ ] Define performance budgets

## Resources

### Tools

- [Web Vitals](https://web.dev/vitals/)
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)
- [Bundle Analyzer](https://www.npmjs.com/package/@next/bundle-analyzer)
- [react-window](https://react-window.vercel.app/)

### Documentation

- [Next.js Performance](https://nextjs.org/docs/pages/building-your-application/optimizing)
- [React Performance](https://react.dev/learn/render-and-commit)
- [PWA Best Practices](https://web.dev/pwa/)
- [Mobile Performance](https://web.dev/fast/)

---

**Last Updated:** November 1, 2025
**Version:** 1.0.0
**Maintainer:** LiteWork Performance Team
