-- Phase 4: Visual Progress & Social Features (CORRECTED for existing LiteWork schema)
-- Create progress_photos table for before/after photo tracking
-- NOTE: This version uses 'users' table instead of 'profiles'

CREATE TABLE IF NOT EXISTS progress_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Photo details
  image_url TEXT NOT NULL,
  thumbnail_url TEXT,
  caption TEXT,
  photo_date DATE NOT NULL DEFAULT CURRENT_DATE,
  
  -- Measurements (optional)
  bodyweight DECIMAL(5,1),
  body_fat_percentage DECIMAL(4,1),
  
  -- Before/After linking
  is_before_photo BOOLEAN DEFAULT FALSE,
  is_after_photo BOOLEAN DEFAULT FALSE,
  linked_photo_id UUID REFERENCES progress_photos(id) ON DELETE SET NULL,
  
  -- Visibility & Privacy
  visibility VARCHAR(20) NOT NULL DEFAULT 'private' CHECK (visibility IN ('private', 'coaches', 'group', 'public')),
  
  -- Metadata
  upload_source VARCHAR(50) DEFAULT 'web',  -- 'web', 'mobile', 'ios', 'android'
  file_size_bytes INTEGER,
  mime_type VARCHAR(50),
  
  -- Audit fields
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_progress_photos_athlete_id ON progress_photos(athlete_id);
CREATE INDEX IF NOT EXISTS idx_progress_photos_date ON progress_photos(photo_date DESC);
CREATE INDEX IF NOT EXISTS idx_progress_photos_visibility ON progress_photos(visibility);
CREATE INDEX IF NOT EXISTS idx_progress_photos_before_after ON progress_photos(is_before_photo, is_after_photo) 
  WHERE is_before_photo = TRUE OR is_after_photo = TRUE;

-- RLS Policies
ALTER TABLE progress_photos ENABLE ROW LEVEL SECURITY;

-- Athletes can view their own photos
DROP POLICY IF EXISTS "Athletes can view own photos" ON progress_photos;
CREATE POLICY "Athletes can view own photos"
  ON progress_photos FOR SELECT
  USING (auth.uid() = athlete_id);

-- Athletes can upload photos
DROP POLICY IF EXISTS "Athletes can upload own photos" ON progress_photos;
CREATE POLICY "Athletes can upload own photos"
  ON progress_photos FOR INSERT
  WITH CHECK (auth.uid() = athlete_id);

-- Athletes can update their own photos
DROP POLICY IF EXISTS "Athletes can update own photos" ON progress_photos;
CREATE POLICY "Athletes can update own photos"
  ON progress_photos FOR UPDATE
  USING (auth.uid() = athlete_id);

-- Athletes can delete their own photos
DROP POLICY IF EXISTS "Athletes can delete own photos" ON progress_photos;
CREATE POLICY "Athletes can delete own photos"
  ON progress_photos FOR DELETE
  USING (auth.uid() = athlete_id);

-- Coaches can view photos based on visibility (CORRECTED to use 'users' table)
DROP POLICY IF EXISTS "Coaches can view athlete photos" ON progress_photos;
CREATE POLICY "Coaches can view athlete photos"
  ON progress_photos FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.role::text IN ('coach', 'admin')
    )
    AND visibility IN ('coaches', 'group', 'public')
  );

-- Group members can view group-visible photos
DROP POLICY IF EXISTS "Group members can view group photos" ON progress_photos;
CREATE POLICY "Group members can view group photos"
  ON progress_photos FOR SELECT
  USING (
    visibility = 'group'
    AND EXISTS (
      SELECT 1 FROM public.users u1
      JOIN public.users u2 ON u1.group_ids && u2.group_ids
      WHERE u1.id = progress_photos.athlete_id
      AND u2.id = auth.uid()
    )
  );

-- Public photos are viewable by all authenticated users
DROP POLICY IF EXISTS "Public photos are viewable" ON progress_photos;
CREATE POLICY "Public photos are viewable"
  ON progress_photos FOR SELECT
  USING (visibility = 'public');

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_progress_photos_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_progress_photos_timestamp ON progress_photos;
CREATE TRIGGER update_progress_photos_timestamp
  BEFORE UPDATE ON progress_photos
  FOR EACH ROW
  EXECUTE FUNCTION update_progress_photos_updated_at();

-- Workout feed table (optional - for social features)
CREATE TABLE IF NOT EXISTS workout_feed_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  workout_session_id UUID REFERENCES workout_sessions(id) ON DELETE CASCADE,
  
  -- Feed content
  feed_type VARCHAR(30) NOT NULL CHECK (feed_type IN ('workout_completed', 'pr_achieved', 'goal_completed', 'achievement_earned', 'milestone')),
  content_json JSONB,  -- Flexible content structure
  
  -- Visibility
  visibility VARCHAR(20) NOT NULL DEFAULT 'group' CHECK (visibility IN ('private', 'group', 'public')),
  
  -- Engagement (optional)
  like_count INTEGER DEFAULT 0,
  comment_count INTEGER DEFAULT 0,
  
  -- Audit fields
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_workout_feed_athlete_id ON workout_feed_items(athlete_id);
CREATE INDEX IF NOT EXISTS idx_workout_feed_created_at ON workout_feed_items(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_workout_feed_type ON workout_feed_items(feed_type);
CREATE INDEX IF NOT EXISTS idx_workout_feed_visibility ON workout_feed_items(visibility);

-- RLS Policies for workout feed
ALTER TABLE workout_feed_items ENABLE ROW LEVEL SECURITY;

-- Athletes can view their own feed items
DROP POLICY IF EXISTS "Athletes can view own feed items" ON workout_feed_items;
CREATE POLICY "Athletes can view own feed items"
  ON workout_feed_items FOR SELECT
  USING (auth.uid() = athlete_id);

-- Athletes can create feed items
DROP POLICY IF EXISTS "Athletes can create feed items" ON workout_feed_items;
CREATE POLICY "Athletes can create feed items"
  ON workout_feed_items FOR INSERT
  WITH CHECK (auth.uid() = athlete_id);

-- Group members can view group feed items (CORRECTED to use 'users' table)
DROP POLICY IF EXISTS "Group members can view group feed" ON workout_feed_items;
CREATE POLICY "Group members can view group feed"
  ON workout_feed_items FOR SELECT
  USING (
    visibility IN ('group', 'public')
    AND EXISTS (
      SELECT 1 FROM public.users u1
      JOIN public.users u2 ON u1.group_ids && u2.group_ids
      WHERE u1.id = workout_feed_items.athlete_id
      AND u2.id = auth.uid()
    )
  );

-- Coaches can view all feed items (CORRECTED to use 'users' table)
DROP POLICY IF EXISTS "Coaches can view all feed items" ON workout_feed_items;
CREATE POLICY "Coaches can view all feed items"
  ON workout_feed_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.role::text IN ('coach', 'admin')
    )
  );

-- Leaderboard snapshots (for performance)
CREATE TABLE IF NOT EXISTS leaderboard_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID REFERENCES athlete_groups(id) ON DELETE CASCADE,
  
  -- Leaderboard type
  leaderboard_type VARCHAR(30) NOT NULL CHECK (leaderboard_type IN ('weekly_volume', 'monthly_volume', 'streak', 'pr_count', 'workout_count')),
  time_period VARCHAR(20) NOT NULL,  -- 'weekly', 'monthly', 'all_time'
  
  -- Rankings (JSONB array of {athleteId, value, rank})
  rankings JSONB NOT NULL,
  
  -- Metadata
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_leaderboard_group ON leaderboard_snapshots(group_id);
CREATE INDEX IF NOT EXISTS idx_leaderboard_type ON leaderboard_snapshots(leaderboard_type);
CREATE INDEX IF NOT EXISTS idx_leaderboard_period ON leaderboard_snapshots(period_start, period_end);

-- RLS for leaderboards
ALTER TABLE leaderboard_snapshots ENABLE ROW LEVEL SECURITY;

-- Group members can view group leaderboards (CORRECTED to use 'users' table)
DROP POLICY IF EXISTS "Group members can view leaderboards" ON leaderboard_snapshots;
CREATE POLICY "Group members can view leaderboards"
  ON leaderboard_snapshots FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND leaderboard_snapshots.group_id::text = ANY(users.group_ids)
    )
  );

-- Coaches can view all leaderboards (CORRECTED to use 'users' table)
DROP POLICY IF EXISTS "Coaches can view all leaderboards" ON leaderboard_snapshots;
CREATE POLICY "Coaches can view all leaderboards"
  ON leaderboard_snapshots FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.role::text IN ('coach', 'admin')
    )
  );

-- Comments for documentation
COMMENT ON TABLE progress_photos IS 'Before/after photos for visual progress tracking with privacy controls';
COMMENT ON TABLE workout_feed_items IS 'Social feed of workout activities, PRs, and achievements';
COMMENT ON TABLE leaderboard_snapshots IS 'Pre-computed leaderboard rankings for performance';
COMMENT ON COLUMN progress_photos.visibility IS 'private: only athlete, coaches: + coaches, group: + group members, public: all';
COMMENT ON COLUMN progress_photos.linked_photo_id IS 'Links before/after photos for comparison slider';
