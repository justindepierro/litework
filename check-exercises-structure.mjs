// Check exercises table structure
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkExercisesStructure() {
  console.log('🔍 Checking exercises table structure...');
  
  const { data, error } = await supabase
    .from('exercises')
    .select('*')
    .limit(1);
    
  if (error) {
    console.error('❌ Error:', error.message);
  } else {
    console.log('✅ Exercises table structure:');
    if (data && data.length > 0) {
      console.log('Columns:', Object.keys(data[0]));
      console.log('Sample data:', data[0]);
    }
  }
}

checkExercisesStructure();