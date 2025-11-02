-- Fix Your Account: Confirm Email + Create Profile
-- Run this in Supabase SQL Editor

-- 1. Confirm your email (only update email_confirmed_at, not confirmed_at)
UPDATE auth.users
SET email_confirmed_at = NOW()
WHERE id = 'ac6d5911-b5d2-42cc-9359-3a7abfc2dea5';

-- 2. Create your user profile (with coach role for full access)
INSERT INTO public.users (
  id,
  email,
  name,
  first_name,
  last_name,
  role,
  created_at,
  updated_at
)
VALUES (
  'ac6d5911-b5d2-42cc-9359-3a7abfc2dea5',
  'justindepierro@gmail.com',
  'Justin DePierro',
  'Justin',
  'DePierro',
  'coach',
  NOW(),
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  name = EXCLUDED.name,
  first_name = EXCLUDED.first_name,
  last_name = EXCLUDED.last_name,
  role = EXCLUDED.role,
  updated_at = NOW();

-- 3. Verify it worked - should show your user with confirmed email and coach role
SELECT 
  u.id,
  u.email,
  u.name,
  u.role,
  a.email_confirmed_at,
  CASE 
    WHEN a.email_confirmed_at IS NOT NULL THEN '✅ Confirmed'
    ELSE '❌ Not Confirmed'
  END as status
FROM public.users u
JOIN auth.users a ON u.id = a.id
WHERE u.id = 'ac6d5911-b5d2-42cc-9359-3a7abfc2dea5';
