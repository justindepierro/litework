// Verify Justin's coach profile
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

// Load .env.local file manually
try {
  const envContent = readFileSync('.env.local', 'utf8');
  const envLines = envContent.split('\n');
  
  envLines.forEach(line => {
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length > 0) {
      process.env[key.trim()] = valueParts.join('=').trim();
    }
  });
} catch (err) {
  console.error('❌ Could not read .env.local file:', err.message);
  process.exit(1);
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function verifyProfile() {
  console.log('🔍 Verifying coach profile...');
  
  try {
    // Check if the user exists in our users table
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', 'jdepierro@burkecatholic.org')
      .single();

    if (error) {
      console.error('❌ Error fetching profile:', error.message);
      return;
    }

    if (data) {
      console.log('✅ Profile found!');
      console.log(`   ID: ${data.id}`);
      console.log(`   Name: ${data.name}`);
      console.log(`   Email: ${data.email}`);
      console.log(`   Role: ${data.role}`);
      console.log(`   Created: ${new Date(data.created_at).toLocaleDateString()}`);
    } else {
      console.log('❌ Profile not found');
    }
  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
}

verifyProfile();