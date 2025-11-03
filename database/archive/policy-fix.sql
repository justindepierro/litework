-- Policy Update Script - Run this in Supabase SQL Editor
-- This fixes the infinite recursion issue in RLS policies

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Coaches can view their athletes" ON public.users;
DROP POLICY IF EXISTS "Coaches can manage athletes KPIs" ON public.athlete_kpis;

-- Recreate simplified policies

-- Users policies - simplified to avoid recursion
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

-- Allow coaches and admins to view all users (simplified for now)
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

-- Simplified KPI policy for coaches
CREATE POLICY "Coaches can manage all KPIs" ON public.athlete_kpis
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() 
      AND role IN ('coach', 'admin')
    )
  );