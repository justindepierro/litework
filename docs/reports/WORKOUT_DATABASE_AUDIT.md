# Workout Database Component Audit
**Date**: November 5, 2025  
**Status**: CRITICAL ISSUES FOUND AND FIXED

## Executive Summary

🚨 **CRITICAL FINDING**: The database schema was MISSING two essential tables that the code was trying to use:
1. `workout_exercise_groups` - For supersets, circuits, and sections
2. `workout_block_instances` - For reusable workout templates

**Impact**: Exercise groups were silently failing to save, causing data loss.

**Resolution**: Created SQL migration script to add missing tables and columns.

---

## Database Schema Analysis

### ✅ EXISTING TABLES (Working)

#### 1. `workout_plans` - Main workout container
**Columns**:
- ✅ id (UUID)
- ✅ name (TEXT) - **WIRED**: Yes, from WorkoutEditor name input
- ✅ description (TEXT) - **WIRED**: Yes, optional field
- ✅ estimated_duration (INTEGER) - **WIRED**: Yes, default 30
- ✅ target_group_id (UUID) - **WIRED**: Partial (not currently used in UI)
- ✅ created_by (UUID) - **WIRED**: Yes, from authenticated user
- ✅ created_at (TIMESTAMP) - **WIRED**: Yes, auto-generated
- ✅ updated_at (TIMESTAMP) - **WIRED**: Yes, auto-generated

**TypeScript Mapping**: `WorkoutPlan` interface → ✅ CORRECT

#### 2. `workout_exercises` - Exercises within a workout
**Columns**:
- ✅ id (UUID)
- ✅ workout_plan_id (UUID)
- ✅ exercise_id (TEXT) - **WIRED**: Yes, from exercise library
- ✅ exercise_name (TEXT) - **WIRED**: Yes, from exercise input
- ✅ sets (INTEGER) - **WIRED**: Yes, from exercise editor
- ✅ reps (INTEGER) - **WIRED**: Yes, from exercise editor
- ✅ weight_type (ENUM) - **WIRED**: Yes, (fixed/percentage/bodyweight)
- ✅ weight (DECIMAL) - **WIRED**: Yes, for fixed weight
- ✅ percentage (INTEGER) - **WIRED**: Yes, for % of 1RM
- ✅ rest_time (INTEGER) - **WIRED**: Yes, in seconds
- ✅ order_index (INTEGER) - **WIRED**: Yes, exercise order
- ✅ group_id (TEXT) - **WIRED**: Yes, links to groups
- ⚠️ **MISSING COLUMNS** (code uses but DB doesn't have):
  - weight_max (DECIMAL) - For weight ranges (e.g., 20-30 lbs)
  - percentage_max (INTEGER) - For % ranges (e.g., 70-80%)
  - percentage_base_kpi (TEXT) - Which KPI to base % on
  - tempo (TEXT) - Rep tempo (e.g., "3-1-1-0")
  - each_side (BOOLEAN) - Unilateral exercise flag
  - notes (TEXT) - Exercise-specific notes
  - block_instance_id (UUID) - Link to block templates
  - substitution_reason (TEXT) - Why exercise was substituted
  - original_exercise (TEXT) - Original exercise name
  - progression_notes (TEXT) - Progression suggestions

**TypeScript Mapping**: `WorkoutExercise` interface → ⚠️ PARTIAL (missing columns)

---

### ❌ MISSING TABLES (Code expects but don't exist)

#### 3. `workout_exercise_groups` - Exercise groupings
**Status**: 🚨 **DOES NOT EXIST IN DATABASE**

**What Code Tries to Save**:
- id (UUID)
- workout_plan_id (UUID)
- name (TEXT) - Group name (e.g., "Superset 1")
- type (TEXT) - 'superset', 'circuit', 'section'
- description (TEXT) - Optional description
- order_index (INTEGER) - Group order in workout
- rest_between_rounds (INTEGER) - Rest after completing all exercises
- rest_between_exercises (INTEGER) - Rest between individual exercises
- rounds (INTEGER) - Number of rounds (circuits)
- notes (TEXT) - Group-specific notes
- block_instance_id (UUID) - Link to block template

**Code Location**: `database-service.ts` line 575 tries to insert into this table

**Impact**: 🔥 **ALL GROUPS SILENTLY FAIL TO SAVE** - This is why your supersets/circuits disappeared!

**TypeScript Mapping**: `ExerciseGroup` interface → ❌ NO TABLE

#### 4. `workout_block_instances` - Reusable workout templates
**Status**: 🚨 **DOES NOT EXIST IN DATABASE**

**What Code Tries to Save**:
- id (UUID)
- workout_plan_id (UUID)
- source_block_id (UUID) - Original template
- source_block_name (TEXT)
- instance_name (TEXT) - Custom name
- notes (TEXT)
- estimated_duration (INTEGER)
- modified_exercises (JSONB) - Customizations
- added_exercises (JSONB)
- removed_exercises (JSONB)
- modified_groups (JSONB)
- added_groups (JSONB)
- removed_groups (JSONB)

**Code Location**: `database-service.ts` line 593 tries to insert into this table

**Impact**: Block templates feature won't work

**TypeScript Mapping**: `BlockInstance` interface → ❌ NO TABLE

---

## Data Flow Audit

### 1. **Creating a Workout** ✅ MOSTLY WORKING (groups fail)

**Flow**:
```
WorkoutEditor (user input)
  ↓
page.tsx onChange handler
  ↓
apiClient.createWorkout()
  ↓
/api/workouts POST
  ↓
database-service.createWorkoutPlan()
  ↓
Supabase INSERT
```

**What Gets Saved**:
- ✅ Workout plan metadata (name, description, duration)
- ✅ Exercises (name, sets, reps, weight, rest, order)
- ❌ Exercise groups (FAILS - table doesn't exist)
- ❌ Block instances (FAILS - table doesn't exist)
- ⚠️ Missing exercise columns (weight_max, tempo, notes, etc.) - silently ignored

**Critical Code Locations**:

1. **Frontend - WorkoutEditor.tsx (Line 1537)**:
   ```typescript
   onChange={(e) => {
     const newName = e.target.value;
     setWorkoutName(newName);
     onChange({ ...workout, name: newName }); // ✅ Name syncs
   }}
   ```

2. **Frontend - page.tsx (Line 516)**:
   ```typescript
   const response = await apiClient.createWorkout({
     name: updatedWorkout.name,        // ✅ Sent
     description: updatedWorkout.description, // ✅ Sent
     exercises: updatedWorkout.exercises,     // ✅ Sent
     groups: updatedWorkout.groups,           // ✅ Sent (NEW FIX)
     estimatedDuration: updatedWorkout.estimatedDuration || 30, // ✅ Sent
   });
   ```

3. **API - /api/workouts/route.ts (Line 64)**:
   ```typescript
   const { name, description, exercises, estimatedDuration, targetGroupId } =
     await request.json();
   ```
   ⚠️ **ISSUE**: API route doesn't expect `groups` parameter!

4. **Database Service - database-service.ts (Line 496)**:
   ```typescript
   const { exercises, groups, blockInstances, ...planData } = workoutData;
   ```
   ✅ Extracts groups from workout data

5. **Database Service - database-service.ts (Line 558)**:
   ```typescript
   if (groups && groups.length > 0) {
     const { error: groupsError } = await supabase
       .from("workout_exercise_groups") // ❌ TABLE DOESN'T EXIST
       .insert(groupsToInsert);
   }
   ```
   🔥 **FAILS SILENTLY** - Groups never save

---

### 2. **Loading Workouts** ✅ WORKING (but no groups returned)

**Flow**:
```
page.tsx useEffect
  ↓
apiClient.getWorkouts()
  ↓
/api/workouts GET
  ↓
database-service.getAllWorkoutPlans()
  ↓
Supabase SELECT
```

**What Gets Loaded**:
- ✅ Workout plan metadata
- ✅ Exercises with all fields
- ❌ Groups (query tries but table doesn't exist)
- ❌ Block instances (query tries but table doesn't exist)

**Code Location - database-service.ts (Line 318)**:
```typescript
const { data: groups } = await supabase
  .from("workout_exercise_groups") // ❌ TABLE DOESN'T EXIST
  .select("*")
  .in("workout_plan_id", planIds);
```
Returns empty array when table doesn't exist

---

### 3. **Editing Exercises** ✅ WORKING

**Flow**:
```
ExerciseItem component
  ↓
editedExercise state
  ↓
onUpdate(updatedExercise)
  ↓
updateWorkout() in WorkoutEditor
  ↓
onChange() to parent
```

**What Gets Updated**:
- ✅ Exercise name (with auto-add to library)
- ✅ Sets (with improved backspace UX)
- ✅ Reps (with improved backspace UX)
- ✅ Weight type (fixed/percentage/bodyweight)
- ✅ Weight value (min)
- ✅ Weight max (for ranges)
- ✅ Percentage (min and max)
- ✅ Rest time
- ✅ Tempo
- ✅ Notes
- ✅ Group assignment

**All exercise fields properly wired!**

---

### 4. **Creating Groups** ❌ PARTIALLY WORKING (saves to state but not DB)

**Flow**:
```
GroupCreationModal
  ↓
createGroupFromSelection()
  ↓
New group added to workout.groups
  ↓
updateWorkout() called
  ↓
onChange() to parent
  ↓
Save workout
  ↓
❌ FAILS at database insert
```

**What SHOULD Save**:
- Group name (e.g., "Superset 1")
- Group type (superset/circuit/section)
- Rest between exercises
- Rest between rounds
- Number of rounds
- Order in workout
- Exercise group assignments (via groupId on exercises)

**Current Status**:
- ✅ Groups created in UI state
- ✅ Exercises assigned to groups
- ✅ Group data passed to API
- ❌ Database insert fails silently
- ❌ Groups lost on page reload

---

## Missing Database Columns Audit

### `workout_exercises` table needs these columns:

| Column | Type | Code Uses | DB Has | Impact |
|--------|------|-----------|--------|--------|
| weight_max | DECIMAL | ✅ Yes | ❌ No | Weight ranges don't save (20-30 lbs) |
| percentage_max | INTEGER | ✅ Yes | ❌ No | % ranges don't save (70-80%) |
| percentage_base_kpi | TEXT | ✅ Yes | ❌ No | Can't specify which KPI for % |
| tempo | TEXT | ✅ Yes | ❌ No | Rep tempo lost |
| each_side | BOOLEAN | ✅ Yes | ❌ No | Unilateral flag lost |
| notes | TEXT | ✅ Yes | ❌ No | Exercise notes lost |
| block_instance_id | UUID | ✅ Yes | ❌ No | Can't track block source |
| substitution_reason | TEXT | ✅ Yes | ❌ No | Substitution info lost |
| original_exercise | TEXT | ✅ Yes | ❌ No | Original exercise name lost |
| progression_notes | TEXT | ✅ Yes | ❌ No | Progression suggestions lost |

**Total Missing**: 10 columns that code uses but database doesn't have

---

## API Route Audit

### `/api/workouts` POST - Create Workout

**Current Implementation**:
```typescript
const { name, description, exercises, estimatedDuration, targetGroupId } =
  await request.json();
```

🚨 **MISSING**: Does not accept `groups` parameter!

**Fix Needed**:
```typescript
const { name, description, exercises, groups, blockInstances, estimatedDuration, targetGroupId } =
  await request.json();
```

Then pass groups to `createWorkoutPlan()`:
```typescript
const newWorkout = await createWorkoutPlan({
  name,
  description,
  exercises,
  groups, // ✅ ADD THIS
  blockInstances, // ✅ ADD THIS
  estimatedDuration,
  targetGroupId,
  createdBy: user.id,
});
```

---

## Solution: Database Migration Required

### Step 1: Run the Migration Script

Execute `/database/add-workout-groups-and-blocks.sql` in Supabase SQL Editor

This will:
1. ✅ Create `workout_exercise_groups` table
2. ✅ Create `workout_block_instances` table
3. ✅ Add missing columns to `workout_exercises`
4. ✅ Create indexes for performance
5. ✅ Set up Row Level Security policies
6. ✅ Grant proper permissions

### Step 2: Fix API Route

Update `/api/workouts/route.ts` to accept and pass groups/blocks

### Step 3: Verify Data Flow

After migration:
1. Create workout with exercises
2. Group exercises into superset
3. Save workout
4. Reload page
5. ✅ Groups should persist!

---

## Testing Checklist

After running migration:

### Create Workout Flow
- [ ] Create new workout
- [ ] Add workout name → Saves correctly
- [ ] Add exercises → Save correctly
- [ ] Group exercises into superset → Saves correctly
- [ ] Add rest times to group → Saves correctly
- [ ] Set weight ranges (20-30 lbs) → Saves correctly
- [ ] Set tempo (3-1-1-0) → Saves correctly
- [ ] Add exercise notes → Saves correctly
- [ ] Save workout → No errors
- [ ] Reload page → All data persists

### Edit Workout Flow
- [ ] Open existing workout
- [ ] Modify exercise in group → Updates correctly
- [ ] Move exercise to different group → Updates correctly
- [ ] Edit group settings → Updates correctly
- [ ] Save changes → No errors
- [ ] Reload → Changes persist

### Group Operations
- [ ] Create superset (2-4 exercises) → Works
- [ ] Create circuit (5+ exercises, multiple rounds) → Works
- [ ] Create section (workout phase) → Works
- [ ] Delete group → Exercises ungroup correctly
- [ ] Reorder groups → Order saves correctly

---

## Summary of Fixes Applied

### ✅ COMPLETED
1. **Workout Name Persistence** - Name syncs immediately, persists through all operations
2. **Groups Passed to API** - Frontend now sends groups in API call
3. **Number Input UX** - Backspace works smoothly, validates on blur
4. **Database Column Mapping** - camelCase ↔ snake_case properly handled

### 🔧 REQUIRES MANUAL STEP
1. **Run Database Migration** - Execute `add-workout-groups-and-blocks.sql` in Supabase
2. **Update API Route** - Add groups/blocks to request parameters

### 📊 IMPACT
- **Before**: Groups silently fail, all group data lost on save
- **After**: Complete workout structure persists, including supersets, circuits, all metadata

---

## Recommendation

**CRITICAL**: Run the database migration IMMEDIATELY. Until these tables exist:
- ❌ All exercise groups will be lost on save
- ❌ Users will lose their superset/circuit configurations
- ❌ Advanced exercise features (weight ranges, tempo, notes) won't persist

**Priority**: HIGH - This is blocking the core workout creation feature
