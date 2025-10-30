-- Complete Policy Reset Script - Run this in Supabase SQL Editor
-- This completely removes and recreates all policies to fix recursion

-- Disable RLS temporarily to clear all policies
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.athlete_groups DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.athlete_kpis DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_plans DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_exercises DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_sessions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_exercises DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.set_records DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_assignments DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.progress_entries DISABLE ROW LEVEL SECURITY;

-- Drop ALL existing policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Coaches can view users" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Coaches can view their athletes" ON public.users;
DROP POLICY IF EXISTS "Coaches can manage their groups" ON public.athlete_groups;
DROP POLICY IF EXISTS "Athletes can view their groups" ON public.athlete_groups;
DROP POLICY IF EXISTS "Athletes can manage own KPIs" ON public.athlete_kpis;
DROP POLICY IF EXISTS "Coaches can manage all KPIs" ON public.athlete_kpis;
DROP POLICY IF EXISTS "Coaches can manage athletes KPIs" ON public.athlete_kpis;
DROP POLICY IF EXISTS "Coaches can manage workout plans" ON public.workout_plans;
DROP POLICY IF EXISTS "Athletes can view assigned workout plans" ON public.workout_plans;
DROP POLICY IF EXISTS "Workout exercises follow workout plan permissions" ON public.workout_exercises;
DROP POLICY IF EXISTS "Users can manage own workout sessions" ON public.workout_sessions;
DROP POLICY IF EXISTS "Session exercises follow session permissions" ON public.session_exercises;
DROP POLICY IF EXISTS "Set records follow session exercise permissions" ON public.set_records;
DROP POLICY IF EXISTS "Coaches can manage workout assignments" ON public.workout_assignments;
DROP POLICY IF EXISTS "Athletes can view their assignments" ON public.workout_assignments;
DROP POLICY IF EXISTS "Users can manage own progress" ON public.progress_entries;

-- Re-enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.athlete_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.athlete_kpis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.set_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.progress_entries ENABLE ROW LEVEL SECURITY;

-- Create simple, non-recursive policies

-- Users: Allow all operations for now (we'll refine later)
CREATE POLICY "Allow all users operations" ON public.users FOR ALL TO authenticated USING (true);

-- Groups: Allow all operations for authenticated users
CREATE POLICY "Allow all groups operations" ON public.athlete_groups FOR ALL TO authenticated USING (true);

-- KPIs: Allow all operations for authenticated users  
CREATE POLICY "Allow all KPIs operations" ON public.athlete_kpis FOR ALL TO authenticated USING (true);

-- Workout Plans: Allow all operations for authenticated users
CREATE POLICY "Allow all workout plans operations" ON public.workout_plans FOR ALL TO authenticated USING (true);

-- Workout Exercises: Allow all operations for authenticated users
CREATE POLICY "Allow all workout exercises operations" ON public.workout_exercises FOR ALL TO authenticated USING (true);

-- Workout Sessions: Allow all operations for authenticated users
CREATE POLICY "Allow all workout sessions operations" ON public.workout_sessions FOR ALL TO authenticated USING (true);

-- Session Exercises: Allow all operations for authenticated users
CREATE POLICY "Allow all session exercises operations" ON public.session_exercises FOR ALL TO authenticated USING (true);

-- Set Records: Allow all operations for authenticated users
CREATE POLICY "Allow all set records operations" ON public.set_records FOR ALL TO authenticated USING (true);

-- Workout Assignments: Allow all operations for authenticated users
CREATE POLICY "Allow all workout assignments operations" ON public.workout_assignments FOR ALL TO authenticated USING (true);

-- Progress Entries: Allow all operations for authenticated users
CREATE POLICY "Allow all progress entries operations" ON public.progress_entries FOR ALL TO authenticated USING (true);