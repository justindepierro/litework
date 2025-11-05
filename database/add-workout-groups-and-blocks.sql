-- Add missing tables for workout groups and block instances
-- Run this in your Supabase SQL Editor

-- Workout Exercise Groups table (supersets, circuits, sections)
CREATE TABLE IF NOT EXISTS public.workout_exercise_groups (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  workout_plan_id UUID REFERENCES public.workout_plans(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('superset', 'circuit', 'section')),
  description TEXT,
  order_index INTEGER NOT NULL,
  rest_between_rounds INTEGER, -- For circuits
  rest_between_exercises INTEGER, -- For supersets/circuits
  rounds INTEGER, -- For circuits
  notes TEXT,
  block_instance_id UUID, -- Reference to block if group came from block
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Workout Block Instances table (reusable workout templates)
CREATE TABLE IF NOT EXISTS public.workout_block_instances (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  workout_plan_id UUID REFERENCES public.workout_plans(id) ON DELETE CASCADE NOT NULL,
  source_block_id UUID, -- Reference to original block template
  source_block_name TEXT NOT NULL,
  instance_name TEXT, -- Custom name for this instance
  notes TEXT,
  estimated_duration INTEGER,
  modified_exercises JSONB DEFAULT '[]'::jsonb, -- Customizations
  added_exercises JSONB DEFAULT '[]'::jsonb,
  removed_exercises JSONB DEFAULT '[]'::jsonb,
  modified_groups JSONB DEFAULT '[]'::jsonb,
  added_groups JSONB DEFAULT '[]'::jsonb,
  removed_groups JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_workout_exercise_groups_workout_plan 
  ON public.workout_exercise_groups(workout_plan_id);

CREATE INDEX IF NOT EXISTS idx_workout_exercise_groups_order 
  ON public.workout_exercise_groups(workout_plan_id, order_index);

CREATE INDEX IF NOT EXISTS idx_workout_block_instances_workout_plan 
  ON public.workout_block_instances(workout_plan_id);

-- Update workout_exercises table to add missing columns
DO $$ 
BEGIN
  -- Add weight_max column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'workout_exercises' 
    AND column_name = 'weight_max'
  ) THEN
    ALTER TABLE public.workout_exercises ADD COLUMN weight_max DECIMAL;
  END IF;

  -- Add percentage_max column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'workout_exercises' 
    AND column_name = 'percentage_max'
  ) THEN
    ALTER TABLE public.workout_exercises ADD COLUMN percentage_max INTEGER;
  END IF;

  -- Add percentage_base_kpi column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'workout_exercises' 
    AND column_name = 'percentage_base_kpi'
  ) THEN
    ALTER TABLE public.workout_exercises ADD COLUMN percentage_base_kpi TEXT;
  END IF;

  -- Add tempo column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'workout_exercises' 
    AND column_name = 'tempo'
  ) THEN
    ALTER TABLE public.workout_exercises ADD COLUMN tempo TEXT;
  END IF;

  -- Add each_side column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'workout_exercises' 
    AND column_name = 'each_side'
  ) THEN
    ALTER TABLE public.workout_exercises ADD COLUMN each_side BOOLEAN DEFAULT FALSE;
  END IF;

  -- Add notes column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'workout_exercises' 
    AND column_name = 'notes'
  ) THEN
    ALTER TABLE public.workout_exercises ADD COLUMN notes TEXT;
  END IF;

  -- Add block_instance_id column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'workout_exercises' 
    AND column_name = 'block_instance_id'
  ) THEN
    ALTER TABLE public.workout_exercises ADD COLUMN block_instance_id UUID 
      REFERENCES public.workout_block_instances(id) ON DELETE SET NULL;
  END IF;

  -- Add substitution_reason column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'workout_exercises' 
    AND column_name = 'substitution_reason'
  ) THEN
    ALTER TABLE public.workout_exercises ADD COLUMN substitution_reason TEXT;
  END IF;

  -- Add original_exercise column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'workout_exercises' 
    AND column_name = 'original_exercise'
  ) THEN
    ALTER TABLE public.workout_exercises ADD COLUMN original_exercise TEXT;
  END IF;

  -- Add progression_notes column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'workout_exercises' 
    AND column_name = 'progression_notes'
  ) THEN
    ALTER TABLE public.workout_exercises ADD COLUMN progression_notes TEXT;
  END IF;

  -- Update group_id to be UUID type if it's TEXT
  -- This is more complex and may require data migration
  -- For now, we'll leave it as TEXT since it references workout_exercise_groups.id
END $$;

-- Grant permissions (adjust based on your setup)
GRANT ALL ON public.workout_exercise_groups TO authenticated;
GRANT ALL ON public.workout_block_instances TO authenticated;

-- Enable Row Level Security
ALTER TABLE public.workout_exercise_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_block_instances ENABLE ROW LEVEL SECURITY;

-- RLS Policies for workout_exercise_groups
CREATE POLICY "workout_exercise_groups_select_policy" 
  ON public.workout_exercise_groups FOR SELECT 
  TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM public.workout_plans 
      WHERE workout_plans.id = workout_exercise_groups.workout_plan_id
    )
  );

CREATE POLICY "workout_exercise_groups_insert_policy" 
  ON public.workout_exercise_groups FOR INSERT 
  TO authenticated 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.workout_plans 
      WHERE workout_plans.id = workout_exercise_groups.workout_plan_id
      AND workout_plans.created_by = auth.uid()
    )
  );

CREATE POLICY "workout_exercise_groups_update_policy" 
  ON public.workout_exercise_groups FOR UPDATE 
  TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM public.workout_plans 
      WHERE workout_plans.id = workout_exercise_groups.workout_plan_id
      AND workout_plans.created_by = auth.uid()
    )
  );

CREATE POLICY "workout_exercise_groups_delete_policy" 
  ON public.workout_exercise_groups FOR DELETE 
  TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM public.workout_plans 
      WHERE workout_plans.id = workout_exercise_groups.workout_plan_id
      AND workout_plans.created_by = auth.uid()
    )
  );

-- RLS Policies for workout_block_instances
CREATE POLICY "workout_block_instances_select_policy" 
  ON public.workout_block_instances FOR SELECT 
  TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM public.workout_plans 
      WHERE workout_plans.id = workout_block_instances.workout_plan_id
    )
  );

CREATE POLICY "workout_block_instances_insert_policy" 
  ON public.workout_block_instances FOR INSERT 
  TO authenticated 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.workout_plans 
      WHERE workout_plans.id = workout_block_instances.workout_plan_id
      AND workout_plans.created_by = auth.uid()
    )
  );

CREATE POLICY "workout_block_instances_update_policy" 
  ON public.workout_block_instances FOR UPDATE 
  TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM public.workout_plans 
      WHERE workout_plans.id = workout_block_instances.workout_plan_id
      AND workout_plans.created_by = auth.uid()
    )
  );

CREATE POLICY "workout_block_instances_delete_policy" 
  ON public.workout_block_instances FOR DELETE 
  TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM public.workout_plans 
      WHERE workout_plans.id = workout_block_instances.workout_plan_id
      AND workout_plans.created_by = auth.uid()
    )
  );

-- Verify tables were created
SELECT 
  'workout_exercise_groups' as table_name, 
  COUNT(*) as column_count 
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'workout_exercise_groups'
UNION ALL
SELECT 
  'workout_block_instances' as table_name, 
  COUNT(*) as column_count 
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'workout_block_instances';
