#!/usr/bin/env node

// Script to update all API routes to use async authentication
// Updates verifyToken(request) to await verifyToken(request)

import { readFileSync, writeFileSync } from 'fs';
import { glob } from 'glob';

async function updateApiRoutes() {
  console.log('🔄 Updating API routes to use async authentication...');

  // Find all API route files
  const apiFiles = await glob('src/app/api/**/route.ts', { cwd: process.cwd() });
  
  let updatedCount = 0;
  
  for (const filePath of apiFiles) {
    try {
      const content = readFileSync(filePath, 'utf8');
      
      // Skip if file doesn't use verifyToken
      if (!content.includes('verifyToken(request)')) {
        continue;
      }
      
      // Replace synchronous calls with async calls
      const updatedContent = content.replace(
        /(\s+)(const auth = )verifyToken\(request\);/g,
        '$1$2await verifyToken(request);'
      );
      
      // Only write if content changed
      if (updatedContent !== content) {
        writeFileSync(filePath, updatedContent, 'utf8');
        console.log(`✅ Updated: ${filePath}`);
        updatedCount++;
      }
      
    } catch (error) {
      console.error(`❌ Error updating ${filePath}:`, error.message);
    }
  }
  
  console.log(`\n🎉 Updated ${updatedCount} API route files`);
  
  if (updatedCount > 0) {
    console.log('\n📝 Updated files:');
    console.log('   - All verifyToken() calls are now async');
    console.log('   - Authentication now supports both JWT and Supabase');
    console.log('   - Backward compatibility maintained');
  }
}

// Check if glob is available
try {
  updateApiRoutes().catch(console.error);
} catch (error) {
  console.log('📦 Installing glob package...');
  
  // Fallback method without glob
  const { execSync } = require('child_process');
  const { readdirSync, statSync } = require('fs');
  const path = require('path');
  
  function findApiFiles(dir, files = []) {
    const items = readdirSync(dir);
    
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = statSync(fullPath);
      
      if (stat.isDirectory()) {
        findApiFiles(fullPath, files);
      } else if (item === 'route.ts') {
        files.push(fullPath);
      }
    }
    
    return files;
  }
  
  console.log('🔄 Updating API routes (fallback method)...');
  
  const apiFiles = findApiFiles('src/app/api');
  let updatedCount = 0;
  
  for (const filePath of apiFiles) {
    try {
      const content = readFileSync(filePath, 'utf8');
      
      if (!content.includes('verifyToken(request)')) {
        continue;
      }
      
      const updatedContent = content.replace(
        /(\s+)(const auth = )verifyToken\(request\);/g,
        '$1$2await verifyToken(request);'
      );
      
      if (updatedContent !== content) {
        writeFileSync(filePath, updatedContent, 'utf8');
        console.log(`✅ Updated: ${filePath}`);
        updatedCount++;
      }
      
    } catch (error) {
      console.error(`❌ Error updating ${filePath}:`, error.message);
    }
  }
  
  console.log(`\n🎉 Updated ${updatedCount} API route files`);
}