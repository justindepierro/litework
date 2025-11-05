#!/bin/bash
#
# Quick Migration Helper
# Copies SQL to clipboard and opens Supabase dashboard
#

echo ""
echo "🚀 LiteWork Workout Groups Migration"
echo "====================================="
echo ""

# Copy SQL to clipboard
if command -v pbcopy &> /dev/null; then
  cat database/add-workout-groups-and-blocks.sql | pbcopy
  echo "✅ SQL copied to clipboard!"
else
  echo "⚠️  Could not copy to clipboard (pbcopy not found)"
fi

echo ""
echo "📋 Next Steps:"
echo ""
echo "1. Opening Supabase SQL Editor in your browser..."
echo ""
echo "2. In the SQL Editor:"
echo "   • Paste the SQL (Cmd+V) - it's already in your clipboard!"
echo "   • Click the green 'Run' button"
echo "   • Wait for success message"
echo ""
echo "3. Verify at the bottom you see:"
echo "   workout_exercise_groups  | 13"
echo "   workout_block_instances  | 13"
echo ""

# Open the Supabase SQL editor
open "https://supabase.com/dashboard/project/lzsjaqkhdoqsafptqpnt/sql/new"

echo "✅ Browser opened!"
echo ""
echo "💡 If it didn't copy, the SQL file is at:"
echo "   database/add-workout-groups-and-blocks.sql"
echo ""
