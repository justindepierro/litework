# Performance Baseline & Optimization Plan
**Date:** November 12, 2025  
**Project:** LiteWork - Workout Tracker  
**Status:** Baseline Analysis Complete

---

## Executive Summary

Current application performance analysis based on Next.js 16 build output and codebase review. All pages are successfully pre-rendered as static content, providing excellent baseline performance.

---

## Build Analysis

### Route Configuration ✅
```
All 22 routes: ○ (Static) - prerendered as static content
```

**Routes:**
- ✅ `/` - Landing
- ✅ `/dashboard` - Main dashboard
- ✅ `/athletes` - Athlete management
- ✅ `/workouts` - Workout library
- ✅ `/workouts/history` - Workout history
- ✅ `/profile` - User profile
- ✅ `/notifications` - Notifications
- ✅ `/schedule` - Calendar
- ✅ `/progress` - Progress tracking
- ✅ `/settings` - Settings
- ✅ Auth pages (login, signup, reset-password, update-password)
- ✅ Utility pages (offline, diagnose, performance-demo, pwa-demo, setup, simple, test)

**Performance Impact:** Excellent - Static pages = fast initial load, CDN cacheable

---

## Current Optimizations ✅

### 1. **Code Splitting** ✅
- Next.js automatic code splitting per route
- Dynamic imports for heavy components
- Lazy loading patterns in place

### 2. **React Performance** ✅
- `useMemo` for expensive computations
- `useCallback` for stable function references
- `React.memo` for pure components
- Proper dependency arrays in hooks

### 3. **Animation Performance** ✅
- Framer Motion with GPU acceleration
- `will-change` properties for transforms
- Spring physics (60fps target)
- Respects `prefers-reduced-motion`

### 4. **Loading Optimization** ✅
- Skeleton screens with 300ms minimum
- `useMinimumLoadingTime` hook prevents flashing
- Progressive loading patterns
- Optimistic UI updates

### 5. **PWA Configuration** ✅
- Service worker for offline capability
- Manifest for app installation
- Caching strategies in place

---

## Optimization Opportunities 🎯

### Priority 1: High Impact, Low Effort

#### 1.1 Font Optimization
**Current State:** Font loading not optimized  
**Target:** Preload critical fonts, use `font-display: swap`

**Action Items:**
```typescript
// In layout.tsx or _document.tsx
<link
  rel="preload"
  href="/fonts/Inter-Variable.woff2"
  as="font"
  type="font/woff2"
  crossOrigin="anonymous"
/>
```

**Expected Impact:**
- Reduce First Contentful Paint (FCP) by 200-400ms
- Eliminate font flash (FOIT/FOUT)
- Lighthouse score: +5-10 points

---

#### 1.2 Image Optimization
**Current State:** No images currently in use (icon-based UI)  
**Future Proof:** Ready for athlete photos, workout images

**Action Items:**
```typescript
// When adding images, use next/image
import Image from 'next/image';

<Image
  src="/athlete-photo.jpg"
  alt="Athlete name"
  width={400}
  height={400}
  placeholder="blur"
  blurDataURL="data:image/..." // Low-res placeholder
  loading="lazy" // Lazy load below fold
/>
```

**Expected Impact:**
- Automatic WebP/AVIF conversion
- Responsive images (srcset)
- Lazy loading below fold
- Lighthouse score: +10-15 points (when images added)

---

#### 1.3 Bundle Analysis
**Current State:** No bundle size analysis performed  
**Action:** Generate bundle analysis report

**Action Items:**
```bash
npm install --save-dev @next/bundle-analyzer
```

```javascript
// next.config.ts
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

module.exports = withBundleAnalyzer(nextConfig);
```

**Run:**
```bash
ANALYZE=true npm run build
```

**Expected Insights:**
- Identify largest dependencies
- Find duplicate code
- Discover tree-shaking opportunities

---

### Priority 2: Medium Impact, Medium Effort

#### 2.1 API Route Optimization
**Current State:** All API routes use cookies (dynamic rendering)  
**Observation:** Expected for authenticated routes

**Action Items:**
- Implement API response caching where appropriate
- Use SWR/React Query for client-side caching
- Consider edge caching for public data

```typescript
// Example: Cache exercise library (static data)
export const revalidate = 3600; // Revalidate every hour

export async function GET() {
  const exercises = await getExercises();
  return NextResponse.json(exercises, {
    headers: {
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200'
    }
  });
}
```

**Expected Impact:**
- Reduce API response times by 50-80%
- Lower database load
- Better user experience

---

#### 2.2 Critical CSS Extraction
**Current State:** Tailwind CSS loaded in full  
**Target:** Inline critical CSS, defer non-critical

**Action Items:**
- Use Next.js CSS optimization (already enabled)
- Consider critical CSS plugin for above-fold content
- Purge unused Tailwind classes (already configured)

**Expected Impact:**
- Faster First Contentful Paint (FCP)
- Reduce render-blocking CSS
- Lighthouse score: +5-8 points

---

#### 2.3 Database Query Optimization
**Current State:** Supabase queries throughout app  
**Target:** Optimize query patterns, add indexes

**Action Items:**
1. Analyze slow queries in Supabase dashboard
2. Add database indexes for frequently queried fields
3. Use `select` to limit columns returned
4. Implement query batching where possible

**Example:**
```typescript
// Before: Fetch all columns
const { data } = await supabase
  .from('workouts')
  .select('*');

// After: Fetch only needed columns
const { data } = await supabase
  .from('workouts')
  .select('id, name, estimated_duration, created_at');
```

**Expected Impact:**
- Reduce API response times by 30-50%
- Lower bandwidth usage
- Better mobile performance

---

### Priority 3: Low Impact, High Effort

#### 3.1 Service Worker Enhancement
**Current State:** Basic PWA service worker  
**Target:** Advanced caching strategies

**Action Items:**
- Implement runtime caching for API responses
- Add offline page with useful content
- Cache workout data for offline access
- Implement background sync for pending actions

**Expected Impact:**
- Better offline experience
- Faster repeat visits
- Reduced server load

---

#### 3.2 Component Lazy Loading
**Current State:** Some dynamic imports in place  
**Target:** Lazy load all heavy components

**Action Items:**
```typescript
// Lazy load modals and heavy components
const WorkoutEditor = dynamic(() => import('@/components/WorkoutEditor'), {
  loading: () => <SkeletonModal />,
  ssr: false
});

const GroupAssignmentModal = dynamic(() => import('@/components/GroupAssignmentModal'), {
  loading: () => <SkeletonModal />,
  ssr: false
});
```

**Expected Impact:**
- Reduce initial bundle size by 20-30KB per lazy component
- Faster Time to Interactive (TTI)
- Better mobile performance

---

## Performance Metrics Target

### Current (Estimated)
Based on static rendering and optimizations in place:
- **Performance:** 85-90
- **Accessibility:** 95-98
- **Best Practices:** 90-95
- **SEO:** 95-100

### Target (After Optimizations)
- **Performance:** 95+ ✅
- **Accessibility:** 100 ✅
- **Best Practices:** 100 ✅
- **SEO:** 95+ ✅

---

## Quick Wins (Today)

1. ✅ **Zero TypeScript Errors** - Already achieved
2. ✅ **Production Build Success** - Already achieved
3. ⏳ **Bundle Analysis** - Run `ANALYZE=true npm run build`
4. ⏳ **Font Preloading** - Add to layout.tsx
5. ⏳ **API Response Headers** - Add cache headers to static endpoints

---

## Monitoring & Testing

### Tools to Use:
1. **Lighthouse** - Chrome DevTools → Lighthouse tab
2. **WebPageTest** - https://webpagetest.org
3. **Next.js Analytics** - Vercel Analytics (if deployed)
4. **Bundle Analyzer** - `ANALYZE=true npm run build`

### Metrics to Track:
- First Contentful Paint (FCP) - Target: <1.8s
- Largest Contentful Paint (LCP) - Target: <2.5s
- Total Blocking Time (TBT) - Target: <200ms
- Cumulative Layout Shift (CLS) - Target: <0.1
- Speed Index - Target: <3.4s

---

## Next Steps

1. **Immediate (Today):**
   - Run bundle analysis
   - Document current bundle sizes
   - Identify optimization opportunities

2. **Short-term (This Week):**
   - Add font preloading
   - Optimize API caching
   - Lazy load heavy modals

3. **Long-term (Next Week):**
   - Database query optimization
   - Enhanced service worker
   - Performance monitoring dashboard

---

## Conclusion

**Current Status:** Strong baseline with static rendering and good React patterns.

**Priority Focus:** Font optimization and bundle analysis will provide the biggest wins with minimal effort.

**Overall Assessment:** Application is well-optimized for a modern React/Next.js app. Focus should be on incremental improvements rather than major refactoring.
