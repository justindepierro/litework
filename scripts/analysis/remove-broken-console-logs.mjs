#!/usr/bin/env node
/**
 * Remove Broken Console Log Comments Completely
 * 
 * Simply delete any line with // [REMOVED] console.log that has ... })
 * These are broken and should just be removed.
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "../..");

let filesFixed = 0;
let linesRemoved = 0;

function fixFile(filePath) {
  const content = fs.readFileSync(filePath, "utf8");
  const lines = content.split('\n');
  const newLines = [];
  
  for (const line of lines) {
    // Skip any line with [REMOVED] console.log that has ... })
    if (line.includes('// [REMOVED] console.log') && line.includes('... })')) {
      linesRemoved++;
      continue; // Skip this line entirely
    }
    newLines.push(line);
  }
  
  if (newLines.length !== lines.length) {
    fs.writeFileSync(filePath, newLines.join('\n'));
    return true;
  }
  
  return false;
}

function processDirectory(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

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

console.log("🔧 Removing broken console.log comment lines...\n");

const srcDir = path.join(rootDir, "src");
processDirectory(srcDir);

console.log(`\n✅ Removed ${linesRemoved} broken comment lines from ${filesFixed} files`);
