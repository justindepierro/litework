#!/bin/bash

# Verify Workout Blocks Installation
# Run this after applying the schema and seed data

echo "🔍 Checking workout_blocks table..."
echo ""

# This assumes you have Supabase CLI installed or you're connected via psql
# Replace with your actual connection method

cat << 'EOF'
-- Copy and paste this into your Supabase SQL Editor to verify installation:

-- 1. Check if table exists
SELECT COUNT(*) as total_blocks FROM workout_blocks;

-- 2. List all template blocks by category
SELECT 
  category,
  name,
  estimated_duration,
  usage_count,
  array_length(tags, 1) as tag_count
FROM workout_blocks 
WHERE is_template = true 
ORDER BY category, name;

-- 3. Verify block structure (sample one block)
SELECT 
  name,
  jsonb_array_length(exercises) as exercise_count,
  jsonb_array_length(COALESCE(groups, '[]'::jsonb)) as group_count
FROM workout_blocks 
WHERE name = 'Push Day - Main Lifts';

-- 4. Check RLS policies
SELECT 
  schemaname, 
  tablename, 
  policyname,
  cmd 
FROM pg_policies 
WHERE tablename = 'workout_blocks'
ORDER BY policyname;

EOF
