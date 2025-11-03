-- Ensure service role can insert users (for trigger)
-- This policy allows the database trigger to insert new users

CREATE POLICY "Service role can insert users" ON public.users
  FOR INSERT
  WITH CHECK (true);

-- Grant insert permission to service role explicitly
GRANT INSERT ON public.users TO service_role;
