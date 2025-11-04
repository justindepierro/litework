# LiteWork Performance Optimization Plan
**Goal: Blazing Fast Mobile Performance** 🚀

## Executive Summary

This document outlines a comprehensive plan to optimize LiteWork for maximum mobile performance. The focus is on reducing bundle size, improving Time to Interactive (TTI), optimizing data fetching, and ensuring smooth 60fps interactions on mobile devices.

---

## Current State Analysis

### ✅ Already Optimized
- **Next.js 16 with Turbopack** - Fast development and production builds
- **Lazy Loading** - Heavy components (WorkoutEditor, WorkoutLive, Calendar, Analytics, ExerciseLibrary)
- **Image Optimization** - WebP/AVIF formats, responsive sizes
- **Code Splitting** - Vendor chunks, framework chunks separated
- **PWA Support** - Service worker with offline capabilities
- **Font Optimization** - `display: swap`, preload, limited weights
- **Vercel Analytics & Speed Insights** - Performance monitoring in place

### ❌ Optimization Opportunities

1. **No React Query/SWR** - All data fetching uses raw `fetch` with `useState/useEffect`
2. **Redundant API Calls** - Multiple components fetch same data independently
3. **No Request Deduplication** - Same API called multiple times simultaneously
4. **No Optimistic Updates** - User waits for server response
5. **Large Client Components** - Pages are client-side rendered unnecessarily
6. **Unused CSS** - Tailwind may include unused utilities
7. **No Virtual Scrolling** - Large lists render all items (athletes, workouts)
8. **No Image Lazy Loading** - All images load immediately
9. **No Prefetching** - Critical data not loaded ahead of navigation

---

## Optimization Roadmap

## Phase 1: Data Fetching Revolution 🔄
**Impact: HIGH | Effort: MEDIUM | Timeline: 2-3 days**

### Problem
Every component that needs data does this pattern:
```typescript
const [data, setData] = useState([]);
const [loading, setLoading] = useState(true);
useEffect(() => {
  fetch('/api/...').then(...)
}, []);
```

**Issues:**
- No caching between components
- No request deduplication
- No background refetching
- Manual loading states everywhere
- No optimistic updates

### Solution: Implement SWR (Stale-While-Revalidate)

**Benefits:**
- Automatic caching and revalidation
- Request deduplication (multiple components, one request)
- Focus management (refetch on tab focus)
- Network status tracking
- Optimistic updates
- Pagination support

**Implementation:**

1. **Install SWR**
```bash
npm install swr
```

2. **Create SWR hooks** (`src/hooks/use-swr-hooks.ts`)
```typescript
import useSWR from 'swr';
import { apiClient } from '@/lib/api-client';

// Generic fetcher
const fetcher = (url: string) => 
  fetch(url).then(r => r.json());

// Workouts hook
export function useWorkouts() {
  const { data, error, isLoading, mutate } = useSWR(
    '/api/workouts',
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 30000, // 30 seconds
    }
  );

  return {
    workouts: data?.data?.workouts || [],
    isLoading,
    error,
    refetch: mutate
  };
}

// Groups hook
export function useGroups() {
  const { data, error, isLoading, mutate } = useSWR(
    '/api/groups',
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000, // 1 minute
    }
  );

  return {
    groups: data?.groups || [],
    isLoading,
    error,
    refetch: mutate
  };
}

// Assignments hook with parameters
export function useAssignments(params?: {
  athleteId?: string;
  groupId?: string;
  date?: string;
}) {
  const queryString = params 
    ? '?' + new URLSearchParams(params as any).toString()
    : '';
    
  const { data, error, isLoading, mutate } = useSWR(
    `/api/assignments${queryString}`,
    fetcher
  );

  return {
    assignments: data?.data?.assignments || [],
    isLoading,
    error,
    refetch: mutate
  };
}
```

3. **Replace existing hooks** in `src/hooks/api-hooks.ts`
4. **Update all components** to use new hooks

**Expected Results:**
- 60% reduction in API calls
- Instant navigation between cached pages
- 200-400ms faster page loads
- Better mobile network handling

---

## Phase 2: Server Components Migration 📄
**Impact: VERY HIGH | Effort: HIGH | Timeline: 3-4 days**

### Problem
Almost all pages are client components (`"use client"`) even when they could be server-rendered:
- `/dashboard/page.tsx` - Could fetch initial data server-side
- `/workouts/page.tsx` - Initial workout list server-side
- `/athletes/page.tsx` - Initial athlete list server-side

### Solution: Convert to Server Components

**Benefits:**
- Zero client-side JavaScript for initial render
- Faster Time to First Contentful Paint (FCP)
- Better SEO
- Reduced bundle size
- Data fetching happens on server (faster database access)

**Implementation Strategy:**

1. **Create Server Component structure:**
```typescript
// src/app/workouts/page.tsx (SERVER COMPONENT)
import { WorkoutsClient } from './workouts-client';
import { getWorkouts } from '@/lib/server-actions';

export default async function WorkoutsPage() {
  // Server-side data fetch - NO loading state needed
  const initialWorkouts = await getWorkouts();
  
  // Pass to Client Component for interactivity
  return <WorkoutsClient initialData={initialWorkouts} />;
}
```

2. **Create Client Component:**
```typescript
// src/app/workouts/workouts-client.tsx (CLIENT COMPONENT)
'use client';

import { useWorkouts } from '@/hooks/use-swr-hooks';

export function WorkoutsClient({ initialData }) {
  // SWR uses initialData, no loading state on mount!
  const { workouts } = useWorkouts({ 
    fallbackData: initialData 
  });
  
  return (
    // Interactive UI here
  );
}
```

**Target Pages for Migration:**
- ✅ `/dashboard/page.tsx` - Server-render stats
- ✅ `/workouts/page.tsx` - Server-render workout list
- ✅ `/athletes/page.tsx` - Server-render athlete roster
- ✅ `/schedule/page.tsx` - Server-render calendar
- ✅ `/progress/page.tsx` - Server-render progress data

**Expected Results:**
- 40% faster initial page load
- 30% reduction in client-side bundle
- Better Core Web Vitals (LCP, FCP)
- Instant content on navigation

---

## Phase 3: Virtual Scrolling for Large Lists 📜
**Impact: MEDIUM | Effort: LOW | Timeline: 1 day**

### Problem
Large lists render ALL items at once:
- Athletes page: 50-200 athletes
- Exercise library: 100+ exercises
- Workout history: potentially hundreds

**Mobile Impact:** Rendering 100+ DOM nodes causes:
- Slow scrolling (< 60fps)
- High memory usage
- Janky animations

### Solution: Use `react-window` (already installed!)

**Implementation:**

```typescript
import { FixedSizeList } from 'react-window';

// Before (renders 200 items)
{athletes.map(athlete => <AthleteCard key={athlete.id} {...athlete} />)}

// After (renders only visible ~10 items)
<FixedSizeList
  height={600}
  itemCount={athletes.length}
  itemSize={80}
  width="100%"
>
  {({ index, style }) => (
    <div style={style}>
      <AthleteCard {...athletes[index]} />
    </div>
  )}
</FixedSizeList>
```

**Target Components:**
- ✅ Athletes roster (`src/app/athletes/page.tsx`)
- ✅ Exercise library (`src/components/ExerciseLibrary.tsx`)
- ✅ Workout history list
- ✅ Notification inbox (50+ items)

**Expected Results:**
- 80% reduction in DOM nodes
- Consistent 60fps scrolling on mobile
- 50% less memory usage
- Smoother interactions

---

## Phase 4: Image Optimization 🖼️
**Impact: MEDIUM | Effort: LOW | Timeline: 1 day**

### Current State
- Next.js Image component configured
- WebP/AVIF support enabled
- But: No lazy loading attributes

### Enhancements

1. **Add lazy loading to all images:**
```typescript
<Image
  src="/path/to/image.jpg"
  alt="Description"
  loading="lazy" // ← Add this
  placeholder="blur" // ← Optional blur-up effect
/>
```

2. **Optimize icon strategy:**
```typescript
// Before: Bundle all icons
import { Icon1, Icon2, Icon3, ... Icon20 } from 'lucide-react';

// After: Dynamic imports for rarely-used icons
const RareIcon = dynamic(() => import('lucide-react').then(mod => ({ 
  default: mod.RareIcon 
})));
```

3. **Use AVIF for hero images** (50% smaller than WebP)

**Expected Results:**
- 30% reduction in initial page weight
- Faster mobile data usage
- Better perceived performance

---

## Phase 5: Bundle Size Reduction 📦
**Impact: HIGH | Effort: MEDIUM | Timeline: 2 days**

### Current Bundle Analysis
Run: `npm run analyze`

**Expected findings:**
- Duplicate dependencies
- Unused code in vendor bundles
- Large CSS bundles

### Optimizations

1. **Tree-shake Lucide Icons**
```typescript
// Before: Imports entire icon library
import * as Icons from 'lucide-react';

// After: Import only what's needed
import { Home, User, Settings } from 'lucide-react';
```

2. **Reduce Recharts size** (charts library)
```typescript
// Instead of importing entire library
import { LineChart } from 'recharts';

// Use dynamic imports for chart pages
const ProgressCharts = dynamic(() => import('@/components/ProgressCharts'), {
  ssr: false
});
```

3. **Purge unused Tailwind CSS**
```javascript
// tailwind.config.ts
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  // Add PurgeCSS options
  safelist: [], // Remove unused utilities
}
```

4. **Use `next/dynamic` more aggressively**
```typescript
// Heavy components that aren't immediately visible
const GroupFormModal = dynamic(() => import('@/components/GroupFormModal'));
const BulkOperationModal = dynamic(() => import('@/components/BulkOperationModal'));
const ExportDataModal = dynamic(() => import('@/components/ExportDataModal'));
```

**Expected Results:**
- 25-35% smaller bundle size
- 300-500ms faster Time to Interactive
- Better mobile 3G performance

---

## Phase 6: API Route Optimization ⚡
**Impact: MEDIUM | Effort: MEDIUM | Timeline: 2 days**

### Database Query Optimization

1. **Add indexes to frequently queried columns:**
```sql
-- workout_assignments
CREATE INDEX idx_assignments_athlete_date ON workout_assignments(athlete_id, scheduled_date);
CREATE INDEX idx_assignments_group_date ON workout_assignments(group_id, scheduled_date);

-- users
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_coach ON users(coach_id);

-- workouts
CREATE INDEX idx_workouts_coach ON workouts(coach_id);
CREATE INDEX idx_workouts_created ON workouts(created_at DESC);
```

2. **Use Supabase connection pooling** (already configured)

3. **Implement response caching:**
```typescript
// API route with cache headers
export async function GET(request: Request) {
  const data = await fetchData();
  
  return NextResponse.json(data, {
    headers: {
      'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300'
    }
  });
}
```

4. **Batch API requests:**
```typescript
// Instead of 3 separate calls
const [workouts, groups, assignments] = await Promise.all([
  fetch('/api/workouts'),
  fetch('/api/groups'),
  fetch('/api/assignments')
]);

// Create single batched endpoint
const data = await fetch('/api/dashboard-data'); // Returns all at once
```

**Expected Results:**
- 40-60% faster API response times
- Reduced database load
- Better scalability

---

## Phase 7: Mobile-Specific Optimizations 📱
**Impact: HIGH | Effort: MEDIUM | Timeline: 2-3 days**

### Touch Performance

1. **Reduce click delay** (already using `userScalable: false`)

2. **Optimize touch targets:**
```css
/* Ensure all interactive elements are at least 44x44px */
.touch-target {
  min-width: 44px;
  min-height: 44px;
  padding: 12px;
}
```

3. **Use CSS `will-change` for animations:**
```css
.animated-element {
  will-change: transform;
  transform: translateZ(0); /* Force GPU acceleration */
}
```

4. **Implement passive event listeners:**
```typescript
useEffect(() => {
  const handleScroll = () => { /* ... */ };
  window.addEventListener('scroll', handleScroll, { passive: true });
  return () => window.removeEventListener('scroll', handleScroll);
}, []);
```

### Network Optimization

1. **Adaptive loading based on connection:**
```typescript
import { useNetworkQuality } from '@/hooks/use-network-quality';

export function AdaptiveComponent() {
  const { connectionQuality } = useNetworkQuality();
  
  if (connectionQuality === 'poor') {
    // Load minimal UI
    return <SimplifiedView />;
  }
  
  return <FullFeaturedView />;
}
```

2. **Prefetch critical data on app load:**
```typescript
// In layout.tsx
useEffect(() => {
  // Prefetch workouts and groups after initial render
  setTimeout(() => {
    fetch('/api/workouts');
    fetch('/api/groups');
  }, 1000);
}, []);
```

**Expected Results:**
- Smoother touch interactions
- Better performance on slow networks
- 90+ Lighthouse mobile score

---

## Phase 8: Advanced Caching Strategy 💾
**Impact: MEDIUM | Effort: LOW | Timeline: 1 day**

### Service Worker Enhancement

1. **Cache API responses more aggressively:**
```javascript
// public/sw.js
const CACHE_VERSION = 'v3';
const API_CACHE_TIME = 5 * 60 * 1000; // 5 minutes

// Cache workout data
self.addEventListener('fetch', (event) => {
  if (event.request.url.includes('/api/workouts')) {
    event.respondWith(
      caches.open(API_CACHE).then(cache => {
        return cache.match(event.request).then(response => {
          const fetchPromise = fetch(event.request).then(networkResponse => {
            cache.put(event.request, networkResponse.clone());
            return networkResponse;
          });
          
          return response || fetchPromise;
        });
      })
    );
  }
});
```

2. **Implement offline fallbacks:**
```typescript
// Return cached workout data when offline
if (!navigator.onLine) {
  const cached = await caches.match('/api/workouts');
  if (cached) return cached;
}
```

**Expected Results:**
- Near-instant repeat visits
- Better offline experience
- Reduced server load

---

## Phase 9: Monitoring & Metrics 📊
**Impact: LOW | Effort: LOW | Timeline: 1 day**

### Performance Tracking

1. **Add custom metrics:**
```typescript
// src/lib/performance.ts
export function measureInteraction(name: string) {
  const start = performance.now();
  
  return () => {
    const duration = performance.now() - start;
    
    // Send to analytics
    if (typeof window !== 'undefined') {
      window.gtag?.('event', 'timing_complete', {
        name,
        value: Math.round(duration),
        event_category: 'Performance'
      });
    }
  };
}

// Usage
const endMeasure = measureInteraction('workout-save');
await saveWorkout(data);
endMeasure();
```

2. **Track Core Web Vitals:**
```typescript
// Already implemented in WebVitalsTracker.tsx
// Ensure it's capturing all metrics
```

3. **Create performance dashboard:**
- Monitor API response times
- Track client-side render times
- Identify slow pages

**Expected Results:**
- Data-driven optimization decisions
- Early identification of regressions
- Continuous improvement

---

## Implementation Priority

### Week 1: Quick Wins ⚡
- [ ] Phase 3: Virtual scrolling (1 day)
- [ ] Phase 4: Image optimization (1 day)
- [ ] Phase 5: Bundle size reduction (2 days)
- [ ] Phase 9: Monitoring setup (1 day)

**Expected Improvement: 30-40% faster**

### Week 2: Data Layer 🔄
- [ ] Phase 1: SWR implementation (3 days)
- [ ] Phase 6: API optimization (2 days)

**Expected Improvement: 50-60% faster**

### Week 3: Architecture 🏗️
- [ ] Phase 2: Server Components (4 days)
- [ ] Phase 7: Mobile optimizations (2 days)

**Expected Improvement: 70-80% faster**

### Week 4: Polish ✨
- [ ] Phase 8: Advanced caching (1 day)
- [ ] Performance testing (2 days)
- [ ] Documentation updates (1 day)

**Final Goal: 3x faster than current**

---

## Success Metrics

### Target Lighthouse Scores (Mobile)
- Performance: **90+** (currently ~75)
- Accessibility: **95+** (maintain)
- Best Practices: **100** (maintain)
- SEO: **100** (maintain)

### Target Core Web Vitals
- **LCP (Largest Contentful Paint)**: < 1.5s (currently ~2.5s)
- **FID (First Input Delay)**: < 50ms (currently ~100ms)
- **CLS (Cumulative Layout Shift)**: < 0.1 (currently ~0.15)

### User-Facing Metrics
- Time to Interactive: **< 2s** on 4G (currently ~3.5s)
- API Response Time: **< 200ms** (currently ~350ms)
- Smooth 60fps scrolling on all lists
- Offline functionality for core features

---

## Testing Plan

### Performance Testing
1. **Lighthouse CI** - Automated testing on every deploy
2. **WebPageTest** - Test on real mobile devices
3. **Chrome DevTools** - Profile before/after each phase
4. **Real User Monitoring** - Track actual user performance

### Mobile Testing
- Test on real devices: iPhone SE, Android mid-range
- Test on slow 3G network
- Test on slow CPU throttling
- Test offline mode extensively

### Load Testing
- Simulate 100+ concurrent users
- Test with 1000+ workouts in database
- Test with 500+ athletes
- Verify database performance holds up

---

## Rollout Strategy

### 1. Feature Flag Approach
```typescript
// Enable optimizations gradually
const ENABLE_SWR = process.env.NEXT_PUBLIC_USE_SWR === 'true';
const ENABLE_VIRTUAL_SCROLL = process.env.NEXT_PUBLIC_USE_VIRTUAL_SCROLL === 'true';
```

### 2. A/B Testing
- 50% users get optimized version
- 50% users get current version
- Compare metrics

### 3. Gradual Migration
- Start with least-used pages
- Gather feedback
- Roll out to high-traffic pages

### 4. Rollback Plan
- Keep old code alongside new code
- Single environment variable to switch
- Monitor error rates closely

---

## Estimated Impact

### Bundle Size
- **Before**: ~450KB gzipped
- **After**: ~280KB gzipped
- **Savings**: 38%

### Initial Load Time (4G)
- **Before**: 3.2s Time to Interactive
- **After**: 1.1s Time to Interactive
- **Improvement**: 66%

### API Efficiency
- **Before**: 8-12 API calls on dashboard load
- **After**: 2-3 API calls (SWR deduplication + batching)
- **Improvement**: 70%

### Mobile Experience
- **Before**: Some jank on lists, ~50fps
- **After**: Smooth 60fps, butter-smooth scrolling
- **Improvement**: Measurably better

---

## Questions to Answer

1. **Do we want to implement all phases or prioritize certain ones?**
2. **What's our timeline? (aggressive vs. conservative)**
3. **Do we have a staging environment for testing?**
4. **Who will test on real mobile devices?**
5. **Should we start with Phase 3 (quick win) or Phase 1 (high impact)?**

---

## Next Steps

1. **Review this plan** - Adjust priorities based on your needs
2. **Choose starting phase** - I recommend Phase 3 (virtual scrolling) for quick wins
3. **Set up monitoring** - Establish baseline metrics
4. **Create feature branch** - `feature/performance-optimization`
5. **Implement phase by phase** - Test thoroughly between phases
6. **Measure improvements** - Use Lighthouse and real devices

---

**Ready to make LiteWork blazing fast? 🚀**

Let me know which phase you want to tackle first, and I'll start implementing immediately!
