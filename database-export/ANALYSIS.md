# Database Schema Analysis - November 5, 2025

## ✅ GOOD NEWS: All Tables Exist!

The database migration has already been applied. All required tables are present:

### Workout Core Tables

- ✅ **workout_plans** - Main workout container
- ✅ **workout_exercises** - Exercises within workouts
- ✅ **workout_exercise_groups** - Supersets, circuits, sections
- ✅ **workout_block_instances** - Workout templates
- ✅ **workout_assignments** - Workout assignments to athletes
- ✅ **workout_sessions** - Completed workout sessions

### workout_exercises Columns (ALL PRESENT)

```sql
- id (uuid)
- workout_plan_id (uuid)
- exercise_id (text)
- exercise_name (text)
- sets (integer)
- reps (integer)
- weight_type (enum: fixed/percentage/bodyweight)
- weight (numeric)
- weight_max (numeric) ✅ ADDED BY MIGRATION
- percentage (integer)
- percentage_max (integer) ✅ ADDED BY MIGRATION
- percentage_base_kpi (text) ✅ ADDED BY MIGRATION
- tempo (text) ✅ ADDED BY MIGRATION
- each_side (boolean) ✅ ADDED BY MIGRATION
- notes (text) ✅ ADDED BY MIGRATION
- rest_time (integer)
- order_index (integer)
- group_id (text)
- block_instance_id (text) ✅ ADDED BY MIGRATION
- substitution_reason (text) ✅ ADDED BY MIGRATION
- original_exercise (text) ✅ ADDED BY MIGRATION
- progression_notes (text) ✅ ADDED BY MIGRATION
- created_at (timestamp)
```

### workout_exercise_groups Columns (ALL PRESENT)

```sql
- id (uuid)
- workout_plan_id (uuid)
- name (text) - e.g., "Superset 1"
- type (text) - CHECK: 'superset', 'circuit', 'section'
- description (text)
- order_index (integer)
- rest_between_rounds (integer)
- rest_between_exercises (integer)
- rounds (integer)
- notes (text)
- block_instance_id (text)
- created_at (timestamp)
```

## 🔍 Why Groups Were Failing

The tables exist NOW, but they may not have existed when you first tested. Possible reasons:

1. **Migration was run after** - Someone ran the migration SQL in Supabase dashboard
2. **RLS Policies** - Row Level Security might be blocking inserts
3. **API Not Passing Groups** - The API route might not be accepting the groups parameter
4. **Type Mismatch** - `block_instance_id` is TEXT in DB but code may expect UUID

## 🚨 Potential Issues Found

### 1. Type Mismatch - block_instance_id

**Database**: `block_instance_id TEXT`
**Code**: May expect `UUID`

This could cause issues if code tries to use UUID functions on this field.

### 2. API Route Not Accepting Groups

Need to verify `/api/workouts` POST route accepts and passes the `groups` parameter.

## ✅ Next Steps

1. **Verify API Route** - Check if `/api/workouts/route.ts` accepts `groups` in POST
2. **Test Workout Creation** - Create a workout with groups in the app
3. **Check RLS Policies** - Verify authenticated users can INSERT into workout_exercise_groups
4. **Monitor Console** - Watch browser console for any errors during save

## 📁 Export Files Created

- `database-export/schema-dump.sql` - Complete database schema (4000+ lines)
- `database-export/TABLES_SUMMARY.txt` - List of all 34 tables in database

## 🎯 Summary

**The database is ready!** All tables and columns exist. The issue is likely in:

1. API route not passing groups data
2. RLS policies blocking inserts
3. Type mismatches between code and database

Let's test creating a workout now and watch what happens!
