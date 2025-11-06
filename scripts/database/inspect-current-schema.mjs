#!/usr/bin/env node
/**
 * Inspect Current Database Schema
 * Shows all tables and columns related to workouts
 */

import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: resolve(__dirname, "../../.env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Missing Supabase credentials in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

console.log("🔍 Inspecting Current Database Schema\n");

// Query to get all workout-related tables and their columns
const query = `
  SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
  FROM information_schema.columns
  WHERE table_schema = 'public'
    AND table_name LIKE '%workout%'
  ORDER BY table_name, ordinal_position;
`;

try {
  const { data, error } = await supabase.rpc("exec_sql", {
    sql_query: query,
  });

  if (error) {
    // If RPC doesn't work, try direct query
    console.log(
      "⚠️  exec_sql RPC not available, using direct table query...\n"
    );

    // List all tables first
    const { data: tables, error: tablesError } = await supabase
      .from("information_schema.tables")
      .select("table_name")
      .eq("table_schema", "public")
      .like("table_name", "%workout%");

    if (tablesError) {
      throw tablesError;
    }

    console.log("📋 Workout-related tables found:");
    tables?.forEach((t) => console.log(`   - ${t.table_name}`));
    console.log("\n");

    // For each table, get columns
    for (const table of tables || []) {
      console.log(`\n📊 Table: ${table.table_name}`);
      console.log("─".repeat(80));

      const { data: columns, error: colError } = await supabase
        .from("information_schema.columns")
        .select("column_name, data_type, is_nullable")
        .eq("table_schema", "public")
        .eq("table_name", table.table_name)
        .order("ordinal_position");

      if (colError) {
        console.log(`   ❌ Error fetching columns: ${colError.message}`);
        continue;
      }

      columns?.forEach((col) => {
        const nullable =
          col.is_nullable === "YES" ? "(nullable)" : "(NOT NULL)";
        console.log(
          `   • ${col.column_name.padEnd(30)} ${col.data_type.padEnd(20)} ${nullable}`
        );
      });
    }
  } else {
    console.log("✅ Query successful:", data);
  }
} catch (err) {
  console.error("❌ Error:", err.message);
  console.log("\n💡 Alternative: Use Supabase Dashboard → SQL Editor");
  console.log("   Run this query:\n");
  console.log(`
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name LIKE '%workout%'
ORDER BY table_name, ordinal_position;
  `);
}

console.log("\n✅ Schema inspection complete\n");
