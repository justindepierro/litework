import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createInvitesTable() {
  try {
    console.log('Creating athlete_invites table using direct query...');
    
    const { data, error } = await supabase
      .from('athlete_invites')
      .select('*')
      .limit(1);

    if (error && error.code === 'PGRST116') {
      console.log('Table does not exist, it needs to be created manually in Supabase dashboard');
      console.log('Please run this SQL in your Supabase SQL editor:');
      console.log(`
CREATE TABLE public.athlete_invites (
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

ALTER TABLE public.athlete_invites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable all operations for authenticated users on athlete_invites" 
ON public.athlete_invites FOR ALL USING (auth.role() = 'authenticated');

CREATE INDEX athlete_invites_invite_code_idx ON public.athlete_invites(invite_code);
CREATE INDEX athlete_invites_email_idx ON public.athlete_invites(email);
      `);
    } else if (error) {
      console.error('Error checking table:', error);
    } else {
      console.log('✅ athlete_invites table already exists!');
    }

  } catch (error) {
    console.error('Script error:', error);
  }
}

createInvitesTable();
