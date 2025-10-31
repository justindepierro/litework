// Create initial users in Supabase Auth for seeding database
// This creates users that can be referenced by foreign keys

import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

// Load environment variables
dotenv.config({ path: ".env.local" });

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // Use service role for admin operations
);

async function createInitialUsers() {
  console.log("🔗 Creating initial users in Supabase Auth...");

  const users = [
    {
      email: "coach.smith@litework.com",
      password: "password123",
      name: "Coach Smith",
      role: "coach",
    },
    {
      email: "john.doe@athlete.com",
      password: "password123",
      name: "John Doe",
      role: "athlete",
    },
    {
      email: "jane.smith@athlete.com",
      password: "password123",
      name: "Jane Smith",
      role: "athlete",
    },
    {
      email: "mike.wilson@athlete.com",
      password: "password123",
      name: "Mike Wilson",
      role: "athlete",
    },
  ];

  const createdUsers = [];

  for (const userData of users) {
    try {
      console.log(`\nProcessing user: ${userData.email}`);

      // Check if auth user already exists
      const { data: existingUsers } = await supabase.auth.admin.listUsers();
      const existingUser = existingUsers.users.find(
        (u) => u.email === userData.email
      );

      let authUserId;

      if (existingUser) {
        console.log(
          `📧 Auth user already exists: ${userData.email} (${existingUser.id})`
        );
        authUserId = existingUser.id;
      } else {
        // Create auth user
        const { data: authData, error: authError } =
          await supabase.auth.admin.createUser({
            email: userData.email,
            password: userData.password,
            email_confirm: true,
            user_metadata: {
              name: userData.name,
              role: userData.role,
            },
          });

        if (authError) {
          console.error(
            `❌ Failed to create auth user ${userData.email}:`,
            authError.message
          );
          continue;
        }

        console.log(
          `✅ Created auth user: ${userData.email} (${authData.user.id})`
        );
        authUserId = authData.user.id;
      }

      // Check if user profile already exists
      const { data: existingProfile } = await supabase
        .from("users")
        .select("id")
        .eq("id", authUserId)
        .single();

      if (existingProfile) {
        console.log(`👤 User profile already exists: ${userData.email}`);
      } else {
        // Create user profile in our users table
        const { error: profileError } = await supabase.from("users").insert([
          {
            id: authUserId,
            email: userData.email,
            name: userData.name,
            role: userData.role,
            group_ids: [],
            status: "active",
          },
        ]);

        if (profileError) {
          console.error(
            `❌ Failed to create user profile ${userData.email}:`,
            profileError.message
          );
          continue;
        }

        console.log(`✅ Created user profile: ${userData.email}`);
      }

      createdUsers.push({
        id: authUserId,
        email: userData.email,
        name: userData.name,
        role: userData.role,
      });
    } catch (error) {
      console.error(
        `❌ Error processing user ${userData.email}:`,
        error.message
      );
    }
  }

  console.log("\n📋 Created users summary:");
  createdUsers.forEach((user) => {
    console.log(`  - ${user.name} (${user.role}): ${user.id}`);
  });

  return createdUsers;
}

// Run the script
createInitialUsers()
  .then(() => {
    console.log("\n✅ Initial users created successfully!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Failed to create initial users:", error);
    process.exit(1);
  });
