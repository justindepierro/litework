-- Add first_name and last_name columns to users table
-- These are required by the handle_new_user() trigger

ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS first_name TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS last_name TEXT DEFAULT '';

-- Add comments
COMMENT ON COLUMN public.users.first_name IS 'User first name';
COMMENT ON COLUMN public.users.last_name IS 'User last name';
