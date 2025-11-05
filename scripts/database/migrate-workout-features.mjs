#!/usr/bin/env node

/**
 * Migration Script: Add Workout Features to Database
 * 
 * This script applies the migration to add all missing workout features:
 * - Exercise groups (supersets, circuits, sections)
 * - Workout blocks (reusable templates)
 * - Block instances (track block usage)
 * - Missing exercise fields (tempo, ranges, notes, etc.)
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join } from 'path';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables:');
  console.error('   - NEXT_PUBLIC_SUPABASE_URL');
  console.error('   - SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runMigration() {
  console.log('🚀 Starting workout features migration...\n');

  try {
    // Read the migration SQL file
    const migrationPath = join(process.cwd(), 'database', 'migrate-workout-features.sql');
    const migrationSQL = readFileSync(migrationPath, 'utf-8');

    console.log('📄 Loaded migration from:', migrationPath);
    console.log('📊 Migration size:', migrationSQL.length, 'characters\n');

    // Split into individual statements (rough split by semicolons)
    const statements = migrationSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    console.log(`📝 Found ${statements.length} SQL statements to execute\n`);

    let successCount = 0;
    let errorCount = 0;

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i] + ';';
      
      // Get a preview of the statement
      const preview = statement.substring(0, 80).replace(/\s+/g, ' ');
      
      try {
        const { error } = await supabase.rpc('exec_sql', { sql: statement });
        
        if (error) {
          // Check if it's a "already exists" error (which is okay)
          if (error.message?.includes('already exists') || 
              error.message?.includes('already has') ||
              error.message?.includes('IF NOT EXISTS')) {
            console.log(`⏭️  [${i + 1}/${statements.length}] Skipped (already exists): ${preview}...`);
            successCount++;
          } else {
            console.error(`❌ [${i + 1}/${statements.length}] Error: ${preview}...`);
            console.error(`   ${error.message}\n`);
            errorCount++;
          }
        } else {
          console.log(`✅ [${i + 1}/${statements.length}] Success: ${preview}...`);
          successCount++;
        }
      } catch (err) {
        console.error(`❌ [${i + 1}/${statements.length}] Exception: ${preview}...`);
        console.error(`   ${err instanceof Error ? err.message : String(err)}\n`);
        errorCount++;
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('📊 Migration Summary:');
    console.log(`   ✅ Successful: ${successCount}`);
    console.log(`   ❌ Errors: ${errorCount}`);
    console.log('='.repeat(60) + '\n');

    if (errorCount === 0) {
      console.log('🎉 Migration completed successfully!');
      console.log('\n✨ Your database now supports:');
      console.log('   • Exercise groups (supersets, circuits, sections)');
      console.log('   • Workout blocks (reusable templates)');
      console.log('   • Block instances (customizable usage)');
      console.log('   • Weight ranges (20-30 lbs, 70-80% 1RM)');
      console.log('   • Exercise tempo, notes, and advanced features');
      process.exit(0);
    } else {
      console.log('⚠️  Migration completed with some errors.');
      console.log('   Some features may not work correctly.');
      console.log('   Check the errors above for details.');
      process.exit(1);
    }

  } catch (error) {
    console.error('\n❌ Fatal error running migration:');
    console.error(error);
    process.exit(1);
  }
}

// Alternative: Direct SQL execution (if RPC not available)
async function runMigrationDirect() {
  console.log('🚀 Running migration with direct SQL execution...\n');
  
  try {
    const migrationPath = join(process.cwd(), 'database', 'migrate-workout-features.sql');
    const migrationSQL = readFileSync(migrationPath, 'utf-8');

    console.log('📄 Loaded migration from:', migrationPath);
    console.log('\n⚠️  NOTE: You may need to run this SQL manually in Supabase SQL Editor:');
    console.log('   1. Go to your Supabase project dashboard');
    console.log('   2. Navigate to SQL Editor');
    console.log('   3. Create a new query');
    console.log('   4. Paste the contents of: database/migrate-workout-features.sql');
    console.log('   5. Run the query\n');

    console.log('📋 Migration SQL preview (first 500 chars):');
    console.log('-'.repeat(60));
    console.log(migrationSQL.substring(0, 500));
    console.log('-'.repeat(60));
    console.log('\n✅ Migration file is ready to be applied!');
    
  } catch (error) {
    console.error('\n❌ Error reading migration file:');
    console.error(error);
    process.exit(1);
  }
}

// Run the appropriate migration method
if (process.argv.includes('--direct')) {
  runMigrationDirect();
} else {
  console.log('⚠️  Note: If this fails, try running with --direct flag');
  console.log('   and manually apply the SQL in Supabase dashboard\n');
  runMigrationDirect(); // Use direct method by default
}
