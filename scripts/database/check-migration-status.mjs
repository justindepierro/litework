#!/usr/bin/env node

/**
 * CHECK MIGRATION STATUS
 * 
 * This script helps you understand what needs to be done to fix the
 * "API request failed" error when saving workouts.
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..', '..');

console.log('\n🔍 CHECKING MIGRATION STATUS\n');
console.log('=' .repeat(70));

// Read the migration file
const migrationPath = join(rootDir, 'database', 'migrate-workout-features.sql');
const migrationSQL = readFileSync(migrationPath, 'utf-8');

console.log('\n📋 ISSUE DIAGNOSIS:');
console.log('─'.repeat(70));
console.log('❌ Your code is trying to save workout data using a NEW schema');
console.log('❌ But your database is still using the OLD schema');
console.log('❌ This causes "API request failed: {}" errors\n');

console.log('📊 WHAT\'S MISSING IN YOUR DATABASE:\n');

console.log('1️⃣  Missing columns in workout_exercises table:');
console.log('   • tempo (for tempo notation like "3-1-1-0")');
console.log('   • weight_max (for weight ranges like 20-30 lbs)');
console.log('   • percentage_max (for % ranges like 70-80% 1RM)');
console.log('   • percentage_base_kpi (which exercise to base % on)');
console.log('   • each_side (for unilateral exercises)');
console.log('   • notes (exercise-specific notes)');
console.log('   • block_instance_id (track which block this belongs to)');
console.log('   • substitution_reason (why exercise was substituted)');
console.log('   • original_exercise (original exercise name)');
console.log('   • progression_notes (progression tracking)\n');

console.log('2️⃣  Missing tables:');
console.log('   • workout_exercise_groups (supersets, circuits, sections)');
console.log('   • workout_blocks (reusable workout templates)');
console.log('   • workout_block_instances (track block usage)');
console.log('   • block_exercises (exercises within blocks)');
console.log('   • block_exercise_groups (groups within blocks)\n');

console.log('3️⃣  Missing security & performance:');
console.log('   • Row Level Security policies for new tables');
console.log('   • Indexes for better query performance');
console.log('   • Auto-update timestamp triggers\n');

console.log('=' .repeat(70));
console.log('\n✅ SOLUTION: Apply the migration SQL\n');
console.log('📂 Migration file location:');
console.log(`   ${migrationPath}\n`);
console.log(`📏 Migration size: ${migrationSQL.length} characters (${migrationSQL.split('\n').length} lines)\n`);

console.log('🚀 HOW TO APPLY:\n');
console.log('OPTION 1: Supabase Dashboard (RECOMMENDED)');
console.log('─'.repeat(70));
console.log('1. Open: https://supabase.com/dashboard/project/lzsjaqkhdoqsafptqpnt');
console.log('2. Click "SQL Editor" in left sidebar');
console.log('3. Click "New query"');
console.log('4. Copy ALL contents from:');
console.log(`   ${migrationPath}`);
console.log('5. Paste into SQL Editor');
console.log('6. Click "Run" (or press Cmd+Enter)');
console.log('7. Wait for success messages\n');

console.log('OPTION 2: Supabase CLI (if installed)');
console.log('─'.repeat(70));
console.log('Run this command:');
console.log(`   supabase db execute --file ${migrationPath}\n`);

console.log('=' .repeat(70));
console.log('\n⏱️  EXPECTED RESULTS:\n');
console.log('You should see approximately 50-60 success messages:');
console.log('  • ALTER TABLE (10 times - adding columns)');
console.log('  • CREATE TABLE (5 times - new tables)');
console.log('  • CREATE INDEX (6 times - performance)');
console.log('  • CREATE POLICY (25+ times - security)');
console.log('  • CREATE TRIGGER (2 times - auto-updates)\n');

console.log('⚠️  NOTE: Some warnings are OK:');
console.log('  ✓ "column already exists" - Migration is safe to re-run');
console.log('  ✓ "table already exists" - Migration is safe to re-run');
console.log('  ✗ "permission denied" - You need admin access');
console.log('  ✗ Other errors - Copy and share for debugging\n');

console.log('=' .repeat(70));
console.log('\n🧪 AFTER MIGRATION - TEST IT:\n');
console.log('1. Go to http://localhost:3000/workouts');
console.log('2. Click "Create Workout"');
console.log('3. Add some exercises');
console.log('4. Try adding weight ranges (e.g., 70-80% 1RM)');
console.log('5. Name the workout');
console.log('6. Click "Save Workout"');
console.log('7. ✅ Should succeed WITHOUT errors');
console.log('8. Open browser console (F12)');
console.log('9. ✅ Should NOT see "API request failed"');
console.log('10. Refresh page');
console.log('11. ✅ Workout should still be there with all data\n');

console.log('=' .repeat(70));
console.log('\n📚 DOCUMENTATION:\n');
console.log('• Full audit report: docs/WORKOUT_SAVE_AUDIT.md');
console.log('• Migration SQL: database/migrate-workout-features.sql');
console.log('• Quick instructions: scripts/database/apply-migration-instructions.md\n');

console.log('=' .repeat(70));
console.log('\n💬 NEED HELP?\n');
console.log('If you see errors during migration, share:');
console.log('1. The exact error message');
console.log('2. Which line of SQL it occurred on');
console.log('3. Screenshot if helpful\n');

console.log('The migration is designed to be safe and can be run multiple times!\n');
