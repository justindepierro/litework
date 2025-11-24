-- Phase 3: Goals & Motivation System (CORRECTED for existing LiteWork schema)
-- Create athlete_goals table for personal goal tracking
-- NOTE: This version uses 'users' table instead of 'profiles'

CREATE TABLE IF NOT EXISTS athlete_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Goal details
  goal_type VARCHAR(50) NOT NULL CHECK (goal_type IN (
    'strength',      -- Hit a specific 1RM
    'volume',        -- Reach weekly volume target
    'frequency',     -- Workout X times per week
    'streak',        -- Maintain workout streak
    'bodyweight',    -- Reach target bodyweight
    'custom'         -- Custom text goal
  )),
  title VARCHAR(200) NOT NULL,
  description TEXT,
  
  -- Strength-specific fields
  exercise_id UUID REFERENCES exercises(id) ON DELETE SET NULL,
  target_weight DECIMAL(6,2),  -- For strength goals
  
  -- Volume/frequency fields
  target_volume INTEGER,        -- Weekly volume in lbs
  target_frequency INTEGER,     -- Workouts per week
  target_streak INTEGER,        -- Days streak
  
  -- Bodyweight fields
  target_bodyweight DECIMAL(5,1),
  
  -- Progress tracking
  current_value DECIMAL(10,2),
  progress_percentage INTEGER GENERATED ALWAYS AS (
    CASE 
      WHEN target_weight IS NOT NULL AND target_weight > 0 THEN 
        LEAST(100, FLOOR((current_value / target_weight) * 100))
      WHEN target_volume IS NOT NULL AND target_volume > 0 THEN
        LEAST(100, FLOOR((current_value / target_volume) * 100))
      WHEN target_frequency IS NOT NULL AND target_frequency > 0 THEN
        LEAST(100, FLOOR((current_value / target_frequency) * 100))
      WHEN target_streak IS NOT NULL AND target_streak > 0 THEN
        LEAST(100, FLOOR((current_value / target_streak) * 100))
      WHEN target_bodyweight IS NOT NULL AND target_bodyweight > 0 THEN
        LEAST(100, FLOOR((current_value / target_bodyweight) * 100))
      ELSE 0
    END
  ) STORED,
  
  -- Status
  status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'abandoned')),
  deadline DATE,
  completed_at TIMESTAMP WITH TIME ZONE,
  
  -- Audit fields
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_athlete_goals_athlete_id ON athlete_goals(athlete_id);
CREATE INDEX IF NOT EXISTS idx_athlete_goals_status ON athlete_goals(status);
CREATE INDEX IF NOT EXISTS idx_athlete_goals_deadline ON athlete_goals(deadline);
CREATE INDEX IF NOT EXISTS idx_athlete_goals_exercise_id ON athlete_goals(exercise_id) WHERE exercise_id IS NOT NULL;

-- RLS Policies
ALTER TABLE athlete_goals ENABLE ROW LEVEL SECURITY;

-- Athletes can view their own goals
DROP POLICY IF EXISTS "Athletes can view own goals" ON athlete_goals;
CREATE POLICY "Athletes can view own goals"
  ON athlete_goals FOR SELECT
  USING (auth.uid() = athlete_id);

-- Athletes can create their own goals
DROP POLICY IF EXISTS "Athletes can create own goals" ON athlete_goals;
CREATE POLICY "Athletes can create own goals"
  ON athlete_goals FOR INSERT
  WITH CHECK (auth.uid() = athlete_id);

-- Athletes can update their own goals
DROP POLICY IF EXISTS "Athletes can update own goals" ON athlete_goals;
CREATE POLICY "Athletes can update own goals"
  ON athlete_goals FOR UPDATE
  USING (auth.uid() = athlete_id);

-- Athletes can delete their own goals
DROP POLICY IF EXISTS "Athletes can delete own goals" ON athlete_goals;
CREATE POLICY "Athletes can delete own goals"
  ON athlete_goals FOR DELETE
  USING (auth.uid() = athlete_id);

-- Coaches can view their athletes' goals (CORRECTED to use 'users' table)
DROP POLICY IF EXISTS "Coaches can view athlete goals" ON athlete_goals;
CREATE POLICY "Coaches can view athlete goals"
  ON athlete_goals FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.role::text IN ('coach', 'admin')
    )
  );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_athlete_goals_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_athlete_goals_timestamp ON athlete_goals;
CREATE TRIGGER update_athlete_goals_timestamp
  BEFORE UPDATE ON athlete_goals
  FOR EACH ROW
  EXECUTE FUNCTION update_athlete_goals_updated_at();

-- Create achievements table for gamification
CREATE TABLE IF NOT EXISTS athlete_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Achievement details
  achievement_type VARCHAR(50) NOT NULL CHECK (achievement_type IN (
    'first_workout',
    'workouts_10',
    'workouts_25',
    'workouts_50',
    'workouts_100',
    'streak_7',
    'streak_30',
    'streak_100',
    'pr_first',
    'pr_10',
    'pr_25',
    'volume_milestone_100k',
    'volume_milestone_250k',
    'volume_milestone_500k',
    'goal_completed_first',
    'goal_completed_5',
    'elite_strength'
  )),
  title VARCHAR(100) NOT NULL,
  description TEXT,
  icon VARCHAR(50),  -- Icon name or emoji
  
  -- Tracking
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_highlighted BOOLEAN DEFAULT FALSE,  -- Feature on profile
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add missing columns if table already exists
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='athlete_achievements' AND column_name='is_highlighted') THEN
    ALTER TABLE athlete_achievements ADD COLUMN is_highlighted BOOLEAN DEFAULT FALSE;
  END IF;
END $$;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_athlete_achievements_athlete_id ON athlete_achievements(athlete_id);
CREATE INDEX IF NOT EXISTS idx_athlete_achievements_type ON athlete_achievements(achievement_type);
CREATE INDEX IF NOT EXISTS idx_athlete_achievements_earned_at ON athlete_achievements(earned_at DESC);

-- Prevent duplicate achievements
CREATE UNIQUE INDEX IF NOT EXISTS idx_athlete_achievements_unique 
  ON athlete_achievements(athlete_id, achievement_type);

-- RLS Policies
ALTER TABLE athlete_achievements ENABLE ROW LEVEL SECURITY;

-- Athletes can view their own achievements
DROP POLICY IF EXISTS "Athletes can view own achievements" ON athlete_achievements;
CREATE POLICY "Athletes can view own achievements"
  ON athlete_achievements FOR SELECT
  USING (auth.uid() = athlete_id);

-- System can insert achievements (for trigger functions)
DROP POLICY IF EXISTS "System can insert achievements" ON athlete_achievements;
CREATE POLICY "System can insert achievements"
  ON athlete_achievements FOR INSERT
  WITH CHECK (true);

-- Athletes can update highlighted status
DROP POLICY IF EXISTS "Athletes can update own achievements" ON athlete_achievements;
CREATE POLICY "Athletes can update own achievements"
  ON athlete_achievements FOR UPDATE
  USING (auth.uid() = athlete_id);

-- Coaches can view athlete achievements (CORRECTED to use 'users' table)
DROP POLICY IF EXISTS "Coaches can view athlete achievements" ON athlete_achievements;
CREATE POLICY "Coaches can view athlete achievements"
  ON athlete_achievements FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.role::text IN ('coach', 'admin')
    )
  );

-- Strength standards reference table (optional - can be hardcoded in frontend)
CREATE TABLE IF NOT EXISTS strength_standards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exercise_id UUID NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
  bodyweight_category VARCHAR(20) NOT NULL,  -- e.g., '132', '148', '165', '181', '198', '220', '242', '275', '308', '308+'
  
  -- Standards in lbs (multiply bodyweight for relative strength)
  untrained DECIMAL(6,2),
  novice DECIMAL(6,2),
  intermediate DECIMAL(6,2),
  advanced DECIMAL(6,2),
  elite DECIMAL(6,2),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_strength_standards_exercise ON strength_standards(exercise_id);
CREATE INDEX IF NOT EXISTS idx_strength_standards_bodyweight ON strength_standards(bodyweight_category);

-- Make strength standards publicly readable
ALTER TABLE strength_standards ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Strength standards are public" ON strength_standards;
CREATE POLICY "Strength standards are public"
  ON strength_standards FOR SELECT
  USING (true);

-- Comments for documentation
COMMENT ON TABLE athlete_goals IS 'Personal goals set by athletes for motivation and progress tracking';
COMMENT ON TABLE athlete_achievements IS 'Badges and achievements earned by athletes based on milestones';
COMMENT ON TABLE strength_standards IS 'Reference standards for comparing athlete strength levels (e.g., ExRx standards)';
COMMENT ON COLUMN athlete_goals.progress_percentage IS 'Auto-calculated progress towards goal (0-100)';
COMMENT ON COLUMN athlete_achievements.is_highlighted IS 'Featured achievement to display on profile';
