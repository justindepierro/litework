-- Achievement System Schema
-- Tracks athlete achievements and badges

CREATE TABLE IF NOT EXISTS athlete_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  achievement_type TEXT NOT NULL,
  earned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Prevent duplicate achievements
  UNIQUE(athlete_id, achievement_type)
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_athlete_achievements_athlete_id ON athlete_achievements(athlete_id);
CREATE INDEX IF NOT EXISTS idx_athlete_achievements_earned_at ON athlete_achievements(earned_at DESC);

-- Enable RLS
ALTER TABLE athlete_achievements ENABLE ROW LEVEL SECURITY;

-- Athletes can view their own achievements
CREATE POLICY "Athletes can view own achievements"
  ON athlete_achievements
  FOR SELECT
  USING (athlete_id = auth.uid());

-- System can insert achievements (via service role)
CREATE POLICY "System can insert achievements"
  ON athlete_achievements
  FOR INSERT
  WITH CHECK (true);

-- Coaches/admins can view all achievements
CREATE POLICY "Coaches can view all achievements"
  ON athlete_achievements
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role IN ('coach', 'admin')
    )
  );

COMMENT ON TABLE athlete_achievements IS 'Tracks achievement badges earned by athletes';
COMMENT ON COLUMN athlete_achievements.achievement_type IS 'Type of achievement: first_workout, streak_3, volume_10k, etc.';
