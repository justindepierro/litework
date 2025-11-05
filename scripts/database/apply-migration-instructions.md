# How to Apply the Workout Features Migration

## ⚠️ CRITICAL: You need to run the migration SQL in Supabase

The code has been updated to work with the new database schema, but **the database itself hasn't been updated yet**. This is causing the "API request failed" errors.

## Steps to Apply Migration:

### 1. Open Supabase Dashboard
- Go to: https://supabase.com/dashboard/project/lzsjaqkhdoqsafptqpnt
- Login with your account

### 2. Navigate to SQL Editor
- Click "SQL Editor" in the left sidebar
- Click "New query" button

### 3. Copy Migration SQL
- Open: `/Users/justindepierro/Documents/LiteWork/database/migrate-workout-features.sql`
- Copy ALL contents (383 lines)

### 4. Paste and Run
- Paste the SQL into the SQL Editor
- Click "Run" button (or press Cmd+Enter)

### 5. Verify Success
You should see messages like:
```
ALTER TABLE
CREATE TABLE
CREATE INDEX
CREATE POLICY
```

If you see errors, check:
- ✅ "column already exists" - OK, migration is idempotent
- ✅ "table already exists" - OK, migration is idempotent
- ❌ "permission denied" - Check you're using admin account
- ❌ Other errors - Copy the error and share it

## What This Migration Does:

### Adds to `workout_exercises` table:
- tempo, weight_max, percentage_max
- percentage_base_kpi, each_side, notes
- block_instance_id, substitution tracking

### Creates new tables:
- `workout_exercise_groups` - Supersets/circuits/sections
- `workout_blocks` - Reusable workout templates
- `workout_block_instances` - Track block usage
- `block_exercises` - Exercises in blocks
- `block_exercise_groups` - Groups in blocks

### Adds security:
- Row Level Security policies for all tables
- Proper indexes for performance
- Auto-update timestamps

## After Migration:

1. **Test Creating a Workout**:
   - Go to /workouts
   - Click "Create Workout"
   - Add exercises
   - Name it
   - Click "Save Workout"
   - Should succeed without errors

2. **Verify in Database**:
   - Go to Supabase → Table Editor
   - Check `workout_plans` - should have new row
   - Check `workout_exercises` - should have exercise rows
   - Check `workout_exercise_groups` - if you created groups

3. **Check for Errors**:
   - Open browser console (F12)
   - Should NOT see "API request failed"
   - Should NOT see "Failed to create workout plan"

## Need Help?

If you encounter errors during migration:
1. Copy the exact error message
2. Note which line of SQL it occurred on
3. Share the error so I can help debug

The migration is designed to be safe and idempotent (can run multiple times).
