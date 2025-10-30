-- Exercise Library Database Schema
-- Add this to your existing Supabase database

-- Exercise Categories
CREATE TABLE public.exercise_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  color TEXT DEFAULT '#6366f1',
  icon TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Target Muscle Groups
CREATE TABLE public.muscle_groups (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  category TEXT, -- Primary, Secondary, Stabilizer
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Equipment Types
CREATE TABLE public.equipment_types (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  availability TEXT DEFAULT 'common', -- common, specialized, bodyweight
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Main Exercises Table
CREATE TABLE public.exercises (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category_id UUID REFERENCES public.exercise_categories(id),
  instructions JSONB DEFAULT '[]', -- Array of instruction steps
  difficulty_level INTEGER DEFAULT 1 CHECK (difficulty_level >= 1 AND difficulty_level <= 5),
  equipment_needed TEXT[] DEFAULT '{}', -- Array of equipment IDs or names
  is_compound BOOLEAN DEFAULT FALSE,
  is_bodyweight BOOLEAN DEFAULT FALSE,
  is_unilateral BOOLEAN DEFAULT FALSE,
  estimated_duration_minutes INTEGER DEFAULT 5,
  safety_notes TEXT,
  video_url TEXT,
  image_url TEXT,
  created_by UUID REFERENCES public.users(id),
  is_active BOOLEAN DEFAULT TRUE,
  is_approved BOOLEAN DEFAULT FALSE, -- For admin approval workflow
  tags TEXT[] DEFAULT '{}', -- Flexible tagging system
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Exercise Muscle Groups (Many-to-Many)
CREATE TABLE public.exercise_muscle_groups (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  exercise_id UUID REFERENCES public.exercises(id) ON DELETE CASCADE,
  muscle_group_id UUID REFERENCES public.muscle_groups(id),
  involvement_type TEXT DEFAULT 'primary' CHECK (involvement_type IN ('primary', 'secondary', 'stabilizer')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(exercise_id, muscle_group_id)
);

-- Exercise Variations
CREATE TABLE public.exercise_variations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  parent_exercise_id UUID REFERENCES public.exercises(id) ON DELETE CASCADE,
  variation_exercise_id UUID REFERENCES public.exercises(id) ON DELETE CASCADE,
  variation_type TEXT NOT NULL CHECK (variation_type IN ('easier', 'harder', 'equipment', 'angle', 'grip', 'range')),
  reason TEXT,
  difficulty_modifier INTEGER DEFAULT 0, -- -2 to +2 relative to parent
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(parent_exercise_id, variation_exercise_id)
);

-- Exercise Analytics (track usage)
CREATE TABLE public.exercise_analytics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  exercise_id UUID REFERENCES public.exercises(id) ON DELETE CASCADE,
  usage_count INTEGER DEFAULT 0,
  avg_rating DECIMAL(3,2) DEFAULT 0,
  last_used_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Exercise Preferences/Ratings
CREATE TABLE public.user_exercise_preferences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  exercise_id UUID REFERENCES public.exercises(id) ON DELETE CASCADE,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  notes TEXT,
  is_favorite BOOLEAN DEFAULT FALSE,
  is_restricted BOOLEAN DEFAULT FALSE, -- For injury restrictions
  restriction_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, exercise_id)
);

-- Insert default categories
INSERT INTO public.exercise_categories (name, description, color, sort_order) VALUES 
('Chest', 'Chest and pectoral exercises', '#ef4444', 1),
('Back', 'Back, lats, and rhomboid exercises', '#3b82f6', 2),
('Shoulders', 'Deltoid and shoulder exercises', '#f59e0b', 3),
('Arms', 'Bicep, tricep, and arm exercises', '#10b981', 4),
('Legs', 'Quadriceps, hamstring, and leg exercises', '#8b5cf6', 5),
('Core', 'Abdominal and core stability exercises', '#f97316', 6),
('Olympic', 'Olympic lifting movements', '#dc2626', 7),
('Functional', 'Functional and CrossFit movements', '#059669', 8),
('Cardio', 'Cardiovascular exercises', '#e11d48', 9),
('Flexibility', 'Stretching and mobility exercises', '#0ea5e9', 10);

-- Insert common muscle groups
INSERT INTO public.muscle_groups (name, category) VALUES 
-- Primary movers
('Chest', 'primary'),
('Upper Chest', 'primary'),
('Lower Chest', 'primary'),
('Lats', 'primary'),
('Rhomboids', 'primary'),
('Middle Traps', 'primary'),
('Upper Traps', 'primary'),
('Lower Traps', 'primary'),
('Front Delts', 'primary'),
('Middle Delts', 'primary'),
('Rear Delts', 'primary'),
('Biceps', 'primary'),
('Triceps', 'primary'),
('Forearms', 'primary'),
('Quadriceps', 'primary'),
('Hamstrings', 'primary'),
('Glutes', 'primary'),
('Calves', 'primary'),
('Abs', 'primary'),
('Obliques', 'primary'),
('Lower Back', 'primary'),
-- Secondary/Stabilizers
('Core', 'stabilizer'),
('Shoulders', 'secondary'),
('Hip Flexors', 'secondary'),
('Neck', 'secondary');

-- Insert common equipment types
INSERT INTO public.equipment_types (name, description, availability) VALUES 
('Barbell', 'Standard Olympic barbell', 'common'),
('Dumbbells', 'Adjustable or fixed dumbbells', 'common'),
('Kettlebell', 'Kettlebells for functional training', 'common'),
('Cable Machine', 'Cable crossover or functional trainer', 'common'),
('Pull-up Bar', 'Pull-up or chin-up bar', 'common'),
('Bench', 'Adjustable workout bench', 'common'),
('Squat Rack', 'Power rack or squat stands', 'common'),
('Leg Press Machine', 'Leg press or hack squat machine', 'specialized'),
('Leg Curl Machine', 'Hamstring curl machine', 'specialized'),
('Leg Extension Machine', 'Quadriceps extension machine', 'specialized'),
('Lat Pulldown Machine', 'Lat pulldown station', 'specialized'),
('Rowing Machine', 'Cable or machine rows', 'specialized'),
('Smith Machine', 'Smith machine for guided lifts', 'specialized'),
('Medicine Ball', 'Weighted medicine ball', 'common'),
('Resistance Bands', 'Elastic resistance bands', 'common'),
('TRX/Suspension', 'Suspension trainer system', 'common'),
('Plyometric Box', 'Jump box for plyometrics', 'common'),
('Battle Ropes', 'Heavy training ropes', 'specialized'),
('Sled', 'Weighted pushing/pulling sled', 'specialized'),
('None', 'Bodyweight only', 'bodyweight');

-- Create indexes for performance
CREATE INDEX idx_exercises_category ON public.exercises(category_id);
CREATE INDEX idx_exercises_active ON public.exercises(is_active);
CREATE INDEX idx_exercises_compound ON public.exercises(is_compound);
CREATE INDEX idx_exercises_bodyweight ON public.exercises(is_bodyweight);
CREATE INDEX idx_exercises_difficulty ON public.exercises(difficulty_level);
CREATE INDEX idx_exercise_muscle_groups_exercise ON public.exercise_muscle_groups(exercise_id);
CREATE INDEX idx_exercise_muscle_groups_muscle ON public.exercise_muscle_groups(muscle_group_id);
CREATE INDEX idx_exercise_variations_parent ON public.exercise_variations(parent_exercise_id);
CREATE INDEX idx_user_preferences_user ON public.user_exercise_preferences(user_id);
CREATE INDEX idx_user_preferences_exercise ON public.user_exercise_preferences(exercise_id);

-- Enable Row Level Security (RLS)
ALTER TABLE public.exercise_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.muscle_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.equipment_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercise_muscle_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercise_variations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercise_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_exercise_preferences ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Categories, muscle groups, and equipment are readable by all authenticated users
CREATE POLICY "Categories readable by authenticated users" ON public.exercise_categories
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Muscle groups readable by authenticated users" ON public.muscle_groups
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Equipment types readable by authenticated users" ON public.equipment_types
  FOR SELECT TO authenticated USING (true);

-- Exercises are readable by all, but only coaches/admins can create/modify
CREATE POLICY "Exercises readable by authenticated users" ON public.exercises
  FOR SELECT TO authenticated USING (is_active = true OR created_by = auth.uid());

CREATE POLICY "Exercises manageable by coaches and admins" ON public.exercises
  FOR ALL TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() 
      AND role IN ('coach', 'admin')
    )
  );

-- Exercise muscle groups follow exercise permissions
CREATE POLICY "Exercise muscle groups readable" ON public.exercise_muscle_groups
  FOR SELECT TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.exercises 
      WHERE id = exercise_id 
      AND (is_active = true OR created_by = auth.uid())
    )
  );

CREATE POLICY "Exercise muscle groups manageable by coaches" ON public.exercise_muscle_groups
  FOR ALL TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() 
      AND role IN ('coach', 'admin')
    )
  );

-- Similar policies for variations
CREATE POLICY "Exercise variations readable" ON public.exercise_variations
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Exercise variations manageable by coaches" ON public.exercise_variations
  FOR ALL TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() 
      AND role IN ('coach', 'admin')
    )
  );

-- User preferences are private to each user
CREATE POLICY "User preferences private" ON public.user_exercise_preferences
  FOR ALL TO authenticated USING (user_id = auth.uid());

-- Analytics readable by coaches/admins
CREATE POLICY "Exercise analytics readable by coaches" ON public.exercise_analytics
  FOR SELECT TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() 
      AND role IN ('coach', 'admin')
    )
  );

-- Functions for exercise management

-- Function to get exercises with muscle groups
CREATE OR REPLACE FUNCTION get_exercises_with_details(
  category_filter UUID DEFAULT NULL,
  muscle_group_filter TEXT DEFAULT NULL,
  equipment_filter TEXT DEFAULT NULL,
  difficulty_filter INTEGER DEFAULT NULL,
  search_term TEXT DEFAULT NULL
) 
RETURNS TABLE (
  id UUID,
  name TEXT,
  description TEXT,
  category_name TEXT,
  category_color TEXT,
  muscle_groups JSONB,
  equipment_needed TEXT[],
  difficulty_level INTEGER,
  is_compound BOOLEAN,
  is_bodyweight BOOLEAN,
  instructions JSONB,
  video_url TEXT,
  usage_count INTEGER
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    e.id,
    e.name,
    e.description,
    ec.name as category_name,
    ec.color as category_color,
    COALESCE(
      json_agg(
        json_build_object(
          'name', mg.name,
          'involvement', emg.involvement_type
        )
      ) FILTER (WHERE mg.id IS NOT NULL),
      '[]'::json
    )::jsonb as muscle_groups,
    e.equipment_needed,
    e.difficulty_level,
    e.is_compound,
    e.is_bodyweight,
    e.instructions,
    e.video_url,
    COALESCE(ea.usage_count, 0) as usage_count
  FROM public.exercises e
  LEFT JOIN public.exercise_categories ec ON e.category_id = ec.id
  LEFT JOIN public.exercise_muscle_groups emg ON e.id = emg.exercise_id
  LEFT JOIN public.muscle_groups mg ON emg.muscle_group_id = mg.id
  LEFT JOIN public.exercise_analytics ea ON e.id = ea.exercise_id
  WHERE 
    e.is_active = true
    AND (category_filter IS NULL OR e.category_id = category_filter)
    AND (difficulty_filter IS NULL OR e.difficulty_level = difficulty_filter)
    AND (equipment_filter IS NULL OR equipment_filter = ANY(e.equipment_needed))
    AND (muscle_group_filter IS NULL OR EXISTS (
      SELECT 1 FROM public.exercise_muscle_groups emg2 
      JOIN public.muscle_groups mg2 ON emg2.muscle_group_id = mg2.id
      WHERE emg2.exercise_id = e.id AND mg2.name ILIKE '%' || muscle_group_filter || '%'
    ))
    AND (search_term IS NULL OR 
         e.name ILIKE '%' || search_term || '%' OR 
         e.description ILIKE '%' || search_term || '%' OR
         search_term = ANY(e.tags))
  GROUP BY e.id, ec.name, ec.color, ea.usage_count
  ORDER BY e.name;
END;
$$;

-- Function to increment exercise usage
CREATE OR REPLACE FUNCTION increment_exercise_usage(exercise_uuid UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.exercise_analytics (exercise_id, usage_count, last_used_at)
  VALUES (exercise_uuid, 1, NOW())
  ON CONFLICT (exercise_id) 
  DO UPDATE SET 
    usage_count = exercise_analytics.usage_count + 1,
    last_used_at = NOW();
END;
$$;