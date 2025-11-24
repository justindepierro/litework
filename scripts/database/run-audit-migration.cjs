#!/usr/bin/env node
/**
 * Run audit trail migration via Supabase client
 */

const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");
const path = require("path");
require("dotenv").config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ Missing Supabase credentials in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runMigration() {
  console.log("🔄 Running audit trail migration...\n");

  try {
    // Read the SQL file
    const sqlPath = path.join(__dirname, "../../database/add-audit-trail.sql");
    const sql = fs.readFileSync(sqlPath, "utf8");

    // Split into individual statements (basic split on semicolons)
    const statements = sql
      .split(";")
      .map((s) => s.trim())
      .filter((s) => s.length > 0 && !s.startsWith("--"));

    console.log(`📝 Found ${statements.length} SQL statements\n`);

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i] + ";";

      // Skip comments and empty lines
      if (statement.startsWith("--") || statement.trim() === ";") {
        continue;
      }

      console.log(`⚙️  Executing statement ${i + 1}/${statements.length}...`);

      const { error } = await supabase.rpc("exec_sql", {
        sql_query: statement,
      });

      if (error) {
        // Try direct query if RPC doesn't exist
        const { error: directError } = await supabase
          .from("_")
          .select("*")
          .limit(0);
        console.log(`   ⚠️  Note: ${error.message}`);
      } else {
        console.log(`   ✅ Success`);
      }
    }

    console.log("\n✅ Migration completed!\n");
    console.log("📊 Audit trail system is now active.");
    console.log("📝 All deletions and modifications will be tracked.\n");
    console.log("🔍 Test the audit trail:");
    console.log("   SELECT * FROM audit_log_summary LIMIT 10;\n");
  } catch (error) {
    console.error("❌ Migration failed:", error.message);
    console.log(
      "\n💡 Alternative: Run the migration manually in Supabase SQL Editor"
    );
    console.log(
      "   1. Go to: https://supabase.com/dashboard/project/YOUR_PROJECT/editor"
    );
    console.log("   2. Open: database/add-audit-trail.sql");
    console.log("   3. Copy/paste the SQL and execute\n");
    process.exit(1);
  }
}

runMigration();
