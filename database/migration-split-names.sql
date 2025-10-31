-- Migration: Split athlete names into first_name and last_name
-- Date: October 31, 2025
-- Description: Update users table to store separate first and last names
-- Note: Run create-invites-table.sql first to create the invites table with split names

-- Step 1: Add new columns to users table
ALTER TABLE public.users
ADD COLUMN first_name TEXT,
ADD COLUMN last_name TEXT;

-- Step 2: Migrate existing data (split on first space)
UPDATE public.users
SET 
  first_name = SPLIT_PART(name, ' ', 1),
  last_name = CASE 
    WHEN POSITION(' ' IN name) > 0 THEN SUBSTRING(name FROM POSITION(' ' IN name) + 1)
    ELSE ''
  END
WHERE first_name IS NULL;

-- Step 3: Make new columns NOT NULL after migration
ALTER TABLE public.users
ALTER COLUMN first_name SET NOT NULL,
ALTER COLUMN last_name SET NOT NULL;

-- Step 4: Add computed full_name column for convenience
ALTER TABLE public.users
ADD COLUMN full_name TEXT GENERATED ALWAYS AS (first_name || ' ' || last_name) STORED;

-- Step 5: Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_users_first_name ON public.users(first_name);
CREATE INDEX IF NOT EXISTS idx_users_last_name ON public.users(last_name);
CREATE INDEX IF NOT EXISTS idx_users_full_name ON public.users(full_name);

-- Step 6: Drop old name column (OPTIONAL - after verifying migration)
-- IMPORTANT: Only run this after confirming data migration was successful
-- ALTER TABLE public.users DROP COLUMN name;

-- Verification query:
-- SELECT id, name, first_name, last_name, full_name, email, role FROM public.users LIMIT 10;
