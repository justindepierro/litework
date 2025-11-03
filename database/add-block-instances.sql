-- Migration: Add Block Instance Support
-- Purpose: Enable customizable block instances in workouts
-- Date: November 3, 2025

-- Add block instance metadata column to workout_plans table
ALTER TABLE workout_plans
ADD COLUMN IF NOT EXISTS block_instances JSONB DEFAULT '[]'::jsonb;

-- Create index for better query performance on block instances
CREATE INDEX IF NOT EXISTS idx_workout_plans_block_instances 
ON workout_plans USING GIN (block_instances);

-- Add comment explaining the column
COMMENT ON COLUMN workout_plans.block_instances IS 
'Array of block instances used in this workout. Each instance has: id, sourceBlockId, sourceBlockName, instanceName (optional), customizations (tracking changes), notes, estimatedDuration, createdAt, updatedAt';

-- Example block instance structure:
-- {
--   "id": "block-instance-1699123456789",
--   "sourceBlockId": "block-uuid",
--   "sourceBlockName": "Push Day Main Lifts",
--   "instanceName": "Week 3 Progression",  -- optional custom name
--   "customizations": {
--     "modifiedExercises": ["ex-1", "ex-2"],
--     "addedExercises": ["ex-3"],
--     "removedExercises": [],
--     "modifiedGroups": [],
--     "addedGroups": [],
--     "removedGroups": []
--   },
--   "notes": "Increased weight by 5% for bench press",
--   "estimatedDuration": 25,
--   "createdAt": "2025-11-03T10:00:00Z",
--   "updatedAt": "2025-11-03T10:30:00Z"
-- }

-- Verify the migration
SELECT 
  table_name,
  column_name,
  data_type,
  column_default,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'workout_plans'
  AND column_name = 'block_instances';
