# Sprint 9 Pre-Review Notes

**Date**: November 10, 2025  
**Purpose**: Review existing code before building Sprint 9 features  
**Status**: ✅ Complete

---

## 🔍 Existing Code Review

### 1. ✅ Notification Service - USE THIS!

**File**: `src/lib/unified-notification-service.ts` (414 lines)

**Status**: **COMPLETE** - Multi-channel notification system ready

**Key Features**:

- ✅ Push notifications with fallback to email
- ✅ In-app notification creation
- ✅ User preference checking (push_enabled, email_enabled)
- ✅ Smart fallback logic (tries push first, then email)
- ✅ Batch notification support
- ✅ Integration with Supabase for in-app storage

**Functions Available**:

```typescript
sendNotification(recipient, payload); // Single user
sendBulkNotifications(recipients, payload); // Multiple users
createInAppNotification(userId, payload); // Direct in-app
```

**Integration Plan for Sprint 9**:

- ✅ **Use for feedback notifications** - When athlete submits feedback
- ✅ **Use for achievement notifications** - When badges are earned
- ✅ **Use for progress milestone alerts** - When PRs are achieved

**DO NOT**: Create new notification service or duplicate this logic

---

### 2. ⚡ Progress Analytics - EXTEND, DON'T REBUILD!

**File**: `src/components/ProgressAnalytics.tsx` (743 lines)

**Status**: **COMPREHENSIVE** - Already has charting infrastructure!

**Existing Features**:

- ✅ **recharts already imported!** Line, Bar, Area, Pie, Radar charts
- ✅ Multiple view modes: overview, strength, comparison, goals
- ✅ Timeframe selector: 1m, 3m, 6m, 1y
- ✅ Fetches data from `/api/analytics/athlete-analytics` endpoint
- ✅ Interface for `ExerciseProgressData` already defined
- ✅ Strength progress visualization structure exists

**Current Data Structures**:

```typescript
interface ExerciseProgressData {
  exerciseId: string;
  exerciseName: string;
  data: Array<{
    date: string;
    weight: number;
    reps: number;
    estimated1RM: number;
    volume: number;
  }>;
}
```

**What's Missing** (Sprint 9 work):

1. Need to populate `strengthProgress` data from `set_records` table
2. Need to wire up existing charts to real exercise history
3. Need to add exercise selector dropdown
4. Need to enhance API endpoint to return exercise-specific data

**Integration Plan**:

- ✅ **Extend existing component** - Don't create new ProgressGraphs.tsx
- ✅ **Use existing chart components** - recharts already imported
- ✅ **Enhance API endpoint** - Add exercise history queries
- ✅ **Query set_records table** - Join with exercises for names

**DO NOT**: Create separate progress graph component or rebuild charting

---

### 3. ⚙️ 1RM Tracking - RE-ENABLE EXISTING CODE!

**File**: `src/lib/pr-detection.ts` (286 lines)

**Status**: **DISABLED** - Complete logic exists, just commented out

**Current State**:

- ✅ `calculateOneRM()` function **works perfectly** (Epley formula)
- ✅ `calculateVolume()` function available
- ⚠️ `checkForPR()` returns false - **database logic commented out**
- ⚠️ All query logic exists but disabled to avoid client-side DB calls

**Existing Functions**:

```typescript
calculateOneRM(weight, reps); // ✅ WORKS - Returns estimated 1RM
calculateVolume(weight, reps); // ✅ WORKS - Returns weight × reps
checkForPR(athleteId, exerciseId, weight, reps); // ⚠️ DISABLED
```

**Why Disabled**:

- Comment says: "Temporarily disabled to avoid client-side database calls"
- Logic exists starting at line ~77 (commented out)
- Queries `set_records` table to find previous best

**Integration Plan for Sprint 9**:

1. ✅ **Create server-side API route**: `/api/analytics/calculate-1rm`
2. ✅ **Move checkForPR logic** to server route (uncomment and adapt)
3. ✅ **Keep utility functions** (calculateOneRM, calculateVolume) in lib
4. ✅ **Wire into ProgressAnalytics** - Show 1RM progression over time

**DO NOT**: Rewrite 1RM calculation logic - it's already perfect!

---

### 4. 🎨 Achievement System - UI ONLY NEEDED!

**File**: `database/achievements-schema.sql` (50 lines)

**Status**: **DATABASE COMPLETE** - Just needs UI components

**Existing Database**:

```sql
athlete_achievements table:
- id (UUID primary key)
- athlete_id (references users)
- achievement_type (TEXT) - "first_workout", "streak_3", etc.
- earned_at (TIMESTAMPTZ)
- UNIQUE constraint (athlete_id, achievement_type)
- RLS policies in place
```

**RLS Policies**:

- ✅ Athletes can view own achievements
- ✅ System can insert (via service role)
- ✅ Coaches can view all

**Indexes**:

- ✅ Fast lookup by athlete_id
- ✅ Sorted by earned_at DESC

**What's Missing** (Sprint 9 work):

1. Achievement badge UI component (may exist as AchievementBadge.tsx)
2. Achievement notification system
3. Achievement earning logic (when to award)
4. Dashboard integration

**Integration Plan**:

- ✅ **Check if AchievementBadge.tsx exists** (audit found it in components)
- ✅ **Create achievement earning logic** - Trigger on workout completion
- ✅ **Use unified-notification-service.ts** - Notify when earned
- ✅ **Add to athlete dashboard** - Display recent achievements

**DO NOT**: Create new database tables - schema is production-ready!

---

## 📋 Sprint 9 Implementation Checklist

### Before Starting ANY Task:

- [x] Review unified-notification-service.ts API
- [x] Review ProgressAnalytics.tsx existing structure
- [x] Confirm pr-detection.ts logic exists (just disabled)
- [x] Confirm achievements database schema complete

### What to BUILD NEW:

1. ❌ **Feedback System** - Genuinely missing
   - Create `workout_session_feedback` table
   - Create `WorkoutFeedbackModal.tsx` component
   - Create `/api/sessions/[id]/feedback` endpoints
   - Create `FeedbackDashboard.tsx` for coaches

### What to EXTEND:

2. ⚡ **Progress Analytics** - Extend existing component
   - Install recharts (if not already): `npm install recharts`
   - Enhance `/api/analytics/athlete-analytics` endpoint
   - Wire up exercise history data from `set_records`
   - Add exercise selector to existing component

### What to RE-ENABLE:

3. ⚙️ **1RM Tracking** - Uncomment and move to server
   - Create `/api/analytics/calculate-1rm` endpoint
   - Move commented logic from pr-detection.ts to server
   - Keep utility functions in lib/pr-detection.ts

### What to CONNECT:

4. 🎨 **Achievement Badges** - Just add UI
   - Check if `AchievementBadge.tsx` component exists
   - Query `athlete_achievements` table
   - Add to athlete dashboard
   - Wire notifications via unified-notification-service.ts

---

## 🚨 Critical Integration Warnings

### ⚠️ DO NOT:

1. **Create new notification service** - Use `unified-notification-service.ts`
2. **Create new progress component** - Extend `ProgressAnalytics.tsx`
3. **Rewrite 1RM calculation** - Use `pr-detection.ts` functions
4. **Create achievements table** - Database schema complete

### ✅ DO:

1. **Use existing notification service** for all new notifications
2. **Enhance existing progress component** with exercise-specific graphs
3. **Move disabled PR logic to server** - Don't rebuild from scratch
4. **Query existing achievements table** - Just add display UI

---

## ⏱️ Time Estimates (Revised)

### Original Estimate: 3-4 days

- Feedback System: 1.5 days (new)
- Progress Graphs: 1 day (thought we needed to build)
- 1RM Tracking: 0.5 days (thought we needed to build)
- Achievements: 0.5 days (thought we needed to build)

### Actual Estimate: 2-3 days

- Feedback System: 1.5 days (still new)
- Progress Graphs: 4 hours (extend existing, add data)
- 1RM Tracking: 30 minutes (move to server)
- Achievements: 4 hours (UI only, DB ready)

**Time Saved**: 1.5 days by leveraging existing infrastructure!

---

## 🎯 Next Steps

1. ✅ **Review Complete** - This document created
2. ⏭️ **Install recharts** - May already be installed, verify
3. ⏭️ **Start Feedback System** - This is the only truly new feature
4. ⏭️ **Extend Progress Analytics** - Quick wins with existing charts
5. ⏭️ **Wire up 1RM tracking** - Move server-side and re-enable
6. ⏭️ **Add Achievement UI** - Connect to ready database

---

**Review Completed By**: AI Assistant  
**Approved By**: [Pending Developer Review]  
**Ready to Start Sprint 9**: ✅ YES - Armed with knowledge of existing code!
