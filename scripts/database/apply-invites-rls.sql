-- Apply this migration to your Supabase database to add RLS to invites
-- Run in Supabase SQL Editor

-- Enable RLS on the table
ALTER TABLE public.invites ENABLE ROW LEVEL SECURITY;

-- Policy: Only coaches and admins can access invites
CREATE POLICY "Only coaches can access invites" ON public.invites
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() 
      AND role IN ('coach', 'admin')
    )
  );

-- Verification query (run after applying):
-- This should show RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'invites';
-- Expected: rowsecurity = true
