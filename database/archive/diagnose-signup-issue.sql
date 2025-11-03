-- Diagnostic queries to check signup status

-- 1. Check auth.users table (Supabase Auth records)
SELECT 
  id,
  email,
  created_at,
  email_confirmed_at,
  raw_user_meta_data->>'first_name' as first_name,
  raw_user_meta_data->>'last_name' as last_name,
  raw_user_meta_data->>'role' as role
FROM auth.users
ORDER BY created_at DESC
LIMIT 10;

-- 2. Check public.users table (Application user profiles)
SELECT 
  id,
  email,
  first_name,
  last_name,
  role,
  created_at
FROM public.users
ORDER BY created_at DESC
LIMIT 10;

-- 3. Find users in auth.users but NOT in public.users (orphaned accounts)
SELECT 
  au.id,
  au.email,
  au.created_at,
  au.raw_user_meta_data->>'first_name' as first_name,
  au.raw_user_meta_data->>'last_name' as last_name
FROM auth.users au
LEFT JOIN public.users pu ON au.id = pu.id
WHERE pu.id IS NULL
ORDER BY au.created_at DESC;

-- 4. Search for your specific email
SELECT 
  'auth.users' as table_name,
  id,
  email,
  created_at,
  email_confirmed_at
FROM auth.users
WHERE email ILIKE '%justindepierro%' OR email ILIKE '%gmail%'

UNION ALL

SELECT 
  'public.users' as table_name,
  id::text,
  email,
  created_at,
  NULL as email_confirmed_at
FROM public.users
WHERE email ILIKE '%justindepierro%' OR email ILIKE '%gmail%';
