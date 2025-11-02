-- Change Justin's role from coach to athlete
UPDATE public.users
SET 
  role = 'athlete',
  updated_at = NOW()
WHERE id = 'ac6d5911-b5d2-42cc-9359-3a7abfc2dea5';

-- Verify the change
SELECT 
  id,
  email,
  name,
  first_name,
  last_name,
  role
FROM public.users
WHERE id = 'ac6d5911-b5d2-42cc-9359-3a7abfc2dea5';
