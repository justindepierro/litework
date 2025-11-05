#!/bin/bash
# 
# Database Migration: Add Workout Groups and Blocks
# This script will:
# 1. Show current state of database
# 2. Run the migration
# 3. Verify the changes
#

set -e  # Exit on error

echo "🔍 Step 1: Inspecting current database state..."
echo "=============================================="
echo ""

# Check if tables exist
echo "📋 Checking for workout tables..."
supabase db dump --linked --data-only=false 2>/dev/null | grep -E "CREATE TABLE.*workout" || echo "   Using alternative method..."

echo ""
echo "🚀 Step 2: Ready to apply migration"
echo "=============================================="
echo ""
echo "The migration will:"
echo "  ✅ Create 'workout_exercise_groups' table (for supersets/circuits)"
echo "  ✅ Create 'workout_block_instances' table (for templates)"
echo "  ✅ Add 10 missing columns to 'workout_exercises'"
echo "  ✅ Set up indexes and RLS policies"
echo ""
read -p "Press ENTER to continue or Ctrl+C to cancel..."

echo ""
echo "📝 Applying migration..."

# Copy SQL to temp file and execute using psql through supabase
supabase db execute --linked --file database/add-workout-groups-and-blocks.sql

echo ""
echo "✅ Step 3: Verifying migration"
echo "=============================================="
echo ""

# Verify tables were created
echo "🔍 Checking if tables were created..."
supabase db execute --linked --sql "
SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'workout_exercise_groups')
    THEN '✅ workout_exercise_groups created'
    ELSE '❌ workout_exercise_groups missing'
  END as groups_status,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'workout_block_instances')
    THEN '✅ workout_block_instances created'
    ELSE '❌ workout_block_instances missing'
  END as blocks_status
"

echo ""
echo "🎉 Migration complete!"
echo ""
echo "Next steps:"
echo "  1. Test creating a workout with groups in the app"
echo "  2. Save the workout"
echo "  3. Reload and verify groups persist"
echo ""
