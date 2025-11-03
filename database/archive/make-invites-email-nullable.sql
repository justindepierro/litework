-- Make Invites Email Column Nullable
-- Date: November 3, 2025
-- Description: Allow invites to be created without email for draft status
-- This enables coaches to create athlete profiles before athletes have email addresses

-- Remove NOT NULL constraint from email column
ALTER TABLE public.invites
ALTER COLUMN email DROP NOT NULL;

-- Add comment explaining the change
COMMENT ON COLUMN public.invites.email IS 'Email address for the invite (nullable to support draft invites without email)';

-- Add check constraint to ensure pending invites have email
ALTER TABLE public.invites
ADD CONSTRAINT invites_pending_must_have_email
CHECK (
  (status = 'pending' AND email IS NOT NULL) OR
  (status != 'pending')
);

COMMENT ON CONSTRAINT invites_pending_must_have_email ON public.invites IS 'Ensures pending invites always have an email address, but draft invites can be created without email';
