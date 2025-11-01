-- Add athlete invites table
CREATE TABLE IF NOT EXISTS public.athlete_invites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  invite_code TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  group_ids TEXT[] DEFAULT '{}',
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  is_used BOOLEAN DEFAULT FALSE,
  used_at TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES public.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policy for athlete_invites
ALTER TABLE public.athlete_invites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable all operations for authenticated users on athlete_invites" ON public.athlete_invites
  FOR ALL USING (auth.role() = 'authenticated');

-- Add index for performance
CREATE INDEX IF NOT EXISTS athlete_invites_invite_code_idx ON public.athlete_invites(invite_code);
CREATE INDEX IF NOT EXISTS athlete_invites_email_idx ON public.athlete_invites(email);
