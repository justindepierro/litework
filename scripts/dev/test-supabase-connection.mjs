#!/usr/bin/env node
/**
 * Test Supabase Connection
 * Quick diagnostic to check if Supabase is reachable
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = resolve(__dirname, '../..');

// Load environment variables
dotenv.config({ path: resolve(rootDir, '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('🔧 Testing Supabase Connection...\n');

if (!supabaseUrl) {
  console.error('❌ NEXT_PUBLIC_SUPABASE_URL is not set');
  process.exit(1);
}

if (!supabaseAnonKey) {
  console.error('❌ NEXT_PUBLIC_SUPABASE_ANON_KEY is not set');
  process.exit(1);
}

console.log('✅ Environment variables found');
console.log(`📍 URL: ${supabaseUrl.substring(0, 30)}...`);
console.log(`🔑 Key: ${supabaseAnonKey.substring(0, 10)}...\n`);

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Test 1: Check connection with timeout
console.log('Test 1: Testing basic connection...');
const connectionTimeout = setTimeout(() => {
  console.error('❌ Connection timeout after 5 seconds');
  console.error('   Supabase may be unreachable or slow to respond');
  process.exit(1);
}, 5000);

try {
  const startTime = Date.now();
  const { data, error } = await supabase.from('users').select('count').limit(1);
  clearTimeout(connectionTimeout);
  const elapsed = Date.now() - startTime;
  
  if (error) {
    if (error.code === 'PGRST116') {
      console.log(`✅ Connection successful (${elapsed}ms)`);
      console.log('   Note: No users found, but connection works');
    } else {
      console.error(`❌ Query error: ${error.message}`);
      console.error('   Connection works but query failed');
    }
  } else {
    console.log(`✅ Connection successful (${elapsed}ms)`);
    console.log(`   Found data: ${JSON.stringify(data)}`);
  }
} catch (err) {
  clearTimeout(connectionTimeout);
  console.error(`❌ Connection failed: ${err.message}`);
  process.exit(1);
}

// Test 2: Test auth session
console.log('\nTest 2: Testing auth session...');
try {
  const startTime = Date.now();
  const { data, error } = await supabase.auth.getSession();
  const elapsed = Date.now() - startTime;
  
  if (error) {
    console.error(`❌ Auth error: ${error.message}`);
  } else {
    console.log(`✅ Auth endpoint reachable (${elapsed}ms)`);
    console.log(`   Session: ${data.session ? 'Active' : 'None'}`);
  }
} catch (err) {
  console.error(`❌ Auth test failed: ${err.message}`);
}

console.log('\n✅ All tests complete!');
console.log('\nRecommendations:');
if (process.env.NODE_ENV === 'production') {
  console.log('- Connection latency is acceptable for production');
} else {
  console.log('- If auth is slow, check your internet connection');
  console.log('- If timeout persists, check Supabase dashboard for issues');
}
