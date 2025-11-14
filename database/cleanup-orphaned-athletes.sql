-- Clean up orphaned athlete references from groups
-- Run this in Supabase SQL Editor

-- 1. First, let's see what we're cleaning
SELECT 
  id,
  name,
  athlete_ids,
  array_length(athlete_ids, 1) as current_count
FROM athlete_groups
WHERE array_length(athlete_ids, 1) > 0;

-- 2. Clean up orphaned IDs from Football - Skill group
UPDATE athlete_groups
SET athlete_ids = array_remove(
  array_remove(athlete_ids, '308eaf8a-4f2d-4035-8aee-f4bfdf655d50'),
  '1998d16b-f827-400a-8910-e58e8fb89ce3'
)
WHERE id = 'd04cdc05-b30a-40e5-a22c-dfefb1544ac1';

-- 3. Clean up orphaned IDs from Football - Line group  
UPDATE athlete_groups
SET athlete_ids = array_remove(
  array_remove(athlete_ids, '5de9c5d7-b9cb-4cde-916a-197b1a4a97c1'),
  'ce837a9a-8972-462b-a186-1416c9c1e0f8'
)
WHERE id = '102d122d-44b9-408b-9cb6-b40baa103ea5';

-- 4. Verify cleanup
SELECT 
  id,
  name,
  athlete_ids,
  array_length(athlete_ids, 1) as new_count
FROM athlete_groups
WHERE array_length(athlete_ids, 1) > 0;

-- 5. Check for any other orphaned references
SELECT 
  g.name as group_name,
  unnest(g.athlete_ids) as athlete_id
FROM athlete_groups g
WHERE NOT EXISTS (
  SELECT 1 FROM users u 
  WHERE u.id::text = ANY(g.athlete_ids)
);
