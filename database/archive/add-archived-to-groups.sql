-- Add archived column to athlete_groups table
-- This allows groups to be archived instead of deleted, preserving historical data

ALTER TABLE public.athlete_groups
ADD COLUMN IF NOT EXISTS archived BOOLEAN DEFAULT FALSE;

-- Add index for better query performance when filtering archived groups
CREATE INDEX IF NOT EXISTS idx_athlete_groups_archived 
ON public.athlete_groups(archived);

-- Add comment for documentation
COMMENT ON COLUMN public.athlete_groups.archived IS 'Whether the group is archived (soft delete)';
