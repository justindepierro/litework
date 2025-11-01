import { createClient } from "@supabase/supabase-js";
import "dotenv/config";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const testData = {
  name: "Test Group",
  description: "test",
  sport: "Other",
  category: "test",
  coach_id: "37b288ff-5221-4f23-9754-7749463526cf", // Justin's CORRECT user ID
  athlete_ids: [],
  color: "#ff6b35",
};

console.log("Testing group creation with data:", testData);

const { data, error } = await supabase
  .from("athlete_groups")
  .insert([testData])
  .select()
  .single();

if (error) {
  console.error("Error creating group:", error);
  console.error("Error details:", JSON.stringify(error, null, 2));
} else {
  console.log("Group created successfully:", data);
}

process.exit(0);
