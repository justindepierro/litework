-- Add Profile Fields to Users Table
-- Date: November 3, 2025
-- Description: Add bio and notes fields to users table for complete profiles

-- Add bio and notes fields
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS notes TEXT;

-- Add comments
COMMENT ON COLUMN public.users.bio IS 'Athlete bio/description visible to athlete';
COMMENT ON COLUMN public.users.notes IS 'Coach notes about athlete (visible only to coaches)';

-- Add index for text search on bio (useful for searches)
CREATE INDEX IF NOT EXISTS idx_users_bio_text_search ON public.users USING gin(to_tsvector('english', COALESCE(bio, '')));
