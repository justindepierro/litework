# KPI System Audit & Integration Review

**Date**: November 9, 2025  
**Status**: 🟡 Functional but needs improvements  
**Priority**: HIGH - Data is being tracked but not displayed optimally

---

## Executive Summary

The KPI assignment system is **functionally complete** at the database and API level, but there's a **data transformation mismatch** between the database views and frontend expectations. Additionally, we're not leveraging all the incredible data we're tracking.

### Current State

✅ **Database**: Rock solid - 3 tables, 2 views, triggers working  
✅ **API**: Complete CRUD operations with authentication  
⚠️ **Frontend**: Data transformation issues, incomplete display  
❌ **Analytics**: Not utilizing KPI data for insights

---

## System Architecture

### Database Layer (PostgreSQL + Supabase)

**Tables:**

1. **`kpi_tags`** - KPI definitions (BENCH, SQUAT, etc.)
   - 8 seeded tags with colors and types
   - Custom tags can be created by coaches
2. **`athlete_assigned_kpis`** - Assignment tracking
   - Links athletes to KPI tags
   - Stores targets, dates, notes
   - Tracks assignment source (group vs individual)
3. **`exercise_kpi_tags`** - Exercise-to-KPI mapping
   - NOT YET USED - designed for volume tracking
   - Would enable "exercises contributing to BENCH KPI"

**Views:**

1. **`active_athlete_kpis`** - Flattened KPI assignments with details
   - Returns snake_case columns
   - Used by API with `with_details=true`
2. **`athlete_kpi_summary`** - Aggregated KPI counts per athlete
   - NOT YET USED on frontend

**Triggers:**

1. **`auto_assign_group_kpis()`** - Automatic KPI inheritance
   - Fires when athlete joins group or accepts invite
   - Copies group KPIs to new member

### API Layer

**Endpoints:**

- `GET /api/kpi-tags` - List all KPI tags ✅
- `POST /api/kpi-tags` - Create custom KPI ✅
- `GET /api/athlete-assigned-kpis` - List assignments ✅
- `POST /api/athlete-assigned-kpis` - Bulk assign ✅
- `PATCH /api/athlete-assigned-kpis` - Update targets ⚠️ (exists but not wired to UI)
- `DELETE /api/athlete-assigned-kpis` - Remove assignments ⚠️ (exists but not wired to UI)

**Issues Identified:**

1. ✅ **FIXED**: API returns `{ data: [...] }` but frontend expected array directly
2. ⚠️ **View returns snake_case** but frontend expects camelCase - requires transformation
3. ⚠️ **No error handling** for failed fetches in frontend

### Frontend Layer

**Components:**

1. **`KPIManagementModal`** - Create/edit KPIs ✅
2. **`BulkKPIAssignmentModal`** - Bulk assign KPIs ✅
3. **`AthleteDetailModal`** - Display assigned KPIs ⚠️ (just fixed)

**Missing UI:**

- ❌ Individual KPI assignment (not just bulk to groups)
- ❌ Edit KPI targets after assignment
- ❌ Remove KPI assignments
- ❌ KPI progress tracking dashboard
- ❌ KPI badges on athlete cards
- ❌ KPI filter in athletes list
- ❌ Volume tracking by KPI (using `exercise_kpi_tags`)

---

## Data We're Tracking (But Not Fully Utilizing)

### 1. **Athlete KPIs** (`athlete_kpis` table)

**What it stores:**

- 1RM values (bench, squat, deadlift, etc.)
- Max reps, distances, times
- Historical PR tracking

**How we're using it:** ✅ Progress Analytics modal  
**Missing opportunities:**

- Don't show PRs alongside assigned KPI targets in detail modal
- Don't correlate assigned KPIs with actual PR data
- Don't show "how close to target" visualization

### 2. **Workout Sessions** (`workout_sessions`, `session_exercises`, `set_records`)

**What it stores:**

- Every workout completed
- Every exercise performed
- Every set with weight/reps/RPE

**How we're using it:** ✅ Workout history, progress tracking  
**Missing opportunities:**

- Don't show volume trends for KPI-related exercises
- Don't calculate "weeks until target" based on current progression
- Don't suggest KPI targets based on training history

### 3. **Progress Entries** (`progress_entries`)

**What it stores:**

- Body weight tracking
- Body measurements
- Progress photos
- Notes

**How we're using it:** ✅ Progress charts  
**Missing opportunities:**

- Don't correlate body composition with strength KPIs
- Don't show "weight class" context for powerlifting KPIs

### 4. **Group Assignments**

**What it stores:**

- Which athletes belong to which groups
- Group-level KPI assignments

**How we're using it:** ✅ Bulk KPI assignment  
**Missing opportunities:**

- Don't show group leaderboards for KPIs
- Don't compare athlete KPI progress within groups
- Don't show "team average" vs individual

### 5. **Workout Assignments** (`workout_assignments`)

**What it stores:**

- Which workouts are assigned to which athletes
- Workout programming history

**Missing opportunities:**

- Don't link KPI targets to specific workout programs
- Don't show "this program targets your BENCH KPI"
- Don't auto-suggest workouts based on KPI goals

---

## Critical Issues to Fix

### Issue #1: Data Transformation Mismatch ✅ FIXED

**Problem:** API view returns `snake_case`, frontend expects `camelCase` nested objects  
**Impact:** KPIs don't display in athlete detail modal  
**Fix Applied:** Added transformation layer in `AthleteDetailModal.tsx`  
**Better Solution:** Create a dedicated API transformer utility

### Issue #2: No Individual KPI Management

**Problem:** Can only bulk assign to groups, can't manage individual athlete KPIs  
**Impact:** Can't customize targets, can't remove KPIs, can't add KPIs to one athlete  
**Fix Needed:** Build individual KPI management UI in athlete detail modal

### Issue #3: KPI Data Not Visible Enough

**Problem:** KPIs hidden in detail modal, not on athlete cards  
**Impact:** Coaches don't see at-a-glance which athletes have which KPIs  
**Fix Needed:** Add KPI badges to athlete cards, add KPI filter

### Issue #4: No Progress Visualization for KPIs

**Problem:** Can see targets but not progress toward them  
**Impact:** No feedback loop, can't tell if athlete is on track  
**Fix Needed:**

- Show current PR vs target
- Show trend line
- Show estimated time to goal

### Issue #5: Volume Tracking Not Implemented

**Problem:** `exercise_kpi_tags` table exists but unused  
**Impact:** Can't track training volume leading up to PRs  
**Fix Needed:** Wire up exercise tagging in workout editor

---

## Recommended Improvements (Priority Order)

### 🔴 Critical (Do Now)

1. ✅ **Fix KPI display in athlete modal** - DONE
2. **Add KPI badges to athlete cards** - Show 2-3 KPIs with colors
3. **Add individual KPI management** - Edit/remove from detail modal
4. **Show current PR alongside KPI target** - "315 lbs current → 405 lbs target"

### 🟡 Important (Next Sprint)

5. **KPI progress dashboard widget** - Coach overview of all athlete KPIs
6. **Group KPI leaderboard** - Compare athletes within groups
7. **KPI filter in athletes list** - "Show only athletes with BENCH KPI"
8. **Auto-suggest targets** - Based on current PRs + typical progressions

### 🟢 Enhancement (Future)

9. **Volume tracking by KPI** - Implement `exercise_kpi_tags` usage
10. **KPI-specific workout recommendations** - "Try this program to hit your squat goal"
11. **Achievement system** - Badges when athletes hit KPI targets
12. **Email notifications** - "You're 2 weeks from your target date!"

---

## API Response Format Standardization

**Current State:** Inconsistent - some endpoints return arrays, some return `{ data: [...] }`

**Proposed Standard:**

```typescript
// List endpoints
{
  data: T[],
  total?: number,
  page?: number,
  limit?: number
}

// Single item endpoints
{
  data: T
}

// Mutation endpoints
{
  success: boolean,
  data?: T,
  error?: string
}
```

**Action Required:** Audit all API routes and standardize responses

---

## Database View Optimization

**Current Issue:** Views return snake_case, frontend expects camelCase

**Option 1: Transform in API** (current approach)

- Pro: Database stays standard SQL
- Con: Transformation logic duplicated across routes

**Option 2: Transform in shared utility**

```typescript
// src/lib/api-transformers.ts
export function transformKPIAssignment(
  raw: any
): AthleteAssignedKPIWithDetails {
  return {
    id: raw.assignment_id,
    athleteId: raw.athlete_id,
    // ... etc
  };
}
```

**Option 3: Use database column aliases**

```sql
SELECT
  aak.id as "assignmentId",
  aak.athlete_id as "athleteId",
  -- etc
```

- Pro: No transformation needed
- Con: Non-standard SQL, harder to read

**Recommendation:** Option 2 - Centralized transformer utilities

---

## Type Safety Improvements

**Current Issues:**

1. `active_athlete_kpis` view columns not typed
2. API responses use `any` for transformation
3. No runtime validation of API responses

**Recommended:**

1. Generate TypeScript types from database schema
2. Use Zod for runtime validation
3. Create strict API response types

---

## Testing Gaps

**Current State:** No tests for KPI system

**Needed Tests:**

1. **Unit**: KPI assignment trigger logic
2. **Integration**: Bulk assignment API endpoint
3. **E2E**: Complete flow from assigning to displaying KPIs
4. **Data integrity**: Prevent duplicate assignments, ensure RLS works

---

## Documentation Gaps

**Current State:** Code comments exist but no user-facing docs

**Needed Docs:**

1. **Coach Guide**: "How to assign and track KPIs"
2. **API Docs**: Complete endpoint reference
3. **Database Schema**: Visual ERD of KPI tables
4. **Type Definitions**: TSDoc for all KPI interfaces

---

## Next Actions

### Immediate (Today)

1. ✅ Fix athlete detail modal KPI display
2. Test KPI assignment flow end-to-end
3. Verify trigger fires when athlete accepts invite
4. Add console logging to debug any missing KPIs

### This Week

1. Add KPI badges to athlete cards
2. Build individual KPI management UI
3. Show current PR vs target in detail modal
4. Create API transformer utility

### This Month

1. Implement KPI progress dashboard
2. Add group leaderboards
3. Wire up volume tracking
4. Build achievement system

---

## Questions for Product Decision

1. **Should we limit KPIs per athlete?** (e.g., max 5 active KPIs)
2. **Should KPI targets be required or optional?**
3. **Should we auto-suggest targets based on current PRs?**
4. **Should KPIs have expiration dates or stay active indefinitely?**
5. **Should we notify athletes when assigned new KPIs?**
6. **Should athletes be able to see their own KPIs in their athlete portal?**

---

## Related Files

**Database:**

- `database/kpi-tags-schema.sql`
- `database/athlete-assigned-kpis-schema.sql`
- `database/group-kpi-inheritance-trigger.sql`

**API:**

- `src/app/api/kpi-tags/route.ts`
- `src/app/api/athlete-assigned-kpis/route.ts`

**Components:**

- `src/components/KPIManagementModal.tsx`
- `src/components/BulkKPIAssignmentModal.tsx`
- `src/components/AthleteDetailModal.tsx`

**Types:**

- `src/types/index.ts` (lines 473-537)

---

**End of Audit**
