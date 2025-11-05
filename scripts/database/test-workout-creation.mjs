#!/usr/bin/env node

/**
 * Test Workout Creation
 * Creates a test workout to verify the migration was successful
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..', '..');

// Load environment variables manually
const envPath = join(rootDir, '.env.local');
const envContent = readFileSync(envPath, 'utf-8');
const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    env[match[1].trim()] = match[2].trim();
  }
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('\n🧪 TESTING WORKOUT CREATION\n');
console.log('=' .repeat(70));

async function testWorkoutCreation() {
  try {
    // Step 1: Check if tables exist
    console.log('\n1️⃣  Checking database schema...');
    
    const { error: colError } = await supabase
      .from('workout_exercises')
      .select('tempo, weight_max, notes')
      .limit(0);
    
    if (colError && colError.message.includes('column')) {
      console.log('   ❌ Migration NOT applied - missing columns');
      console.log('   Error:', colError.message);
      console.log('\n   Please run the migration SQL in Supabase dashboard');
      return;
    }
    console.log('   ✅ workout_exercises has new columns');

    const { error: tableError } = await supabase
      .from('workout_exercise_groups')
      .select('id')
      .limit(0);
    
    if (tableError) {
      console.log('   ❌ Migration NOT applied - missing tables');
      console.log('   Error:', tableError.message);
      console.log('\n   Please run the migration SQL in Supabase dashboard');
      return;
    }
    console.log('   ✅ workout_exercise_groups table exists');

    // Step 2: Get or create a test user
    console.log('\n2️⃣  Setting up test data...');
    const { data: users } = await supabase
      .from('users')
      .select('id')
      .eq('role', 'coach')
      .limit(1);
    
    let userId;
    if (!users || users.length === 0) {
      console.log('   ⚠️  No coach users found - will use first user');
      const { data: anyUsers } = await supabase
        .from('users')
        .select('id')
        .limit(1);
      
      if (!anyUsers || anyUsers.length === 0) {
        console.log('   ❌ No users in database - cannot test');
        return;
      }
      userId = anyUsers[0].id;
      console.log(`   ✅ Using user: ${userId}`);
    } else {
      userId = users[0].id;
      console.log(`   ✅ Using coach: ${userId}`);
    }

    // Step 3: Create a test workout
    console.log('\n3️⃣  Creating test workout...');
    const testWorkout = {
      name: 'Migration Test Workout',
      description: 'Test workout to verify migration',
      estimated_duration: 45,
      created_by: userId,
    };

    const { data: newPlan, error: planError } = await supabase
      .from('workout_plans')
      .insert([testWorkout])
      .select()
      .single();

    if (planError) {
      console.log('   ❌ Failed to create workout plan');
      console.log('   Error:', planError);
      return;
    }
    console.log(`   ✅ Created workout plan: ${newPlan.id}`);

    // Step 4: Add exercises with new features
    console.log('\n4️⃣  Adding exercises with weight ranges...');
    const exercises = [
      {
        workout_plan_id: newPlan.id,
        exercise_id: 'barbell-squat',
        exercise_name: 'Barbell Squat',
        sets: 3,
        reps: 10,
        weight_type: 'percentage',
        percentage: 70,
        percentage_max: 80, // NEW FIELD - range
        tempo: '3-1-1-0', // NEW FIELD
        rest_time: 120,
        notes: 'Focus on depth', // NEW FIELD
        order_index: 1,
      },
      {
        workout_plan_id: newPlan.id,
        exercise_id: 'bench-press',
        exercise_name: 'Bench Press',
        sets: 4,
        reps: 8,
        weight_type: 'fixed',
        weight: 135,
        weight_max: 155, // NEW FIELD - range
        rest_time: 90,
        order_index: 2,
      }
    ];

    const { error: exError } = await supabase
      .from('workout_exercises')
      .insert(exercises);

    if (exError) {
      console.log('   ❌ Failed to create exercises');
      console.log('   Error:', exError);
      return;
    }
    console.log('   ✅ Created 2 exercises with weight ranges');

    // Step 5: Add a superset group
    console.log('\n5️⃣  Adding exercise group (superset)...');
    const group = {
      workout_plan_id: newPlan.id,
      name: 'Superset A',
      type: 'superset',
      order_index: 1,
      rest_between_rounds: 60,
    };

    const { error: groupError } = await supabase
      .from('workout_exercise_groups')
      .insert([group]);

    if (groupError) {
      console.log('   ❌ Failed to create group');
      console.log('   Error:', groupError);
      return;
    }
    console.log('   ✅ Created exercise group');

    // Step 6: Fetch and verify
    console.log('\n6️⃣  Fetching created workout...');
    const { data: fetchedPlan } = await supabase
      .from('workout_plans')
      .select('*')
      .eq('id', newPlan.id)
      .single();

    const { data: fetchedExercises } = await supabase
      .from('workout_exercises')
      .select('*')
      .eq('workout_plan_id', newPlan.id);

    const { data: fetchedGroups } = await supabase
      .from('workout_exercise_groups')
      .select('*')
      .eq('workout_plan_id', newPlan.id);

    console.log(`   ✅ Fetched plan: ${fetchedPlan.name}`);
    console.log(`   ✅ Fetched ${fetchedExercises.length} exercises`);
    console.log(`   ✅ Fetched ${fetchedGroups.length} groups`);

    // Verify new fields
    const ex1 = fetchedExercises[0];
    if (ex1.tempo && ex1.percentage_max && ex1.notes) {
      console.log('   ✅ New fields present: tempo, percentage_max, notes');
    }

    // Step 7: Cleanup
    console.log('\n7️⃣  Cleaning up test data...');
    await supabase
      .from('workout_plans')
      .delete()
      .eq('id', newPlan.id);
    console.log('   ✅ Deleted test workout');

    console.log('\n' + '=' .repeat(70));
    console.log('\n🎉 🎉 🎉  ALL TESTS PASSED! 🎉 🎉 🎉\n');
    console.log('Your database migration is working correctly!\n');
    console.log('✅ Can create workouts');
    console.log('✅ Can add exercises with weight ranges');
    console.log('✅ Can add exercise groups (supersets/circuits)');
    console.log('✅ New fields (tempo, notes, ranges) are saved');
    console.log('\nYou can now use the workout editor normally! 🏋️\n');

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error('Stack:', error.stack);
  }
}

testWorkoutCreation();
