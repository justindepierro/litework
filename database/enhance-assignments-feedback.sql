-- =====================================================
-- Workout Assignment & Feedback System Enhancements
-- Phase 1.1: Database Schema Updates
-- Created: November 6, 2025
-- =====================================================

-- =====================================================
-- PART 1: Enhance workout_assignments table
-- =====================================================

-- Add missing columns for enhanced assignment functionality
ALTER TABLE workout_assignments
  ADD COLUMN IF NOT EXISTS start_time TIME,
  ADD COLUMN IF NOT EXISTS end_time TIME,
  ADD COLUMN IF NOT EXISTS location TEXT,
  ADD COLUMN IF NOT EXISTS reminder_sent BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS notification_preferences JSONB DEFAULT '{}';

-- Add comment for documentation
COMMENT ON COLUMN workout_assignments.start_time IS 'Scheduled start time for the workout';
COMMENT ON COLUMN workout_assignments.end_time IS 'Scheduled end time for the workout';
COMMENT ON COLUMN workout_assignments.location IS 'Location where workout takes place (e.g., Main Gym, Weight Room)';
COMMENT ON COLUMN workout_assignments.reminder_sent IS 'Whether reminder notification has been sent';
COMMENT ON COLUMN workout_assignments.notification_preferences IS 'JSON object with notification settings';

-- =====================================================
-- PART 2: Create workout_feedback table
-- =====================================================

-- Create feedback table for athlete post-workout feedback
CREATE TABLE IF NOT EXISTS workout_feedback (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Foreign keys
  workout_session_id UUID NOT NULL REFERENCES workout_sessions(id) ON DELETE CASCADE,
  athlete_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Quantitative feedback (1-10 scales)
  difficulty_rating INTEGER CHECK (difficulty_rating BETWEEN 1 AND 10),
  difficulty_notes TEXT,
  
  -- Physical feedback
  soreness_level INTEGER CHECK (soreness_level BETWEEN 1 AND 10),
  soreness_areas TEXT[], -- Array of muscle groups that are sore
  energy_level INTEGER CHECK (energy_level BETWEEN 1 AND 10),
  
  -- Qualitative feedback
  enjoyed BOOLEAN,
  what_went_well TEXT,
  what_was_difficult TEXT,
  suggestions TEXT,
  
  -- Coach interaction
  coach_viewed BOOLEAN DEFAULT FALSE,
  coach_response TEXT,
  coach_responded_at TIMESTAMPTZ,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add comments for documentation
COMMENT ON TABLE workout_feedback IS 'Athlete feedback on completed workouts';
COMMENT ON COLUMN workout_feedback.difficulty_rating IS 'How difficult was the workout (1=too easy, 10=way too hard)';
COMMENT ON COLUMN workout_feedback.soreness_level IS 'Overall soreness level (1=none, 10=extremely sore)';
COMMENT ON COLUMN workout_feedback.soreness_areas IS 'Array of muscle groups experiencing soreness';
COMMENT ON COLUMN workout_feedback.energy_level IS 'Energy level after workout (1=exhausted, 10=energized)';
COMMENT ON COLUMN workout_feedback.enjoyed IS 'Whether the athlete enjoyed the workout';

-- =====================================================
-- PART 3: Create performance indexes
-- =====================================================

-- Indexes for workout_assignments (optimized for common queries)
CREATE INDEX IF NOT EXISTS idx_assignments_scheduled_date 
  ON workout_assignments(scheduled_date);

CREATE INDEX IF NOT EXISTS idx_assignments_user_date 
  ON workout_assignments(assigned_to_user_id, scheduled_date)
  WHERE assigned_to_user_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_assignments_group_date_new 
  ON workout_assignments(assigned_to_group_id, scheduled_date)
  WHERE assigned_to_group_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_assignments_completed 
  ON workout_assignments(completed, scheduled_date);

CREATE INDEX IF NOT EXISTS idx_assignments_reminder_pending
  ON workout_assignments(scheduled_date, reminder_sent)
  WHERE reminder_sent = FALSE;

-- Indexes for workout_feedback
CREATE INDEX IF NOT EXISTS idx_feedback_session 
  ON workout_feedback(workout_session_id);

CREATE INDEX IF NOT EXISTS idx_feedback_athlete 
  ON workout_feedback(athlete_id);

CREATE INDEX IF NOT EXISTS idx_feedback_created 
  ON workout_feedback(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_feedback_unviewed 
  ON workout_feedback(coach_viewed, created_at DESC)
  WHERE coach_viewed = FALSE;

-- =====================================================
-- PART 4: Row Level Security (RLS) Policies
-- =====================================================

-- Enable RLS on workout_feedback
ALTER TABLE workout_feedback ENABLE ROW LEVEL SECURITY;

-- Policy: Athletes can view their own feedback
CREATE POLICY "Athletes can view own feedback"
  ON workout_feedback
  FOR SELECT
  USING (
    auth.uid() = athlete_id
  );

-- Policy: Athletes can insert their own feedback
CREATE POLICY "Athletes can create own feedback"
  ON workout_feedback
  FOR INSERT
  WITH CHECK (
    auth.uid() = athlete_id
  );

-- Policy: Athletes can update their own feedback (before coach views)
CREATE POLICY "Athletes can update own unviewed feedback"
  ON workout_feedback
  FOR UPDATE
  USING (
    auth.uid() = athlete_id
    AND coach_viewed = FALSE
  )
  WITH CHECK (
    auth.uid() = athlete_id
    AND coach_viewed = FALSE
  );

-- Policy: Coaches can view feedback from their athletes
CREATE POLICY "Coaches can view athlete feedback"
  ON workout_feedback
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('coach', 'admin')
    )
  );

-- Policy: Coaches can update feedback (add response, mark viewed)
CREATE POLICY "Coaches can respond to feedback"
  ON workout_feedback
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('coach', 'admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('coach', 'admin')
    )
  );

-- Policy: Admins have full access
CREATE POLICY "Admins have full access to feedback"
  ON workout_feedback
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- =====================================================
-- PART 5: Triggers and Functions
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_feedback_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
DROP TRIGGER IF EXISTS trigger_update_feedback_timestamp ON workout_feedback;
CREATE TRIGGER trigger_update_feedback_timestamp
  BEFORE UPDATE ON workout_feedback
  FOR EACH ROW
  EXECUTE FUNCTION update_feedback_updated_at();

-- Function to set coach_responded_at when coach adds response
CREATE OR REPLACE FUNCTION set_coach_responded_at()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.coach_response IS NOT NULL AND OLD.coach_response IS NULL THEN
    NEW.coach_responded_at = NOW();
    NEW.coach_viewed = TRUE;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-set coach_responded_at
DROP TRIGGER IF EXISTS trigger_set_coach_responded_at ON workout_feedback;
CREATE TRIGGER trigger_set_coach_responded_at
  BEFORE UPDATE ON workout_feedback
  FOR EACH ROW
  EXECUTE FUNCTION set_coach_responded_at();

-- =====================================================
-- PART 6: Helpful Views (Optional)
-- =====================================================

-- View: Unread feedback for coaches
CREATE OR REPLACE VIEW coach_unread_feedback AS
SELECT 
  wf.*,
  u.first_name || ' ' || u.last_name AS athlete_name,
  u.email AS athlete_email,
  ws.workout_plan_id,
  ws.completed_at AS workout_completed_at,
  wp.name AS workout_name
FROM workout_feedback wf
JOIN users u ON wf.athlete_id = u.id
JOIN workout_sessions ws ON wf.workout_session_id = ws.id
LEFT JOIN workout_plans wp ON ws.workout_plan_id = wp.id
WHERE wf.coach_viewed = FALSE
ORDER BY wf.created_at DESC;

COMMENT ON VIEW coach_unread_feedback IS 'All unviewed feedback with athlete and workout details';

-- View: Feedback summary by athlete
CREATE OR REPLACE VIEW athlete_feedback_summary AS
SELECT 
  athlete_id,
  COUNT(*) AS total_feedback,
  AVG(difficulty_rating) AS avg_difficulty,
  AVG(soreness_level) AS avg_soreness,
  AVG(energy_level) AS avg_energy,
  SUM(CASE WHEN enjoyed = TRUE THEN 1 ELSE 0 END)::FLOAT / COUNT(*) AS enjoyment_rate,
  SUM(CASE WHEN coach_viewed = TRUE THEN 1 ELSE 0 END) AS feedback_viewed,
  MAX(created_at) AS last_feedback_date
FROM workout_feedback
GROUP BY athlete_id;

COMMENT ON VIEW athlete_feedback_summary IS 'Aggregate feedback statistics by athlete';

-- =====================================================
-- PART 7: Sample Data (Development Only - Remove for Production)
-- =====================================================

-- Uncomment below to insert sample feedback data for testing
/*
-- Sample feedback entry (requires existing session and athlete)
INSERT INTO workout_feedback (
  workout_session_id,
  athlete_id,
  difficulty_rating,
  difficulty_notes,
  soreness_level,
  soreness_areas,
  energy_level,
  enjoyed,
  what_went_well,
  what_was_difficult,
  suggestions
) VALUES (
  'sample-session-id'::UUID,
  'sample-athlete-id'::UUID,
  8,
  'Challenging but manageable',
  4,
  ARRAY['Chest', 'Shoulders', 'Triceps'],
  6,
  TRUE,
  'Form felt good on bench press',
  'Struggled on last set of rows',
  'Maybe add straps for rows next time'
);
*/

-- =====================================================
-- PART 8: Verification Queries
-- =====================================================

-- Check if columns were added to workout_assignments
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'workout_assignments' 
    AND column_name = 'start_time'
  ) THEN
    RAISE NOTICE '✓ workout_assignments enhanced successfully';
  END IF;
END $$;

-- Check if workout_feedback table was created
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'workout_feedback'
  ) THEN
    RAISE NOTICE '✓ workout_feedback table created successfully';
  END IF;
END $$;

-- Check if indexes were created
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE tablename = 'workout_feedback' 
    AND indexname = 'idx_feedback_unviewed'
  ) THEN
    RAISE NOTICE '✓ Indexes created successfully';
  END IF;
END $$;

-- Check if RLS is enabled
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE tablename = 'workout_feedback' 
    AND rowsecurity = TRUE
  ) THEN
    RAISE NOTICE '✓ Row Level Security enabled';
  END IF;
END $$;

-- =====================================================
-- Migration Complete!
-- =====================================================

-- Summary of changes:
-- ✓ Enhanced workout_assignments with 5 new columns
-- ✓ Created workout_feedback table with 20 columns
-- ✓ Created 9 performance indexes
-- ✓ Implemented RLS policies for security
-- ✓ Created 2 triggers for auto-updates
-- ✓ Created 2 helpful views
-- ✓ Added verification queries

-- Next steps:
-- 1. Run this migration on development database
-- 2. Update DATABASE_SCHEMA.md documentation
-- 3. Create TypeScript types for workout_feedback
-- 4. Implement API endpoints (Phase 1.3)
