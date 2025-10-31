#!/usr/bin/env node

// Test API endpoints with authentication
const API_BASE = 'http://localhost:3000/api';

async function testAPIWithAuth() {
  console.log('🌐 Testing API Endpoints with Authentication...\n');
  
  // Step 1: Login to get token
  console.log('1. Logging in to get auth token...');
  const loginResponse = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'coach.smith@litework.com',
      password: 'password123'
    })
  });
  
  if (!loginResponse.ok) {
    console.error('❌ Login failed:', loginResponse.status, loginResponse.statusText);
    return;
  }
  
  const loginData = await loginResponse.json();
  console.log('✅ Login successful!');
  console.log('   Has token:', !!loginData.token);
  console.log('   User role:', loginData.user?.role);
  
  const authToken = loginData.token;
  
  // Step 2: Test protected endpoints
  const endpoints = [
    { name: 'Groups', path: '/groups' },
    { name: 'Workouts', path: '/workouts' }, 
    { name: 'Users', path: '/users' },
    { name: 'Analytics', path: '/analytics?timeframe=week' }
  ];
  
  for (const endpoint of endpoints) {
    console.log(`\n2.${endpoints.indexOf(endpoint) + 1} Testing ${endpoint.name} API...`);
    
    const response = await fetch(`${API_BASE}${endpoint.path}`, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log(`✅ ${endpoint.name} API successful!`);
      console.log(`   Status: ${response.status}`);
      console.log(`   Data type: ${Array.isArray(data.data) ? 'array' : typeof data.data}`);
      if (Array.isArray(data.data)) {
        console.log(`   Items count: ${data.data.length}`);
      }
    } else {
      console.log(`⚠️  ${endpoint.name} API response: ${response.status} ${response.statusText}`);
      const errorText = await response.text();
      console.log(`   Error: ${errorText.slice(0, 100)}...`);
    }
  }
  
  // Step 3: Test without auth token (should fail)
  console.log('\n3. Testing without auth token (should fail)...');
  const noAuthResponse = await fetch(`${API_BASE}/groups`);
  console.log(`✅ No auth test: ${noAuthResponse.status} ${noAuthResponse.statusText}`);
  
  console.log('\n🎉 API authentication tests completed!');
}

testAPIWithAuth().catch(console.error);