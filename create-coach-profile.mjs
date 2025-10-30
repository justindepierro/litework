// Create Justin DePierro's coach profile in Supabase
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

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  console.log('Expected: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

// Use service role key for admin operations
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createCoachProfile() {
  console.log('🏃‍♂️ Creating coach profile for Justin DePierro...');
  console.log(`📧 Email: jdepierro@burkecatholic.org`);
  console.log(`👤 Name: Justin DePierro`);
  console.log(`🎯 Role: Coach (with admin access)`);
  
  try {
    // First, create the auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: 'jdepierro@burkecatholic.org',
      password: 'TempPassword123!', // You can change this after first login
      email_confirm: true,
      user_metadata: {
        name: 'Justin DePierro',
        role: 'admin'
      }
    });

    if (authError) {
      console.error('❌ Error creating auth user:', authError.message);
      return false;
    }

    console.log('✅ Auth user created successfully');
    
    // Now create the user profile in our users table
    const { error: profileError } = await supabase
      .from('users')
      .insert({
        id: authData.user.id,
        email: 'jdepierro@burkecatholic.org',
        name: 'Justin DePierro',
        role: 'admin', // Admin role gives you access to everything
        group_ids: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

    if (profileError) {
      console.error('❌ Error creating user profile:', profileError.message);
      return false;
    }

    console.log('✅ User profile created successfully');
    console.log('\n🎉 Coach profile setup complete!');
    console.log('\n📝 Login Details:');
    console.log('   Email: jdepierro@burkecatholic.org');
    console.log('   Password: TempPassword123!');
    console.log('   Role: Admin (full access)');
    console.log('\n💡 Next steps:');
    console.log('   1. Go to http://localhost:3000/login');
    console.log('   2. Login with the credentials above');
    console.log('   3. Change your password in settings');
    console.log('   4. Start managing athletes and workouts!');
    
    return true;
  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
    return false;
  }
}

createCoachProfile();