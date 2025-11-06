-- Add Row Level Security to athlete_invites table
-- This fixes the security gap identified in RLS verification

-- Enable RLS on the table
ALTER TABLE public.athlete_invites ENABLE ROW LEVEL SECURITY;

-- Policy: Only coaches and admins can access invites
-- This prevents athletes from seeing other athletes' invite information
CREATE POLICY "Only coaches can access invites" ON public.athlete_invites
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() 
      AND role IN ('coach', 'admin')
    )
  );

-- Note: Public invite endpoints (like /api/invites/validate and /api/invites/accept)
-- use the service role key which bypasses RLS, so they will continue to work.
-- This policy only affects direct database queries from authenticated users.
