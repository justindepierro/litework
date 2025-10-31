-- Cleanup script - Delete all test data except Justin DePierro
-- Run this in Supabase SQL Editor

-- Step 1: Delete related data first (cascading deletes)
-- Delete from communication_preferences
DELETE FROM public.communication_preferences 
WHERE user_id IN (
  SELECT id FROM public.users 
  WHERE email != 'jdepierro@burkecatholic.org'
);

-- Delete from athlete_kpis
DELETE FROM public.athlete_kpis 
WHERE athlete_id IN (
  SELECT id FROM public.users 
  WHERE email != 'jdepierro@burkecatholic.org'
);

-- Delete from workout_sessions (if exists)
DELETE FROM public.workout_sessions 
WHERE user_id IN (
  SELECT id FROM public.users 
  WHERE email != 'jdepierro@burkecatholic.org'
);

-- Delete from workout_assignments (if exists)
DELETE FROM public.workout_assignments 
WHERE assigned_to_user_id IN (
  SELECT id FROM public.users 
  WHERE email != 'jdepierro@burkecatholic.org'
);

-- Update athlete_groups to remove references
UPDATE public.athlete_groups 
SET athlete_ids = ARRAY[]::TEXT[]
WHERE coach_id IN (
  SELECT id FROM public.users 
  WHERE email != 'jdepierro@burkecatholic.org'
);

-- Delete athlete groups created by test coaches
DELETE FROM public.athlete_groups 
WHERE coach_id IN (
  SELECT id FROM public.users 
  WHERE email != 'jdepierro@burkecatholic.org'
  AND role = 'coach'
);

-- Step 2: Now delete the test users from users table
DELETE FROM public.users 
WHERE email != 'jdepierro@burkecatholic.org';

-- Step 3: Verify cleanup
SELECT 
  id, 
  email, 
  first_name, 
  last_name, 
  role 
FROM public.users;

-- Expected result: Only Justin DePierro should remain
