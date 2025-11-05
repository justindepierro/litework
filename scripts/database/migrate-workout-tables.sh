#!/bin/bash
# 
# Simple Database Migration Runner
# Applies the workout groups and blocks migration
#

set -e

echo ""
echo "🗃️  LiteWork Database Migration"
echo "================================"
echo ""
echo "This will add the missing tables for workout groups:"
echo "  • workout_exercise_groups (supersets, circuits, sections)"
echo "  • workout_block_instances (workout templates)"
echo "  • 10 missing columns in workout_exercises"
echo ""

# Check if we have the Supabase service role key for direct DB access
if [ -f .env.local ]; then
  source .env.local
fi

if [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
  echo "⚠️  Service role key not found in .env.local"
  echo ""
  echo "📋 MANUAL MIGRATION REQUIRED:"
  echo "================================"
  echo ""
  echo "1. Open your Supabase Dashboard:"
  echo "   https://supabase.com/dashboard/project/lzsjaqkhdoqsafptqpnt"
  echo ""
  echo "2. Go to: SQL Editor (left sidebar)"
  echo ""
  echo "3. Create a new query"
  echo ""
  echo "4. Copy and paste the contents of:"
  echo "   database/add-workout-groups-and-blocks.sql"
  echo ""
  echo "5. Click 'Run' button"
  echo ""
  echo "6. You should see: '✅ 2 rows' at the bottom showing:"
  echo "   - workout_exercise_groups: 13 columns"
  echo "   - workout_block_instances: 13 columns"
  echo ""
  exit 0
fi

echo "✅ Found service role key"
echo ""
echo "🚀 Applying migration to remote database..."

# Use supabase CLI with the SQL file
if command -v supabase &> /dev/null; then
  # Method 1: Try using CLI
  echo "Using Supabase CLI..."
  
  # Read the SQL file and execute it
  cat database/add-workout-groups-and-blocks.sql | \
    supabase db remote --linked - 2>&1 || \
    echo "❌ CLI method failed, falling back to manual instructions"
else
  echo "❌ Supabase CLI not found"
fi

echo ""
echo "📋 ALTERNATIVE: Manual Migration via Dashboard"
echo "=============================================="
echo ""
echo "If the automatic migration didn't work:"
echo ""
echo "1. Go to: https://supabase.com/dashboard/project/lzsjaqkhdoqsafptqpnt/sql"
echo "2. Copy contents of: database/add-workout-groups-and-blocks.sql"
echo "3. Paste and click 'Run'"
echo ""
