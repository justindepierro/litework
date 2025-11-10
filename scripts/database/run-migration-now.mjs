#!/usr/bin/env node

import "dotenv/config";
import pg from "pg";
const { Client } = pg;

// Use direct PostgreSQL connection
const connectionString = process.env.DATABASE_URL || 
  `postgresql://postgres.lzsjaqkhdoqsafptqpnt:${process.env.SUPABASE_DB_PASSWORD}@aws-0-us-east-1.pooler.supabase.com:6543/postgres`;

console.log("🔧 Running migration to add group_id to session_exercises...\n");

const client = new Client({
  connectionString,
  ssl: { rejectUnauthorized: false }
});

try {
  await client.connect();
  console.log("✅ Connected to database\n");

  // Run migration
  const result = await client.query(`
    ALTER TABLE session_exercises
    ADD COLUMN IF NOT EXISTS group_id UUID REFERENCES workout_exercise_groups(id);
    
    CREATE INDEX IF NOT EXISTS idx_session_exercises_group_id 
    ON session_exercises(group_id);
  `);

  console.log("✅ Migration successful!");
  console.log("   - Added 'group_id' column to session_exercises");
  console.log("   - Created index for faster lookups\n");
  
  // Verify
  const verify = await client.query(`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'session_exercises' AND column_name = 'group_id';
  `);
  
  if (verify.rows.length > 0) {
    console.log("✅ Verified: Column exists!");
    console.log(`   Type: ${verify.rows[0].data_type}\n`);
  }

} catch (error) {
  console.error("❌ Migration failed:", error.message);
  
  if (error.message.includes("already exists")) {
    console.log("\n✅ Column already exists - migration previously completed!");
  } else {
    process.exit(1);
  }
} finally {
  await client.end();
}
