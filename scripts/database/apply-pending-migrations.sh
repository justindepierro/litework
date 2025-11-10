#!/bin/bash

# =============================================================================
# Run Pending Database Migrations
# =============================================================================
# This script applies all pending migrations to the Supabase database
# 
# Usage: ./scripts/database/apply-pending-migrations.sh
#
# Prerequisites:
# - SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env.local
# - psql must be installed (brew install postgresql)
# =============================================================================

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}==============================================================================${NC}"
echo -e "${BLUE}Running Pending Database Migrations${NC}"
echo -e "${BLUE}==============================================================================${NC}"
echo ""

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo -e "${RED}Error: .env.local file not found${NC}"
    echo "Please create .env.local with SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY"
    exit 1
fi

# Load environment variables
export $(cat .env.local | grep -v '^#' | xargs)

# Check required environment variables
if [ -z "$SUPABASE_URL" ]; then
    echo -e "${RED}Error: SUPABASE_URL not set in .env.local${NC}"
    exit 1
fi

if [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
    echo -e "${RED}Error: SUPABASE_SERVICE_ROLE_KEY not set in .env.local${NC}"
    exit 1
fi

# Extract database connection details from Supabase URL
# Format: https://xxxxx.supabase.co
PROJECT_REF=$(echo $SUPABASE_URL | sed -E 's|https://([^.]+)\.supabase\.co|\1|')
DB_HOST="db.${PROJECT_REF}.supabase.co"
DB_PORT="5432"
DB_NAME="postgres"
DB_USER="postgres"

echo -e "${YELLOW}Database Connection Info:${NC}"
echo "  Host: $DB_HOST"
echo "  Port: $DB_PORT"
echo "  Database: $DB_NAME"
echo ""

# Prompt for database password
echo -e "${YELLOW}Enter your Supabase database password:${NC}"
echo "(Find this in Supabase Dashboard → Settings → Database → Connection String)"
read -s DB_PASSWORD
echo ""

if [ -z "$DB_PASSWORD" ]; then
    echo -e "${RED}Error: Database password is required${NC}"
    exit 1
fi

# Export password for psql
export PGPASSWORD="$DB_PASSWORD"

echo -e "${BLUE}Testing database connection...${NC}"
if ! psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "SELECT 1" > /dev/null 2>&1; then
    echo -e "${RED}Error: Could not connect to database${NC}"
    echo "Please check your database password and try again"
    exit 1
fi
echo -e "${GREEN}✓ Database connection successful${NC}"
echo ""

# Show migration preview
echo -e "${BLUE}Migrations to be applied:${NC}"
echo "  1. Add video_url column to workout_exercises"
echo "  2. Add enhanced assignment fields (workout_plan_name, assignment_type, athlete_ids, etc.)"
echo ""

# Confirm before running
echo -e "${YELLOW}WARNING: This will modify the production database${NC}"
echo -e "${YELLOW}Do you want to continue? (yes/no)${NC}"
read -r CONFIRM

if [ "$CONFIRM" != "yes" ]; then
    echo -e "${RED}Migration cancelled${NC}"
    exit 0
fi

echo ""
echo -e "${BLUE}Applying migrations...${NC}"

# Run the migration SQL file
if psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -f "scripts/database/run-pending-migrations.sql"; then
    echo ""
    echo -e "${GREEN}==============================================================================${NC}"
    echo -e "${GREEN}✓ All migrations applied successfully!${NC}"
    echo -e "${GREEN}==============================================================================${NC}"
    echo ""
    echo -e "${BLUE}Next steps:${NC}"
    echo "  1. Export updated schema:"
    echo -e "     ${YELLOW}./scripts/database/export-schema.sh${NC}"
    echo ""
    echo "  2. Verify application:"
    echo -e "     ${YELLOW}npm run dev${NC}"
    echo ""
    echo "  3. Test new features:"
    echo "     - Create workout with YouTube video URL"
    echo "     - Assign workout to group with start/end time and location"
    echo ""
else
    echo ""
    echo -e "${RED}==============================================================================${NC}"
    echo -e "${RED}✗ Migration failed!${NC}"
    echo -e "${RED}==============================================================================${NC}"
    echo ""
    echo "Please check the error message above and try again."
    echo "If the migration partially completed, you may need to manually rollback changes."
    exit 1
fi
