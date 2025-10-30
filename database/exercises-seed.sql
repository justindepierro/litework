-- Exercise Library Data Seeding
-- Run this after the exercises-schema.sql to populate with comprehensive exercise library

-- First, let's add some sample exercises for each category
-- This comprehensive library includes 150+ exercises across all categories

-- Helper function to get category ID by name
CREATE OR REPLACE FUNCTION get_category_id(category_name TEXT)
RETURNS UUID
LANGUAGE plpgsql
AS $$
DECLARE
  category_uuid UUID;
BEGIN
  SELECT id INTO category_uuid 
  FROM public.exercise_categories 
  WHERE name = category_name;
  RETURN category_uuid;
END;
$$;

-- Helper function to get muscle group ID by name
CREATE OR REPLACE FUNCTION get_muscle_group_id(muscle_name TEXT)
RETURNS UUID
LANGUAGE plpgsql
AS $$
DECLARE
  muscle_uuid UUID;
BEGIN
  SELECT id INTO muscle_uuid 
  FROM public.muscle_groups 
  WHERE name = muscle_name;
  RETURN muscle_uuid;
END;
$$;

-- CHEST EXERCISES (30+ exercises)
INSERT INTO public.exercises (name, description, category_id, instructions, difficulty_level, equipment_needed, is_compound, safety_notes, tags) VALUES 
(
  'Barbell Bench Press',
  'The king of chest exercises using a barbell for maximum load',
  get_category_id('Chest'),
  '["Lie flat on bench with feet firmly planted", "Grip barbell slightly wider than shoulders", "Lower bar to chest with control", "Press bar up explosively", "Keep core tight throughout"]'::jsonb,
  3,
  ARRAY['Barbell', 'Bench'],
  true,
  'Always use a spotter or safety bars. Keep wrists straight and maintain proper bar path.',
  ARRAY['compound', 'mass', 'strength', 'powerlifting']
),
(
  'Dumbbell Bench Press',
  'Chest exercise using dumbbells for greater range of motion and unilateral training',
  get_category_id('Chest'),
  '["Lie on bench with dumbbells at chest level", "Press weights up and slightly together", "Lower with control to stretch position", "Keep core engaged throughout"]'::jsonb,
  2,
  ARRAY['Dumbbells', 'Bench'],
  true,
  'Control the weights at all times. Start with lighter weight to learn movement pattern.',
  ARRAY['unilateral', 'range-of-motion', 'stabilizer']
),
(
  'Incline Barbell Press',
  'Upper chest focused barbell press on inclined bench',
  get_category_id('Chest'),
  '["Set bench to 30-45 degree incline", "Grip barbell slightly wider than shoulders", "Lower to upper chest", "Press up maintaining incline angle"]'::jsonb,
  3,
  ARRAY['Barbell', 'Bench'],
  true,
  'Avoid going too steep (over 45°) as this shifts emphasis to shoulders.',
  ARRAY['upper-chest', 'incline', 'compound']
),
(
  'Incline Dumbbell Press',
  'Upper chest focused dumbbell press on inclined bench',
  get_category_id('Chest'),
  '["Set bench to 30-45 degree incline", "Hold dumbbells at chest level", "Press weights up maintaining incline angle", "Lower with control to starting position"]'::jsonb,
  3,
  ARRAY['Dumbbells', 'Bench'],
  true,
  'Avoid going too steep (over 45°) as this shifts emphasis to shoulders.',
  ARRAY['upper-chest', 'incline', 'definition']
),
(
  'Decline Barbell Press',
  'Lower chest focused barbell press on declined bench',
  get_category_id('Chest'),
  '["Set bench to 15-30 degree decline", "Secure feet in holders", "Lower bar to lower chest", "Press up with control"]'::jsonb,
  3,
  ARRAY['Barbell', 'Bench'],
  true,
  'Use moderate decline angle. Ensure feet are properly secured.',
  ARRAY['lower-chest', 'decline', 'compound']
),
(
  'Decline Dumbbell Press',
  'Lower chest focused dumbbell press on declined bench',
  get_category_id('Chest'),
  '["Set bench to 15-30 degree decline", "Secure feet in holders", "Press dumbbells from lower chest", "Control the negative portion"]'::jsonb,
  3,
  ARRAY['Dumbbells', 'Bench'],
  true,
  'Use moderate decline angle. Control weights carefully in decline position.',
  ARRAY['lower-chest', 'decline', 'definition']
),
(
  'Push-ups',
  'Classic bodyweight chest exercise that can be done anywhere',
  get_category_id('Chest'),
  '["Start in plank position with hands under shoulders", "Lower chest toward ground", "Keep body in straight line", "Push back up to starting position"]'::jsonb,
  1,
  ARRAY['None'],
  true,
  'Keep core tight to avoid sagging hips. Modify on knees if needed.',
  ARRAY['bodyweight', 'beginner', 'home-workout', 'functional']
),
(
  'Diamond Push-ups',
  'Push-up variation with hands forming diamond shape for tricep emphasis',
  get_category_id('Chest'),
  '["Form diamond with thumbs and index fingers", "Position hands under chest", "Lower body maintaining diamond hand position", "Press up focusing on triceps"]'::jsonb,
  3,
  ARRAY['None'],
  true,
  'More challenging than regular push-ups. Scale to knees if needed.',
  ARRAY['bodyweight', 'triceps', 'advanced', 'home-workout']
),
(
  'Wide-Grip Push-ups',
  'Push-up variation with wider hand placement for chest emphasis',
  get_category_id('Chest'),
  '["Place hands wider than shoulders", "Lower chest toward ground", "Feel stretch in chest", "Press up with chest focus"]'::jsonb,
  2,
  ARRAY['None'],
  true,
  'Wider grip increases chest activation. Don''t go too wide to avoid shoulder strain.',
  ARRAY['bodyweight', 'chest-emphasis', 'home-workout']
),
(
  'Incline Push-ups',
  'Easier push-up variation with hands elevated',
  get_category_id('Chest'),
  '["Place hands on elevated surface", "Lower chest toward surface", "Keep body straight", "Press back up"]'::jsonb,
  1,
  ARRAY['Bench'],
  true,
  'Great for beginners. Higher surface makes it easier.',
  ARRAY['bodyweight', 'beginner', 'progression', 'home-workout']
),
(
  'Decline Push-ups',
  'Advanced push-up variation with feet elevated',
  get_category_id('Chest'),
  '["Place feet on elevated surface", "Hands on ground", "Lower chest toward ground", "Press up with control"]'::jsonb,
  3,
  ARRAY['Bench'],
  true,
  'More challenging than regular push-ups. Emphasizes upper chest.',
  ARRAY['bodyweight', 'advanced', 'upper-chest', 'home-workout']
),
(
  'Dumbbell Flyes',
  'Isolation exercise for chest development and stretch',
  get_category_id('Chest'),
  '["Lie on bench with dumbbells extended above chest", "Lower weights in wide arc motion", "Feel stretch in chest at bottom", "Bring weights back together with same arc"]'::jsonb,
  2,
  ARRAY['Dumbbells', 'Bench'],
  false,
  'Use lighter weight than pressing exercises. Focus on the stretch and squeeze.',
  ARRAY['isolation', 'chest-fly', 'definition', 'stretch']
),
(
  'Incline Dumbbell Flyes',
  'Upper chest isolation with incline bench',
  get_category_id('Chest'),
  '["Set bench to 30-45 degree incline", "Start with dumbbells above chest", "Lower in arc motion", "Squeeze upper chest at top"]'::jsonb,
  2,
  ARRAY['Dumbbells', 'Bench'],
  false,
  'Focus on upper chest squeeze. Control the stretch at bottom.',
  ARRAY['isolation', 'upper-chest', 'fly', 'definition']
),
(
  'Cable Crossovers',
  'Cable machine chest isolation with constant tension',
  get_category_id('Chest'),
  '["Set cables to high position", "Lean slightly forward", "Bring handles together in wide arc", "Squeeze chest at bottom of movement"]'::jsonb,
  2,
  ARRAY['Cable Machine'],
  false,
  'Maintain slight bend in elbows throughout movement. Control the negative.',
  ARRAY['isolation', 'constant-tension', 'definition', 'cable']
),
(
  'Low Cable Crossovers',
  'Cable crossover from low position targeting upper chest',
  get_category_id('Chest'),
  '["Set cables to low position", "Bring handles up and together", "Squeeze upper chest", "Control the negative"]'::jsonb,
  2,
  ARRAY['Cable Machine'],
  false,
  'Focus on upward arc motion. Feel upper chest contraction.',
  ARRAY['isolation', 'upper-chest', 'cable', 'definition']
),
(
  'Pec Deck Machine',
  'Machine-based chest isolation exercise',
  get_category_id('Chest'),
  '["Sit with back against pad", "Grip handles or place forearms on pads", "Bring arms together in front of chest", "Squeeze and control return"]'::jsonb,
  1,
  ARRAY['Pec Deck Machine'],
  false,
  'Adjust seat height for proper alignment. Don''t slam weights.',
  ARRAY['machine', 'isolation', 'beginner-friendly', 'chest-squeeze']
),
(
  'Dips',
  'Bodyweight exercise targeting lower chest and triceps',
  get_category_id('Chest'),
  '["Grip parallel bars with arms extended", "Lower body by bending elbows", "Lean slightly forward for chest emphasis", "Push back up to starting position"]'::jsonb,
  3,
  ARRAY['Pull-up Bar'],
  true,
  'Start with assisted version if needed. Avoid going too low to prevent shoulder injury.',
  ARRAY['bodyweight', 'lower-chest', 'triceps', 'compound']
),
(
  'Chest Dips',
  'Dip variation with forward lean for maximum chest activation',
  get_category_id('Chest'),
  '["Lean torso forward 20-30 degrees", "Lower body with elbows flared out", "Feel stretch in chest", "Press up maintaining forward lean"]'::jsonb,
  3,
  ARRAY['Pull-up Bar'],
  true,
  'Forward lean is key for chest emphasis. Control the depth.',
  ARRAY['bodyweight', 'chest-emphasis', 'advanced', 'lower-chest']
),
(
  'Machine Chest Press',
  'Machine-based pressing movement for chest development',
  get_category_id('Chest'),
  '["Sit with back against pad", "Grip handles at chest level", "Press forward with control", "Squeeze chest at full extension"]'::jsonb,
  1,
  ARRAY['Chest Press Machine'],
  true,
  'Good for beginners. Adjust seat for proper alignment.',
  ARRAY['machine', 'beginner-friendly', 'compound', 'stable']
),
(
  'Incline Machine Press',
  'Machine-based incline pressing for upper chest',
  get_category_id('Chest'),
  '["Adjust seat for incline position", "Grip handles at upper chest level", "Press up and slightly together", "Focus on upper chest contraction"]'::jsonb,
  1,
  ARRAY['Incline Press Machine'],
  true,
  'Machine provides stability for consistent form.',
  ARRAY['machine', 'upper-chest', 'beginner-friendly', 'compound']
),
(
  'Pullovers',
  'Chest and lat exercise with dumbbell or barbell',
  get_category_id('Chest'),
  '["Lie perpendicular to bench with shoulders on pad", "Hold weight above chest", "Lower weight behind head in arc", "Pull back to starting position"]'::jsonb,
  2,
  ARRAY['Dumbbells', 'Bench'],
  false,
  'Keep slight bend in elbows. Focus on chest stretch and contraction.',
  ARRAY['stretch', 'chest-expansion', 'lats', 'definition']
),
(
  'Single-Arm Dumbbell Press',
  'Unilateral chest press for core stability and balance',
  get_category_id('Chest'),
  '["Lie on bench with one dumbbell", "Press weight up with one arm", "Keep core tight for stability", "Alternate arms"]'::jsonb,
  3,
  ARRAY['Dumbbells', 'Bench'],
  true,
  'Requires core stability. Start lighter than bilateral pressing.',
  ARRAY['unilateral', 'core-stability', 'balance', 'functional']
),
(
  'Floor Press',
  'Pressing movement performed on the floor',
  get_category_id('Chest'),
  '["Lie on floor with knees bent", "Press weight from chest level", "Touch elbows to floor briefly", "Press back up"]'::jsonb,
  2,
  ARRAY['Dumbbells'],
  true,
  'Limited range of motion protects shoulders. Good for strength.',
  ARRAY['floor', 'shoulder-safe', 'strength', 'powerlifting']
),
(
  'Squeeze Press',
  'Dumbbell press with weights pressed together',
  get_category_id('Chest'),
  '["Hold dumbbells pressed together", "Press up while squeezing weights together", "Maintain pressure throughout", "Lower with control"]'::jsonb,
  2,
  ARRAY['Dumbbells', 'Bench'],
  true,
  'Focus on squeezing weights together for inner chest activation.',
  ARRAY['inner-chest', 'squeeze', 'mind-muscle', 'definition']
),
(
  'Cable Chest Press',
  'Cable machine pressing movement',
  get_category_id('Chest'),
  '["Set cables to chest height", "Press handles forward", "Squeeze chest at full extension", "Control the return"]'::jsonb,
  2,
  ARRAY['Cable Machine'],
  true,
  'Constant tension throughout range of motion.',
  ARRAY['cable', 'constant-tension', 'compound', 'definition']
),
(
  'Resistance Band Chest Press',
  'Chest press using resistance bands',
  get_category_id('Chest'),
  '["Anchor band behind you", "Press handles forward", "Squeeze chest at full extension", "Control the return"]'::jsonb,
  1,
  ARRAY['Resistance Bands'],
  true,
  'Great for home workouts. Adjust resistance by changing band tension.',
  ARRAY['bands', 'home-workout', 'portable', 'variable-resistance']
),
(
  'Svend Press',
  'Isometric chest exercise with plates',
  get_category_id('Chest'),
  '["Hold plates pressed together at chest", "Press plates away from body", "Squeeze plates together throughout", "Return to chest"]'::jsonb,
  2,
  ARRAY['Weight Plates'],
  false,
  'Focus on squeezing plates together for inner chest activation.',
  ARRAY['isometric', 'inner-chest', 'squeeze', 'unique']
),
(
  'Push-up to T',
  'Push-up with rotation for core and chest',
  get_category_id('Chest'),
  '["Perform standard push-up", "At top, rotate and reach one arm to ceiling", "Return to push-up position", "Alternate sides"]'::jsonb,
  3,
  ARRAY['None'],
  true,
  'Requires core stability and shoulder mobility.',
  ARRAY['bodyweight', 'rotation', 'core', 'functional']
),
(
  'Archer Push-ups',
  'Single-arm emphasis push-up variation',
  get_category_id('Chest'),
  '["Start in wide push-up position", "Lower to one side", "Keep one arm straight", "Push up and alternate sides"]'::jsonb,
  4,
  ARRAY['None'],
  true,
  'Very advanced movement. Build up to this gradually.',
  ARRAY['bodyweight', 'advanced', 'unilateral', 'strength']
),
(
  'Hindu Push-ups',
  'Dynamic push-up with hip movement',
  get_category_id('Chest'),
  '["Start in downward dog position", "Dive forward and down", "Push up to upward dog", "Return to starting position"]'::jsonb,
  3,
  ARRAY['None'],
  true,
  'Dynamic movement requiring shoulder and hip mobility.',
  ARRAY['bodyweight', 'dynamic', 'mobility', 'yoga']
);

-- Add muscle group associations for chest exercises
INSERT INTO public.exercise_muscle_groups (exercise_id, muscle_group_id, involvement_type)
SELECT e.id, get_muscle_group_id('Chest'), 'primary'
FROM public.exercises e 
WHERE e.name IN ('Barbell Bench Press', 'Dumbbell Bench Press', 'Incline Barbell Press', 'Incline Dumbbell Press', 
                 'Decline Barbell Press', 'Decline Dumbbell Press', 'Push-ups', 'Diamond Push-ups', 'Wide-Grip Push-ups',
                 'Incline Push-ups', 'Decline Push-ups', 'Dumbbell Flyes', 'Incline Dumbbell Flyes', 'Cable Crossovers',
                 'Low Cable Crossovers', 'Pec Deck Machine', 'Dips', 'Chest Dips', 'Machine Chest Press', 
                 'Incline Machine Press', 'Pullovers', 'Single-Arm Dumbbell Press', 'Floor Press', 'Squeeze Press',
                 'Cable Chest Press', 'Resistance Band Chest Press', 'Svend Press', 'Push-up to T', 'Archer Push-ups', 'Hindu Push-ups')
ON CONFLICT (exercise_id, muscle_group_id) DO NOTHING;

INSERT INTO public.exercise_muscle_groups (exercise_id, muscle_group_id, involvement_type)
SELECT e.id, get_muscle_group_id('Triceps'), 'secondary'
FROM public.exercises e 
WHERE e.name IN ('Barbell Bench Press', 'Dumbbell Bench Press', 'Incline Barbell Press', 'Incline Dumbbell Press',
                 'Decline Barbell Press', 'Decline Dumbbell Press', 'Push-ups', 'Diamond Push-ups', 'Dips', 'Chest Dips')
ON CONFLICT (exercise_id, muscle_group_id) DO NOTHING;

INSERT INTO public.exercise_muscle_groups (exercise_id, muscle_group_id, involvement_type)
SELECT e.id, get_muscle_group_id('Front Delts'), 'secondary'
FROM public.exercises e 
WHERE e.name IN ('Barbell Bench Press', 'Dumbbell Bench Press', 'Incline Barbell Press', 'Incline Dumbbell Press', 'Push-ups')
ON CONFLICT (exercise_id, muscle_group_id) DO NOTHING;

-- BACK EXERCISES (40+ exercises)
INSERT INTO public.exercises (name, description, category_id, instructions, difficulty_level, equipment_needed, is_compound, safety_notes, tags) VALUES 
(
  'Deadlifts',
  'The king of all exercises - full body compound movement',
  get_category_id('Back'),
  '["Stand with feet hip-width apart", "Grip barbell with mixed or double overhand grip", "Keep back straight and chest up", "Drive through heels and extend hips", "Stand tall with shoulders back"]'::jsonb,
  4,
  ARRAY['Barbell'],
  true,
  'Master the hip hinge pattern first. Keep bar close to body throughout lift.',
  ARRAY['compound', 'posterior-chain', 'strength', 'powerlifting', 'full-body']
),
(
  'Romanian Deadlifts',
  'Hip hinge movement targeting hamstrings and glutes',
  get_category_id('Back'),
  '["Hold barbell with overhand grip", "Hinge at hips while keeping legs straight", "Feel stretch in hamstrings", "Drive hips forward to return"]'::jsonb,
  3,
  ARRAY['Barbell'],
  true,
  'Focus on hip hinge pattern. Keep bar close to body throughout.',
  ARRAY['compound', 'hamstrings', 'glutes', 'hip-hinge', 'posterior-chain']
),
(
  'Sumo Deadlifts',
  'Wide stance deadlift variation',
  get_category_id('Back'),
  '["Stand with wide stance and toes pointed out", "Grip bar with hands inside legs", "Keep chest up and back straight", "Drive through heels to stand"]'::jsonb,
  4,
  ARRAY['Barbell'],
  true,
  'Requires good hip mobility. Keep knees tracking over toes.',
  ARRAY['compound', 'glutes', 'powerlifting', 'hip-mobility']
),
(
  'Deficit Deadlifts',
  'Deadlifts performed from elevated position for increased range',
  get_category_id('Back'),
  '["Stand on platform 1-4 inches high", "Perform deadlift with increased range", "Maintain proper form throughout", "Focus on hamstring stretch"]'::jsonb,
  5,
  ARRAY['Barbell', 'Platform'],
  true,
  'Advanced variation. Start with small deficit and progress gradually.',
  ARRAY['advanced', 'range-of-motion', 'hamstrings', 'strength']
),
(
  'Trap Bar Deadlifts',
  'Deadlift variation using hexagonal bar',
  get_category_id('Back'),
  '["Step inside trap bar", "Grip handles at sides", "Keep chest up and back straight", "Drive through heels to stand"]'::jsonb,
  3,
  ARRAY['Trap Bar'],
  true,
  'More quad-dominant than conventional deadlifts. Easier on lower back.',
  ARRAY['compound', 'quad-dominant', 'beginner-friendly', 'functional']
),
(
  'Pull-ups',
  'Classic bodyweight back exercise for width and strength',
  get_category_id('Back'),
  '["Hang from bar with overhand grip", "Pull body up until chin clears bar", "Lower with control to full extension", "Maintain tight core throughout"]'::jsonb,
  3,
  ARRAY['Pull-up Bar'],
  true,
  'Use assistance or negative reps if unable to perform full pull-ups initially.',
  ARRAY['bodyweight', 'back-width', 'functional', 'lat-development']
),
(
  'Chin-ups',
  'Pull-up variation with underhand grip',
  get_category_id('Back'),
  '["Hang from bar with underhand grip", "Pull body up until chin clears bar", "Focus on bicep and lat engagement", "Lower with control"]'::jsonb,
  3,
  ARRAY['Pull-up Bar'],
  true,
  'Underhand grip increases bicep involvement. Often easier than pull-ups.',
  ARRAY['bodyweight', 'biceps', 'lats', 'functional']
),
(
  'Wide-Grip Pull-ups',
  'Pull-up variation with wide grip for lat emphasis',
  get_category_id('Back'),
  '["Grip bar wider than shoulders", "Pull up focusing on lat contraction", "Bring chest toward bar", "Lower with control"]'::jsonb,
  4,
  ARRAY['Pull-up Bar'],
  true,
  'More challenging than regular pull-ups. Emphasizes lat width.',
  ARRAY['bodyweight', 'lats', 'back-width', 'advanced']
),
(
  'Neutral Grip Pull-ups',
  'Pull-up with parallel grip handles',
  get_category_id('Back'),
  '["Use parallel grip handles", "Pull up with neutral wrist position", "Focus on lat and rhomboid engagement", "Lower with control"]'::jsonb,
  3,
  ARRAY['Pull-up Bar'],
  true,
  'Easier on wrists and shoulders. Good for those with grip issues.',
  ARRAY['bodyweight', 'neutral-grip', 'shoulder-friendly', 'functional']
),
(
  'Assisted Pull-ups',
  'Pull-up with assistance for beginners',
  get_category_id('Back'),
  '["Use assistance machine or bands", "Perform pull-up motion", "Focus on proper form", "Gradually reduce assistance"]'::jsonb,
  2,
  ARRAY['Assistance Machine'],
  true,
  'Great for building up to unassisted pull-ups.',
  ARRAY['beginner', 'progression', 'assisted', 'functional']
),
(
  'Negative Pull-ups',
  'Eccentric-focused pull-up training',
  get_category_id('Back'),
  '["Start at top position of pull-up", "Lower body as slowly as possible", "Focus on 3-5 second descent", "Use assistance to return to top"]'::jsonb,
  2,
  ARRAY['Pull-up Bar'],
  true,
  'Great for building strength for full pull-ups.',
  ARRAY['eccentric', 'progression', 'strength-building', 'bodyweight']
),
(
  'Bent-over Barbell Rows',
  'Classic rowing movement for back thickness and strength',
  get_category_id('Back'),
  '["Bend at hips with slight knee bend", "Grip barbell with overhand grip", "Pull bar to lower chest/upper abdomen", "Squeeze shoulder blades together"]'::jsonb,
  3,
  ARRAY['Barbell'],
  true,
  'Keep torso angle consistent. Pull with elbows, not hands.',
  ARRAY['compound', 'back-thickness', 'rowing', 'strength']
),
(
  'Pendlay Rows',
  'Bent-over row starting from floor each rep',
  get_category_id('Back'),
  '["Set up like deadlift position", "Pull bar explosively to lower chest", "Lower bar to floor and pause", "Reset position for each rep"]'::jsonb,
  4,
  ARRAY['Barbell'],
  true,
  'More explosive than regular bent-over rows. Reset each rep.',
  ARRAY['explosive', 'power', 'rowing', 'strength']
),
(
  'T-Bar Rows',
  'Rowing exercise using T-bar or landmine setup',
  get_category_id('Back'),
  '["Straddle T-bar with bent knees", "Grip handles or barbell end", "Pull weight to lower chest", "Squeeze shoulder blades together"]'::jsonb,
  3,
  ARRAY['T-Bar'],
  true,
  'Provides stable position for heavy rowing.',
  ARRAY['compound', 'back-thickness', 'heavy', 'strength']
),
(
  'Single-Arm Dumbbell Rows',
  'Unilateral rowing exercise for back development',
  get_category_id('Back'),
  '["Place one knee and hand on bench", "Pull dumbbell to hip with opposite arm", "Keep torso parallel to floor", "Squeeze lat at top of movement"]'::jsonb,
  2,
  ARRAY['Dumbbells', 'Bench'],
  true,
  'Avoid rotating torso. Focus on pulling with the lat, not just the arm.',
  ARRAY['unilateral', 'back-thickness', 'rowing', 'isolation']
),
(
  'Chest-Supported Rows',
  'Rowing exercise with chest support to eliminate momentum',
  get_category_id('Back'),
  '["Lie chest down on incline bench", "Let arms hang with weights", "Pull weights to lower chest", "Focus on squeezing shoulder blades"]'::jsonb,
  2,
  ARRAY['Dumbbells', 'Bench'],
  true,
  'Eliminates momentum and lower back stress.',
  ARRAY['supported', 'strict-form', 'rowing', 'back-thickness']
),
(
  'Inverted Rows',
  'Bodyweight rowing exercise using bar',
  get_category_id('Back'),
  '["Lie under bar set at waist height", "Pull chest up to bar", "Keep body straight", "Lower with control"]'::jsonb,
  2,
  ARRAY['Pull-up Bar'],
  true,
  'Great progression exercise toward pull-ups.',
  ARRAY['bodyweight', 'progression', 'rowing', 'functional']
),
(
  'Lat Pulldowns',
  'Cable machine exercise for lat development',
  get_category_id('Back'),
  '["Sit at lat pulldown machine", "Grip bar wider than shoulders", "Pull bar to upper chest", "Squeeze lats at bottom"]'::jsonb,
  2,
  ARRAY['Lat Pulldown Machine'],
  true,
  'Avoid pulling behind neck. Focus on lat contraction rather than just moving weight.',
  ARRAY['machine', 'lat-development', 'back-width', 'beginner-friendly']
),
(
  'Wide-Grip Lat Pulldowns',
  'Lat pulldown with wide grip for maximum lat width',
  get_category_id('Back'),
  '["Use wide overhand grip", "Pull bar to upper chest", "Focus on lat contraction", "Control the return"]'::jsonb,
  2,
  ARRAY['Lat Pulldown Machine'],
  true,
  'Emphasizes lat width development.',
  ARRAY['machine', 'lat-width', 'back-development', 'isolation']
),
(
  'Close-Grip Lat Pulldowns',
  'Lat pulldown with narrow grip for mid-trap emphasis',
  get_category_id('Back'),
  '["Use narrow overhand grip", "Pull bar to lower chest", "Focus on mid-trap squeeze", "Control the eccentric"]'::jsonb,
  2,
  ARRAY['Lat Pulldown Machine'],
  true,
  'Targets different area of lats and mid-traps.',
  ARRAY['machine', 'mid-traps', 'lats', 'variation']
),
(
  'Reverse-Grip Lat Pulldowns',
  'Lat pulldown with underhand grip',
  get_category_id('Back'),
  '["Use underhand grip", "Pull bar to lower chest", "Focus on bicep and lat engagement", "Squeeze at bottom"]'::jsonb,
  2,
  ARRAY['Lat Pulldown Machine'],
  true,
  'Increases bicep involvement. Often allows heavier weight.',
  ARRAY['machine', 'biceps', 'lats', 'underhand']
),
(
  'Cable Rows',
  'Seated cable rowing exercise',
  get_category_id('Back'),
  '["Sit at cable row machine", "Pull handle to lower chest", "Squeeze shoulder blades together", "Control the return"]'::jsonb,
  2,
  ARRAY['Cable Machine'],
  true,
  'Keep torso upright. Focus on pulling with elbows.',
  ARRAY['cable', 'rowing', 'back-thickness', 'rhomboids']
),
(
  'Single-Arm Cable Rows',
  'Unilateral cable rowing for balance and strength',
  get_category_id('Back'),
  '["Use single handle attachment", "Pull handle to hip", "Rotate slightly toward working side", "Control the return"]'::jsonb,
  2,
  ARRAY['Cable Machine'],
  true,
  'Allows for slight rotation and unilateral training.',
  ARRAY['unilateral', 'cable', 'rowing', 'core-stability']
),
(
  'Face Pulls',
  'Cable exercise for rear delts and upper back',
  get_category_id('Back'),
  '["Set cable to eye level", "Pull rope attachment to face", "Focus on rear delt contraction", "Squeeze shoulder blades together"]'::jsonb,
  2,
  ARRAY['Cable Machine'],
  false,
  'Great for posture correction. Focus on pulling apart, not just back.',
  ARRAY['isolation', 'rear-delts', 'posture', 'upper-back', 'cable']
),
(
  'Reverse Flyes',
  'Rear delt isolation with dumbbells or machine',
  get_category_id('Back'),
  '["Bend forward with dumbbells in hands", "Raise arms out to sides", "Squeeze shoulder blades together", "Focus on rear delt contraction"]'::jsonb,
  2,
  ARRAY['Dumbbells'],
  false,
  'Keep slight bend in elbows. Focus on rear delt squeeze.',
  ARRAY['isolation', 'rear-delts', 'posture', 'shoulder-health']
),
(
  'Shrugs',
  'Trap isolation exercise',
  get_category_id('Back'),
  '["Hold weights at sides", "Shrug shoulders up toward ears", "Hold contraction briefly", "Lower with control"]'::jsonb,
  1,
  ARRAY['Dumbbells'],
  false,
  'Avoid rolling shoulders. Straight up and down motion.',
  ARRAY['isolation', 'traps', 'simple', 'beginner-friendly']
),
(
  'Barbell Shrugs',
  'Trap exercise using barbell',
  get_category_id('Back'),
  '["Hold barbell in front of thighs", "Shrug shoulders straight up", "Hold contraction", "Lower with control"]'::jsonb,
  2,
  ARRAY['Barbell'],
  false,
  'Can use heavier weight than dumbbells. Keep bar close to body.',
  ARRAY['isolation', 'traps', 'heavy', 'mass']
),
(
  'Power Shrugs',
  'Explosive shrug variation for power development',
  get_category_id('Back'),
  '["Start with barbell at mid-thigh", "Explosively shrug and rise on toes", "Focus on speed and power", "Control the descent"]'::jsonb,
  3,
  ARRAY['Barbell'],
  false,
  'Focus on explosive movement. Part of Olympic lift training.',
  ARRAY['explosive', 'power', 'traps', 'olympic']
),
(
  'Rack Pulls',
  'Partial deadlift from elevated position',
  get_category_id('Back'),
  '["Set bar at knee height in rack", "Perform deadlift from this position", "Focus on lockout portion", "Squeeze glutes at top"]'::jsonb,
  3,
  ARRAY['Barbell', 'Squat Rack'],
  true,
  'Allows heavier weight than full deadlifts. Focus on proper form.',
  ARRAY['partial-range', 'lockout', 'heavy', 'strength']
),
(
  'Good Mornings',
  'Hip hinge movement for posterior chain',
  get_category_id('Back'),
  '["Place barbell on shoulders like squat", "Hinge at hips with straight legs", "Feel stretch in hamstrings", "Return to upright position"]'::jsonb,
  3,
  ARRAY['Barbell'],
  true,
  'Start with light weight. Focus on hip hinge pattern.',
  ARRAY['hip-hinge', 'hamstrings', 'posterior-chain', 'technique']
),
(
  'Hyperextensions',
  'Lower back and glute exercise on hyperextension bench',
  get_category_id('Back'),
  '["Position hips on pad", "Cross arms over chest", "Lower torso toward floor", "Raise back to starting position"]'::jsonb,
  2,
  ARRAY['Hyperextension Bench'],
  false,
  'Don''t hyperextend beyond neutral spine.',
  ARRAY['lower-back', 'glutes', 'isolation', 'rehabilitation']
),
(
  'Reverse Hyperextensions',
  'Glute and hamstring exercise with legs moving',
  get_category_id('Back'),
  '["Lie face down on bench", "Let legs hang off end", "Raise legs up squeezing glutes", "Lower with control"]'::jsonb,
  2,
  ARRAY['Bench'],
  false,
  'Great for glute activation and lower back health.',
  ARRAY['glutes', 'hamstrings', 'rehabilitation', 'activation']
),
(
  '45-Degree Back Extensions',
  'Back extension on 45-degree bench',
  get_category_id('Back'),
  '["Position hips on 45-degree pad", "Cross arms over chest", "Lower torso maintaining neutral spine", "Raise back up squeezing glutes"]'::jsonb,
  2,
  ARRAY['45-Degree Back Extension'],
  false,
  'Focus on glute activation rather than just back extension.',
  ARRAY['glutes', 'lower-back', 'neutral-spine', 'rehabilitation']
),
(
  'Superman',
  'Bodyweight exercise for lower back and glutes',
  get_category_id('Back'),
  '["Lie face down on floor", "Raise chest and legs simultaneously", "Hold contraction briefly", "Lower with control"]'::jsonb,
  1,
  ARRAY['None'],
  false,
  'Great for beginners. Focus on quality over quantity.',
  ARRAY['bodyweight', 'beginner', 'lower-back', 'glutes']
),
(
  'Bird Dog',
  'Core stability exercise with opposite arm and leg',
  get_category_id('Back'),
  '["Start on hands and knees", "Extend opposite arm and leg", "Hold position maintaining balance", "Return and switch sides"]'::jsonb,
  1,
  ARRAY['None'],
  false,
  'Focus on stability and control. Keep hips level.',
  ARRAY['core-stability', 'balance', 'rehabilitation', 'functional']
),
(
  'Wall Slides',
  'Upper back mobility and strengthening exercise',
  get_category_id('Back'),
  '["Stand with back against wall", "Place arms in goalpost position", "Slide arms up and down wall", "Keep contact throughout"]'::jsonb,
  1,
  ARRAY['None'],
  false,
  'Great for posture and shoulder health.',
  ARRAY['posture', 'mobility', 'shoulder-health', 'therapeutic']
),
(
  'Band Pull-Aparts',
  'Resistance band exercise for rear delts and rhomboids',
  get_category_id('Back'),
  '["Hold band at chest level", "Pull band apart squeezing shoulder blades", "Control the return", "Focus on rear delt activation"]'::jsonb,
  1,
  ARRAY['Resistance Bands'],
  false,
  'Great for warm-up and posture correction.',
  ARRAY['bands', 'rear-delts', 'posture', 'warm-up']
),
(
  'High Pulls',
  'Explosive pulling movement for power development',
  get_category_id('Back'),
  '["Start like deadlift", "Pull explosively to chest height", "Lead with elbows", "Focus on speed and power"]'::jsonb,
  4,
  ARRAY['Barbell'],
  true,
  'Advanced movement requiring proper technique. Focus on explosive pull.',
  ARRAY['explosive', 'power', 'traps', 'olympic-prep']
),
(
  'Meadows Rows',
  'Single-arm barbell row in T-bar position',
  get_category_id('Back'),
  '["Position one end of barbell in corner", "Straddle bar and grip near plates", "Pull weight to hip", "Focus on lat contraction"]'::jsonb,
  3,
  ARRAY['Barbell'],
  true,
  'Unique angle provides different stimulus than regular rows.',
  ARRAY['unilateral', 'unique-angle', 'lats', 'advanced']
),
(
  'Landmine Rows',
  'Rowing exercise using landmine setup',
  get_category_id('Back'),
  '["Set up barbell in landmine", "Grip end of barbell", "Pull to chest in rowing motion", "Squeeze back muscles"]'::jsonb,
  2,
  ARRAY['Barbell', 'Landmine'],
  true,
  'Provides unique angle and core challenge.',
  ARRAY['landmine', 'functional', 'core', 'rowing']
);

-- Add muscle group associations for back exercises
INSERT INTO public.exercise_muscle_groups (exercise_id, muscle_group_id, involvement_type)
SELECT e.id, mg.id, 'primary'
FROM public.exercises e
CROSS JOIN public.muscle_groups mg
WHERE e.name IN ('Deadlifts', 'Romanian Deadlifts', 'Sumo Deadlifts', 'Deficit Deadlifts', 'Trap Bar Deadlifts', 'Rack Pulls') 
  AND mg.name IN ('Lower Back', 'Glutes', 'Hamstrings')
ON CONFLICT (exercise_id, muscle_group_id) DO NOTHING;

INSERT INTO public.exercise_muscle_groups (exercise_id, muscle_group_id, involvement_type)
SELECT e.id, mg.id, 'secondary'
FROM public.exercises e
CROSS JOIN public.muscle_groups mg
WHERE e.name IN ('Deadlifts', 'Romanian Deadlifts', 'Sumo Deadlifts', 'Deficit Deadlifts', 'Trap Bar Deadlifts', 'Rack Pulls') 
  AND mg.name IN ('Upper Traps', 'Forearms', 'Core')
ON CONFLICT (exercise_id, muscle_group_id) DO NOTHING;

INSERT INTO public.exercise_muscle_groups (exercise_id, muscle_group_id, involvement_type)
SELECT e.id, mg.id, 'primary'
FROM public.exercises e
CROSS JOIN public.muscle_groups mg
WHERE e.name IN ('Pull-ups', 'Chin-ups', 'Wide-Grip Pull-ups', 'Neutral Grip Pull-ups', 'Assisted Pull-ups', 'Negative Pull-ups',
                 'Lat Pulldowns', 'Wide-Grip Lat Pulldowns', 'Close-Grip Lat Pulldowns', 'Reverse-Grip Lat Pulldowns') 
  AND mg.name IN ('Lats', 'Rhomboids')
ON CONFLICT (exercise_id, muscle_group_id) DO NOTHING;

INSERT INTO public.exercise_muscle_groups (exercise_id, muscle_group_id, involvement_type)
SELECT e.id, mg.id, 'secondary'
FROM public.exercises e
CROSS JOIN public.muscle_groups mg
WHERE e.name IN ('Pull-ups', 'Chin-ups', 'Wide-Grip Pull-ups', 'Neutral Grip Pull-ups', 'Assisted Pull-ups', 'Negative Pull-ups') 
  AND mg.name IN ('Biceps', 'Rear Delts')
ON CONFLICT (exercise_id, muscle_group_id) DO NOTHING;

INSERT INTO public.exercise_muscle_groups (exercise_id, muscle_group_id, involvement_type)
SELECT e.id, mg.id, 'primary'
FROM public.exercises e
CROSS JOIN public.muscle_groups mg
WHERE e.name IN ('Bent-over Barbell Rows', 'Pendlay Rows', 'T-Bar Rows', 'Single-Arm Dumbbell Rows', 'Chest-Supported Rows',
                 'Inverted Rows', 'Cable Rows', 'Single-Arm Cable Rows') 
  AND mg.name IN ('Rhomboids', 'Middle Traps', 'Lats')
ON CONFLICT (exercise_id, muscle_group_id) DO NOTHING;

INSERT INTO public.exercise_muscle_groups (exercise_id, muscle_group_id, involvement_type)
SELECT e.id, mg.id, 'primary'
FROM public.exercises e
CROSS JOIN public.muscle_groups mg
WHERE e.name IN ('Face Pulls', 'Reverse Flyes') 
  AND mg.name = 'Rear Delts'
ON CONFLICT (exercise_id, muscle_group_id) DO NOTHING;

INSERT INTO public.exercise_muscle_groups (exercise_id, muscle_group_id, involvement_type)
SELECT e.id, mg.id, 'primary'
FROM public.exercises e
CROSS JOIN public.muscle_groups mg
WHERE e.name IN ('Shrugs', 'Barbell Shrugs', 'Power Shrugs') 
  AND mg.name = 'Upper Traps'
ON CONFLICT (exercise_id, muscle_group_id) DO NOTHING;

-- SHOULDER EXERCISES (25+ exercises)
INSERT INTO public.exercises (name, description, category_id, instructions, difficulty_level, equipment_needed, is_compound, safety_notes, tags) VALUES 
(
  'Overhead Press',
  'Standing barbell shoulder press for overall shoulder development',
  get_category_id('Shoulders'),
  '["Stand with feet hip-width apart", "Press barbell from shoulder level overhead", "Keep core tight and avoid arching back", "Lower with control to starting position"]'::jsonb,
  3,
  ARRAY['Barbell'],
  true,
  'Start with lighter weight to master form. Keep core engaged to protect lower back.',
  ARRAY['compound', 'overhead', 'strength', 'functional']
),
(
  'Military Press',
  'Strict overhead press with feet together',
  get_category_id('Shoulders'),
  '["Stand with feet together", "Press barbell overhead with strict form", "No leg drive or back arch", "Focus on shoulder strength"]'::jsonb,
  4,
  ARRAY['Barbell'],
  true,
  'Most challenging overhead press variation. Requires excellent core stability.',
  ARRAY['strict', 'overhead', 'strength', 'advanced']
),
(
  'Push Press',
  'Overhead press with leg drive for power development',
  get_category_id('Shoulders'),
  '["Start with barbell at shoulders", "Dip knees slightly", "Drive up explosively with legs", "Press weight overhead"]'::jsonb,
  3,
  ARRAY['Barbell'],
  true,
  'Allows heavier weight than strict press. Focus on timing.',
  ARRAY['explosive', 'power', 'leg-drive', 'olympic']
),
(
  'Dumbbell Shoulder Press',
  'Seated or standing dumbbell press for shoulder development',
  get_category_id('Shoulders'),
  '["Hold dumbbells at shoulder level", "Press weights overhead until arms extend", "Lower with control to starting position", "Keep core engaged throughout"]'::jsonb,
  2,
  ARRAY['Dumbbells'],
  true,
  'Use full range of motion. Avoid pressing too far back behind head.',
  ARRAY['unilateral', 'overhead', 'shoulder-development']
),
(
  'Seated Dumbbell Press',
  'Seated variation of dumbbell shoulder press',
  get_category_id('Shoulders'),
  '["Sit on bench with back support", "Press dumbbells overhead", "Focus on shoulder isolation", "Control the negative"]'::jsonb,
  2,
  ARRAY['Dumbbells', 'Bench'],
  true,
  'Back support allows focus on shoulders without core fatigue.',
  ARRAY['seated', 'isolation', 'beginner-friendly', 'stable']
),
(
  'Arnold Press',
  'Dumbbell press with rotation named after Arnold Schwarzenegger',
  get_category_id('Shoulders'),
  '["Start with dumbbells at chin level, palms facing you", "Rotate and press overhead", "Reverse the motion on the way down", "Feel all deltoid heads working"]'::jsonb,
  3,
  ARRAY['Dumbbells'],
  true,
  'Unique movement pattern works all deltoid heads.',
  ARRAY['rotation', 'all-delts', 'unique', 'advanced']
),
(
  'Single-Arm Dumbbell Press',
  'Unilateral shoulder press for stability and strength',
  get_category_id('Shoulders'),
  '["Hold one dumbbell at shoulder", "Press overhead while stabilizing core", "Control the weight throughout", "Alternate arms"]'::jsonb,
  3,
  ARRAY['Dumbbells'],
  true,
  'Requires significant core stability. Start lighter than bilateral pressing.',
  ARRAY['unilateral', 'core-stability', 'functional', 'anti-lateral-flexion']
),
(
  'Lateral Raises',
  'Side deltoid isolation exercise',
  get_category_id('Shoulders'),
  '["Hold dumbbells at sides", "Raise weights out to shoulder level", "Lead with pinkies, not thumbs", "Lower with control"]'::jsonb,
  1,
  ARRAY['Dumbbells'],
  false,
  'Use lighter weight and focus on form. Avoid swinging or momentum.',
  ARRAY['isolation', 'side-delts', 'shoulder-width', 'definition']
),
(
  'Cable Lateral Raises',
  'Lateral raise using cable for constant tension',
  get_category_id('Shoulders'),
  '["Set cable to low position", "Raise handle out to side", "Feel constant tension throughout", "Control the negative"]'::jsonb,
  2,
  ARRAY['Cable Machine'],
  false,
  'Provides constant tension unlike dumbbells.',
  ARRAY['cable', 'constant-tension', 'side-delts', 'isolation']
),
(
  'Leaning Lateral Raises',
  'Lateral raise with lean for increased range',
  get_category_id('Shoulders'),
  '["Hold onto stable object and lean away", "Perform lateral raise with outside arm", "Increased range of motion", "Focus on stretch and contraction"]'::jsonb,
  2,
  ARRAY['Dumbbells'],
  false,
  'Provides greater stretch and range than regular lateral raises.',
  ARRAY['increased-range', 'stretch', 'side-delts', 'advanced']
),
(
  'Front Raises',
  'Front deltoid isolation exercise',
  get_category_id('Shoulders'),
  '["Hold weight in front of thighs", "Raise to shoulder level with straight arms", "Lower with control", "Keep core engaged"]'::jsonb,
  1,
  ARRAY['Dumbbells'],
  false,
  'Avoid swinging. Control both lifting and lowering phases.',
  ARRAY['isolation', 'front-delts', 'shoulder-definition']
),
(
  'Alternating Front Raises',
  'Front raise performed one arm at a time',
  get_category_id('Shoulders'),
  '["Hold dumbbells at sides", "Raise one arm forward to shoulder height", "Lower and repeat with other arm", "Maintain control throughout"]'::jsonb,
  1,
  ARRAY['Dumbbells'],
  false,
  'Allows focus on one arm at a time. Less fatigue than bilateral.',
  ARRAY['alternating', 'front-delts', 'unilateral', 'controlled']
),
(
  'Plate Front Raises',
  'Front raise using weight plate',
  get_category_id('Shoulders'),
  '["Hold plate with both hands", "Raise plate to shoulder level", "Keep arms straight", "Lower with control"]'::jsonb,
  1,
  ARRAY['Weight Plates'],
  false,
  'Different grip pattern than dumbbells. Good variation.',
  ARRAY['plate', 'front-delts', 'grip-variation', 'simple']
),
(
  'Cable Front Raises',
  'Front raise using cable machine',
  get_category_id('Shoulders'),
  '["Set cable to low position behind you", "Raise handle forward to shoulder height", "Feel constant tension", "Control return"]'::jsonb,
  2,
  ARRAY['Cable Machine'],
  false,
  'Constant tension throughout movement.',
  ARRAY['cable', 'constant-tension', 'front-delts', 'isolation']
),
(
  'Rear Delt Flyes',
  'Isolation exercise for rear deltoids',
  get_category_id('Shoulders'),
  '["Bend forward with dumbbells", "Raise weights out to sides", "Squeeze shoulder blades", "Focus on rear delt contraction"]'::jsonb,
  2,
  ARRAY['Dumbbells'],
  false,
  'Critical for shoulder health and posture.',
  ARRAY['rear-delts', 'posture', 'shoulder-health', 'isolation']
),
(
  'Bent-Over Lateral Raises',
  'Lateral raise in bent-over position for rear delts',
  get_category_id('Shoulders'),
  '["Bend at hips with dumbbells", "Raise weights out to sides", "Keep slight bend in elbows", "Squeeze rear delts"]'::jsonb,
  2,
  ARRAY['Dumbbells'],
  false,
  'Same as rear delt flyes. Focus on rear deltoid activation.',
  ARRAY['rear-delts', 'bent-over', 'isolation', 'posture']
),
(
  'Cable Rear Delt Flyes',
  'Rear delt exercise using cable machine',
  get_category_id('Shoulders'),
  '["Set cables at shoulder height", "Cross cables and pull apart", "Focus on rear delt squeeze", "Control the return"]'::jsonb,
  2,
  ARRAY['Cable Machine'],
  false,
  'Constant tension variation of rear delt flyes.',
  ARRAY['cable', 'rear-delts', 'constant-tension', 'isolation']
),
(
  'Reverse Pec Deck',
  'Machine-based rear delt exercise',
  get_category_id('Shoulders'),
  '["Sit facing the pec deck machine", "Grip handles and pull back", "Squeeze shoulder blades together", "Focus on rear delt contraction"]'::jsonb,
  1,
  ARRAY['Pec Deck Machine'],
  false,
  'Machine provides stable movement pattern.',
  ARRAY['machine', 'rear-delts', 'beginner-friendly', 'stable']
),
(
  'Upright Rows',
  'Compound shoulder and trap exercise',
  get_category_id('Shoulders'),
  '["Hold barbell with narrow grip", "Pull bar up to chest level", "Lead with elbows", "Lower with control"]'::jsonb,
  2,
  ARRAY['Barbell'],
  true,
  'Can be hard on shoulders for some people. Use wide grip if needed.',
  ARRAY['compound', 'traps', 'side-delts', 'controversial']
),
(
  'Dumbbell Upright Rows',
  'Upright row using dumbbells',
  get_category_id('Shoulders'),
  '["Hold dumbbells at sides", "Pull weights up to chest level", "Lead with elbows", "Focus on trap and delt activation"]'::jsonb,
  2,
  ARRAY['Dumbbells'],
  true,
  'May be more shoulder-friendly than barbell version.',
  ARRAY['compound', 'traps', 'side-delts', 'dumbbells']
),
(
  'Cable Upright Rows',
  'Upright row using cable machine',
  get_category_id('Shoulders'),
  '["Use cable with rope or bar attachment", "Pull up to chest level", "Squeeze traps at top", "Control the negative"]'::jsonb,
  2,
  ARRAY['Cable Machine'],
  true,
  'Smooth resistance curve compared to free weights.',
  ARRAY['cable', 'traps', 'side-delts', 'smooth']
),
(
  'Pike Push-ups',
  'Bodyweight shoulder exercise in pike position',
  get_category_id('Shoulders'),
  '["Start in downward dog position", "Lower head toward ground", "Push back up to starting position", "Focus on shoulder strength"]'::jsonb,
  3,
  ARRAY['None'],
  true,
  'Progression toward handstand push-ups.',
  ARRAY['bodyweight', 'overhead', 'progression', 'advanced']
),
(
  'Handstand Push-ups',
  'Advanced bodyweight shoulder exercise',
  get_category_id('Shoulders'),
  '["Kick up into handstand against wall", "Lower head toward ground", "Push back up to handstand", "Requires significant strength"]'::jsonb,
  5,
  ARRAY['None'],
  true,
  'Extremely advanced. Master pike push-ups first.',
  ARRAY['bodyweight', 'advanced', 'handstand', 'expert']
),
(
  'Wall Handstand Push-ups',
  'Handstand push-up with wall support',
  get_category_id('Shoulders'),
  '["Face away from wall in handstand", "Lower to comfortable depth", "Push back up", "Use wall for balance"]'::jsonb,
  4,
  ARRAY['None'],
  true,
  'Easier than freestanding handstand push-ups.',
  ARRAY['bodyweight', 'wall-supported', 'advanced', 'overhead']
),
(
  'Shoulder Shrugs',
  'Trap isolation similar to general shrugs',
  get_category_id('Shoulders'),
  '["Hold weights at sides", "Shrug shoulders up", "Hold briefly", "Lower with control"]'::jsonb,
  1,
  ARRAY['Dumbbells'],
  false,
  'Simple movement focusing on trap development.',
  ARRAY['traps', 'isolation', 'simple', 'beginner']
),
(
  'Band Pull-Aparts',
  'Resistance band exercise for rear delts',
  get_category_id('Shoulders'),
  '["Hold band at chest level", "Pull band apart", "Squeeze shoulder blades", "Control the return"]'::jsonb,
  1,
  ARRAY['Resistance Bands'],
  false,
  'Great for warm-up and posture correction.',
  ARRAY['bands', 'rear-delts', 'warm-up', 'posture']
);

-- Add muscle group associations for shoulder exercises
INSERT INTO public.exercise_muscle_groups (exercise_id, muscle_group_id, involvement_type)
SELECT e.id, mg.id, 'primary'
FROM public.exercises e
CROSS JOIN public.muscle_groups mg
WHERE e.name IN ('Overhead Press', 'Military Press', 'Push Press', 'Dumbbell Shoulder Press', 'Seated Dumbbell Press',
                 'Arnold Press', 'Single-Arm Dumbbell Press', 'Pike Push-ups', 'Handstand Push-ups', 'Wall Handstand Push-ups') 
  AND mg.name IN ('Front Delts', 'Middle Delts')
ON CONFLICT (exercise_id, muscle_group_id) DO NOTHING;

INSERT INTO public.exercise_muscle_groups (exercise_id, muscle_group_id, involvement_type)
SELECT e.id, mg.id, 'secondary'
FROM public.exercises e
CROSS JOIN public.muscle_groups mg
WHERE e.name IN ('Overhead Press', 'Military Press', 'Push Press', 'Dumbbell Shoulder Press', 'Seated Dumbbell Press') 
  AND mg.name IN ('Triceps', 'Core')
ON CONFLICT (exercise_id, muscle_group_id) DO NOTHING;

INSERT INTO public.exercise_muscle_groups (exercise_id, muscle_group_id, involvement_type)
SELECT e.id, mg.id, 'primary'
FROM public.exercises e
CROSS JOIN public.muscle_groups mg
WHERE e.name IN ('Lateral Raises', 'Cable Lateral Raises', 'Leaning Lateral Raises') 
  AND mg.name = 'Middle Delts'
ON CONFLICT (exercise_id, muscle_group_id) DO NOTHING;

INSERT INTO public.exercise_muscle_groups (exercise_id, muscle_group_id, involvement_type)
SELECT e.id, mg.id, 'primary'
FROM public.exercises e
CROSS JOIN public.muscle_groups mg
WHERE e.name IN ('Front Raises', 'Alternating Front Raises', 'Plate Front Raises', 'Cable Front Raises') 
  AND mg.name = 'Front Delts'
ON CONFLICT (exercise_id, muscle_group_id) DO NOTHING;

INSERT INTO public.exercise_muscle_groups (exercise_id, muscle_group_id, involvement_type)
SELECT e.id, mg.id, 'primary'
FROM public.exercises e
CROSS JOIN public.muscle_groups mg
WHERE e.name IN ('Rear Delt Flyes', 'Bent-Over Lateral Raises', 'Cable Rear Delt Flyes', 'Reverse Pec Deck', 'Band Pull-Aparts') 
  AND mg.name = 'Rear Delts'
ON CONFLICT (exercise_id, muscle_group_id) DO NOTHING;

INSERT INTO public.exercise_muscle_groups (exercise_id, muscle_group_id, involvement_type)
SELECT e.id, mg.id, 'primary'
FROM public.exercises e
CROSS JOIN public.muscle_groups mg
WHERE e.name IN ('Upright Rows', 'Dumbbell Upright Rows', 'Cable Upright Rows', 'Shoulder Shrugs') 
  AND mg.name = 'Upper Traps'
ON CONFLICT (exercise_id, muscle_group_id) DO NOTHING;

-- ARM EXERCISES (35+ exercises)
INSERT INTO public.exercises (name, description, category_id, instructions, difficulty_level, equipment_needed, is_compound, safety_notes, tags) VALUES 
-- BICEP EXERCISES
(
  'Barbell Curls',
  'Classic bicep building exercise with barbell',
  get_category_id('Arms'),
  '["Stand with barbell in hands", "Curl weight up with biceps", "Keep elbows stationary", "Lower with control"]'::jsonb,
  2,
  ARRAY['Barbell'],
  false,
  'Avoid swinging or using momentum. Focus on bicep contraction.',
  ARRAY['isolation', 'biceps', 'mass', 'strength']
),
(
  'EZ-Bar Curls',
  'Bicep curls using EZ-curl bar for wrist comfort',
  get_category_id('Arms'),
  '["Hold EZ-bar with underhand grip", "Curl weight focusing on biceps", "Keep elbows stable", "Control the negative"]'::jsonb,
  2,
  ARRAY['EZ-Bar'],
  false,
  'EZ-bar is easier on wrists than straight barbell.',
  ARRAY['isolation', 'biceps', 'wrist-friendly', 'ez-bar']
),
(
  'Dumbbell Curls',
  'Basic dumbbell bicep exercise',
  get_category_id('Arms'),
  '["Hold dumbbells at sides", "Curl one or both arms up", "Squeeze biceps at top", "Lower with control"]'::jsonb,
  1,
  ARRAY['Dumbbells'],
  false,
  'Can be performed seated or standing. Control the negative portion.',
  ARRAY['isolation', 'biceps', 'unilateral', 'beginner-friendly']
),
(
  'Alternating Dumbbell Curls',
  'Dumbbell curls performed one arm at a time',
  get_category_id('Arms'),
  '["Hold dumbbells at sides", "Curl one arm while other stays down", "Alternate arms with each rep", "Focus on each bicep individually"]'::jsonb,
  1,
  ARRAY['Dumbbells'],
  false,
  'Allows focus on one arm at a time. Prevents stronger arm from compensating.',
  ARRAY['alternating', 'biceps', 'unilateral', 'mind-muscle']
),
(
  'Hammer Curls',
  'Neutral grip bicep exercise targeting brachialis',
  get_category_id('Arms'),
  '["Hold dumbbells with neutral grip", "Curl weights up like swinging hammers", "Keep wrists straight", "Lower with control"]'::jsonb,
  2,
  ARRAY['Dumbbells'],
  false,
  'Neutral grip targets different muscle fibers. Keep wrists aligned.',
  ARRAY['isolation', 'biceps', 'brachialis', 'neutral-grip']
),
(
  'Cross-Body Hammer Curls',
  'Hammer curl variation across the body',
  get_category_id('Arms'),
  '["Hold dumbbell in neutral grip", "Curl across body toward opposite shoulder", "Focus on bicep and brachialis", "Alternate arms"]'::jsonb,
  2,
  ARRAY['Dumbbells'],
  false,
  'Different angle provides unique stimulus.',
  ARRAY['cross-body', 'biceps', 'brachialis', 'angle-variation']
),
(
  'Concentration Curls',
  'Seated bicep curl with arm braced against leg',
  get_category_id('Arms'),
  '["Sit with elbow braced against inner thigh", "Curl dumbbell focusing on bicep", "Squeeze hard at top", "Lower slowly"]'::jsonb,
  2,
  ARRAY['Dumbbells', 'Bench'],
  false,
  'Eliminates momentum. Great for mind-muscle connection.',
  ARRAY['concentration', 'biceps', 'mind-muscle', 'isolation']
),
(
  'Preacher Curls',
  'Bicep curls using preacher bench',
  get_category_id('Arms'),
  '["Position arms on preacher bench", "Curl weight focusing on biceps", "Don''t lock out completely at bottom", "Control the negative"]'::jsonb,
  2,
  ARRAY['Barbell', 'Preacher Bench'],
  false,
  'Provides strict form. Be careful not to hyperextend elbows.',
  ARRAY['preacher', 'biceps', 'strict-form', 'isolation']
),
(
  'Cable Curls',
  'Bicep curls using cable machine',
  get_category_id('Arms'),
  '["Set cable to low position", "Curl handle up focusing on biceps", "Keep elbows stationary", "Feel constant tension"]'::jsonb,
  2,
  ARRAY['Cable Machine'],
  false,
  'Constant tension throughout range of motion.',
  ARRAY['cable', 'biceps', 'constant-tension', 'isolation']
),
(
  'Cable Hammer Curls',
  'Hammer curls using cable with rope attachment',
  get_category_id('Arms'),
  '["Use rope attachment on low cable", "Curl with neutral grip", "Focus on brachialis activation", "Control the return"]'::jsonb,
  2,
  ARRAY['Cable Machine'],
  false,
  'Cable provides smooth resistance curve.',
  ARRAY['cable', 'hammer', 'brachialis', 'neutral-grip']
),
(
  '21s (Bicep 21s)',
  'Bicep curl variation with partial reps',
  get_category_id('Arms'),
  '["7 reps bottom half of curl", "7 reps top half of curl", "7 reps full range of motion", "No rest between phases"]'::jsonb,
  3,
  ARRAY['Barbell'],
  false,
  'Intense bicep finisher. Use lighter weight than normal curls.',
  ARRAY['intensity-technique', 'biceps', 'partial-reps', 'finisher']
),
(
  'Incline Dumbbell Curls',
  'Bicep curls on inclined bench for stretch',
  get_category_id('Arms'),
  '["Lie on incline bench with dumbbells", "Let arms hang for stretch", "Curl weights up", "Feel bicep stretch at bottom"]'::jsonb,
  2,
  ARRAY['Dumbbells', 'Bench'],
  false,
  'Provides excellent bicep stretch. Don''t swing the weights.',
  ARRAY['incline', 'biceps', 'stretch', 'range-of-motion']
),
(
  'Spider Curls',
  'Bicep curls over incline bench',
  get_category_id('Arms'),
  '["Lie chest down on incline bench", "Let arms hang over bench", "Curl weights up", "Focus on bicep contraction"]'::jsonb,
  2,
  ARRAY['Dumbbells', 'Bench'],
  false,
  'Eliminates momentum completely.',
  ARRAY['spider', 'biceps', 'strict-form', 'chest-supported']
),
-- TRICEP EXERCISES
(
  'Close-Grip Bench Press',
  'Tricep-focused bench press variation',
  get_category_id('Arms'),
  '["Lie on bench with narrow grip", "Lower bar to chest", "Press up focusing on triceps", "Keep elbows closer to body"]'::jsonb,
  3,
  ARRAY['Barbell', 'Bench'],
  true,
  'Grip should be shoulder-width or slightly narrower. Avoid too narrow grip.',
  ARRAY['compound', 'triceps', 'pressing', 'mass']
),
(
  'Tricep Dips',
  'Bodyweight tricep exercise',
  get_category_id('Arms'),
  '["Support body on parallel bars or bench", "Lower body by bending elbows", "Push back up to starting position", "Keep body upright"]'::jsonb,
  2,
  ARRAY['Pull-up Bar'],
  true,
  'Can be performed on bench for easier variation. Control the descent.',
  ARRAY['bodyweight', 'triceps', 'compound', 'functional']
),
(
  'Bench Dips',
  'Tricep dips using bench',
  get_category_id('Arms'),
  '["Place hands on bench behind you", "Lower body by bending elbows", "Push back up", "Keep feet on ground or elevated"]'::jsonb,
  2,
  ARRAY['Bench'],
  true,
  'Easier than parallel bar dips. Can add weight on lap.',
  ARRAY['bodyweight', 'triceps', 'bench', 'beginner-friendly']
),
(
  'Overhead Tricep Extension',
  'Tricep isolation exercise with overhead position',
  get_category_id('Arms'),
  '["Hold weight overhead with both hands", "Lower weight behind head", "Extend arms back to starting position", "Keep elbows stationary"]'::jsonb,
  2,
  ARRAY['Dumbbells'],
  false,
  'Start with lighter weight. Keep elbows pointing forward throughout.',
  ARRAY['isolation', 'triceps', 'overhead', 'stretch']
),
(
  'Skull Crushers',
  'Lying tricep extension exercise',
  get_category_id('Arms'),
  '["Lie on bench with barbell or EZ-bar", "Lower weight toward forehead", "Extend arms back up", "Keep elbows stationary"]'::jsonb,
  2,
  ARRAY['Barbell', 'Bench'],
  false,
  'Also called lying tricep extensions. Control the weight carefully.',
  ARRAY['lying', 'triceps', 'isolation', 'skull-crushers']
),
(
  'Dumbbell Tricep Extensions',
  'Overhead tricep extension with single dumbbell',
  get_category_id('Arms'),
  '["Hold one dumbbell with both hands overhead", "Lower behind head by bending elbows", "Extend back to starting position", "Feel tricep stretch"]'::jsonb,
  2,
  ARRAY['Dumbbells'],
  false,
  'Can be performed seated or standing.',
  ARRAY['overhead', 'triceps', 'stretch', 'isolation']
),
(
  'Cable Tricep Pushdowns',
  'Tricep isolation using cable machine',
  get_category_id('Arms'),
  '["Set cable to high position", "Push handle down extending triceps", "Keep elbows at sides", "Control the return"]'::jsonb,
  2,
  ARRAY['Cable Machine'],
  false,
  'Most popular tricep isolation exercise. Focus on tricep contraction.',
  ARRAY['cable', 'triceps', 'pushdown', 'isolation']
),
(
  'Rope Tricep Pushdowns',
  'Cable pushdowns using rope attachment',
  get_category_id('Arms'),
  '["Use rope attachment on high cable", "Push down and spread rope at bottom", "Focus on tricep contraction", "Control the negative"]'::jsonb,
  2,
  ARRAY['Cable Machine'],
  false,
  'Spreading rope at bottom increases tricep activation.',
  ARRAY['cable', 'rope', 'triceps', 'spread']
),
(
  'Reverse-Grip Tricep Pushdowns',
  'Cable pushdowns with underhand grip',
  get_category_id('Arms'),
  '["Use underhand grip on cable", "Push down extending triceps", "Feel different tricep activation", "Control the return"]'::jsonb,
  2,
  ARRAY['Cable Machine'],
  false,
  'Underhand grip targets different part of tricep.',
  ARRAY['cable', 'reverse-grip', 'triceps', 'variation']
),
(
  'Diamond Push-ups',
  'Push-up variation emphasizing triceps',
  get_category_id('Arms'),
  '["Form diamond with hands under chest", "Lower body maintaining hand position", "Push up focusing on triceps", "Keep core tight"]'::jsonb,
  3,
  ARRAY['None'],
  true,
  'More challenging than regular push-ups. Scale to knees if needed.',
  ARRAY['bodyweight', 'triceps', 'advanced', 'diamond']
),
(
  'Tricep Kickbacks',
  'Tricep isolation in bent-over position',
  get_category_id('Arms'),
  '["Bend over with dumbbell in hand", "Keep upper arm parallel to floor", "Extend forearm back", "Squeeze tricep at top"]'::jsonb,
  1,
  ARRAY['Dumbbells'],
  false,
  'Light weight exercise. Focus on perfect form and tricep squeeze.',
  ARRAY['isolation', 'triceps', 'kickback', 'light-weight']
),
(
  'Single-Arm Tricep Extensions',
  'Overhead tricep extension one arm at a time',
  get_category_id('Arms'),
  '["Hold dumbbell overhead with one arm", "Lower behind head", "Extend back up", "Keep elbow pointing forward"]'::jsonb,
  2,
  ARRAY['Dumbbells'],
  false,
  'Allows focus on one arm at a time.',
  ARRAY['unilateral', 'triceps', 'overhead', 'isolation']
),
-- FOREARM EXERCISES
(
  'Wrist Curls',
  'Forearm flexor exercise',
  get_category_id('Arms'),
  '["Sit with forearms on thighs", "Hold barbell or dumbbells", "Curl wrists up", "Lower with control"]'::jsonb,
  1,
  ARRAY['Dumbbells'],
  false,
  'Light weight exercise. Focus on forearm contraction.',
  ARRAY['forearms', 'wrist-curls', 'flexors', 'grip']
),
(
  'Reverse Wrist Curls',
  'Forearm extensor exercise',
  get_category_id('Arms'),
  '["Sit with forearms on thighs, palms down", "Lift wrists up against resistance", "Lower with control", "Feel forearm extensors working"]'::jsonb,
  1,
  ARRAY['Dumbbells'],
  false,
  'Balances forearm development. Use very light weight.',
  ARRAY['forearms', 'extensors', 'reverse', 'balance']
),
(
  'Farmer''s Walks',
  'Functional exercise for grip and core strength',
  get_category_id('Arms'),
  '["Hold heavy weights at sides", "Walk for distance or time", "Keep upright posture", "Focus on grip strength"]'::jsonb,
  2,
  ARRAY['Dumbbells'],
  true,
  'Great for grip strength and core stability.',
  ARRAY['functional', 'grip', 'core', 'carry']
),
(
  'Plate Pinches',
  'Grip strength exercise using weight plates',
  get_category_id('Arms'),
  '["Pinch smooth sides of plates together", "Hold for time", "Focus on finger and thumb strength", "Don''t let plates slip"]'::jsonb,
  2,
  ARRAY['Weight Plates'],
  false,
  'Builds incredible grip strength. Start with lighter plates.',
  ARRAY['grip', 'pinch', 'finger-strength', 'static']
),
(
  'Dead Hangs',
  'Grip endurance exercise hanging from bar',
  get_category_id('Arms'),
  '["Hang from pull-up bar", "Hold for maximum time", "Keep shoulders engaged", "Focus on grip endurance"]'::jsonb,
  2,
  ARRAY['Pull-up Bar'],
  false,
  'Builds grip endurance and shoulder stability.',
  ARRAY['grip-endurance', 'hang', 'bodyweight', 'time']
);

-- Add muscle group associations for arm exercises
INSERT INTO public.exercise_muscle_groups (exercise_id, muscle_group_id, involvement_type)
SELECT e.id, mg.id, 'primary'
FROM public.exercises e
CROSS JOIN public.muscle_groups mg
WHERE e.name IN ('Barbell Curls', 'EZ-Bar Curls', 'Dumbbell Curls', 'Alternating Dumbbell Curls', 'Hammer Curls', 
                 'Cross-Body Hammer Curls', 'Concentration Curls', 'Preacher Curls', 'Cable Curls', 'Cable Hammer Curls',
                 '21s (Bicep 21s)', 'Incline Dumbbell Curls', 'Spider Curls') 
  AND mg.name = 'Biceps'
ON CONFLICT (exercise_id, muscle_group_id) DO NOTHING;

INSERT INTO public.exercise_muscle_groups (exercise_id, muscle_group_id, involvement_type)
SELECT e.id, mg.id, 'primary'
FROM public.exercises e
CROSS JOIN public.muscle_groups mg
WHERE e.name IN ('Hammer Curls', 'Cross-Body Hammer Curls', 'Cable Hammer Curls') 
  AND mg.name = 'Brachialis'
ON CONFLICT (exercise_id, muscle_group_id) DO NOTHING;

INSERT INTO public.exercise_muscle_groups (exercise_id, muscle_group_id, involvement_type)
SELECT e.id, mg.id, 'primary'
FROM public.exercises e
CROSS JOIN public.muscle_groups mg
WHERE e.name IN ('Close-Grip Bench Press', 'Tricep Dips', 'Bench Dips', 'Overhead Tricep Extension', 'Skull Crushers',
                 'Dumbbell Tricep Extensions', 'Cable Tricep Pushdowns', 'Rope Tricep Pushdowns', 'Reverse-Grip Tricep Pushdowns',
                 'Diamond Push-ups', 'Tricep Kickbacks', 'Single-Arm Tricep Extensions') 
  AND mg.name = 'Triceps'
ON CONFLICT (exercise_id, muscle_group_id) DO NOTHING;

INSERT INTO public.exercise_muscle_groups (exercise_id, muscle_group_id, involvement_type)
SELECT e.id, mg.id, 'primary'
FROM public.exercises e
CROSS JOIN public.muscle_groups mg
WHERE e.name IN ('Wrist Curls', 'Reverse Wrist Curls', 'Farmer''s Walks', 'Plate Pinches', 'Dead Hangs') 
  AND mg.name = 'Forearms'
ON CONFLICT (exercise_id, muscle_group_id) DO NOTHING;

-- LEG EXERCISES (40+ exercises)
INSERT INTO public.exercises (name, description, category_id, instructions, difficulty_level, equipment_needed, is_compound, safety_notes, tags) VALUES 
-- QUADRICEPS EXERCISES
(
  'Squats',
  'The king of lower body exercises',
  get_category_id('Legs'),
  '["Stand with feet shoulder-width apart", "Lower by bending knees and hips", "Keep chest up and weight on heels", "Drive through heels to stand"]'::jsonb,
  3,
  ARRAY['Barbell', 'Squat Rack'],
  true,
  'Master bodyweight squats first. Keep knees tracking over toes.',
  ARRAY['compound', 'lower-body', 'strength', 'functional', 'mass']
),
(
  'Front Squats',
  'Squat variation with barbell in front rack position',
  get_category_id('Legs'),
  '["Hold barbell in front rack position", "Keep elbows up", "Squat down maintaining upright torso", "Drive up through heels"]'::jsonb,
  4,
  ARRAY['Barbell', 'Squat Rack'],
  true,
  'More quad-dominant than back squats. Requires good mobility.',
  ARRAY['compound', 'quads', 'front-rack', 'upright-torso']
),
(
  'Goblet Squats',
  'Squat holding weight at chest level',
  get_category_id('Legs'),
  '["Hold dumbbell or kettlebell at chest", "Squat down keeping chest up", "Drive through heels to stand", "Great for learning squat pattern"]'::jsonb,
  2,
  ARRAY['Dumbbells'],
  true,
  'Excellent for beginners learning squat mechanics.',
  ARRAY['compound', 'beginner-friendly', 'goblet', 'learning-tool']
),
(
  'Bulgarian Split Squats',
  'Single-leg squat with rear foot elevated',
  get_category_id('Legs'),
  '["Place rear foot on bench", "Lower into single-leg squat", "Drive through front heel to stand", "Complete all reps before switching legs"]'::jsonb,
  3,
  ARRAY['Dumbbells', 'Bench'],
  true,
  'Requires balance and unilateral strength. Start bodyweight.',
  ARRAY['unilateral', 'single-leg', 'balance', 'split-squat']
),
(
  'Leg Press',
  'Machine-based leg pressing exercise',
  get_category_id('Legs'),
  '["Sit in leg press machine", "Lower weight by bending knees", "Press through heels to extend legs", "Don''t lock knees completely"]'::jsonb,
  2,
  ARRAY['Leg Press Machine'],
  true,
  'Safer than squats for beginners. Can use heavy weight.',
  ARRAY['machine', 'quad-dominant', 'beginner-friendly', 'heavy']
),
(
  'Hack Squats',
  'Squat variation using hack squat machine',
  get_category_id('Legs'),
  '["Position back against hack squat pad", "Lower by bending knees", "Keep core tight", "Drive through heels to stand"]'::jsonb,
  3,
  ARRAY['Hack Squat Machine'],
  true,
  'Machine provides stability while allowing heavy loading.',
  ARRAY['machine', 'quad-focused', 'stability', 'heavy']
),
(
  'Walking Lunges',
  'Dynamic lunging exercise moving forward',
  get_category_id('Legs'),
  '["Step forward into lunge position", "Lower back knee toward ground", "Push off front foot to next lunge", "Continue walking forward"]'::jsonb,
  2,
  ARRAY['None'],
  true,
  'Great for functional movement. Can add weight as you progress.',
  ARRAY['unilateral', 'functional', 'dynamic', 'bodyweight']
),
(
  'Reverse Lunges',
  'Lunge stepping backward',
  get_category_id('Legs'),
  '["Step backward into lunge position", "Lower back knee toward ground", "Push back to starting position", "Alternate legs or complete all reps"]'::jsonb,
  2,
  ARRAY['None'],
  true,
  'Often easier on knees than forward lunges.',
  ARRAY['unilateral', 'knee-friendly', 'reverse', 'functional']
),
(
  'Lateral Lunges',
  'Side-to-side lunging movement',
  get_category_id('Legs'),
  '["Step out to one side", "Lower into side lunge", "Keep other leg straight", "Push back to center and repeat"]'::jsonb,
  2,
  ARRAY['None'],
  true,
  'Works muscles in frontal plane. Great for sports.',
  ARRAY['lateral', 'frontal-plane', 'sports', 'functional']
),
(
  'Step-ups',
  'Single-leg exercise using elevated platform',
  get_category_id('Legs'),
  '["Step up onto platform with one foot", "Drive through heel to stand on platform", "Step down with control", "Complete all reps before switching"]'::jsonb,
  2,
  ARRAY['Plyometric Box'],
  true,
  'Start with bodyweight. Focus on controlled movement.',
  ARRAY['unilateral', 'functional', 'step-up', 'single-leg']
),
(
  'Wall Sits',
  'Isometric quad exercise against wall',
  get_category_id('Legs'),
  '["Lean back against wall", "Slide down to 90-degree position", "Hold position for time", "Keep weight evenly distributed"]'::jsonb,
  2,
  ARRAY['None'],
  false,
  'Great for building quad endurance. Start with shorter holds.',
  ARRAY['isometric', 'quads', 'endurance', 'bodyweight']
),
(
  'Pistol Squats',
  'Single-leg squat to full depth',
  get_category_id('Legs'),
  '["Stand on one leg", "Lower into single-leg squat", "Keep other leg extended forward", "Drive through heel to stand"]'::jsonb,
  5,
  ARRAY['None'],
  true,
  'Extremely advanced. Requires significant strength and mobility.',
  ARRAY['bodyweight', 'advanced', 'single-leg', 'pistol']
),
-- HAMSTRING EXERCISES  
(
  'Romanian Deadlifts',
  'Hip hinge movement targeting hamstrings and glutes',
  get_category_id('Legs'),
  '["Hold barbell with overhand grip", "Hinge at hips while keeping legs straight", "Feel stretch in hamstrings", "Drive hips forward to return"]'::jsonb,
  3,
  ARRAY['Barbell'],
  true,
  'Focus on hip hinge pattern. Keep bar close to body throughout.',
  ARRAY['compound', 'hamstrings', 'glutes', 'hip-hinge', 'posterior-chain']
),
(
  'Single-Leg Romanian Deadlifts',
  'Unilateral RDL for balance and hamstring strength',
  get_category_id('Legs'),
  '["Stand on one leg with weight in opposite hand", "Hinge at hip extending free leg back", "Feel hamstring stretch", "Return to standing"]'::jsonb,
  4,
  ARRAY['Dumbbells'],
  true,
  'Requires significant balance and coordination.',
  ARRAY['unilateral', 'balance', 'hamstrings', 'coordination']
),
(
  'Good Mornings',
  'Hip hinge movement with barbell on shoulders',
  get_category_id('Legs'),
  '["Place barbell on shoulders like squat", "Hinge at hips with straight legs", "Feel stretch in hamstrings", "Return to upright position"]'::jsonb,
  3,
  ARRAY['Barbell'],
  true,
  'Start with light weight. Focus on hip hinge pattern.',
  ARRAY['hip-hinge', 'hamstrings', 'posterior-chain', 'technique']
),
(
  'Leg Curls',
  'Hamstring isolation exercise on machine',
  get_category_id('Legs'),
  '["Lie face down on leg curl machine", "Curl heels toward glutes", "Squeeze hamstrings at top", "Lower with control"]'::jsonb,
  1,
  ARRAY['Leg Curl Machine'],
  false,
  'Adjust machine to fit your body properly.',
  ARRAY['machine', 'hamstring-isolation', 'beginner-friendly']
),
(
  'Nordic Curls',
  'Eccentric bodyweight hamstring exercise',
  get_category_id('Legs'),
  '["Kneel with feet anchored", "Lower body forward slowly", "Use hamstrings to control descent", "Push back up with hands if needed"]'::jsonb,
  5,
  ARRAY['None'],
  false,
  'Extremely challenging. Start with partial range of motion.',
  ARRAY['eccentric', 'bodyweight', 'advanced', 'hamstrings']
),
(
  'Glute Ham Raises',
  'Hamstring and glute exercise on GHD machine',
  get_category_id('Legs'),
  '["Position hips on GHD pad", "Lower body maintaining straight line", "Use hamstrings and glutes to raise up", "Control the movement"]'::jsonb,
  4,
  ARRAY['GHD Machine'],
  true,
  'Advanced exercise requiring specific equipment.',
  ARRAY['advanced', 'hamstrings', 'glutes', 'ghd']
),
-- GLUTE EXERCISES
(
  'Hip Thrusts',
  'Glute isolation exercise for maximum activation',
  get_category_id('Legs'),
  '["Lie with upper back on bench", "Place weight across hips", "Drive hips up by squeezing glutes", "Hold contraction at top"]'::jsonb,
  2,
  ARRAY['Barbell', 'Bench'],
  false,
  'Focus on glute squeeze rather than just hip height. Use padding for comfort.',
  ARRAY['isolation', 'glutes', 'hip-thrust', 'activation']
),
(
  'Single-Leg Hip Thrusts',
  'Unilateral hip thrust for glute strength',
  get_category_id('Legs'),
  '["Lie with upper back on bench", "Extend one leg", "Drive up through single heel", "Squeeze glute at top"]'::jsonb,
  3,
  ARRAY['None'],
  false,
  'More challenging than bilateral hip thrusts.',
  ARRAY['unilateral', 'glutes', 'single-leg', 'activation']
),
(
  'Glute Bridges',
  'Floor-based glute activation exercise',
  get_category_id('Legs'),
  '["Lie on floor with knees bent", "Drive hips up squeezing glutes", "Hold contraction briefly", "Lower with control"]'::jsonb,
  1,
  ARRAY['None'],
  false,
  'Great for glute activation and beginners.',
  ARRAY['glutes', 'activation', 'beginner', 'floor']
),
(
  'Single-Leg Glute Bridges',
  'Unilateral glute bridge',
  get_category_id('Legs'),
  '["Lie on floor with one knee bent", "Extend other leg", "Drive up through planted heel", "Squeeze glute at top"]'::jsonb,
  2,
  ARRAY['None'],
  false,
  'Progression from regular glute bridges.',
  ARRAY['unilateral', 'glutes', 'progression', 'activation']
),
(
  'Clamshells',
  'Side-lying glute activation exercise',
  get_category_id('Legs'),
  '["Lie on side with knees bent", "Keep feet together", "Open top knee like clamshell", "Feel glute activation"]'::jsonb,
  1,
  ARRAY['None'],
  false,
  'Great for glute activation and rehabilitation.',
  ARRAY['activation', 'glutes', 'side-lying', 'rehabilitation']
),
(
  'Monster Walks',
  'Lateral walking with resistance band',
  get_category_id('Legs'),
  '["Place band around ankles or knees", "Maintain quarter squat position", "Step sideways maintaining tension", "Keep knees out"]'::jsonb,
  2,
  ARRAY['Resistance Bands'],
  false,
  'Great for glute activation and warm-up.',
  ARRAY['bands', 'lateral', 'activation', 'warm-up']
),
(
  'Fire Hydrants',
  'Quadruped glute exercise',
  get_category_id('Legs'),
  '["Start on hands and knees", "Lift one leg out to side", "Keep knee bent at 90 degrees", "Squeeze glute at top"]'::jsonb,
  1,
  ARRAY['None'],
  false,
  'Simple glute activation exercise.',
  ARRAY['quadruped', 'glutes', 'activation', 'simple']
),
-- CALF EXERCISES
(
  'Calf Raises',
  'Calf muscle isolation exercise',
  get_category_id('Legs'),
  '["Stand on platform with toes on edge", "Rise up on toes as high as possible", "Lower below platform level", "Feel stretch in calves"]'::jsonb,
  1,
  ARRAY['None'],
  false,
  'Use full range of motion. Can add weight for progression.',
  ARRAY['isolation', 'calves', 'range-of-motion']
),
(
  'Seated Calf Raises',
  'Calf exercise performed in seated position',
  get_category_id('Legs'),
  '["Sit with weight on thighs", "Rise up on toes", "Feel calf contraction", "Lower with control"]'::jsonb,
  1,
  ARRAY['Dumbbells'],
  false,
  'Targets soleus muscle more than standing version.',
  ARRAY['seated', 'calves', 'soleus', 'isolation']
),
(
  'Single-Leg Calf Raises',
  'Unilateral calf exercise',
  get_category_id('Legs'),
  '["Stand on one foot", "Rise up on toes", "Balance and control", "Complete all reps before switching"]'::jsonb,
  2,
  ARRAY['None'],
  false,
  'More challenging than bilateral calf raises.',
  ARRAY['unilateral', 'calves', 'balance', 'single-leg']
),
(
  'Donkey Calf Raises',
  'Calf exercise in bent-over position',
  get_category_id('Legs'),
  '["Bend over with hands supported", "Rise up on toes", "Feel calf stretch and contraction", "Can add weight on back"]'::jsonb,
  2,
  ARRAY['None'],
  false,
  'Different angle provides unique stimulus.',
  ARRAY['donkey', 'calves', 'angle-variation', 'stretch']
),
-- FULL LEG COMPOUND EXERCISES
(
  'Thrusters',
  'Squat to press combination movement',
  get_category_id('Legs'),
  '["Hold weight at shoulder level", "Perform front squat", "Drive up and press overhead", "Lower weight to shoulders"]'::jsonb,
  4,
  ARRAY['Dumbbells'],
  true,
  'Combine squat and press into one fluid movement. Start light.',
  ARRAY['compound', 'full-body', 'functional', 'conditioning', 'crossfit']
),
(
  'Jump Squats',
  'Explosive squat variation with jump',
  get_category_id('Legs'),
  '["Lower into squat position", "Explode up jumping off ground", "Land softly back in squat", "Repeat immediately"]'::jsonb,
  3,
  ARRAY['None'],
  true,
  'Focus on soft landing. Great for power development.',
  ARRAY['explosive', 'plyometric', 'power', 'bodyweight']
),
(
  'Box Squats',
  'Squat to seated position on box',
  get_category_id('Legs'),
  '["Squat down to sit on box", "Brief pause on box", "Stand back up", "Focus on sitting back"]'::jsonb,
  3,
  ARRAY['Plyometric Box'],
  true,
  'Teaches proper squat mechanics. Good for powerlifting.',
  ARRAY['box', 'powerlifting', 'technique', 'seated']
),
(
  'Overhead Squats',
  'Squat with weight held overhead',
  get_category_id('Legs'),
  '["Hold weight overhead with arms extended", "Squat down maintaining overhead position", "Requires excellent mobility", "Drive through heels to stand"]'::jsonb,
  5,
  ARRAY['Barbell'],
  true,
  'Extremely challenging. Requires excellent mobility and stability.',
  ARRAY['overhead', 'mobility', 'stability', 'advanced']
),
(
  'Sissy Squats',
  'Quad-focused squat variation',
  get_category_id('Legs'),
  '["Lean back while squatting down", "Keep knees forward", "Feel intense quad stretch", "Use assistance if needed"]'::jsonb,
  4,
  ARRAY['None'],
  true,
  'Very challenging quad exercise. Start with assistance.',
  ARRAY['quad-focused', 'advanced', 'bodyweight', 'sissy']
);

-- Add muscle group associations for leg exercises
INSERT INTO public.exercise_muscle_groups (exercise_id, muscle_group_id, involvement_type)
SELECT e.id, mg.id, 'primary'
FROM public.exercises e
CROSS JOIN public.muscle_groups mg
WHERE e.name IN ('Squats', 'Front Squats', 'Goblet Squats', 'Bulgarian Split Squats', 'Leg Press', 'Hack Squats',
                 'Walking Lunges', 'Reverse Lunges', 'Lateral Lunges', 'Step-ups', 'Wall Sits', 'Pistol Squats',
                 'Jump Squats', 'Box Squats', 'Overhead Squats', 'Sissy Squats') 
  AND mg.name = 'Quadriceps'
ON CONFLICT (exercise_id, muscle_group_id) DO NOTHING;

INSERT INTO public.exercise_muscle_groups (exercise_id, muscle_group_id, involvement_type)
SELECT e.id, mg.id, 'secondary'
FROM public.exercises e
CROSS JOIN public.muscle_groups mg
WHERE e.name IN ('Squats', 'Front Squats', 'Goblet Squats', 'Bulgarian Split Squats', 'Walking Lunges', 'Reverse Lunges') 
  AND mg.name = 'Glutes'
ON CONFLICT (exercise_id, muscle_group_id) DO NOTHING;

INSERT INTO public.exercise_muscle_groups (exercise_id, muscle_group_id, involvement_type)
SELECT e.id, mg.id, 'primary'
FROM public.exercises e
CROSS JOIN public.muscle_groups mg
WHERE e.name IN ('Romanian Deadlifts', 'Single-Leg Romanian Deadlifts', 'Good Mornings', 'Leg Curls', 'Nordic Curls', 'Glute Ham Raises') 
  AND mg.name = 'Hamstrings'
ON CONFLICT (exercise_id, muscle_group_id) DO NOTHING;

INSERT INTO public.exercise_muscle_groups (exercise_id, muscle_group_id, involvement_type)
SELECT e.id, mg.id, 'primary'
FROM public.exercises e
CROSS JOIN public.muscle_groups mg
WHERE e.name IN ('Hip Thrusts', 'Single-Leg Hip Thrusts', 'Glute Bridges', 'Single-Leg Glute Bridges', 
                 'Clamshells', 'Monster Walks', 'Fire Hydrants') 
  AND mg.name = 'Glutes'
ON CONFLICT (exercise_id, muscle_group_id) DO NOTHING;

INSERT INTO public.exercise_muscle_groups (exercise_id, muscle_group_id, involvement_type)
SELECT e.id, mg.id, 'primary'
FROM public.exercises e
CROSS JOIN public.muscle_groups mg
WHERE e.name IN ('Calf Raises', 'Seated Calf Raises', 'Single-Leg Calf Raises', 'Donkey Calf Raises') 
  AND mg.name = 'Calves'
ON CONFLICT (exercise_id, muscle_group_id) DO NOTHING;

-- CORE EXERCISES (20+ exercises)
INSERT INTO public.exercises (name, description, category_id, instructions, difficulty_level, equipment_needed, is_compound, safety_notes, tags) VALUES 
(
  'Planks',
  'Isometric core strengthening exercise',
  get_category_id('Core'),
  '["Hold push-up position", "Keep body in straight line", "Engage core muscles", "Breathe normally"]'::jsonb,
  1,
  ARRAY['None'],
  false,
  'Start with shorter holds and build up time. Keep hips level.',
  ARRAY['isometric', 'core', 'stability', 'bodyweight', 'beginner']
),
(
  'Side Planks',
  'Lateral core strengthening exercise',
  get_category_id('Core'),
  '["Lie on side supported by forearm", "Keep body in straight line", "Hold position engaging obliques", "Repeat on other side"]'::jsonb,
  2,
  ARRAY['None'],
  false,
  'Keep hips up and body aligned. Start with shorter holds.',
  ARRAY['isometric', 'obliques', 'lateral', 'stability']
),
(
  'Dead Bug',
  'Core stability exercise with limb movement',
  get_category_id('Core'),
  '["Lie on back with arms extended up", "Alternate extending opposite arm and leg", "Keep lower back pressed to floor", "Control the movement"]'::jsonb,
  2,
  ARRAY['None'],
  false,
  'Focus on keeping lower back flat. Move slowly and controlled.',
  ARRAY['stability', 'core', 'coordination', 'bodyweight', 'therapeutic']
),
(
  'Bird Dog',
  'Quadruped core stability exercise',
  get_category_id('Core'),
  '["Start on hands and knees", "Extend opposite arm and leg", "Hold position maintaining balance", "Return and switch sides"]'::jsonb,
  1,
  ARRAY['None'],
  false,
  'Focus on stability and control. Keep hips level.',
  ARRAY['core-stability', 'balance', 'rehabilitation', 'functional']
),
(
  'Russian Twists',
  'Rotational core exercise',
  get_category_id('Core'),
  '["Sit with knees bent, leaning back", "Rotate torso side to side", "Touch ground on each side", "Keep feet off ground for added difficulty"]'::jsonb,
  2,
  ARRAY['None'],
  false,
  'Control the rotation. Can add weight for progression.',
  ARRAY['rotation', 'obliques', 'core', 'bodyweight']
),
(
  'Bicycle Crunches',
  'Dynamic core exercise with rotation',
  get_category_id('Core'),
  '["Lie on back with hands behind head", "Bring opposite elbow to knee", "Alternate sides in cycling motion", "Keep lower back pressed down"]'::jsonb,
  2,
  ARRAY['None'],
  false,
  'Focus on controlled movement, not speed.',
  ARRAY['dynamic', 'obliques', 'rotation', 'bodyweight']
),
(
  'Mountain Climbers',
  'Dynamic core and cardio exercise',
  get_category_id('Core'),
  '["Start in push-up position", "Alternate bringing knees to chest", "Maintain plank position", "Keep hips level"]'::jsonb,
  2,
  ARRAY['None'],
  false,
  'Maintain plank position throughout. Start slow and build speed.',
  ARRAY['dynamic', 'core', 'cardio', 'functional', 'bodyweight']
),
(
  'Hollow Body Hold',
  'Isometric core exercise in hollow position',
  get_category_id('Core'),
  '["Lie on back pressing lower back down", "Lift shoulders and legs off ground", "Hold hollow position", "Keep arms extended"]'::jsonb,
  3,
  ARRAY['None'],
  false,
  'Advanced isometric hold. Build up time gradually.',
  ARRAY['isometric', 'core', 'hollow', 'advanced']
),
(
  'V-Ups',
  'Dynamic core exercise bringing chest to knees',
  get_category_id('Core'),
  '["Lie flat with arms overhead", "Simultaneously lift chest and legs", "Touch hands to feet", "Lower with control"]'::jsonb,
  3,
  ARRAY['None'],
  false,
  'Challenging exercise. Focus on control over speed.',
  ARRAY['dynamic', 'core', 'full-range', 'challenging']
),
(
  'Leg Raises',
  'Lower abdominal exercise',
  get_category_id('Core'),
  '["Lie on back with legs extended", "Lift legs to 90 degrees", "Lower with control", "Don''t let feet touch ground"]'::jsonb,
  2,
  ARRAY['None'],
  false,
  'Keep lower back pressed to floor. Bend knees if needed.',
  ARRAY['lower-abs', 'leg-raise', 'bodyweight', 'control']
),
(
  'Hanging Leg Raises',
  'Advanced leg raise hanging from bar',
  get_category_id('Core'),
  '["Hang from pull-up bar", "Lift legs to 90 degrees", "Control the descent", "Engage core throughout"]'::jsonb,
  4,
  ARRAY['Pull-up Bar'],
  false,
  'Very challenging. Start with knee raises.',
  ARRAY['hanging', 'advanced', 'lower-abs', 'grip']
),
(
  'Hanging Knee Raises',
  'Easier version of hanging leg raises',
  get_category_id('Core'),
  '["Hang from pull-up bar", "Bring knees to chest", "Lower with control", "Focus on core contraction"]'::jsonb,
  3,
  ARRAY['Pull-up Bar'],
  false,
  'Progression toward hanging leg raises.',
  ARRAY['hanging', 'knee-raise', 'progression', 'core']
),
(
  'Ab Wheel Rollouts',
  'Advanced core exercise with ab wheel',
  get_category_id('Core'),
  '["Start on knees with ab wheel", "Roll forward extending body", "Control the movement", "Roll back to starting position"]'::jsonb,
  4,
  ARRAY['Ab Wheel'],
  false,
  'Very challenging. Start with partial range of motion.',
  ARRAY['advanced', 'ab-wheel', 'eccentric', 'core-strength']
),
(
  'Pallof Press',
  'Anti-rotation core exercise with band or cable',
  get_category_id('Core'),
  '["Hold band or cable at chest", "Press straight out resisting rotation", "Hold and return to chest", "Feel core working to prevent rotation"]'::jsonb,
  2,
  ARRAY['Resistance Bands'],
  false,
  'Excellent for functional core stability.',
  ARRAY['anti-rotation', 'functional', 'stability', 'resistance']
),
(
  'Woodchoppers',
  'Rotational core exercise with weight',
  get_category_id('Core'),
  '["Hold weight with both hands", "Rotate from high to low across body", "Engage core throughout movement", "Control both directions"]'::jsonb,
  3,
  ARRAY['Dumbbells'],
  false,
  'Can be done with cable, medicine ball, or dumbbell.',
  ARRAY['rotation', 'functional', 'power', 'woodchopper']
),
(
  'Bear Crawl',
  'Quadruped core and stability exercise',
  get_category_id('Core'),
  '["Start on hands and feet", "Crawl forward keeping knees off ground", "Maintain stable core", "Move opposite hand and foot"]'::jsonb,
  3,
  ARRAY['None'],
  false,
  'Great for core stability and coordination.',
  ARRAY['crawling', 'stability', 'coordination', 'functional']
),
(
  'Turkish Get-ups',
  'Complex full-body movement with core emphasis',
  get_category_id('Core'),
  '["Lie with weight in one hand overhead", "Stand up keeping weight overhead", "Reverse the movement to return", "Complex multi-step exercise"]'::jsonb,
  5,
  ARRAY['Kettlebell'],
  true,
  'Very complex movement. Learn steps progressively.',
  ARRAY['complex', 'full-body', 'turkish-getup', 'advanced']
),
(
  'Sit-ups',
  'Traditional abdominal exercise',
  get_category_id('Core'),
  '["Lie on back with knees bent", "Sit up bringing chest to knees", "Lower with control", "Keep feet anchored"]'::jsonb,
  1,
  ARRAY['None'],
  false,
  'Traditional exercise but not ideal for spine health.',
  ARRAY['traditional', 'sit-up', 'beginner', 'classic']
),
(
  'Crunches',
  'Basic abdominal flexion exercise',
  get_category_id('Core'),
  '["Lie on back with knees bent", "Lift shoulders off ground", "Focus on abdominal contraction", "Lower with control"]'::jsonb,
  1,
  ARRAY['None'],
  false,
  'Basic exercise. Focus on quality over quantity.',
  ARRAY['basic', 'crunch', 'abdominals', 'beginner']
),
(
  'Reverse Crunches',
  'Lower abdominal focused exercise',
  get_category_id('Core'),
  '["Lie on back with knees bent", "Bring knees toward chest", "Lift hips slightly off ground", "Lower with control"]'::jsonb,
  2,
  ARRAY['None'],
  false,
  'Focus on lifting hips, not just bringing knees up.',
  ARRAY['reverse', 'lower-abs', 'hip-flexion', 'control']
);

-- OLYMPIC EXERCISES (15+ exercises)
INSERT INTO public.exercises (name, description, category_id, instructions, difficulty_level, equipment_needed, is_compound, safety_notes, tags) VALUES 
(
  'Clean and Jerk',
  'Full Olympic lift combining clean and jerk',
  get_category_id('Olympic'),
  '["Clean barbell to shoulders", "Front squat to stand", "Jerk weight overhead", "Two-part Olympic lift"]'::jsonb,
  5,
  ARRAY['Barbell'],
  true,
  'Most complex lift. Requires extensive coaching and practice.',
  ARRAY['olympic', 'complex', 'explosive', 'technical', 'expert']
),
(
  'Snatch',
  'Single-movement Olympic lift',
  get_category_id('Olympic'),
  '["Pull barbell from floor to overhead in one motion", "Catch in squat position", "Stand to complete lift", "Most technical lift"]'::jsonb,
  5,
  ARRAY['Barbell'],
  true,
  'Extremely technical. Requires excellent mobility and coaching.',
  ARRAY['olympic', 'technical', 'mobility', 'explosive', 'expert']
),
(
  'Power Clean',
  'Explosive Olympic lift variation',
  get_category_id('Olympic'),
  '["Pull barbell explosively from floor", "Catch at shoulder level", "Do not squat down", "Stand with weight at shoulders"]'::jsonb,
  4,
  ARRAY['Barbell'],
  true,
  'Requires extensive technique practice. Start with light weight or PVC pipe.',
  ARRAY['olympic', 'explosive', 'power', 'technique', 'advanced']
),
(
  'Power Snatch',
  'Snatch variation without full squat',
  get_category_id('Olympic'),
  '["Pull barbell explosively overhead", "Catch in partial squat", "Stand to complete", "Less mobility required than full snatch"]'::jsonb,
  4,
  ARRAY['Barbell'],
  true,
  'Easier than full snatch but still very technical.',
  ARRAY['olympic', 'power', 'explosive', 'technical', 'advanced']
),
(
  'Hang Clean',
  'Clean variation starting from hang position',
  get_category_id('Olympic'),
  '["Start with barbell at mid-thigh", "Explosively pull to shoulders", "Catch in front squat position", "Stand to complete"]'::jsonb,
  4,
  ARRAY['Barbell'],
  true,
  'Easier entry point to Olympic lifting. Focus on hip extension.',
  ARRAY['olympic', 'explosive', 'power', 'hang-position', 'technique']
),
(
  'Hang Snatch',
  'Snatch variation from hang position',
  get_category_id('Olympic'),
  '["Start with barbell at hip", "Explosively pull overhead", "Catch in squat position", "Stand to complete"]'::jsonb,
  4,
  ARRAY['Barbell'],
  true,
  'Removes deadlift portion of snatch.',
  ARRAY['olympic', 'hang', 'explosive', 'technical', 'advanced']
),
(
  'Clean Pulls',
  'First portion of clean movement',
  get_category_id('Olympic'),
  '["Pull barbell as if cleaning", "Extend fully on toes", "Don''t catch the weight", "Focus on explosive pull"]'::jsonb,
  3,
  ARRAY['Barbell'],
  true,
  'Teaching tool for Olympic lifts. Allows heavier weight.',
  ARRAY['pull', 'explosive', 'teaching', 'power-development']
),
(
  'Snatch Pulls',
  'First portion of snatch movement',
  get_category_id('Olympic'),
  '["Pull barbell as if snatching", "Wide grip like snatch", "Extend fully on toes", "Don''t catch overhead"]'::jsonb,
  3,
  ARRAY['Barbell'],
  true,
  'Develops pulling power for snatch.',
  ARRAY['pull', 'snatch-grip', 'explosive', 'power-development']
),
(
  'Front Squats',
  'Olympic lifting squat position',
  get_category_id('Olympic'),
  '["Hold barbell in front rack", "Squat maintaining upright torso", "Essential for Olympic lifting", "Drive through heels"]'::jsonb,
  3,
  ARRAY['Barbell', 'Squat Rack'],
  true,
  'Critical for Olympic lifting. Requires good mobility.',
  ARRAY['front-squat', 'olympic-prep', 'mobility', 'upright-torso']
),
(
  'Overhead Squats',
  'Squat with weight held overhead',
  get_category_id('Olympic'),
  '["Hold barbell overhead with snatch grip", "Squat maintaining overhead position", "Requires excellent mobility", "Stand to complete"]'::jsonb,
  4,
  ARRAY['Barbell'],
  true,
  'Essential for snatch. Requires tremendous mobility.',
  ARRAY['overhead', 'mobility', 'snatch-prep', 'stability']
),
(
  'Split Jerk',
  'Jerk variation with split leg position',
  get_category_id('Olympic'),
  '["Drive barbell overhead from shoulders", "Catch in split position", "Stand bringing feet together", "Most common jerk variation"]'::jsonb,
  4,
  ARRAY['Barbell'],
  true,
  'Standard jerk technique in Olympic lifting.',
  ARRAY['jerk', 'split', 'overhead', 'olympic']
),
(
  'Push Jerk',
  'Jerk variation with small dip',
  get_category_id('Olympic'),
  '["Dip and drive from shoulders", "Catch in partial squat", "Stand to complete", "No foot movement"]'::jsonb,
  3,
  ARRAY['Barbell'],
  true,
  'Simpler than split jerk but requires more strength.',
  ARRAY['jerk', 'push', 'overhead', 'strength']
),
(
  'Muscle Clean',
  'Clean without catching in squat',
  get_category_id('Olympic'),
  '["Pull barbell to shoulders", "No squat catch", "Use arm pull to finish", "Teaching and strength exercise"]'::jsonb,
  3,
  ARRAY['Barbell'],
  true,
  'Develops upper body pulling strength for cleans.',
  ARRAY['muscle', 'clean', 'teaching', 'strength']
),
(
  'Muscle Snatch',
  'Snatch without catching in squat',
  get_category_id('Olympic'),
  '["Pull barbell overhead", "No squat catch", "Use arms to finish", "Mobility and strength exercise"]'::jsonb,
  3,
  ARRAY['Barbell'],
  true,
  'Develops overhead strength and mobility.',
  ARRAY['muscle', 'snatch', 'overhead', 'mobility']
);

-- CARDIO EXERCISES (15+ exercises)  
INSERT INTO public.exercises (name, description, category_id, instructions, difficulty_level, equipment_needed, is_compound, safety_notes, tags) VALUES 
(
  'Running',
  'Basic cardiovascular exercise',
  get_category_id('Cardio'),
  '["Maintain steady pace", "Land on midfoot", "Keep upright posture", "Control breathing"]'::jsonb,
  2,
  ARRAY['None'],
  false,
  'Start with shorter distances and build gradually.',
  ARRAY['running', 'steady-state', 'endurance', 'outdoor']
),
(
  'Sprint Intervals',
  'High-intensity running intervals',
  get_category_id('Cardio'),
  '["Sprint at maximum effort", "Rest between intervals", "Repeat for desired rounds", "Cool down properly"]'::jsonb,
  4,
  ARRAY['None'],
  false,
  'Proper warm-up essential. Start with shorter intervals.',
  ARRAY['cardio', 'intervals', 'high-intensity', 'running', 'conditioning']
),
(
  'Jumping Jacks',
  'Classic cardio exercise',
  get_category_id('Cardio'),
  '["Start with feet together, arms at sides", "Jump while spreading legs and raising arms", "Return to starting position", "Maintain steady rhythm"]'::jsonb,
  1,
  ARRAY['None'],
  false,
  'Low impact option: step side to side instead of jumping.',
  ARRAY['cardio', 'bodyweight', 'beginner', 'warm-up', 'conditioning']
),
(
  'High Knees',
  'Running in place with high knee drive',
  get_category_id('Cardio'),
  '["Run in place", "Drive knees up to waist level", "Pump arms naturally", "Maintain quick tempo"]'::jsonb,
  2,
  ARRAY['None'],
  false,
  'Land on balls of feet. Keep torso upright.',
  ARRAY['cardio', 'running', 'conditioning', 'bodyweight', 'dynamic']
),
(
  'Butt Kickers',
  'Running in place kicking heels to glutes',
  get_category_id('Cardio'),
  '["Run in place", "Kick heels toward glutes", "Keep thighs perpendicular", "Maintain quick tempo"]'::jsonb,
  2,
  ARRAY['None'],
  false,
  'Focus on quick heel recovery.',
  ARRAY['cardio', 'dynamic', 'running-drill', 'hamstrings']
),
(
  'Burpees',
  'Full body high-intensity exercise',
  get_category_id('Cardio'),
  '["Start standing", "Drop to squat", "Jump back to plank", "Push-up", "Jump feet to hands", "Jump up"]'::jsonb,
  4,
  ARRAY['None'],
  true,
  'Can modify by removing push-up or jump. Pace yourself.',
  ARRAY['full-body', 'conditioning', 'bodyweight', 'cardio', 'functional']
),
(
  'Mountain Climbers',
  'Dynamic plank with cardio element',
  get_category_id('Cardio'),
  '["Start in plank position", "Alternate bringing knees to chest", "Maintain plank throughout", "Keep hips level"]'::jsonb,
  3,
  ARRAY['None'],
  false,
  'Start slow and build speed. Maintain good plank form.',
  ARRAY['cardio', 'core', 'dynamic', 'bodyweight']
),
(
  'Jump Rope',
  'Classic cardio using jump rope',
  get_category_id('Cardio'),
  '["Hold rope handles", "Jump over rope as it passes", "Land on balls of feet", "Maintain rhythm"]'::jsonb,
  2,
  ARRAY['Jump Rope'],
  false,
  'Great for coordination and cardio. Start with basic bounce.',
  ARRAY['jump-rope', 'coordination', 'rhythm', 'portable']
),
(
  'Box Jumps',
  'Explosive jumping exercise',
  get_category_id('Cardio'),
  '["Stand in front of box", "Jump up onto box", "Step or jump down", "Focus on soft landing"]'::jsonb,
  3,
  ARRAY['Plyometric Box'],
  true,
  'Start with lower box. Focus on landing mechanics.',
  ARRAY['plyometric', 'explosive', 'power', 'jumping']
),
(
  'Rowing',
  'Full-body cardio on rowing machine',
  get_category_id('Cardio'),
  '["Sit at rowing machine", "Drive with legs first", "Pull handle to chest", "Control the return"]'::jsonb,
  2,
  ARRAY['Rowing Machine'],
  true,
  'Focus on technique. Legs, then back, then arms.',
  ARRAY['rowing', 'full-body', 'machine', 'technique']
),
(
  'Cycling',
  'Stationary or outdoor cycling',
  get_category_id('Cardio'),
  '["Maintain steady cadence", "Adjust resistance as needed", "Keep proper posture", "Control breathing"]'::jsonb,
  2,
  ARRAY['Bike'],
  false,
  'Low impact option. Good for active recovery.',
  ARRAY['cycling', 'low-impact', 'endurance', 'legs']
),
(
  'Stair Climbing',
  'Cardio using stairs or step machine',
  get_category_id('Cardio'),
  '["Step up at steady pace", "Use full foot on each step", "Pump arms naturally", "Maintain upright posture"]'::jsonb,
  3,
  ARRAY['None'],
  false,
  'Great lower body cardio. Can be very intense.',
  ARRAY['stairs', 'lower-body', 'intense', 'functional']
),
(
  'Swimming',
  'Full-body low-impact cardio',
  get_category_id('Cardio'),
  '["Use proper stroke technique", "Control breathing pattern", "Maintain steady pace", "Focus on efficiency"]'::jsonb,
  3,
  ARRAY['None'],
  true,
  'Excellent low-impact option. Requires pool access.',
  ARRAY['swimming', 'low-impact', 'full-body', 'technique']
),
(
  'Battle Ropes',
  'High-intensity cardio with ropes',
  get_category_id('Cardio'),
  '["Hold rope ends", "Create waves with alternating arms", "Maintain athletic position", "Keep intensity high"]'::jsonb,
  4,
  ARRAY['Battle Ropes'],
  true,
  'Very intense. Start with shorter intervals.',
  ARRAY['battle-ropes', 'high-intensity', 'arms', 'conditioning']
),
(
  'Elliptical',
  'Low-impact cardio machine',
  get_category_id('Cardio'),
  '["Maintain smooth stride", "Use both arms and legs", "Adjust resistance as needed", "Keep upright posture"]'::jsonb,
  1,
  ARRAY['Elliptical Machine'],
  false,
  'Good low-impact option for those with joint issues.',
  ARRAY['elliptical', 'low-impact', 'machine', 'beginner-friendly']
);

-- FUNCTIONAL EXERCISES (20+ exercises)
INSERT INTO public.exercises (name, description, category_id, instructions, difficulty_level, equipment_needed, is_compound, safety_notes, tags) VALUES 
(
  'Kettlebell Swings',
  'Hip hinge exercise with kettlebell',
  get_category_id('Functional'),
  '["Stand with feet wider than shoulders", "Swing kettlebell between legs", "Drive hips forward to swing up", "Let momentum carry weight"]'::jsonb,
  3,
  ARRAY['Kettlebell'],
  true,
  'Focus on hip drive, not arm lifting. Keep back straight throughout.',
  ARRAY['hip-hinge', 'power', 'conditioning', 'functional', 'kettlebell']
),
(
  'Turkish Get-ups',
  'Complex functional movement',
  get_category_id('Functional'),
  '["Start lying with weight overhead", "Stand up keeping weight overhead", "Reverse to return to lying", "Complex movement pattern"]'::jsonb,
  5,
  ARRAY['Kettlebell'],
  true,
  'Very complex. Learn each step progressively.',
  ARRAY['complex', 'full-body', 'stability', 'coordination']
),
(
  'Farmer''s Walks',
  'Functional carrying exercise',
  get_category_id('Functional'),
  '["Hold heavy weights at sides", "Walk for distance or time", "Maintain upright posture", "Focus on grip and core"]'::jsonb,
  2,
  ARRAY['Dumbbells'],
  true,
  'Start with manageable weight. Focus on posture.',
  ARRAY['carry', 'grip', 'core', 'functional', 'walking']
),
(
  'Suitcase Carries',
  'Single-arm carrying exercise',
  get_category_id('Functional'),
  '["Hold weight in one hand", "Walk maintaining upright posture", "Resist leaning to weighted side", "Switch sides"]'::jsonb,
  3,
  ARRAY['Dumbbells'],
  true,
  'Great for anti-lateral flexion core strength.',
  ARRAY['unilateral', 'anti-lateral-flexion', 'core', 'carry']
),
(
  'Overhead Carries',
  'Carrying exercise with weight overhead',
  get_category_id('Functional'),
  '["Hold weight overhead", "Walk maintaining overhead position", "Keep core tight", "Focus on stability"]'::jsonb,
  4,
  ARRAY['Dumbbells'],
  true,
  'Requires significant shoulder stability.',
  ARRAY['overhead', 'stability', 'carry', 'shoulder']
),
(
  'Bear Crawl',
  'Quadruped locomotion exercise',
  get_category_id('Functional'),
  '["Start on hands and feet", "Crawl keeping knees off ground", "Maintain stable core", "Move opposite limbs"]'::jsonb,
  3,
  ARRAY['None'],
  true,
  'Great for coordination and core stability.',
  ARRAY['crawling', 'coordination', 'core', 'bodyweight']
),
(
  'Crab Walk',
  'Reverse quadruped movement',
  get_category_id('Functional'),
  '["Sit with hands behind you", "Lift hips off ground", "Walk backward on hands and feet", "Keep hips up"]'::jsonb,
  3,
  ARRAY['None'],
  true,
  'Works posterior chain and shoulders.',
  ARRAY['crawling', 'posterior', 'shoulders', 'coordination']
),
(
  'Sled Push',
  'Functional pushing exercise',
  get_category_id('Functional'),
  '["Grip sled handles", "Drive through legs pushing sled", "Maintain forward lean", "Keep core tight"]'::jsonb,
  4,
  ARRAY['Sled'],
  true,
  'Great for power and conditioning. Start with lighter weight.',
  ARRAY['pushing', 'power', 'legs', 'conditioning']
),
(
  'Sled Pull',
  'Functional pulling exercise',
  get_category_id('Functional'),
  '["Attach rope to sled", "Pull sled toward you", "Use legs and back", "Maintain good posture"]'::jsonb,
  4,
  ARRAY['Sled'],
  true,
  'Excellent posterior chain exercise.',
  ARRAY['pulling', 'posterior-chain', 'back', 'conditioning']
),
(
  'Medicine Ball Slams',
  'Explosive full-body exercise',
  get_category_id('Functional'),
  '["Hold medicine ball overhead", "Slam down with full force", "Pick up and repeat", "Use whole body"]'::jsonb,
  3,
  ARRAY['Medicine Ball'],
  true,
  'Great for power and stress relief.',
  ARRAY['explosive', 'power', 'full-body', 'slam']
),
(
  'Wall Balls',
  'Squat to overhead throw exercise',
  get_category_id('Functional'),
  '["Hold ball at chest", "Squat down", "Drive up and throw ball to target", "Catch and repeat"]'::jsonb,
  3,
  ARRAY['Medicine Ball'],
  true,
  'Combines squat and overhead throw.',
  ARRAY['squat-throw', 'power', 'conditioning', 'target']
),
(
  'Tire Flips',
  'Functional flipping exercise',
  get_category_id('Functional'),
  '["Squat down gripping tire", "Drive up flipping tire over", "Move to other side", "Repeat for distance"]'::jsonb,
  5,
  ARRAY['Tire'],
  true,
  'Extremely demanding. Requires large tire.',
  ARRAY['flipping', 'power', 'full-body', 'strongman']
),
(
  'Atlas Stone Lifts',
  'Strongman stone lifting exercise',
  get_category_id('Functional'),
  '["Squat down wrapping arms around stone", "Lift stone to chest or platform", "Focus on leg drive", "Lower with control"]'::jsonb,
  5,
  ARRAY['Atlas Stone'],
  true,
  'Advanced strongman exercise. Requires proper equipment.',
  ARRAY['strongman', 'stone', 'lifting', 'specialized']
),
(
  'Sandbag Carries',
  'Functional carrying with unstable load',
  get_category_id('Functional'),
  '["Pick up sandbag", "Carry in various positions", "Adapt to shifting weight", "Maintain posture"]'::jsonb,
  3,
  ARRAY['Sandbag'],
  true,
  'Unstable load challenges core and adaptation.',
  ARRAY['unstable', 'carry', 'adaptation', 'core']
),
(
  'Log Press',
  'Overhead press with log or thick bar',
  get_category_id('Functional'),
  '["Clean log to chest", "Press overhead", "Neutral grip on log", "Full body movement"]'::jsonb,
  4,
  ARRAY['Log'],
  true,
  'Strongman exercise. Different grip than barbell.',
  ARRAY['strongman', 'log', 'overhead', 'neutral-grip']
),
(
  'Yoke Walk',
  'Heavy carrying exercise with yoke',
  get_category_id('Functional'),
  '["Position under yoke", "Stand and walk forward", "Maintain upright posture", "Focus on stability"]'::jsonb,
  5,
  ARRAY['Yoke'],
  true,
  'Advanced strongman exercise. Requires specialized equipment.',
  ARRAY['strongman', 'yoke', 'carrying', 'stability']
);

-- FLEXIBILITY EXERCISES (15+ exercises)
INSERT INTO public.exercises (name, description, category_id, instructions, difficulty_level, equipment_needed, is_compound, safety_notes, tags) VALUES 
(
  'Downward Dog',
  'Yoga pose for full body stretch',
  get_category_id('Flexibility'),
  '["Start on hands and knees", "Lift hips up and back", "Straighten legs as much as possible", "Hold position and breathe"]'::jsonb,
  1,
  ARRAY['None'],
  false,
  'Bend knees if needed. Focus on lengthening spine.',
  ARRAY['yoga', 'flexibility', 'full-body', 'stretch', 'mobility']
),
(
  'Standing Forward Fold',
  'Hamstring and back stretch',
  get_category_id('Flexibility'),
  '["Stand with feet hip-width apart", "Fold forward from hips", "Let arms hang or grab legs", "Keep knees soft"]'::jsonb,
  1,
  ARRAY['None'],
  false,
  'Bend knees as needed. Don''t force the stretch.',
  ARRAY['flexibility', 'hamstrings', 'back', 'stretch', 'mobility']
),
(
  'Cat-Cow Stretch',
  'Spinal mobility exercise',
  get_category_id('Flexibility'),
  '["Start on hands and knees", "Arch back (cow)", "Round spine (cat)", "Flow between positions"]'::jsonb,
  1,
  ARRAY['None'],
  false,
  'Move slowly and breathe with the movement.',
  ARRAY['mobility', 'spine', 'flexibility', 'yoga', 'warm-up']
),
(
  'Child''s Pose',
  'Restorative yoga pose',
  get_category_id('Flexibility'),
  '["Kneel and sit back on heels", "Fold forward extending arms", "Rest forehead on ground", "Breathe deeply"]'::jsonb,
  1,
  ARRAY['None'],
  false,
  'Restorative pose. Hold for longer periods.',
  ARRAY['yoga', 'restorative', 'hip-flexors', 'relaxation']
),
(
  'Pigeon Pose',
  'Deep hip opener stretch',
  get_category_id('Flexibility'),
  '["Bring one knee forward", "Extend other leg back", "Lower into stretch", "Feel deep hip stretch"]'::jsonb,
  3,
  ARRAY['None'],
  false,
  'Very intense hip stretch. Use props if needed.',
  ARRAY['hip-opener', 'deep-stretch', 'yoga', 'intense']
),
(
  'Cobra Stretch',
  'Back extension and chest opener',
  get_category_id('Flexibility'),
  '["Lie face down", "Push up opening chest", "Keep hips on ground", "Feel stretch in front body"]'::jsonb,
  2,
  ARRAY['None'],
  false,
  'Don''t force the back extension.',
  ARRAY['back-extension', 'chest-opener', 'cobra', 'yoga']
),
(
  'Hip Flexor Stretch',
  'Stretch for hip flexors in lunge position',
  get_category_id('Flexibility'),
  '["Step into lunge position", "Lower back knee to ground", "Push hips forward", "Feel stretch in front of hip"]'::jsonb,
  2,
  ARRAY['None'],
  false,
  'Great for people who sit a lot.',
  ARRAY['hip-flexors', 'lunge-stretch', 'sitting', 'mobility']
),
(
  'Seated Spinal Twist',
  'Rotational stretch for spine',
  get_category_id('Flexibility'),
  '["Sit with legs extended", "Cross one leg over", "Rotate toward bent knee", "Hold and breathe"]'::jsonb,
  2,
  ARRAY['None'],
  false,
  'Rotate gently. Don''t force the twist.',
  ARRAY['spinal-twist', 'rotation', 'seated', 'gentle']
),
(
  'Butterfly Stretch',
  'Hip and groin stretch',
  get_category_id('Flexibility'),
  '["Sit with soles of feet together", "Hold feet and gently pull toward body", "Lean forward for deeper stretch", "Keep back straight"]'::jsonb,
  1,
  ARRAY['None'],
  false,
  'Don''t push knees down. Let gravity work.',
  ARRAY['hip-opener', 'groin', 'butterfly', 'seated']
),
(
  'Figure-4 Stretch',
  'Hip and glute stretch',
  get_category_id('Flexibility'),
  '["Lie on back", "Cross ankle over opposite knee", "Pull thigh toward chest", "Feel glute stretch"]'::jsonb,
  2,
  ARRAY['None'],
  false,
  'Great for tight glutes and IT band.',
  ARRAY['glute-stretch', 'hip-opener', 'lying', 'it-band']
),
(
  'Shoulder Cross-Body Stretch',
  'Stretch for rear deltoid and shoulder',
  get_category_id('Flexibility'),
  '["Pull arm across body", "Use other arm to assist", "Feel stretch in back of shoulder", "Hold and breathe"]'::jsonb,
  1,
  ARRAY['None'],
  false,
  'Gentle stretch. Don''t pull too hard.',
  ARRAY['shoulder', 'rear-delt', 'cross-body', 'gentle']
),
(
  'Overhead Shoulder Stretch',
  'Stretch for triceps and shoulders',
  get_category_id('Flexibility'),
  '["Reach one arm overhead", "Bend elbow behind head", "Use other hand to assist", "Feel tricep stretch"]'::jsonb,
  1,
  ARRAY['None'],
  false,
  'Be gentle with shoulder position.',
  ARRAY['tricep-stretch', 'shoulder', 'overhead', 'gentle']
),
(
  'Calf Stretch',
  'Standing stretch for calf muscles',
  get_category_id('Flexibility'),
  '["Step back into runner''s stretch", "Keep back heel down", "Lean forward", "Feel calf stretch"]'::jsonb,
  1,
  ARRAY['None'],
  false,
  'Keep back leg straight for best stretch.',
  ARRAY['calf-stretch', 'runners-stretch', 'standing', 'legs']
),
(
  'Quad Stretch',
  'Standing stretch for quadriceps',
  get_category_id('Flexibility'),
  '["Hold foot behind you", "Pull heel toward glute", "Keep knees together", "Feel front thigh stretch"]'::jsonb,
  1,
  ARRAY['None'],
  false,
  'Use wall for balance if needed.',
  ARRAY['quad-stretch', 'standing', 'balance', 'thigh']
),
(
  'Chest Doorway Stretch',
  'Stretch for chest and front shoulders',
  get_category_id('Flexibility'),
  '["Place forearm on doorway", "Step forward through doorway", "Feel chest stretch", "Vary arm height"]'::jsonb,
  1,
  ARRAY['None'],
  false,
  'Great for people who sit hunched forward.',
  ARRAY['chest-stretch', 'doorway', 'posture', 'shoulders']
);

-- Add muscle group associations for remaining categories
INSERT INTO public.exercise_muscle_groups (exercise_id, muscle_group_id, involvement_type)
SELECT e.id, mg.id, 'primary'
FROM public.exercises e
CROSS JOIN public.muscle_groups mg
WHERE e.name IN ('Planks', 'Side Planks', 'Dead Bug', 'Bird Dog', 'Russian Twists', 'Bicycle Crunches', 
                 'Mountain Climbers', 'Hollow Body Hold', 'V-Ups', 'Leg Raises', 'Hanging Leg Raises',
                 'Hanging Knee Raises', 'Ab Wheel Rollouts', 'Pallof Press', 'Woodchoppers', 'Bear Crawl',
                 'Turkish Get-ups', 'Sit-ups', 'Crunches', 'Reverse Crunches') 
  AND mg.name = 'Core'
ON CONFLICT (exercise_id, muscle_group_id) DO NOTHING;

INSERT INTO public.exercise_muscle_groups (exercise_id, muscle_group_id, involvement_type)
SELECT e.id, mg.id, 'primary'
FROM public.exercises e
CROSS JOIN public.muscle_groups mg
WHERE e.name IN ('Side Planks', 'Russian Twists', 'Bicycle Crunches', 'Woodchoppers') 
  AND mg.name = 'Obliques'
ON CONFLICT (exercise_id, muscle_group_id) DO NOTHING;

-- Clean up helper functions
DROP FUNCTION IF EXISTS get_category_id(TEXT);
DROP FUNCTION IF EXISTS get_muscle_group_id(TEXT);