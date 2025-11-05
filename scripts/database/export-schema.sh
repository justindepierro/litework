#!/bin/bash
#
# Export Database Schema using Supabase CLI
# This will create a complete dump of your database schema
#

set -e

echo ""
echo "📦 Exporting Database Schema"
echo "============================="
echo ""

# Create export directory
mkdir -p database-export

echo "🔍 Step 1: Getting list of all tables..."
echo ""

# Export full schema using Supabase CLI
supabase db dump --linked --data-only=false --schema public > database-export/schema-dump.sql 2>&1

if [ $? -eq 0 ]; then
  echo "✅ Schema exported to: database-export/schema-dump.sql"
  echo ""
  
  # Extract table names
  echo "📋 Tables found:"
  grep "CREATE TABLE" database-export/schema-dump.sql | sed 's/CREATE TABLE //' | sed 's/ (.*$//' || echo "   (checking alternative format...)"
  
  echo ""
  echo "🔍 Step 2: Extracting table structure..."
  
  # Create a readable summary
  cat > database-export/TABLES_SUMMARY.txt << EOF
======================================================================
LiteWork Database Tables Summary
Generated: $(date)
======================================================================

TABLES IN DATABASE:
$(grep -E "^CREATE TABLE" database-export/schema-dump.sql | sed 's/CREATE TABLE /  ✅ /' | sed 's/ ($//' || echo "  (none found in expected format)")

======================================================================
FULL SCHEMA FILE: schema-dump.sql
======================================================================
EOF

  cat database-export/TABLES_SUMMARY.txt
  
else
  echo "❌ Schema export failed"
  echo ""
  echo "This might be because:"
  echo "  1. Docker isn't running"
  echo "  2. Supabase CLI version issue"
  echo ""
  echo "Trying alternative method..."
  echo ""
  
  # Alternative: Get table list via psql
  echo "📋 Attempting to list tables directly..."
  
  # This requires connection string
  if [ -f .env.local ]; then
    source .env.local
    
    if [ ! -z "$DATABASE_URL" ]; then
      echo "✅ Found DATABASE_URL, querying directly..."
      
      # Use psql if available
      if command -v psql &> /dev/null; then
        psql "$DATABASE_URL" -c "\dt public.*" > database-export/tables-list.txt 2>&1
        echo "✅ Tables list saved to: database-export/tables-list.txt"
        cat database-export/tables-list.txt
      else
        echo "❌ psql not available"
      fi
    fi
  fi
fi

echo ""
echo "📁 Export location: database-export/"
echo ""
echo "💡 To view:"
echo "   cat database-export/schema-dump.sql | grep 'CREATE TABLE' -A 20"
echo ""
echo "   Or open database-export/schema-dump.sql in your editor"
echo ""
