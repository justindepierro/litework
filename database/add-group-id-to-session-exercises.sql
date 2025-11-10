-- Add group_id to session_exercises table
-- This allows us to preserve exercise grouping info when creating workout sessions

-- Add the column (nullable since existing rows won't have it)
ALTER TABLE session_exercises
ADD COLUMN IF NOT EXISTS group_id UUID REFERENCES workout_exercise_groups(id);

-- Add index for faster group lookups
CREATE INDEX IF NOT EXISTS idx_session_exercises_group_id 
ON session_exercises(group_id);

-- Add comment
COMMENT ON COLUMN session_exercises.group_id IS 'Reference to the exercise group this exercise belongs to (superset, circuit, or section)';
