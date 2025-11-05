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

import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from .env.local
const envPath = join(__dirname, '../../.env.local');
try {
  const envFile = readFileSync(envPath, 'utf-8');
  envFile.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length > 0) {
      const value = valueParts.join('=').trim();
      process.env[key.trim()] = value;
    }
  });
} catch (err) {
  // .env.local not found, continue with environment variables
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables:');
  console.error('   - NEXT_PUBLIC_SUPABASE_URL');
  console.error('   - SUPABASE_SERVICE_ROLE_KEY');
  console.error('\n💡 Make sure these are set in your .env.local file');
  process.exit(1);
}

// Alternative: Direct SQL execution (if RPC not available)
async function runMigrationDirect() {
  console.log('🚀 Running migration with direct SQL execution...\n');
  
  try {
    const migrationPath = join(__dirname, '../../database/migrate-workout-features.sql');
    const migrationSQL = readFileSync(migrationPath, 'utf-8');

    console.log('📄 Loaded migration from:', migrationPath);
    console.log('\n⚠️  NOTE: You need to run this SQL manually in Supabase SQL Editor:');
    console.log('   1. Go to your Supabase project dashboard');
    console.log('   2. Navigate to SQL Editor');
    console.log('   3. Create a new query');
    console.log('   4. Paste the contents of: database/migrate-workout-features.sql');
    console.log('   5. Run the query\n');

    console.log('📋 Migration SQL preview (first 500 chars):');
    console.log('-'.repeat(60));
    console.log(migrationSQL.substring(0, 500));
    console.log('-'.repeat(60));
    console.log('...');
    console.log('\n✅ Migration file is ready to be applied!');
    console.log(`📊 Total SQL size: ${migrationSQL.length} characters`);
    console.log(`📝 File location: database/migrate-workout-features.sql\n`);
    
  } catch (error) {
    console.error('\n❌ Error reading migration file:');
    console.error(error);
    process.exit(1);
  }
}

// Run the appropriate migration method
runMigrationDirect();
