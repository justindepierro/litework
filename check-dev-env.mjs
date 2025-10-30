#!/usr/bin/env node

/**
 * LiteWork Development Environment Checker
 * Identifies common issues that cause development server instability
 */

import { execSync } from 'child_process';
import { existsSync, statSync } from 'fs';
import { join } from 'path';

const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkNodeVersion() {
  log('\n🔍 Checking Node.js version...', 'blue');
  
  try {
    const version = process.version;
    const majorVersion = parseInt(version.slice(1).split('.')[0]);
    
    if (majorVersion >= 18) {
      log(`✅ Node.js ${version} (Compatible)`, 'green');
      return true;
    } else {
      log(`⚠️  Node.js ${version} (Recommended: Node 18+)`, 'yellow');
      return false;
    }
  } catch (error) {
    log(`❌ Failed to check Node.js version: ${error.message}`, 'red');
    return false;
  }
}

function checkMemoryUsage() {
  log('\n🔍 Checking memory usage...', 'blue');
  
  try {
    const used = process.memoryUsage();
    const totalMB = Math.round(used.heapTotal / 1024 / 1024);
    const usedMB = Math.round(used.heapUsed / 1024 / 1024);
    
    log(`📊 Memory: ${usedMB}MB used / ${totalMB}MB total`, 'blue');
    
    if (usedMB > 500) {
      log(`⚠️  High memory usage detected`, 'yellow');
      return false;
    } else {
      log(`✅ Memory usage normal`, 'green');
      return true;
    }
  } catch (error) {
    log(`❌ Failed to check memory: ${error.message}`, 'red');
    return false;
  }
}

function checkPortAvailability() {
  log('\n🔍 Checking port 3000 availability...', 'blue');
  
  try {
    const result = execSync('lsof -ti :3000', { encoding: 'utf8' }).trim();
    
    if (result) {
      log(`⚠️  Port 3000 is in use by PID: ${result}`, 'yellow');
      
      try {
        const processInfo = execSync(`ps aux | grep ${result} | grep -v grep`, { encoding: 'utf8' }).trim();
        log(`📋 Process: ${processInfo}`, 'blue');
        
        if (processInfo.includes('next')) {
          log(`🎯 Next.js server already running`, 'blue');
        }
      } catch (e) {
        // Process may have ended
      }
      
      return false;
    } else {
      log(`✅ Port 3000 is available`, 'green');
      return true;
    }
  } catch (error) {
    log(`✅ Port 3000 is available`, 'green');
    return true;
  }
}

function checkProjectStructure() {
  log('\n🔍 Checking project structure...', 'blue');
  
  const requiredFiles = [
    'package.json',
    'next.config.ts',
    'src/app/layout.tsx',
    'src/app/page.tsx',
    '.env.local'
  ];
  
  const requiredDirs = [
    'src',
    'src/app',
    'src/components',
    'src/types'
  ];
  
  let allGood = true;
  
  // Check files
  for (const file of requiredFiles) {
    if (existsSync(file)) {
      log(`✅ ${file}`, 'green');
    } else {
      log(`❌ Missing: ${file}`, 'red');
      allGood = false;
    }
  }
  
  // Check directories
  for (const dir of requiredDirs) {
    if (existsSync(dir) && statSync(dir).isDirectory()) {
      log(`✅ ${dir}/`, 'green');
    } else {
      log(`❌ Missing directory: ${dir}/`, 'red');
      allGood = false;
    }
  }
  
  return allGood;
}

function checkNodeModules() {
  log('\n🔍 Checking node_modules...', 'blue');
  
  if (!existsSync('node_modules')) {
    log(`❌ node_modules not found. Run: npm install`, 'red');
    return false;
  }
  
  const criticalPackages = [
    'next',
    'react',
    'react-dom',
    '@supabase/supabase-js',
    'lucide-react'
  ];
  
  let allGood = true;
  
  for (const pkg of criticalPackages) {
    const packagePath = join('node_modules', pkg);
    if (existsSync(packagePath)) {
      log(`✅ ${pkg}`, 'green');
    } else {
      log(`❌ Missing package: ${pkg}`, 'red');
      allGood = false;
    }
  }
  
  return allGood;
}

function checkNextCache() {
  log('\n🔍 Checking Next.js cache...', 'blue');
  
  const nextDir = '.next';
  const cacheDir = join('node_modules', '.cache');
  
  if (existsSync(nextDir)) {
    try {
      const stats = statSync(nextDir);
      const ageHours = (Date.now() - stats.mtime.getTime()) / (1000 * 60 * 60);
      
      if (ageHours > 24) {
        log(`⚠️  .next directory is ${Math.round(ageHours)} hours old`, 'yellow');
        log(`💡 Consider running: npm run clean`, 'blue');
        return false;
      } else {
        log(`✅ .next directory is fresh`, 'green');
      }
    } catch (error) {
      log(`⚠️  Could not check .next directory: ${error.message}`, 'yellow');
    }
  } else {
    log(`✅ No .next directory (will be created on first run)`, 'green');
  }
  
  if (existsSync(cacheDir)) {
    log(`📁 Node modules cache exists`, 'blue');
  }
  
  return true;
}

function generateRecommendations(issues) {
  if (issues.length === 0) {
    log('\n🎉 All checks passed! Your development environment looks good.', 'green');
    return;
  }
  
  log('\n🔧 Recommendations to fix issues:', 'yellow');
  
  const recommendations = {
    nodeVersion: '• Upgrade to Node.js 18+ for better performance and compatibility',
    memory: '• Close other applications to free up memory\n• Restart your development server',
    port: '• Kill existing process: npm run dev:restart\n• Or use a different port: next dev --port 3001',
    structure: '• Ensure all required files and directories exist\n• Check if you\'re in the correct project directory',
    modules: '• Run: npm install\n• If issues persist: rm -rf node_modules package-lock.json && npm install',
    cache: '• Clean Next.js cache: npm run clean\n• Clear node modules cache: rm -rf node_modules/.cache'
  };
  
  for (const issue of issues) {
    if (recommendations[issue]) {
      log(`\n${recommendations[issue]}`, 'blue');
    }
  }
  
  log('\n📚 Common commands:', 'bold');
  log('• npm run dev:stable  - Start with automatic cleanup', 'blue');
  log('• npm run dev:restart - Kill and restart server', 'blue');
  log('• npm run clean       - Clean cache and build files', 'blue');
  log('• ./dev-monitor.sh    - Start with automatic monitoring', 'blue');
}

async function main() {
  log('='.repeat(60), 'bold');
  log('🏋️‍♂️  LiteWork Development Environment Checker', 'bold');
  log('='.repeat(60), 'bold');
  
  const issues = [];
  
  if (!checkNodeVersion()) issues.push('nodeVersion');
  if (!checkMemoryUsage()) issues.push('memory');
  if (!checkPortAvailability()) issues.push('port');
  if (!checkProjectStructure()) issues.push('structure');
  if (!checkNodeModules()) issues.push('modules');
  if (!checkNextCache()) issues.push('cache');
  
  generateRecommendations(issues);
  
  log('\n' + '='.repeat(60), 'bold');
  
  if (issues.length === 0) {
    process.exit(0);
  } else {
    process.exit(1);
  }
}

main().catch(console.error);