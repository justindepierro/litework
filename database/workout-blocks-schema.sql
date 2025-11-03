-- Workout Blocks Schema
-- Reusable workout templates for quick workout building

-- Create workout_blocks table
CREATE TABLE IF NOT EXISTS workout_blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(50) NOT NULL CHECK (category IN ('warmup', 'main', 'accessory', 'cooldown', 'custom')),
  
  -- Block content (denormalized for easy retrieval)
  exercises JSONB NOT NULL DEFAULT '[]'::jsonb,
  groups JSONB DEFAULT '[]'::jsonb,
  
  -- Metadata
  estimated_duration INTEGER NOT NULL DEFAULT 0, -- in minutes
  tags TEXT[] DEFAULT '{}',
  is_template BOOLEAN DEFAULT false, -- system template vs user-created
  
  -- Usage tracking
  usage_count INTEGER DEFAULT 0,
  last_used TIMESTAMPTZ,
  is_favorite BOOLEAN DEFAULT false,
  
  -- Ownership
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Indexes for common queries
  CONSTRAINT workout_blocks_name_check CHECK (length(name) > 0)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_workout_blocks_created_by ON workout_blocks(created_by);
CREATE INDEX IF NOT EXISTS idx_workout_blocks_category ON workout_blocks(category);
CREATE INDEX IF NOT EXISTS idx_workout_blocks_is_template ON workout_blocks(is_template);
CREATE INDEX IF NOT EXISTS idx_workout_blocks_is_favorite ON workout_blocks(is_favorite);
CREATE INDEX IF NOT EXISTS idx_workout_blocks_tags ON workout_blocks USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_workout_blocks_usage_count ON workout_blocks(usage_count DESC);
CREATE INDEX IF NOT EXISTS idx_workout_blocks_last_used ON workout_blocks(last_used DESC NULLS LAST);

-- Add block tracking to workout_plans
ALTER TABLE workout_plans
  ADD COLUMN IF NOT EXISTS block_ids UUID[] DEFAULT '{}';

-- Create index for block_ids
CREATE INDEX IF NOT EXISTS idx_workout_plans_block_ids ON workout_plans USING GIN(block_ids);

-- Row Level Security Policies
ALTER TABLE workout_blocks ENABLE ROW LEVEL SECURITY;

-- Users can view all template blocks
CREATE POLICY "Users can view template blocks"
  ON workout_blocks
  FOR SELECT
  USING (is_template = true);

-- Users can view their own blocks
CREATE POLICY "Users can view own blocks"
  ON workout_blocks
  FOR SELECT
  USING (auth.uid() = created_by);

-- Coaches and admins can view all blocks
CREATE POLICY "Coaches can view all blocks"
  ON workout_blocks
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.role IN ('coach', 'admin')
    )
  );

-- Users can create their own blocks
CREATE POLICY "Users can create own blocks"
  ON workout_blocks
  FOR INSERT
  WITH CHECK (auth.uid() = created_by);

-- Users can update their own blocks
CREATE POLICY "Users can update own blocks"
  ON workout_blocks
  FOR UPDATE
  USING (auth.uid() = created_by);

-- Users can delete their own blocks (not templates)
CREATE POLICY "Users can delete own blocks"
  ON workout_blocks
  FOR DELETE
  USING (auth.uid() = created_by AND is_template = false);

-- Admins can manage all blocks
CREATE POLICY "Admins can manage all blocks"
  ON workout_blocks
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Function to update usage statistics
CREATE OR REPLACE FUNCTION increment_block_usage(block_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE workout_blocks
  SET 
    usage_count = usage_count + 1,
    last_used = NOW(),
    updated_at = NOW()
  WHERE id = block_id;
END;
$$;

-- Function to toggle favorite status
CREATE OR REPLACE FUNCTION toggle_block_favorite(block_id UUID, user_id UUID)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_favorite boolean;
BEGIN
  SELECT is_favorite INTO current_favorite
  FROM workout_blocks
  WHERE id = block_id AND created_by = user_id;
  
  IF current_favorite IS NULL THEN
    RETURN false;
  END IF;
  
  UPDATE workout_blocks
  SET 
    is_favorite = NOT current_favorite,
    updated_at = NOW()
  WHERE id = block_id AND created_by = user_id;
  
  RETURN NOT current_favorite;
END;
$$;

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_workout_blocks_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER workout_blocks_updated_at
  BEFORE UPDATE ON workout_blocks
  FOR EACH ROW
  EXECUTE FUNCTION update_workout_blocks_updated_at();

-- Comments for documentation
COMMENT ON TABLE workout_blocks IS 'Reusable workout block templates for quick workout building';
COMMENT ON COLUMN workout_blocks.exercises IS 'JSONB array of WorkoutExercise objects';
COMMENT ON COLUMN workout_blocks.groups IS 'JSONB array of ExerciseGroup objects for organization';
COMMENT ON COLUMN workout_blocks.category IS 'Block type: warmup, main, accessory, cooldown, or custom';
COMMENT ON COLUMN workout_blocks.is_template IS 'System template (true) or user-created (false)';
COMMENT ON COLUMN workout_blocks.usage_count IS 'Number of times this block has been used';
COMMENT ON COLUMN workout_blocks.tags IS 'Array of tags for filtering (e.g., push, pull, legs)';
