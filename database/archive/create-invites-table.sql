-- Complete Invites Table Setup with Split Names
-- Date: October 31, 2025
-- Description: Create invites table with first_name and last_name fields

-- Step 1: Create the invites table with split name fields from the start
CREATE TABLE IF NOT EXISTS public.invites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  full_name TEXT GENERATED ALWAYS AS (first_name || ' ' || last_name) STORED,
  invited_by UUID REFERENCES public.users(id),
  role TEXT NOT NULL DEFAULT 'athlete',
  group_id UUID,
  status TEXT NOT NULL DEFAULT 'pending',
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),
  accepted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 2: Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_invites_email ON public.invites(email);
CREATE INDEX IF NOT EXISTS idx_invites_status ON public.invites(status);
CREATE INDEX IF NOT EXISTS idx_invites_invited_by ON public.invites(invited_by);
CREATE INDEX IF NOT EXISTS idx_invites_expires_at ON public.invites(expires_at);
CREATE INDEX IF NOT EXISTS idx_invites_first_name ON public.invites(first_name);
CREATE INDEX IF NOT EXISTS idx_invites_last_name ON public.invites(last_name);
CREATE INDEX IF NOT EXISTS idx_invites_full_name ON public.invites(full_name);

-- Step 3: Enable Row Level Security
ALTER TABLE public.invites ENABLE ROW LEVEL SECURITY;

-- Step 4: Create RLS Policies

-- Coaches and admins can view all invites they created
CREATE POLICY "Coaches can view their own invites"
ON public.invites
FOR SELECT
USING (
  invited_by = auth.uid() OR
  EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = auth.uid()
    AND users.role IN ('admin', 'coach')
  )
);

-- Coaches and admins can create invites
CREATE POLICY "Coaches can create invites"
ON public.invites
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = auth.uid()
    AND users.role IN ('admin', 'coach')
  )
);

-- Anyone can view their own invitation (by email)
CREATE POLICY "Users can view invitations sent to their email"
ON public.invites
FOR SELECT
USING (email = auth.email());

-- Anyone can update their own invitation (accept it)
CREATE POLICY "Users can update their own invitation"
ON public.invites
FOR UPDATE
USING (email = auth.email())
WITH CHECK (email = auth.email());

-- Step 5: Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 6: Create trigger for updated_at
DROP TRIGGER IF EXISTS update_invites_updated_at ON public.invites;
CREATE TRIGGER update_invites_updated_at
    BEFORE UPDATE ON public.invites
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Verification query:
-- SELECT id, email, first_name, last_name, full_name, status, created_at FROM public.invites LIMIT 10;
