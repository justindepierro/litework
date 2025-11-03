-- Make Invites Email and Expires At Columns Nullable
-- Date: November 3, 2025
-- Description: Allow invites to be created without email/expiration for draft status
-- This enables coaches to create athlete profiles before athletes have email addresses

-- Remove NOT NULL constraint from email column
ALTER TABLE public.invites
ALTER COLUMN email DROP NOT NULL;

-- Remove NOT NULL constraint from expires_at column
ALTER TABLE public.invites
ALTER COLUMN expires_at DROP NOT NULL;

-- Add comments explaining the changes
COMMENT ON COLUMN public.invites.email IS 'Email address for the invite (nullable to support draft invites without email)';
COMMENT ON COLUMN public.invites.expires_at IS 'Expiration timestamp for the invite (nullable for draft invites that have no expiration)';

-- Add check constraint to ensure pending invites have email AND expiration
ALTER TABLE public.invites
ADD CONSTRAINT invites_pending_must_have_email_and_expiry
CHECK (
  (status = 'pending' AND email IS NOT NULL AND expires_at IS NOT NULL) OR
  (status != 'pending')
);

COMMENT ON CONSTRAINT invites_pending_must_have_email_and_expiry ON public.invites IS 'Ensures pending invites always have an email address and expiration date, but draft invites can be created without either';
