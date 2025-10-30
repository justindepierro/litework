#!/usr/bin/env node

// Test script to verify Supabase connection
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
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables');
  console.log('Expected: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
  console.log('🔗 Testing Supabase connection...');
  console.log(`📍 URL: ${supabaseUrl}`);
  
  try {
    // Test if our tables exist by trying to query users table
    const { error: usersError } = await supabase
      .from('users')
      .select('id')
      .limit(1);
    
    if (usersError) {
      if (usersError.message.includes('not found') || usersError.message.includes('does not exist')) {
        console.log('✅ Connection successful, but schema not installed');
        console.log('\n💡 Run the database schema in your Supabase SQL editor:');
        console.log('   1. Go to: https://supabase.com/dashboard/project/lzsjaqkhdoqsafptqpnt/sql/new');
        console.log('   2. Copy the entire contents of database/schema.sql');
        console.log('   3. Paste and click "Run"');
      } else {
        console.error('❌ Connection failed:', usersError.message);
      }
      return false;
    } else {
      console.log('✅ Connection successful!');
      console.log('✅ LiteWork schema is installed and ready!');
      return true;
    }
  } catch (err) {
    console.error('❌ Unexpected error:', err.message);
    return false;
  }
}

testConnection();