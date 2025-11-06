-- Add archived column to workout_plans table
-- This allows coaches to archive old workouts without deleting them

ALTER TABLE public.workout_plans
ADD COLUMN IF NOT EXISTS archived BOOLEAN DEFAULT FALSE;

-- Create index for faster filtering of active vs archived workouts
CREATE INDEX IF NOT EXISTS idx_workout_plans_archived ON public.workout_plans(archived);

-- Add comment for documentation
COMMENT ON COLUMN public.workout_plans.archived IS 'Marks workout as archived. Archived workouts are hidden from default views but preserved for history.';
