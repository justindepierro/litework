// Check users table schema
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkUsersSchema() {
  console.log("🔍 Checking users table schema...");

  // Try to get existing users to see the column structure
  const { data, error } = await supabase.from("users").select("*").limit(1);

  if (error) {
    console.error("❌ Error:", error.message);
  } else {
    console.log("✅ Users table structure:", data);
  }
}

checkUsersSchema();
