-- Enhance Invites Table for Profile Data Transfer
-- Date: November 3, 2025
-- Description: Add fields to store profile data that will transfer when athlete accepts invite

-- Add profile fields to invites table
ALTER TABLE public.invites
ADD COLUMN IF NOT EXISTS notes TEXT,
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS date_of_birth DATE,
ADD COLUMN IF NOT EXISTS injury_status TEXT,
ADD COLUMN IF NOT EXISTS group_ids TEXT[] DEFAULT '{}';

-- Add comment explaining the purpose
COMMENT ON COLUMN public.invites.notes IS 'Coach notes about the athlete (transfers to user profile on acceptance)';
COMMENT ON COLUMN public.invites.bio IS 'Athlete bio/description (transfers to user profile on acceptance)';
COMMENT ON COLUMN public.invites.date_of_birth IS 'Athlete date of birth (transfers to user profile on acceptance)';
COMMENT ON COLUMN public.invites.injury_status IS 'Current injury status (transfers to user profile on acceptance)';
COMMENT ON COLUMN public.invites.group_ids IS 'Array of group IDs the athlete should be added to (replaces single group_id)';

-- Update existing records to use group_ids array from single group_id
UPDATE public.invites 
SET group_ids = ARRAY[group_id::text]
WHERE group_id IS NOT NULL AND (group_ids IS NULL OR group_ids = '{}');

-- Add index for group_ids array queries
CREATE INDEX IF NOT EXISTS idx_invites_group_ids ON public.invites USING GIN(group_ids);
