-- Workout Editor Performance Indexes
-- Created: November 13, 2025
-- Purpose: Optimize workout editor database queries

-- Indexes for workout_exercises table
-- These are critical for fast loading of exercises in the editor
CREATE INDEX IF NOT EXISTS idx_workout_exercises_plan_id 
  ON workout_exercises(workout_plan_id);

CREATE INDEX IF NOT EXISTS idx_workout_exercises_group_id 
  ON workout_exercises(group_id) 
  WHERE group_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_workout_exercises_block_instance 
  ON workout_exercises(block_instance_id) 
  WHERE block_instance_id IS NOT NULL;

-- Composite index for common query pattern: get exercises by plan, ordered
CREATE INDEX IF NOT EXISTS idx_workout_exercises_plan_order 
  ON workout_exercises(workout_plan_id, order_index);

-- Indexes for workout_exercise_groups table
CREATE INDEX IF NOT EXISTS idx_workout_groups_plan_id 
  ON workout_exercise_groups(workout_plan_id);

CREATE INDEX IF NOT EXISTS idx_workout_groups_block_instance 
  ON workout_exercise_groups(block_instance_id) 
  WHERE block_instance_id IS NOT NULL;

-- Composite index for common query pattern: get groups by plan, ordered
CREATE INDEX IF NOT EXISTS idx_workout_groups_plan_order 
  ON workout_exercise_groups(workout_plan_id, order_index);

-- Index for workout_block_instances
CREATE INDEX IF NOT EXISTS idx_block_instances_plan_id 
  ON workout_block_instances(workout_plan_id);

-- Index for exercise_kpi_tags (used when loading exercise KPIs)
CREATE INDEX IF NOT EXISTS idx_exercise_kpi_tags_workout_exercise 
  ON exercise_kpi_tags(workout_exercise_id);

-- Verify indexes were created
DO $$
BEGIN
  RAISE NOTICE 'Workout Editor performance indexes created successfully';
END $$;
