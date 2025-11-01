import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

// Load environment variables
dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing environment variables. Check .env.local file.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function addInvitesTable() {
  try {
    console.log("Adding athlete_invites table...");

    // Create the table
    const { error: tableError } = await supabase.rpc("sql", {
      sql_query: `
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
      `,
    });

    if (tableError) {
      console.error("Error creating table:", tableError);
      return;
    }

    console.log("✅ athlete_invites table created successfully");

    // Add RLS policy
    const { error: rlsError } = await supabase.rpc("sql", {
      sql_query: `
        ALTER TABLE public.athlete_invites ENABLE ROW LEVEL SECURITY;
        
        CREATE POLICY IF NOT EXISTS "Enable all operations for authenticated users on athlete_invites" 
        ON public.athlete_invites FOR ALL USING (auth.role() = 'authenticated');
      `,
    });

    if (rlsError) {
      console.error("Error setting up RLS:", rlsError);
      return;
    }

    console.log("✅ RLS policies configured");

    // Add indexes
    const { error: indexError } = await supabase.rpc("sql", {
      sql_query: `
        CREATE INDEX IF NOT EXISTS athlete_invites_invite_code_idx ON public.athlete_invites(invite_code);
        CREATE INDEX IF NOT EXISTS athlete_invites_email_idx ON public.athlete_invites(email);
      `,
    });

    if (indexError) {
      console.error("Error creating indexes:", indexError);
      return;
    }

    console.log("✅ Indexes created");
    console.log("🎉 athlete_invites table setup complete!");
  } catch (error) {
    console.error("Script error:", error);
  }
}

addInvitesTable();
