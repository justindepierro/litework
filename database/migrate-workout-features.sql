-- Migration: Add missing workout features to database schema
-- This adds support for all the features in the WorkoutEditor that aren't in the database yet

-- ============================================================================
-- 1. ADD MISSING COLUMNS TO workout_exercises TABLE
-- ============================================================================

-- Add tempo field (e.g., "3-1-1-0" for eccentric-pause-concentric-top)
ALTER TABLE public.workout_exercises 
ADD COLUMN IF NOT EXISTS tempo TEXT;

-- Add weight range support
ALTER TABLE public.workout_exercises 
ADD COLUMN IF NOT EXISTS weight_max DECIMAL;

ALTER TABLE public.workout_exercises 
ADD COLUMN IF NOT EXISTS percentage_max INTEGER;

-- Add percentage base KPI (which exercise to base percentage on)
ALTER TABLE public.workout_exercises 
ADD COLUMN IF NOT EXISTS percentage_base_kpi TEXT;

-- Add unilateral exercise flag
ALTER TABLE public.workout_exercises 
ADD COLUMN IF NOT EXISTS each_side BOOLEAN DEFAULT FALSE;

-- Add notes field
ALTER TABLE public.workout_exercises 
ADD COLUMN IF NOT EXISTS notes TEXT;

-- Add block instance tracking
ALTER TABLE public.workout_exercises 
ADD COLUMN IF NOT EXISTS block_instance_id TEXT;

-- Add substitution tracking
ALTER TABLE public.workout_exercises 
ADD COLUMN IF NOT EXISTS substitution_reason TEXT;

ALTER TABLE public.workout_exercises 
ADD COLUMN IF NOT EXISTS original_exercise TEXT;

ALTER TABLE public.workout_exercises 
ADD COLUMN IF NOT EXISTS progression_notes TEXT;

-- ============================================================================
-- 2. CREATE EXERCISE GROUPS TABLE (for supersets, circuits, sections)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.workout_exercise_groups (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  workout_plan_id UUID REFERENCES public.workout_plans(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('superset', 'circuit', 'section')),
  description TEXT,
  order_index INTEGER NOT NULL,
  rest_between_rounds INTEGER, -- Rest between rounds/sets (for circuits and supersets)
  rest_between_exercises INTEGER, -- Rest between exercises within the group (for circuits)
  rounds INTEGER, -- Number of rounds (for circuits)
  notes TEXT,
  block_instance_id TEXT, -- ID of the block instance this group belongs to
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_workout_exercise_groups_workout_plan 
ON public.workout_exercise_groups(workout_plan_id);

-- ============================================================================
-- 3. CREATE WORKOUT BLOCKS TABLE (reusable workout templates)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.workout_blocks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL CHECK (category IN ('warmup', 'main', 'accessory', 'cooldown', 'custom')),
  estimated_duration INTEGER DEFAULT 30,
  tags TEXT[] DEFAULT '{}',
  is_template BOOLEAN DEFAULT TRUE,
  created_by UUID REFERENCES public.users(id) NOT NULL,
  usage_count INTEGER DEFAULT 0,
  last_used TIMESTAMP WITH TIME ZONE,
  is_favorite BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_workout_blocks_created_by 
ON public.workout_blocks(created_by);

CREATE INDEX IF NOT EXISTS idx_workout_blocks_category 
ON public.workout_blocks(category);

-- ============================================================================
-- 4. CREATE BLOCK INSTANCES TABLE (track block usage in workouts)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.workout_block_instances (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  workout_plan_id UUID REFERENCES public.workout_plans(id) ON DELETE CASCADE,
  source_block_id UUID REFERENCES public.workout_blocks(id),
  source_block_name TEXT NOT NULL,
  instance_name TEXT, -- Custom name for this instance
  notes TEXT, -- Instance-specific notes
  estimated_duration INTEGER,
  -- Track customizations
  modified_exercises TEXT[] DEFAULT '{}',
  added_exercises TEXT[] DEFAULT '{}',
  removed_exercises TEXT[] DEFAULT '{}',
  modified_groups TEXT[] DEFAULT '{}',
  added_groups TEXT[] DEFAULT '{}',
  removed_groups TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_workout_block_instances_workout_plan 
ON public.workout_block_instances(workout_plan_id);

CREATE INDEX IF NOT EXISTS idx_workout_block_instances_source_block 
ON public.workout_block_instances(source_block_id);

-- ============================================================================
-- 5. CREATE BLOCK EXERCISES TABLE (exercises within blocks)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.block_exercises (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  block_id UUID REFERENCES public.workout_blocks(id) ON DELETE CASCADE,
  exercise_id TEXT NOT NULL,
  exercise_name TEXT NOT NULL,
  sets INTEGER NOT NULL,
  reps INTEGER NOT NULL,
  weight_type weight_type NOT NULL,
  weight DECIMAL,
  weight_max DECIMAL,
  percentage INTEGER,
  percentage_max INTEGER,
  percentage_base_kpi TEXT,
  tempo TEXT,
  each_side BOOLEAN DEFAULT FALSE,
  rest_time INTEGER DEFAULT 60,
  notes TEXT,
  order_index INTEGER NOT NULL,
  group_id TEXT, -- For supersets/circuits within blocks
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_block_exercises_block_id 
ON public.block_exercises(block_id);

-- ============================================================================
-- 6. CREATE BLOCK GROUPS TABLE (groups within blocks)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.block_exercise_groups (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  block_id UUID REFERENCES public.workout_blocks(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('superset', 'circuit', 'section')),
  description TEXT,
  order_index INTEGER NOT NULL,
  rest_between_rounds INTEGER,
  rest_between_exercises INTEGER,
  rounds INTEGER,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_block_exercise_groups_block_id 
ON public.block_exercise_groups(block_id);

-- ============================================================================
-- 7. ADD TRIGGERS FOR UPDATED_AT TIMESTAMPS
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for workout_blocks
DROP TRIGGER IF EXISTS update_workout_blocks_updated_at ON public.workout_blocks;
CREATE TRIGGER update_workout_blocks_updated_at
    BEFORE UPDATE ON public.workout_blocks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger for workout_block_instances
DROP TRIGGER IF EXISTS update_workout_block_instances_updated_at ON public.workout_block_instances;
CREATE TRIGGER update_workout_block_instances_updated_at
    BEFORE UPDATE ON public.workout_block_instances
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 8. ADD ROW LEVEL SECURITY POLICIES
-- ============================================================================

-- Enable RLS on new tables
ALTER TABLE public.workout_exercise_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_block_instances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.block_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.block_exercise_groups ENABLE ROW LEVEL SECURITY;

-- Policies for workout_exercise_groups (follows workout_plans policies)
CREATE POLICY "workout_exercise_groups_select" ON public.workout_exercise_groups
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.workout_plans wp
            WHERE wp.id = workout_exercise_groups.workout_plan_id
        )
    );

CREATE POLICY "workout_exercise_groups_insert" ON public.workout_exercise_groups
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.workout_plans wp
            WHERE wp.id = workout_exercise_groups.workout_plan_id
            AND wp.created_by = auth.uid()
        )
    );

CREATE POLICY "workout_exercise_groups_update" ON public.workout_exercise_groups
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.workout_plans wp
            WHERE wp.id = workout_exercise_groups.workout_plan_id
            AND wp.created_by = auth.uid()
        )
    );

CREATE POLICY "workout_exercise_groups_delete" ON public.workout_exercise_groups
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.workout_plans wp
            WHERE wp.id = workout_exercise_groups.workout_plan_id
            AND wp.created_by = auth.uid()
        )
    );

-- Policies for workout_blocks (coach/admin can manage)
CREATE POLICY "workout_blocks_select" ON public.workout_blocks
    FOR SELECT USING (true); -- Everyone can see blocks

CREATE POLICY "workout_blocks_insert" ON public.workout_blocks
    FOR INSERT WITH CHECK (
        created_by = auth.uid()
        AND EXISTS (
            SELECT 1 FROM public.users
            WHERE id = auth.uid()
            AND role IN ('coach', 'admin')
        )
    );

CREATE POLICY "workout_blocks_update" ON public.workout_blocks
    FOR UPDATE USING (
        created_by = auth.uid()
    );

CREATE POLICY "workout_blocks_delete" ON public.workout_blocks
    FOR DELETE USING (
        created_by = auth.uid()
    );

-- Policies for workout_block_instances (follows workout_plans policies)
CREATE POLICY "workout_block_instances_select" ON public.workout_block_instances
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.workout_plans wp
            WHERE wp.id = workout_block_instances.workout_plan_id
        )
    );

CREATE POLICY "workout_block_instances_insert" ON public.workout_block_instances
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.workout_plans wp
            WHERE wp.id = workout_block_instances.workout_plan_id
            AND wp.created_by = auth.uid()
        )
    );

CREATE POLICY "workout_block_instances_update" ON public.workout_block_instances
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.workout_plans wp
            WHERE wp.id = workout_block_instances.workout_plan_id
            AND wp.created_by = auth.uid()
        )
    );

CREATE POLICY "workout_block_instances_delete" ON public.workout_block_instances
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.workout_plans wp
            WHERE wp.id = workout_block_instances.workout_plan_id
            AND wp.created_by = auth.uid()
        )
    );

-- Policies for block_exercises (follows workout_blocks policies)
CREATE POLICY "block_exercises_select" ON public.block_exercises
    FOR SELECT USING (true); -- Everyone can see exercises in blocks

CREATE POLICY "block_exercises_insert" ON public.block_exercises
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.workout_blocks wb
            WHERE wb.id = block_exercises.block_id
            AND wb.created_by = auth.uid()
        )
    );

CREATE POLICY "block_exercises_update" ON public.block_exercises
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.workout_blocks wb
            WHERE wb.id = block_exercises.block_id
            AND wb.created_by = auth.uid()
        )
    );

CREATE POLICY "block_exercises_delete" ON public.block_exercises
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.workout_blocks wb
            WHERE wb.id = block_exercises.block_id
            AND wb.created_by = auth.uid()
        )
    );

-- Policies for block_exercise_groups (follows workout_blocks policies)
CREATE POLICY "block_exercise_groups_select" ON public.block_exercise_groups
    FOR SELECT USING (true); -- Everyone can see groups in blocks

CREATE POLICY "block_exercise_groups_insert" ON public.block_exercise_groups
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.workout_blocks wb
            WHERE wb.id = block_exercise_groups.block_id
            AND wb.created_by = auth.uid()
        )
    );

CREATE POLICY "block_exercise_groups_update" ON public.block_exercise_groups
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.workout_blocks wb
            WHERE wb.id = block_exercise_groups.block_id
            AND wb.created_by = auth.uid()
        )
    );

CREATE POLICY "block_exercise_groups_delete" ON public.block_exercise_groups
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.workout_blocks wb
            WHERE wb.id = block_exercise_groups.block_id
            AND wb.created_by = auth.uid()
        )
    );

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================
-- This migration adds:
-- 1. Missing fields to workout_exercises (tempo, ranges, notes, etc.)
-- 2. workout_exercise_groups table for supersets/circuits/sections
-- 3. workout_blocks table for reusable workout templates
-- 4. workout_block_instances table to track block usage
-- 5. block_exercises and block_exercise_groups for block content
-- 6. Proper indexes and RLS policies
-- ============================================================================
