#!/bin/bash
# Combined KPI System Migration
# Runs both kpi-tags-schema.sql and athlete-assigned-kpis-schema.sql

set -e  # Exit on error

echo "🚀 Starting KPI System Migration..."
echo ""

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
  echo "❌ Error: DATABASE_URL environment variable not set"
  echo "   Please set it with your Supabase connection string:"
  echo "   export DATABASE_URL='postgresql://postgres:[PASSWORD]@[HOST]/postgres'"
  exit 1
fi

echo "📊 Step 1: Creating KPI Tags system..."
psql "$DATABASE_URL" -f database/kpi-tags-schema.sql
if [ $? -eq 0 ]; then
  echo "✅ KPI Tags schema created successfully"
else
  echo "❌ KPI Tags schema failed"
  exit 1
fi

echo ""
echo "👥 Step 2: Creating Athlete KPI Assignments system..."
psql "$DATABASE_URL" -f database/athlete-assigned-kpis-schema.sql
if [ $? -eq 0 ]; then
  echo "✅ Athlete KPI Assignments schema created successfully"
else
  echo "❌ Athlete KPI Assignments schema failed"
  exit 1
fi

echo ""
echo "🔄 Step 3: Creating Group KPI Inheritance trigger..."
psql "$DATABASE_URL" -f database/group-kpi-inheritance-trigger.sql
if [ $? -eq 0 ]; then
  echo "✅ Group KPI Inheritance trigger created successfully"
else
  echo "❌ Group KPI Inheritance trigger failed"
  exit 1
fi

echo ""
echo "🎉 Migration Complete!"
echo ""
echo "Next steps:"
echo "1. Integrate modals into Athletes page"
echo "2. Test creating custom KPIs"
echo "3. Test bulk assignment to groups"
echo ""
