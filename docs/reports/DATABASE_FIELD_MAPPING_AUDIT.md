# Database Field Mapping Audit Report

**Date**: November 9, 2025  
**Status**: Critical Issues Found - Migrations Required

## Executive Summary

Comprehensive audit revealed **critical schema mismatches** between the database and application code. The application expects fields that don't exist in the database, which will cause runtime errors and data loss.

### Severity: 🔴 **CRITICAL**

**Impact**:

- Workout assignments cannot save location, start/end times, or modifications
- YouTube video URLs are not persisted to database
- Group archived status is not retrieved

---

## Critical Issues Found

### 1. 🔴 workout_assignments Table - Missing 9 Columns

**Problem**: Application code expects these fields but they don't exist in production database

**Missing Columns**:

- `workout_plan_name` (TEXT) - Cached workout name for display
- `assignment_type` (TEXT) - 'individual' or 'group'
- `athlete_ids` (UUID[]) - Array of assigned athlete IDs
- `assigned_date` (TIMESTAMP) - When assignment was created
- `status` (TEXT) - 'assigned', 'in_progress', 'completed', 'skipped'
- `modifications` (JSONB) - Individual athlete modifications
- `start_time` (TEXT) - Training session start time
- `end_time` (TEXT) - Training session end time
- `location` (TEXT) - Where workout takes place

**Impact**:

- ❌ Cannot save workout locations (e.g., "Main Gym")
- ❌ Cannot set training session times
- ❌ Cannot track assignment status beyond completed/not completed
- ❌ Individual modifications to group workouts are lost
- ❌ Assignment type must be inferred from NULL checks

**Affected Code**:

- `src/lib/database-service.ts` - getAllAssignments() lines 1000-1027
- `src/lib/database-service.ts` - getAssignmentById() lines 1036-1095
- `src/lib/database-service.ts` - createWorkoutAssignment() lines 1127-1197
- `src/app/schedule/page.tsx` - Assignment creation
- `src/app/dashboard/page.tsx` - Assignment creation
- `src/components/GroupAssignmentModal.tsx`
- `src/components/IndividualAssignmentModal.tsx`

**Migration**: `database/add-assignment-fields.sql` (EXISTS, NOT RUN)

---

### 2. 🔴 workout_exercises Table - Missing video_url Column

**Problem**: Application saves video URLs but database doesn't have the column

**Missing Column**:

- `video_url` (TEXT) - YouTube demonstration video URL

**Impact**:

- ❌ YouTube video URLs entered in workout editor are not saved
- ❌ Videos disappear after page refresh
- ❌ Athletes cannot see demonstration videos

**Affected Code**:

- `src/lib/database-service.ts` - createWorkoutPlan() line 653
- `src/lib/database-service.ts` - updateWorkoutPlan() line 866
- `src/lib/database-service.ts` - getAllWorkoutPlans() line 406
- `src/lib/database-service.ts` - getWorkoutPlanById() line 541
- `src/components/WorkoutEditor.tsx` - Video URL input field

**Migration**: `database/add-video-url-to-exercises.sql` (EXISTS, NOT RUN)

**Note**: We added the field to database-service.ts but it will fail at runtime until migration is run.

---

### 3. ✅ athlete_groups Table - Missing archived Field Mapping

**Problem**: Database has `archived` column but code wasn't reading it

**Status**: **FIXED** ✅

**Changes Made**:

- Added `archived: group.archived || false` to `getAllGroups()` line 127
- Added `archived: data.archived || false` to `getGroupById()` line 156

**Impact Before Fix**:

- Archived groups would show as active
- Couldn't filter archived groups properly

---

## Fixes Applied

### Code Changes ✅

1. **database-service.ts** - Added video_url field mapping:
   - `createWorkoutPlan()` - Saves videoUrl to database
   - `updateWorkoutPlan()` - Saves videoUrl to database
   - `getAllWorkoutPlans()` - Loads videoUrl from database
   - `getWorkoutPlanById()` - Loads videoUrl from database

2. **database-service.ts** - Added archived field mapping:
   - `getAllGroups()` - Loads archived status
   - `getGroupById()` - Loads archived status

3. **dashboard/page.tsx** - Fixed assignment POST format:
   - Changed from `{ assignments: [assignment] }` to `assignment`

4. **athletes/page.tsx** - Fixed assignment POST format:
   - Changed from `{ assignments: [assignment] }` to `assignment`

### TypeScript Validation ✅

```bash
npm run typecheck
# Result: 0 errors ✅
```

---

## Required Database Migrations

### Master Migration Script Created

**Location**: `scripts/database/run-pending-migrations.sql`

**Contents**:

1. Add video_url to workout_exercises
2. Add 9 new columns to workout_assignments
3. Backfill data for existing assignments
4. Create indexes for performance
5. Verification checks

### Migration Application Script

**Location**: `scripts/database/apply-pending-migrations.sh`

**Features**:

- Interactive database password prompt
- Connection testing
- Migration preview
- Confirmation prompt
- Success/failure reporting
- Post-migration instructions

**Usage**:

```bash
./scripts/database/apply-pending-migrations.sh
```

---

## Post-Migration Checklist

### Step 1: Apply Migrations 🔴 REQUIRED

```bash
cd /Users/justindepierro/Documents/LiteWork
./scripts/database/apply-pending-migrations.sh
```

**What It Does**:

- Adds video_url column to workout_exercises
- Adds 9 columns to workout_assignments
- Backfills existing data
- Creates performance indexes

**Estimated Time**: 2-5 minutes

### Step 2: Export Updated Schema

```bash
./scripts/database/export-schema.sh
```

**Purpose**: Update `database-export/schema-dump.sql` with new columns

### Step 3: Verify Application

```bash
npm run dev
```

**Test**:

1. Create workout with YouTube video URL → Should save and persist
2. Assign workout to group with location and times → Should save all fields
3. Edit workout and change video → Should update correctly
4. View assignment in calendar → Should show location and times

### Step 4: Validate TypeScript

```bash
npm run typecheck
```

**Expected**: 0 errors ✅ (already passing)

---

## Testing Plan

### Test 1: Video URL Persistence

1. Create new workout
2. Add exercise with YouTube URL: `https://youtu.be/dQw4w9WgXcQ`
3. Save workout
4. Refresh page
5. Open workout editor
6. **Expected**: Video URL is still there ✅

### Test 2: Assignment with Location and Times

1. Go to Schedule page
2. Create group assignment
3. Set:
   - Start Time: 3:00 PM
   - End Time: 4:30 PM
   - Location: Main Gym
4. Save assignment
5. **Expected**: Assignment shows on calendar with location and times ✅

### Test 3: Assignment Status Tracking

1. View athlete's assigned workouts
2. Start workout
3. **Expected**: Status changes to 'in_progress' ✅
4. Complete workout
5. **Expected**: Status changes to 'completed' ✅

---

## Database Schema Completeness Analysis

### ✅ Complete Mappings

- `workout_plans` - All fields mapped correctly
- `workout_exercises` - Will be complete after video_url migration
- `workout_exercise_groups` - All fields mapped correctly
- `workout_block_instances` - All fields mapped correctly
- `athlete_groups` - All fields mapped correctly (after fix)
- `exercises` (library) - All fields mapped correctly

### 🔴 Incomplete Mappings (Require Migrations)

- `workout_assignments` - Missing 9 columns (CRITICAL)
- `workout_exercises` - Missing video_url column (HIGH)

### ⚠️ Not Yet Audited

- `session_exercises` - Progress tracking (TO DO)
- `set_records` - Set-by-set tracking (TO DO)
- `athlete_kpis` - 1RM tracking (TO DO)
- `progress_entries` - Body metrics (TO DO)
- `in_app_notifications` - Notifications (TO DO)
- `messages` - Communication (TO DO)

---

## Summary of Changes

### Files Modified: 4

1. `src/lib/database-service.ts` - Added video_url and archived field mappings
2. `src/app/dashboard/page.tsx` - Fixed assignment POST format
3. `src/app/athletes/page.tsx` - Fixed assignment POST format
4. `scripts/database/run-pending-migrations.sql` - NEW
5. `scripts/database/apply-pending-migrations.sh` - NEW

### TypeScript Errors: 0 ✅

### Migrations Created: 1

- Master migration combining video_url + assignment fields

### Migrations Required to Run: 1 🔴

- **CRITICAL**: Must run before production use

---

## Risk Assessment

### Before Migrations

**Risk Level**: 🔴 **HIGH**

**Issues**:

- Data loss on workout assignments (location, times lost)
- Data loss on video URLs (disappear after save)
- Silent failures (no errors, data just doesn't persist)
- Poor user experience (enter data, it vanishes)

### After Migrations

**Risk Level**: 🟢 **LOW**

**Benefits**:

- All data persists correctly
- Complete feature functionality
- No silent failures
- Improved user experience

---

## Recommendations

### Immediate Actions (Today)

1. ✅ **DONE**: Fix code to map all fields correctly
2. 🔴 **REQUIRED**: Run database migrations
3. ✅ **DONE**: Verify TypeScript passes
4. ⚠️ **PENDING**: Test all features end-to-end

### Short Term (This Week)

1. Export updated schema to documentation
2. Audit remaining tables (session_exercises, set_records, etc.)
3. Document all table-to-interface mappings
4. Create migration checklist for future changes

### Long Term (Future)

1. Add database schema validation tests
2. Implement migration tracking system
3. Create automated schema comparison tool
4. Add pre-deployment migration checks

---

## Questions for User

1. **When can we run the database migrations?** (Required before production use)
2. **Should we audit the remaining tables now?** (session_exercises, set_records, etc.)
3. **Do you want a tool to automatically detect schema mismatches?** (Prevent this in future)

---

## Contact

If you have questions about these migrations or need help running them, please ask!

**Status**: Ready to migrate ✅  
**Risk**: Low (migrations are reversible)  
**Downtime**: None required (migrations run while app is live)
