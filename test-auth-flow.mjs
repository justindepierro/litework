#!/usr/bin/env node

// Quick authentication test script
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testAuthentication() {
  console.log('🔐 Testing Supabase Authentication...\n');
  
  // Test login
  console.log('1. Testing login with coach.smith@litework.com...');
  const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
    email: 'coach.smith@litework.com',
    password: 'password123'
  });
  
  if (loginError) {
    console.error('❌ Login failed:', loginError.message);
    return;
  }
  
  console.log('✅ Login successful!');
  console.log('   User ID:', loginData.user?.id);
  console.log('   Email:', loginData.user?.email);
  
  // Test session
  console.log('\n2. Testing session retrieval...');
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
  
  if (sessionError) {
    console.error('❌ Session retrieval failed:', sessionError.message);
    return;
  }
  
  console.log('✅ Session retrieved successfully!');
  console.log('   Session valid:', !!sessionData.session);
  console.log('   Access token length:', sessionData.session?.access_token?.length || 0);
  
  // Test user profile
  console.log('\n3. Testing user profile retrieval...');
  const { data: profileData, error: profileError } = await supabase
    .from('users')
    .select('*')
    .eq('id', loginData.user?.id)
    .single();
    
  if (profileError) {
    console.error('❌ Profile retrieval failed:', profileError.message);
    return;
  }
  
  console.log('✅ Profile retrieved successfully!');
  console.log('   Name:', profileData.name);
  console.log('   Role:', profileData.role);
  console.log('   Status:', profileData.status);
  
  // Test logout
  console.log('\n4. Testing logout...');
  const { error: logoutError } = await supabase.auth.signOut();
  
  if (logoutError) {
    console.error('❌ Logout failed:', logoutError.message);
    return;
  }
  
  console.log('✅ Logout successful!');
  
  console.log('\n🎉 All authentication tests passed!');
}

testAuthentication().catch(console.error);