#!/usr/bin/env node

/**
 * Automated Console.log Remover
 * Removes or comments out console.log statements in production code
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '../..');

const filesToProcess = [];
const srcPath = path.join(projectRoot, 'src');

// Files to skip
const skipFiles = [
  'logger.ts',
  'auth-logger.ts',
  'diagnose/page.tsx', // Diagnostic page needs console logs
];

function shouldSkipFile(filePath) {
  return skipFiles.some(skip => filePath.includes(skip));
}

function findFilesWithConsoleLogs(dir) {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      if (!file.startsWith('.') && file !== 'node_modules') {
        findFilesWithConsoleLogs(filePath);
      }
    } else if (
      (file.endsWith('.ts') || file.endsWith('.tsx') || 
       file.endsWith('.js') || file.endsWith('.jsx')) &&
      !shouldSkipFile(filePath)
    ) {
      const content = fs.readFileSync(filePath, 'utf8');
      const lines = content.split('\n');
      const consoleLogLines = [];
      
      lines.forEach((line, index) => {
        // Match console.log but not in comments
        if (line.includes('console.log') && !line.trim().startsWith('//') && !line.trim().startsWith('*')) {
          consoleLogLines.push(index + 1);
        }
      });
      
      if (consoleLogLines.length > 0) {
        filesToProcess.push({
          path: filePath,
          relativePath: filePath.replace(projectRoot + '/', ''),
          lines: consoleLogLines,
          content
        });
      }
    }
  }
}

function commentOutConsoleLogs(file) {
  const lines = file.content.split('\n');
  let modified = false;
  
  const newLines = lines.map((line, index) => {
    const lineNum = index + 1;
    if (file.lines.includes(lineNum)) {
      // Check if already commented
      if (!line.trim().startsWith('//')) {
        modified = true;
        // Comment out the line
        const indent = line.match(/^\s*/)[0];
        return `${indent}// [REMOVED FOR PRODUCTION] ${line.trim()}`;
      }
    }
    return line;
  });
  
  if (modified) {
    fs.writeFileSync(file.path, newLines.join('\n'), 'utf8');
    return true;
  }
  return false;
}

console.log('🔍 Scanning for console.log statements...\n');

findFilesWithConsoleLogs(srcPath);

console.log(`Found ${filesToProcess.length} files with console.log statements\n`);

if (filesToProcess.length === 0) {
  console.log('✅ No console.log statements to remove!');
  process.exit(0);
}

// Show summary
console.log('Files to process:');
filesToProcess.forEach((file, index) => {
  console.log(`  ${index + 1}. ${file.relativePath} (${file.lines.length} occurrences)`);
});

console.log('\n');

// Prompt for confirmation
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question('Do you want to comment out all console.log statements? (yes/no): ', (answer) => {
  rl.close();
  
  if (answer.toLowerCase() === 'yes' || answer.toLowerCase() === 'y') {
    console.log('\n🔧 Processing files...\n');
    
    let processedCount = 0;
    filesToProcess.forEach(file => {
      if (commentOutConsoleLogs(file)) {
        processedCount++;
        console.log(`✅ ${file.relativePath}`);
      }
    });
    
    console.log(`\n✅ Commented out console.logs in ${processedCount} files`);
    console.log('\n⚠️  Review changes with: git diff');
    console.log('   Commit if satisfied, or revert with: git checkout .');
  } else {
    console.log('\n❌ Operation cancelled');
  }
});
