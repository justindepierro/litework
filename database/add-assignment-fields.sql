-- Migration: Add enhanced assignment fields for Phase 1 Assignment System
-- Date: November 7, 2025
-- Description: Adds fields for workout name, start/end times, location, assignment type, and status

-- Add new columns to workout_assignments table
ALTER TABLE public.workout_assignments
  ADD COLUMN IF NOT EXISTS workout_plan_name TEXT,
  ADD COLUMN IF NOT EXISTS assignment_type TEXT DEFAULT 'individual' CHECK (assignment_type IN ('individual', 'group')),
  ADD COLUMN IF NOT EXISTS athlete_ids UUID[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS assigned_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'assigned' CHECK (status IN ('assigned', 'in_progress', 'completed', 'skipped')),
  ADD COLUMN IF NOT EXISTS modifications JSONB DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS start_time TEXT,
  ADD COLUMN IF NOT EXISTS end_time TEXT,
  ADD COLUMN IF NOT EXISTS location TEXT;

-- Create indexes for new columns
CREATE INDEX IF NOT EXISTS idx_workout_assignments_status ON public.workout_assignments(status);
CREATE INDEX IF NOT EXISTS idx_workout_assignments_assignment_type ON public.workout_assignments(assignment_type);
CREATE INDEX IF NOT EXISTS idx_workout_assignments_athlete_ids ON public.workout_assignments USING GIN(athlete_ids);

-- Backfill workout_plan_name from workout_plans
UPDATE public.workout_assignments wa
SET workout_plan_name = wp.name
FROM public.workout_plans wp
WHERE wa.workout_plan_id = wp.id
  AND wa.workout_plan_name IS NULL;

-- Backfill athlete_ids for individual assignments
UPDATE public.workout_assignments
SET athlete_ids = ARRAY[assigned_to_user_id]
WHERE assigned_to_user_id IS NOT NULL
  AND athlete_ids = '{}';

-- Backfill athlete_ids for group assignments from athlete_groups
UPDATE public.workout_assignments wa
SET athlete_ids = ag.athlete_ids
FROM public.athlete_groups ag
WHERE wa.assigned_to_group_id = ag.id
  AND wa.athlete_ids = '{}';

-- Update assignment_type based on existing data
UPDATE public.workout_assignments
SET assignment_type = CASE
  WHEN assigned_to_group_id IS NOT NULL THEN 'group'
  ELSE 'individual'
END
WHERE assignment_type IS NULL;

-- Update status based on completed flag
UPDATE public.workout_assignments
SET status = CASE
  WHEN completed = TRUE THEN 'completed'
  ELSE 'assigned'
END
WHERE status IS NULL;

COMMENT ON COLUMN public.workout_assignments.workout_plan_name IS 'Cached workout plan name for display';
COMMENT ON COLUMN public.workout_assignments.assignment_type IS 'Type of assignment: individual or group';
COMMENT ON COLUMN public.workout_assignments.athlete_ids IS 'Array of athlete UUIDs assigned to this workout';
COMMENT ON COLUMN public.workout_assignments.assigned_date IS 'When the workout was assigned (different from scheduled_date)';
COMMENT ON COLUMN public.workout_assignments.status IS 'Current status: assigned, in_progress, completed, skipped';
COMMENT ON COLUMN public.workout_assignments.modifications IS 'Individual athlete modifications to the base workout';
COMMENT ON COLUMN public.workout_assignments.start_time IS 'Training session start time (HH:MM format)';
COMMENT ON COLUMN public.workout_assignments.end_time IS 'Training session end time (HH:MM format)';
COMMENT ON COLUMN public.workout_assignments.location IS 'Where the workout will take place';
