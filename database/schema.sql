-- LiteWork Database Schema for Supabase
-- Run this in your Supabase SQL Editor

-- Create custom types
CREATE TYPE user_role AS ENUM ('admin', 'coach', 'athlete');
CREATE TYPE weight_type AS ENUM ('fixed', 'percentage', 'bodyweight');
CREATE TYPE workout_mode AS ENUM ('view', 'live');

-- Users table (extends Supabase auth.users)
CREATE TABLE public.users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'athlete',
  group_ids TEXT[] DEFAULT '{}',
  coach_id UUID REFERENCES public.users(id),
  date_of_birth DATE,
  injury_status TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Athlete Groups table
CREATE TABLE public.athlete_groups (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  sport TEXT NOT NULL,
  category TEXT,
  coach_id UUID REFERENCES public.users(id) NOT NULL,
  athlete_ids TEXT[] DEFAULT '{}',
  color TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Athlete KPIs (Personal Records) table
CREATE TABLE public.athlete_kpis (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  athlete_id UUID REFERENCES public.users(id) NOT NULL,
  exercise_id TEXT NOT NULL,
  exercise_name TEXT NOT NULL,
  current_pr DECIMAL NOT NULL,
  date_achieved DATE NOT NULL,
  notes TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Athlete Invites table
CREATE TABLE public.athlete_invites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  invite_code TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  group_ids TEXT[] DEFAULT '{}',
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  is_used BOOLEAN DEFAULT FALSE,
  used_at TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES public.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Workout Plans table
CREATE TABLE public.workout_plans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  estimated_duration INTEGER DEFAULT 30,
  target_group_id UUID REFERENCES public.athlete_groups(id),
  created_by UUID REFERENCES public.users(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Workout Exercises table (exercises within a workout plan)
CREATE TABLE public.workout_exercises (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  workout_plan_id UUID REFERENCES public.workout_plans(id) ON DELETE CASCADE,
  exercise_id TEXT NOT NULL,
  exercise_name TEXT NOT NULL,
  sets INTEGER NOT NULL,
  reps INTEGER NOT NULL,
  weight_type weight_type NOT NULL,
  weight DECIMAL,
  percentage INTEGER,
  rest_time INTEGER DEFAULT 60,
  order_index INTEGER NOT NULL,
  group_id TEXT, -- For supersets/circuits
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Workout Sessions table (individual workout instances)
CREATE TABLE public.workout_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) NOT NULL,
  workout_plan_id UUID REFERENCES public.workout_plans(id) NOT NULL,
  workout_plan_name TEXT NOT NULL,
  workout_assignment_id UUID,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  mode workout_mode NOT NULL DEFAULT 'view',
  started BOOLEAN DEFAULT FALSE,
  completed BOOLEAN DEFAULT FALSE,
  progress_percentage INTEGER DEFAULT 0,
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Session Exercises table (exercises within a session)
CREATE TABLE public.session_exercises (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  workout_session_id UUID REFERENCES public.workout_sessions(id) ON DELETE CASCADE,
  workout_exercise_id UUID REFERENCES public.workout_exercises(id) NOT NULL,
  exercise_name TEXT NOT NULL,
  target_sets INTEGER NOT NULL,
  completed_sets INTEGER DEFAULT 0,
  started BOOLEAN DEFAULT FALSE,
  completed BOOLEAN DEFAULT FALSE,
  is_modified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Set Records table (individual set tracking)
CREATE TABLE public.set_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_exercise_id UUID REFERENCES public.session_exercises(id) ON DELETE CASCADE,
  set_number INTEGER NOT NULL,
  target_reps INTEGER NOT NULL,
  actual_reps INTEGER NOT NULL,
  target_weight DECIMAL NOT NULL,
  actual_weight DECIMAL NOT NULL,
  completed BOOLEAN DEFAULT TRUE,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Workout Assignments table (assigning workouts to athletes/groups)
CREATE TABLE public.workout_assignments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  workout_plan_id UUID REFERENCES public.workout_plans(id) NOT NULL,
  assigned_by UUID REFERENCES public.users(id) NOT NULL,
  assigned_to_user_id UUID REFERENCES public.users(id),
  assigned_to_group_id UUID REFERENCES public.athlete_groups(id),
  scheduled_date DATE NOT NULL,
  notes TEXT,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure assignment is to either user or group, not both
  CONSTRAINT assignment_target_check CHECK (
    (assigned_to_user_id IS NOT NULL AND assigned_to_group_id IS NULL) OR
    (assigned_to_user_id IS NULL AND assigned_to_group_id IS NOT NULL)
  )
);

-- Progress Entries table (for analytics)
CREATE TABLE public.progress_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) NOT NULL,
  exercise_id TEXT NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  weight DECIMAL NOT NULL,
  reps INTEGER NOT NULL,
  one_rep_max DECIMAL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_users_role ON public.users(role);
CREATE INDEX idx_users_coach_id ON public.users(coach_id);
CREATE INDEX idx_athlete_groups_coach_id ON public.athlete_groups(coach_id);
CREATE INDEX idx_athlete_kpis_athlete_id ON public.athlete_kpis(athlete_id);
CREATE INDEX idx_workout_plans_created_by ON public.workout_plans(created_by);
CREATE INDEX idx_workout_plans_target_group ON public.workout_plans(target_group_id);
CREATE INDEX idx_workout_exercises_workout_plan ON public.workout_exercises(workout_plan_id);
CREATE INDEX idx_workout_sessions_user_id ON public.workout_sessions(user_id);
CREATE INDEX idx_workout_sessions_date ON public.workout_sessions(date);
CREATE INDEX idx_session_exercises_session_id ON public.session_exercises(workout_session_id);
CREATE INDEX idx_set_records_session_exercise ON public.set_records(session_exercise_id);
CREATE INDEX idx_workout_assignments_assigned_to_user ON public.workout_assignments(assigned_to_user_id);
CREATE INDEX idx_workout_assignments_assigned_to_group ON public.workout_assignments(assigned_to_group_id);
CREATE INDEX idx_workout_assignments_date ON public.workout_assignments(scheduled_date);
CREATE INDEX idx_progress_entries_user_exercise ON public.progress_entries(user_id, exercise_id);

-- Row Level Security Policies
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.athlete_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.athlete_kpis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.athlete_invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.set_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.progress_entries ENABLE ROW LEVEL SECURITY;

-- Simplified Users policies - users can view their own profile
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

-- Allow coaches and admins to view all users (for now, we'll refine this later)
CREATE POLICY "Coaches can view users" ON public.users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() 
      AND role IN ('coach', 'admin')
    )
  );

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- Coaches can manage their groups
CREATE POLICY "Coaches can manage their groups" ON public.athlete_groups
  FOR ALL USING (coach_id = auth.uid());

-- Athletes can view groups they belong to
CREATE POLICY "Athletes can view their groups" ON public.athlete_groups
  FOR SELECT USING (
    auth.uid()::text = ANY(athlete_ids)
  );

-- Athletes can manage their own KPIs, coaches can manage all KPIs (simplified)
CREATE POLICY "Athletes can manage own KPIs" ON public.athlete_kpis
  FOR ALL USING (athlete_id = auth.uid());

CREATE POLICY "Coaches can manage all KPIs" ON public.athlete_kpis
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() 
      AND role IN ('coach', 'admin')
    )
  );

-- Only coaches and admins can access athlete invites
CREATE POLICY "Only coaches can access invites" ON public.athlete_invites
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() 
      AND role IN ('coach', 'admin')
    )
  );

-- Workout plans: coaches can create/manage, athletes can view assigned ones
CREATE POLICY "Coaches can manage workout plans" ON public.workout_plans
  FOR ALL USING (created_by = auth.uid());

CREATE POLICY "Athletes can view assigned workout plans" ON public.workout_plans
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.workout_assignments wa
      WHERE wa.workout_plan_id = workout_plans.id
      AND wa.assigned_to_user_id = auth.uid()
    )
  );

-- Workout exercises inherit permissions from workout plans
CREATE POLICY "Workout exercises follow workout plan permissions" ON public.workout_exercises
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.workout_plans wp
      WHERE wp.id = workout_exercises.workout_plan_id
    )
  );

-- Workout sessions: users can manage their own
CREATE POLICY "Users can manage own workout sessions" ON public.workout_sessions
  FOR ALL USING (user_id = auth.uid());

-- Session exercises inherit permissions from workout sessions
CREATE POLICY "Session exercises follow session permissions" ON public.session_exercises
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.workout_sessions ws
      WHERE ws.id = session_exercises.workout_session_id
      AND ws.user_id = auth.uid()
    )
  );

-- Set records inherit permissions from session exercises
CREATE POLICY "Set records follow session exercise permissions" ON public.set_records
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.session_exercises se
      JOIN public.workout_sessions ws ON ws.id = se.workout_session_id
      WHERE se.id = set_records.session_exercise_id
      AND ws.user_id = auth.uid()
    )
  );

-- Workout assignments: coaches can create, athletes can view their assignments
CREATE POLICY "Coaches can manage workout assignments" ON public.workout_assignments
  FOR ALL USING (assigned_by = auth.uid());

CREATE POLICY "Athletes can view their assignments" ON public.workout_assignments
  FOR SELECT USING (assigned_to_user_id = auth.uid());

-- Progress entries: users can manage their own
CREATE POLICY "Users can manage own progress" ON public.progress_entries
  FOR ALL USING (user_id = auth.uid());

-- Create updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_athlete_groups_updated_at BEFORE UPDATE ON public.athlete_groups
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_athlete_kpis_updated_at BEFORE UPDATE ON public.athlete_kpis
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_workout_plans_updated_at BEFORE UPDATE ON public.workout_plans
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_workout_assignments_updated_at BEFORE UPDATE ON public.workout_assignments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert demo data (optional - for testing)
-- You can uncomment this after setting up your first coach user

/*
-- Demo coach user (you'll need to sign up first, then update this with your actual auth.users id)
INSERT INTO public.users (id, email, name, role) VALUES 
  ('your-auth-user-id-here', 'coach@example.com', 'Demo Coach', 'coach');

-- Demo athlete group
INSERT INTO public.athlete_groups (name, description, sport, category, coach_id, color) VALUES 
  ('Football Linemen', 'Offensive and defensive line players', 'Football', 'Varsity', 'your-auth-user-id-here', '#ff6b35');

-- Demo workout plan
INSERT INTO public.workout_plans (name, description, estimated_duration, created_by) VALUES 
  ('Upper Body Strength', 'Focus on bench press, rows, and shoulder development', 45, 'your-auth-user-id-here');
*/