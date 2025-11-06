#!/bin/bash

# Apply archived column migration to workout_plans table

set -e

echo "🔧 Adding archived column to workout_plans table..."

# Check for required environment variables
if [ -z "$SUPABASE_DB_URL" ]; then
  echo "❌ Error: SUPABASE_DB_URL environment variable not set"
  echo "   Please set it in your .env.local file"
  exit 1
fi

# Apply the migration
psql "$SUPABASE_DB_URL" -f database/add-archived-to-workouts.sql

if [ $? -eq 0 ]; then
  echo "✅ Migration applied successfully!"
  echo ""
  echo "📝 Changes made:"
  echo "   - Added 'archived' column (BOOLEAN, default FALSE)"
  echo "   - Created index on 'archived' column"
  echo ""
  echo "🎯 Next steps:"
  echo "   1. Update TypeScript types"
  echo "   2. Add archive/unarchive API endpoints"
  echo "   3. Update frontend to filter archived workouts"
else
  echo "❌ Migration failed"
  exit 1
fi
