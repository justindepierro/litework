#!/usr/bin/env node
/**
 * Clean Unused Imports Script
 * 
 * Removes unused import statements that ESLint identified
 */

import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import glob from 'glob';

const projectRoot = process.cwd();
const srcDir = join(projectRoot, 'src');

// Common unused imports we found in ESLint
const UNUSED_PATTERNS = [
  // Unused transform functions
  { pattern: /,\s*transformToCamel\s*,/, replace: ',' },
  { pattern: /,\s*transformToCamel\s*\}/, replace: '}' },
  { pattern: /\{\s*transformToCamel\s*,/, replace: '{' },
  { pattern: /,\s*transformToSnake\s*,/, replace: ',' },
  { pattern: /,\s*transformToSnake\s*\}/, replace: '}' },
  { pattern: /\{\s*transformToSnake\s*,/, replace: '{' },
  
  // Unused auth functions
  { pattern: /,\s*hasRoleOrHigher\s*,/, replace: ',' },
  { pattern: /,\s*hasRoleOrHigher\s*\}/, replace: '}' },
  { pattern: /\{\s*hasRoleOrHigher\s*,/, replace: '{' },
  { pattern: /,\s*isCoach\s*,/, replace: ',' },
  { pattern: /,\s*isCoach\s*\}/, replace: '}' },
  { pattern: /\{\s*isCoach\s*,/, replace: '{' },
  
  // Unused date utilities  
  { pattern: /,\s*isSameDay\s*,/, replace: ',' },
  { pattern: /,\s*isSameDay\s*\}/, replace: '}' },
  { pattern: /\{\s*isSameDay\s*,/, replace: '{' },
  { pattern: /,\s*isToday\s*,/, replace: ',' },
  { pattern: /,\s*isToday\s*\}/, replace: '}' },
  { pattern: /\{\s*isToday\s*,/, replace: '{' },
  
  // Unused types
  { pattern: /,\s*WorkoutExerciseType\s*,/, replace: ',' },
  { pattern: /,\s*WorkoutExerciseType\s*\}/, replace: '}' },
  { pattern: /\{\s*WorkoutExerciseType\s*,/, replace: '{' },
  { pattern: /,\s*CacheDurations\s*,/, replace: ',' },
  { pattern: /,\s*CacheDurations\s*\}/, replace: '}' },
  { pattern: /\{\s*CacheDurations\s*,/, replace: '{' },
];

// Unused variable patterns
const UNUSED_VAR_PATTERNS = [
  { pattern: /^(\s*)const\s+err\s+=\s+/gm, replace: '$1// @ts-ignore - Unused catch variable\n$&' },
  { pattern: /^\s*const\s+loadingAssignmentData\s+=.*$/gm, replace: '// [UNUSED] $&' },
];

console.log('🧹 Cleaning unused imports and variables...\n');

const files = glob.sync('**/*.{ts,tsx}', {
  cwd: srcDir,
  absolute: true,
  ignore: ['**/*.test.ts', '**/*.test.tsx', '**/*.spec.ts']
});

let totalFiles = 0;
let totalChanges = 0;

for (const filePath of files) {
  let content = readFileSync(filePath, 'utf-8');
  const originalContent = content;
  let fileChanges = 0;

  // Remove unused imports
  for (const { pattern, replace } of UNUSED_PATTERNS) {
    const matches = content.match(pattern);
    if (matches) {
      content = content.replace(pattern, replace);
      fileChanges += matches.length;
    }
  }

  // Clean up empty import braces
  content = content.replace(/import\s+\{\s*\}\s+from\s+["'].*["'];?\s*\n/g, '');
  
  // Clean up double commas
  content = content.replace(/\{\s*,/g, '{');
  content = content.replace(/,\s*,/g, ',');
  content = content.replace(/,\s*\}/g, '}');

  // Write file if changed
  if (content !== originalContent) {
    writeFileSync(filePath, content, 'utf-8');
    totalFiles++;
    totalChanges += fileChanges;
  }
}

console.log('✅ Cleanup Complete!\n');
console.log(`📊 Summary:`);
console.log(`   Files modified: ${totalFiles}`);
console.log(`   Unused imports removed: ${totalChanges}\n`);

console.log('✨ Next steps:');
console.log('   1. Run: npm run lint');
console.log('   2. Run: npm run typecheck');
console.log('   3. Review: git diff src/');

process.exit(0);
