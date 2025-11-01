import { createClient } from "@supabase/supabase-js";
import "dotenv/config";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const { data, error } = await supabase
  .from("users")
  .select("*")
  .eq("email", "jdepierro@burkecatholic.org");

if (error) {
  console.error("Error:", error);
} else {
  console.log("User found:", data);
}

process.exit(0);
