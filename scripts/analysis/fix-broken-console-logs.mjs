#!/usr/bin/env node
/**
 * Fix Broken Console Log Comments
 * 
 * The console cleanup script broke multi-line console.log statements
 * by leaving dangling object literals and parameters.
 * This script finds and fixes them by collapsing to single lines.
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "../..");

let filesFixed = 0;
let patternsFixed = 0;

/**
 * Fix broken multi-line console.log comments in a file
 */
function fixFile(filePath) {
  let content = fs.readFileSync(filePath, "utf8");
  const originalContent = content;
  
  // Pattern 1: // [REMOVED] console.log(..., {\n  multiple lines\n});
  // Fix: Remove the dangling object literal lines
  const multiLinePattern = /\/\/ \[REMOVED\] console\.log\([^)]*\{[\s\S]*?\}\);/g;
  
  // Find all matches
  const matches = content.match(multiLinePattern);
  if (!matches) return false;
  
  for (const match of matches) {
    // Extract everything after the opening {
    const afterBrace = match.split('{')[1];
    if (!afterBrace) continue;
    
    // Check if there are actual newlines (indicating it's broken)
    if (!afterBrace.includes('\n')) continue;
    
    // Extract just the comment marker and function call start
    const beforeBrace = match.substring(0, match.indexOf('{'));
    
    // Replace with single-line version (just remove the object contents)
    const fixed = `${beforeBrace}... })`;
    content = content.replace(match, fixed);
    patternsFixed++;
  }
  
  // Pattern 2: Dangling lines after comment that are part of the object
  // These will have indentation and be property assignments or closing braces
  // Look for lines following a [REMOVED] comment that look like object properties
  const lines = content.split('\n');
  const newLines = [];
  let skipUntilCloseBrace = false;
  let braceDepth = 0;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    
    // Check if previous line was a [REMOVED] console.log with opening {
    if (i > 0 && lines[i-1].includes('// [REMOVED] console.log') && lines[i-1].includes('{') && !lines[i-1].includes('}')) {
      skipUntilCloseBrace = true;
      braceDepth = 1;
      continue;
    }
    
    if (skipUntilCloseBrace) {
      // Count braces to track nesting
      for (const char of trimmed) {
        if (char === '{') braceDepth++;
        if (char === '}') braceDepth--;
      }
      
      // Skip this line if we're still inside the object
      if (braceDepth > 0) {
        patternsFixed++;
        continue;
      } else {
        // Found the closing brace, stop skipping
        skipUntilCloseBrace = false;
        braceDepth = 0;
        patternsFixed++;
        continue;
      }
    }
    
    newLines.push(line);
  }
  
  if (newLines.length !== lines.length) {
    content = newLines.join('\n');
  }
  
  if (content !== originalContent) {
    fs.writeFileSync(filePath, content);
    return true;
  }
  
  return false;
}

/**
 * Recursively process all TypeScript files
 */
function processDirectory(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    // Skip node_modules, .next, etc.
    if (entry.name === "node_modules" || entry.name === ".next" || entry.name === ".git") {
      continue;
    }

    if (entry.isDirectory()) {
      processDirectory(fullPath);
    } else if (entry.isFile() && (entry.name.endsWith(".ts") || entry.name.endsWith(".tsx"))) {
      try {
        const fixed = fixFile(fullPath);
        if (fixed) {
          filesFixed++;
          console.log(`✅ Fixed: ${path.relative(rootDir, fullPath)}`);
        }
      } catch (error) {
        console.error(`❌ Error processing ${fullPath}:`, error.message);
      }
    }
  }
}

// Run the fixer
console.log("🔧 Fixing broken console.log comments...\n");

const srcDir = path.join(rootDir, "src");
processDirectory(srcDir);

console.log(`\n✅ Fixed ${patternsFixed} broken patterns in ${filesFixed} files`);
