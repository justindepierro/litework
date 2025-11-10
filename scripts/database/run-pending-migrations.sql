-- ============================================================================
-- PENDING MIGRATIONS - Run All Missing Database Changes
-- ============================================================================
-- Date: November 9, 2025
-- Description: Combines all pending migrations that haven't been run on production
-- 
-- IMPORTANT: This script should be run ONCE on the production database
-- After running, update database-export/schema-dump.sql by running:
--   ./scripts/database/export-schema.sh
-- ============================================================================

BEGIN;

-- ============================================================================
-- MIGRATION 1: Add video_url to workout_exercises
-- ============================================================================
-- Source: database/add-video-url-to-exercises.sql
-- Purpose: Allow coaches to add YouTube demonstration videos for exercises

ALTER TABLE workout_exercises 
ADD COLUMN IF NOT EXISTS video_url TEXT;

COMMENT ON COLUMN workout_exercises.video_url IS 'YouTube URL for exercise demonstration video';

CREATE INDEX IF NOT EXISTS idx_workout_exercises_video_url 
ON workout_exercises(video_url) 
WHERE video_url IS NOT NULL;

-- ============================================================================
-- MIGRATION 2: Add enhanced assignment fields
-- ============================================================================
-- Source: database/add-assignment-fields.sql
-- Purpose: Add Phase 1 Assignment System fields for scheduling and tracking

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
  AND (athlete_ids IS NULL OR athlete_ids = '{}');

-- Backfill athlete_ids for group assignments from athlete_groups
UPDATE public.workout_assignments wa
SET athlete_ids = ag.athlete_ids::uuid[]
FROM public.athlete_groups ag
WHERE wa.assigned_to_group_id = ag.id
  AND (wa.athlete_ids IS NULL OR wa.athlete_ids = '{}');

-- Update assignment_type based on existing data
UPDATE public.workout_assignments
SET assignment_type = CASE
  WHEN assigned_to_group_id IS NOT NULL THEN 'group'
  ELSE 'individual'
END
WHERE assignment_type IS NULL OR assignment_type = 'individual';

-- Update status based on completed flag
UPDATE public.workout_assignments
SET status = CASE
  WHEN completed = TRUE THEN 'completed'
  ELSE 'assigned'
END
WHERE status IS NULL OR status = 'assigned';

-- Update assigned_date to created_at for existing records
UPDATE public.workout_assignments
SET assigned_date = created_at
WHERE assigned_date IS NULL;

COMMENT ON COLUMN public.workout_assignments.workout_plan_name IS 'Cached workout plan name for display';
COMMENT ON COLUMN public.workout_assignments.assignment_type IS 'Type of assignment: individual or group';
COMMENT ON COLUMN public.workout_assignments.athlete_ids IS 'Array of athlete UUIDs assigned to this workout';
COMMENT ON COLUMN public.workout_assignments.assigned_date IS 'When the workout was assigned (different from scheduled_date)';
COMMENT ON COLUMN public.workout_assignments.status IS 'Current status: assigned, in_progress, completed, skipped';
COMMENT ON COLUMN public.workout_assignments.modifications IS 'Individual athlete modifications to the base workout';
COMMENT ON COLUMN public.workout_assignments.start_time IS 'Training session start time (HH:MM format)';
COMMENT ON COLUMN public.workout_assignments.end_time IS 'Training session end time (HH:MM format)';
COMMENT ON COLUMN public.workout_assignments.location IS 'Where the workout will take place';

-- ============================================================================
-- MIGRATION VERIFICATION
-- ============================================================================

DO $$
BEGIN
    -- Verify video_url column exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'workout_exercises' AND column_name = 'video_url'
    ) THEN
        RAISE EXCEPTION 'Migration failed: video_url column not created';
    END IF;

    -- Verify assignment columns exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'workout_assignments' AND column_name = 'workout_plan_name'
    ) THEN
        RAISE EXCEPTION 'Migration failed: workout_plan_name column not created';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'workout_assignments' AND column_name = 'assignment_type'
    ) THEN
        RAISE EXCEPTION 'Migration failed: assignment_type column not created';
    END IF;

    RAISE NOTICE 'All migrations completed successfully!';
END $$;

COMMIT;

-- ============================================================================
-- POST-MIGRATION STEPS
-- ============================================================================
-- 1. Export updated schema: ./scripts/database/export-schema.sh
-- 2. Verify application works: npm run dev
-- 3. Run TypeScript check: npm run typecheck
-- 4. Test workout creation with video URLs
-- 5. Test workout assignment with new fields
-- ============================================================================
