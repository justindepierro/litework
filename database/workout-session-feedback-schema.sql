-- Workout Session Feedback Schema
-- Allows athletes to provide feedback after completing workouts
-- Created: November 10, 2025

CREATE TABLE IF NOT EXISTS workout_session_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES workout_sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Feedback ratings (1-5 scale)
  difficulty_rating INTEGER CHECK (difficulty_rating >= 1 AND difficulty_rating <= 5),
  soreness_rating INTEGER CHECK (soreness_rating >= 1 AND soreness_rating <= 5),
  energy_level INTEGER CHECK (energy_level >= 1 AND energy_level <= 5),
  
  -- Optional text feedback
  notes TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ensure one feedback per session
  UNIQUE(session_id)
);

-- Indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_workout_session_feedback_session_id 
  ON workout_session_feedback(session_id);

CREATE INDEX IF NOT EXISTS idx_workout_session_feedback_user_id 
  ON workout_session_feedback(user_id);

CREATE INDEX IF NOT EXISTS idx_workout_session_feedback_created_at 
  ON workout_session_feedback(created_at DESC);

-- Enable RLS
ALTER TABLE workout_session_feedback ENABLE ROW LEVEL SECURITY;

-- Athletes can view and create their own feedback
CREATE POLICY "Athletes can view own feedback"
  ON workout_session_feedback
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Athletes can insert own feedback"
  ON workout_session_feedback
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Athletes can update own feedback"
  ON workout_session_feedback
  FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Coaches and admins can view all feedback
CREATE POLICY "Coaches can view all feedback"
  ON workout_session_feedback
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role IN ('coach', 'admin')
    )
  );

-- Auto-update timestamp trigger
CREATE OR REPLACE FUNCTION update_workout_session_feedback_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_workout_session_feedback_timestamp
  BEFORE UPDATE ON workout_session_feedback
  FOR EACH ROW
  EXECUTE FUNCTION update_workout_session_feedback_updated_at();

-- Comments for documentation
COMMENT ON TABLE workout_session_feedback IS 'Athlete feedback after completing workout sessions';
COMMENT ON COLUMN workout_session_feedback.difficulty_rating IS 'How difficult was the workout? 1=Too Easy, 5=Too Hard';
COMMENT ON COLUMN workout_session_feedback.soreness_rating IS 'How sore are you? 1=Not Sore, 5=Very Sore';
COMMENT ON COLUMN workout_session_feedback.energy_level IS 'Energy level during workout? 1=Very Low, 5=Very High';
COMMENT ON COLUMN workout_session_feedback.notes IS 'Optional text feedback from athlete';
