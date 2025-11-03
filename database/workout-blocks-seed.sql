-- Workout Blocks Seed Data
-- Pre-built workout block templates for common training patterns

-- Get system user ID (you'll need to replace this with actual system user or admin ID)
-- For now, we'll use a placeholder that should be updated during deployment

-- Warm-up Blocks
INSERT INTO workout_blocks (name, description, category, exercises, estimated_duration, tags, is_template, created_by, usage_count) VALUES
(
  'Monday Upper Body Warm-up',
  'Dynamic warm-up for upper body training days',
  'warmup',
  '[
    {"id": "ex-1", "exerciseId": "arm-circles", "exerciseName": "Arm Circles", "sets": 2, "reps": 10, "weightType": "bodyweight", "order": 1},
    {"id": "ex-2", "exerciseId": "band-pull-aparts", "exerciseName": "Band Pull-Aparts", "sets": 2, "reps": 15, "weightType": "bodyweight", "order": 2},
    {"id": "ex-3", "exerciseId": "push-ups", "exerciseName": "Push-ups", "sets": 2, "reps": 10, "weightType": "bodyweight", "order": 3}
  ]'::jsonb,
  10,
  ARRAY['warmup', 'upper body', 'mobility'],
  true,
  (SELECT id FROM auth.users LIMIT 1), -- Replace with system/admin user
  45
),
(
  'Lower Body Dynamic Warm-up',
  'Dynamic warm-up for leg day',
  'warmup',
  '[
    {"id": "ex-1", "exerciseId": "leg-swings", "exerciseName": "Leg Swings", "sets": 2, "reps": 10, "weightType": "bodyweight", "order": 1},
    {"id": "ex-2", "exerciseId": "bodyweight-squats", "exerciseName": "Bodyweight Squats", "sets": 2, "reps": 15, "weightType": "bodyweight", "order": 2},
    {"id": "ex-3", "exerciseId": "lunges", "exerciseName": "Walking Lunges", "sets": 2, "reps": 10, "weightType": "bodyweight", "order": 3},
    {"id": "ex-4", "exerciseId": "hip-circles", "exerciseName": "Hip Circles", "sets": 2, "reps": 10, "weightType": "bodyweight", "order": 4}
  ]'::jsonb,
  12,
  ARRAY['warmup', 'lower body', 'mobility', 'legs'],
  true,
  (SELECT id FROM auth.users LIMIT 1),
  38
);

-- Main Lift Blocks
INSERT INTO workout_blocks (name, description, category, exercises, estimated_duration, tags, is_template, created_by, usage_count) VALUES
(
  'Push Day - Main Lifts',
  'Core compound movements for push day',
  'main',
  '[
    {"id": "ex-1", "exerciseId": "bench-press", "exerciseName": "Bench Press", "sets": 4, "reps": 8, "weightType": "percentage", "percentage": 80, "restTime": 180, "order": 1},
    {"id": "ex-2", "exerciseId": "overhead-press", "exerciseName": "Overhead Press", "sets": 4, "reps": 8, "weightType": "percentage", "percentage": 75, "restTime": 150, "order": 2},
    {"id": "ex-3", "exerciseId": "incline-db-press", "exerciseName": "Incline Dumbbell Press", "sets": 3, "reps": 10, "weightType": "fixed", "weight": 60, "restTime": 120, "order": 3}
  ]'::jsonb,
  30,
  ARRAY['push', 'strength', 'chest', 'shoulders'],
  true,
  (SELECT id FROM auth.users LIMIT 1),
  78
),
(
  'Pull Day - Main Lifts',
  'Core compound movements for pull day',
  'main',
  '[
    {"id": "ex-1", "exerciseId": "deadlift", "exerciseName": "Deadlift", "sets": 4, "reps": 6, "weightType": "percentage", "percentage": 85, "restTime": 240, "order": 1},
    {"id": "ex-2", "exerciseId": "bent-over-row", "exerciseName": "Bent Over Row", "sets": 4, "reps": 8, "weightType": "percentage", "percentage": 75, "restTime": 150, "order": 2},
    {"id": "ex-3", "exerciseId": "pull-ups", "exerciseName": "Pull-ups", "sets": 3, "reps": 10, "weightType": "bodyweight", "restTime": 120, "order": 3}
  ]'::jsonb,
  30,
  ARRAY['pull', 'strength', 'back', 'deadlift'],
  true,
  (SELECT id FROM auth.users LIMIT 1),
  82
),
(
  'Leg Day - Main Lifts',
  'Lower body strength training',
  'main',
  '[
    {"id": "ex-1", "exerciseId": "back-squat", "exerciseName": "Back Squat", "sets": 5, "reps": 5, "weightType": "percentage", "percentage": 85, "restTime": 240, "order": 1},
    {"id": "ex-2", "exerciseId": "romanian-deadlift", "exerciseName": "Romanian Deadlift", "sets": 4, "reps": 8, "weightType": "percentage", "percentage": 70, "restTime": 150, "order": 2},
    {"id": "ex-3", "exerciseId": "bulgarian-split-squat", "exerciseName": "Bulgarian Split Squat", "sets": 3, "reps": 10, "weightType": "fixed", "weight": 50, "restTime": 120, "order": 3}
  ]'::jsonb,
  35,
  ARRAY['legs', 'strength', 'squat', 'lower body'],
  true,
  (SELECT id FROM auth.users LIMIT 1),
  91
);

-- Accessory Work Blocks
INSERT INTO workout_blocks (name, description, category, exercises, groups, estimated_duration, tags, is_template, created_by, usage_count) VALUES
(
  'Push Accessories',
  'Isolation and accessory work for push day',
  'accessory',
  '[
    {"id": "ex-1", "exerciseId": "lateral-raises", "exerciseName": "Lateral Raises", "sets": 3, "reps": 15, "weightType": "fixed", "weight": 20, "restTime": 60, "order": 1, "groupId": "group-1"},
    {"id": "ex-2", "exerciseId": "front-raises", "exerciseName": "Front Raises", "sets": 3, "reps": 15, "weightType": "fixed", "weight": 20, "restTime": 60, "order": 2, "groupId": "group-1"},
    {"id": "ex-3", "exerciseId": "tricep-pushdowns", "exerciseName": "Tricep Pushdowns", "sets": 3, "reps": 15, "weightType": "fixed", "weight": 50, "restTime": 60, "order": 3},
    {"id": "ex-4", "exerciseId": "cable-flyes", "exerciseName": "Cable Flyes", "sets": 3, "reps": 12, "weightType": "fixed", "weight": 30, "restTime": 60, "order": 4}
  ]'::jsonb,
  '[
    {"id": "group-1", "name": "Shoulder Superset", "type": "superset", "order": 1, "description": "Lateral and front raises"}
  ]'::jsonb,
  20,
  ARRAY['push', 'accessory', 'shoulders', 'triceps', 'chest'],
  true,
  (SELECT id FROM auth.users LIMIT 1),
  34
),
(
  'Pull Accessories',
  'Isolation and accessory work for pull day',
  'accessory',
  '[
    {"id": "ex-1", "exerciseId": "face-pulls", "exerciseName": "Face Pulls", "sets": 3, "reps": 15, "weightType": "fixed", "weight": 40, "restTime": 60, "order": 1},
    {"id": "ex-2", "exerciseId": "bicep-curls", "exerciseName": "Bicep Curls", "sets": 3, "reps": 12, "weightType": "fixed", "weight": 35, "restTime": 60, "order": 2, "groupId": "group-1"},
    {"id": "ex-3", "exerciseId": "hammer-curls", "exerciseName": "Hammer Curls", "sets": 3, "reps": 12, "weightType": "fixed", "weight": 35, "restTime": 60, "order": 3, "groupId": "group-1"},
    {"id": "ex-4", "exerciseId": "lat-pulldowns", "exerciseName": "Lat Pulldowns", "sets": 3, "reps": 12, "weightType": "fixed", "weight": 120, "restTime": 90, "order": 4}
  ]'::jsonb,
  '[
    {"id": "group-1", "name": "Bicep Superset", "type": "superset", "order": 1, "description": "Alternating bicep and hammer curls"}
  ]'::jsonb,
  20,
  ARRAY['pull', 'accessory', 'back', 'biceps', 'rear delts'],
  true,
  (SELECT id FROM auth.users LIMIT 1),
  29
),
(
  'Leg Accessories',
  'Isolation work for legs',
  'accessory',
  '[
    {"id": "ex-1", "exerciseId": "leg-extensions", "exerciseName": "Leg Extensions", "sets": 3, "reps": 15, "weightType": "fixed", "weight": 120, "restTime": 60, "order": 1},
    {"id": "ex-2", "exerciseId": "leg-curls", "exerciseName": "Leg Curls", "sets": 3, "reps": 15, "weightType": "fixed", "weight": 100, "restTime": 60, "order": 2},
    {"id": "ex-3", "exerciseId": "calf-raises", "exerciseName": "Calf Raises", "sets": 4, "reps": 20, "weightType": "fixed", "weight": 150, "restTime": 45, "order": 3}
  ]'::jsonb,
  '[]'::jsonb,
  15,
  ARRAY['legs', 'accessory', 'quads', 'hamstrings', 'calves'],
  true,
  (SELECT id FROM auth.users LIMIT 1),
  26
);

-- Core Work Blocks
INSERT INTO workout_blocks (name, description, category, exercises, groups, estimated_duration, tags, is_template, created_by, usage_count) VALUES
(
  'Core Circuit',
  'Core strength and stability circuit',
  'accessory',
  '[
    {"id": "ex-1", "exerciseId": "planks", "exerciseName": "Planks", "sets": 3, "reps": 1, "weightType": "bodyweight", "restTime": 30, "order": 1, "groupId": "group-1", "notes": "Hold for 60 seconds"},
    {"id": "ex-2", "exerciseId": "russian-twists", "exerciseName": "Russian Twists", "sets": 3, "reps": 20, "weightType": "bodyweight", "restTime": 30, "order": 2, "groupId": "group-1"},
    {"id": "ex-3", "exerciseId": "leg-raises", "exerciseName": "Leg Raises", "sets": 3, "reps": 15, "weightType": "bodyweight", "restTime": 30, "order": 3, "groupId": "group-1"},
    {"id": "ex-4", "exerciseId": "bicycle-crunches", "exerciseName": "Bicycle Crunches", "sets": 3, "reps": 20, "weightType": "bodyweight", "restTime": 30, "order": 4, "groupId": "group-1"}
  ]'::jsonb,
  '[
    {"id": "group-1", "name": "Core Circuit", "type": "circuit", "order": 1, "rounds": 3, "restBetweenRounds": 90, "description": "Complete all exercises, rest, repeat"}
  ]'::jsonb,
  15,
  ARRAY['core', 'abs', 'circuit', 'bodyweight'],
  true,
  (SELECT id FROM auth.users LIMIT 1),
  42
);

-- Cool Down Blocks
INSERT INTO workout_blocks (name, description, category, exercises, estimated_duration, tags, is_template, created_by, usage_count) VALUES
(
  'Standard Cool Down',
  'Static stretching and mobility work',
  'cooldown',
  '[
    {"id": "ex-1", "exerciseId": "foam-rolling", "exerciseName": "Foam Rolling", "sets": 1, "reps": 1, "weightType": "bodyweight", "restTime": 0, "notes": "5 minutes of foam rolling major muscle groups", "order": 1},
    {"id": "ex-2", "exerciseId": "static-stretching", "exerciseName": "Static Stretching", "sets": 1, "reps": 1, "weightType": "bodyweight", "restTime": 0, "notes": "Hold each stretch for 30 seconds", "order": 2}
  ]'::jsonb,
  10,
  ARRAY['cooldown', 'recovery', 'stretching', 'mobility'],
  true,
  (SELECT id FROM auth.users LIMIT 1),
  23
),
(
  'Upper Body Stretch',
  'Focused upper body static stretching',
  'cooldown',
  '[
    {"id": "ex-1", "exerciseId": "chest-stretch", "exerciseName": "Doorway Chest Stretch", "sets": 1, "reps": 1, "weightType": "bodyweight", "notes": "Hold 30 seconds each side", "order": 1},
    {"id": "ex-2", "exerciseId": "shoulder-stretch", "exerciseName": "Cross-Body Shoulder Stretch", "sets": 1, "reps": 1, "weightType": "bodyweight", "notes": "Hold 30 seconds each side", "order": 2},
    {"id": "ex-3", "exerciseId": "tricep-stretch", "exerciseName": "Overhead Tricep Stretch", "sets": 1, "reps": 1, "weightType": "bodyweight", "notes": "Hold 30 seconds each side", "order": 3},
    {"id": "ex-4", "exerciseId": "lat-stretch", "exerciseName": "Lat Stretch", "sets": 1, "reps": 1, "weightType": "bodyweight", "notes": "Hold 30 seconds each side", "order": 4}
  ]'::jsonb,
  8,
  ARRAY['cooldown', 'stretching', 'upper body', 'mobility'],
  true,
  (SELECT id FROM auth.users LIMIT 1),
  18
),
(
  'Lower Body Stretch',
  'Focused lower body static stretching',
  'cooldown',
  '[
    {"id": "ex-1", "exerciseId": "quad-stretch", "exerciseName": "Standing Quad Stretch", "sets": 1, "reps": 1, "weightType": "bodyweight", "notes": "Hold 30 seconds each side", "order": 1},
    {"id": "ex-2", "exerciseId": "hamstring-stretch", "exerciseName": "Seated Hamstring Stretch", "sets": 1, "reps": 1, "weightType": "bodyweight", "notes": "Hold 30 seconds each side", "order": 2},
    {"id": "ex-3", "exerciseId": "hip-flexor-stretch", "exerciseName": "Kneeling Hip Flexor Stretch", "sets": 1, "reps": 1, "weightType": "bodyweight", "notes": "Hold 30 seconds each side", "order": 3},
    {"id": "ex-4", "exerciseId": "calf-stretch", "exerciseName": "Wall Calf Stretch", "sets": 1, "reps": 1, "weightType": "bodyweight", "notes": "Hold 30 seconds each side", "order": 4},
    {"id": "ex-5", "exerciseId": "glute-stretch", "exerciseName": "Pigeon Pose", "sets": 1, "reps": 1, "weightType": "bodyweight", "notes": "Hold 30 seconds each side", "order": 5}
  ]'::jsonb,
  10,
  ARRAY['cooldown', 'stretching', 'lower body', 'mobility', 'legs'],
  true,
  (SELECT id FROM auth.users LIMIT 1),
  21
);

-- Sport-Specific Blocks
INSERT INTO workout_blocks (name, description, category, exercises, estimated_duration, tags, is_template, created_by, usage_count) VALUES
(
  'Football Power Training',
  'Explosive movements for football athletes',
  'main',
  '[
    {"id": "ex-1", "exerciseId": "power-clean", "exerciseName": "Power Clean", "sets": 5, "reps": 3, "weightType": "percentage", "percentage": 80, "restTime": 180, "order": 1},
    {"id": "ex-2", "exerciseId": "box-jumps", "exerciseName": "Box Jumps", "sets": 4, "reps": 5, "weightType": "bodyweight", "restTime": 120, "order": 2},
    {"id": "ex-3", "exerciseId": "med-ball-slams", "exerciseName": "Medicine Ball Slams", "sets": 4, "reps": 10, "weightType": "fixed", "weight": 20, "restTime": 90, "order": 3}
  ]'::jsonb,
  25,
  ARRAY['power', 'explosive', 'football', 'athletic', 'strength'],
  true,
  (SELECT id FROM auth.users LIMIT 1),
  15
);

-- Add comments
COMMENT ON TABLE workout_blocks IS 'Contains pre-built workout block templates for quick workout construction';
