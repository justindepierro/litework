#!/bin/bash
#
# Export table data to CSV for inspection
#

echo ""
echo "📊 Exporting Table Data to CSV"
echo "==============================="
echo ""

mkdir -p database-export/data

# Function to export a single table
export_table() {
  local table=$1
  echo "📋 Exporting: $table"
  
  supabase db dump --linked --data-only --table public.$table > database-export/data/${table}.sql 2>&1
  
  if [ $? -eq 0 ]; then
    local lines=$(wc -l < database-export/data/${table}.sql | tr -d ' ')
    if [ $lines -gt 10 ]; then
      echo "   ✅ $lines lines exported"
    else
      echo "   📭 Empty (no data)"
    fi
  else
    echo "   ⚠️  Export failed"
  fi
}

# Export key workout tables
export_table "workout_plans"
export_table "workout_exercises"  
export_table "workout_exercise_groups"
export_table "workout_block_instances"
export_table "workout_assignments"
export_table "exercises"
export_table "users"

echo ""
echo "✅ Data export complete!"
echo ""
echo "📁 Files in: database-export/data/"
echo ""
echo "To view counts:"
echo "  ls -lh database-export/data/"
echo ""
