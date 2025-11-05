-- Query to inspect current workout tables and columns
-- This will show what exists in your database right now

-- List all workout-related tables
SELECT 
  table_name,
  table_type
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name LIKE '%workout%'
ORDER BY table_name;

-- Show detailed columns for each workout table
SELECT 
  table_name,
  column_name,
  data_type,
  character_maximum_length,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name IN (
    'workout_plans',
    'workout_exercises', 
    'workout_exercise_groups',
    'workout_block_instances',
    'workout_sessions',
    'workout_assignments'
  )
ORDER BY 
  table_name,
  ordinal_position;

-- Check if the missing tables exist
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'workout_exercise_groups'
    ) THEN '✅ workout_exercise_groups EXISTS'
    ELSE '❌ workout_exercise_groups MISSING'
  END as groups_table_status,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'workout_block_instances'
    ) THEN '✅ workout_block_instances EXISTS'
    ELSE '❌ workout_block_instances MISSING'
  END as blocks_table_status;
