// Check if exercises schema is installed
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkExercisesSchema() {
  console.log('🔍 Checking exercises schema...');
  
  try {
    const { data, error } = await supabase
      .from('exercises')
      .select('id, name')
      .limit(1);
      
    if (error) {
      console.error('❌ Exercises table not found:', error.message);
      return false;
    } else {
      console.log('✅ Exercises table exists with structure:', data);
      return true;
    }
  } catch (error) {
    console.error('❌ Error checking exercises:', error.message);
    return false;
  }
}

checkExercisesSchema();