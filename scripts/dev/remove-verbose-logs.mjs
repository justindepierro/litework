#!/usr/bin/env node
/**
 * Simple Console.log Removal Script
 * 
 * Strategy: Only remove console.log and console.debug (verbose dev logs)
 * Keep console.error and console.warn (production-appropriate)
 */

import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import glob from 'glob';

const projectRoot = process.cwd();
const srcDir = join(projectRoot, 'src');

// Files to skip
const SKIP_PATTERNS = [
  '**/diagnose/**',  // Diagnostic tool
  '**/logger.ts',
  '**/*.test.ts',
  '**/*.test.tsx'
];

console.log('🔍 Scanning for console.log and console.debug...\n');
const files = glob.sync('**/*.{ts,tsx}', {
  cwd: srcDir,
  absolute: true,
  ignore: SKIP_PATTERNS
});

let totalFiles = 0;
let totalRemovals = 0;
const changes = [];

for (const filePath of files) {
  let content = readFileSync(filePath, 'utf-8');
  const originalContent = content;
  let fileRemovals = 0;

  // Comment out console.log statements
  const logRegex = /^(\s*)(console\.log\(.*?\);?)/gm;
  const logMatches = [...content.matchAll(logRegex)];
  if (logMatches.length > 0) {
    content = content.replace(logRegex, '$1// [REMOVED] $2');
    fileRemovals += logMatches.length;
  }

  // Comment out console.debug statements
  const debugRegex = /^(\s*)(console\.debug\(.*?\);?)/gm;
  const debugMatches = [...content.matchAll(debugRegex)];
  if (debugMatches.length > 0) {
    content = content.replace(debugRegex, '$1// [REMOVED] $2');
    fileRemovals += debugMatches.length;
  }

  // Write file if changed
  if (content !== originalContent) {
    writeFileSync(filePath, content, 'utf-8');
    totalFiles++;
    totalRemovals += fileRemovals;
    
    const relativePath = filePath.replace(srcDir + '/', 'src/');
    changes.push({
      file: relativePath,
      count: fileRemovals
    });
  }
}

// Report results
console.log('✅ Console.log Removal Complete!\n');
console.log(`📊 Summary:`);
console.log(`   Files modified: ${totalFiles}`);
console.log(`   console.log/debug statements removed: ${totalRemovals}`);
console.log(`   console.error/warn preserved: ✅ (production-appropriate)\n`);

if (changes.length > 0 && changes.length <= 30) {
  console.log('📝 Modified files:');
  changes.forEach(({ file, count }) => {
    console.log(`   ${file} (${count} removed)`);
  });
} else if (changes.length > 30) {
  console.log('📝 Top 30 modified files:');
  changes.slice(0, 30).forEach(({ file, count }) => {
    console.log(`   ${file} (${count} removed)`);
  });
  console.log(`   ... and ${changes.length - 30} more files`);
}

console.log('\n✨ Next steps:');
console.log('   1. Review: git diff src/');
console.log('   2. Test: npm run typecheck');
console.log('   3. Test: npm run lint');
console.log('   4. Test: npm run build');

process.exit(0);
