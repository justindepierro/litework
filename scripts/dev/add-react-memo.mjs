#!/usr/bin/env node
/**
 * Add React.memo to High-Impact Components
 * 
 * Identifies and wraps frequently-rendered components with React.memo
 * Focus on list items, cards, and repeated UI elements
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "../..");

// High-priority components that render in lists or frequently
const TARGET_COMPONENTS = [
  // UI Components
  "src/components/ui/Badge.tsx",
  "src/components/ui/Button.tsx",
  "src/components/ui/Input.tsx",
  
  // Workout components
  "src/components/workout-editor/ExerciseItem.tsx",
  "src/components/workout-editor/GroupContainer.tsx",
  
  // Modal components (heavy, should avoid re-renders)
  "src/components/ConfirmModal.tsx",
  "src/components/Toast.tsx",
  
  // List items and cards
  "src/components/PRBadge.tsx",
  "src/components/AchievementBadge.tsx",
];

let componentsProcessed = 0;
let componentsMemoized = 0;
let componentsSkipped = 0;

/**
 * Check if component is already memoized
 */
function isAlreadyMemoized(content) {
  return (
    content.includes("React.memo(") ||
    content.includes("= memo(") ||
    content.includes("export default memo(")
  );
}

/**
 * Check if component should be skipped (providers, contexts, etc.)
 */
function shouldSkip(content, filePath) {
  const fileName = path.basename(filePath);
  
  // Skip providers and contexts - they need to re-render
  if (fileName.includes("Provider") || fileName.includes("Context")) {
    return true;
  }
  
  // Skip if uses hooks that depend on frequent updates
  if (content.includes("useEffect") && content.includes("setInterval")) {
    return true;
  }
  
  // Skip error boundaries
  if (content.includes("componentDidCatch") || content.includes("ErrorBoundary")) {
    return true;
  }
  
  return false;
}

/**
 * Add React.memo to a component file
 */
function memoizeComponent(filePath) {
  let content = fs.readFileSync(filePath, "utf8");
  const originalContent = content;
  
  componentsProcessed++;
  
  // Check if already memoized
  if (isAlreadyMemoized(content)) {
    console.log(`⏭️  Skipped (already memoized): ${path.relative(rootDir, filePath)}`);
    componentsSkipped++;
    return false;
  }
  
  // Check if should skip
  if (shouldSkip(content, filePath)) {
    console.log(`⏭️  Skipped (provider/context): ${path.relative(rootDir, filePath)}`);
    componentsSkipped++;
    return false;
  }
  
  // Ensure React is imported
  if (!content.includes('from "react"') && !content.includes("from 'react'")) {
    console.log(`⚠️  Warning: No React import found in ${path.relative(rootDir, filePath)}`);
    componentsSkipped++;
    return false;
  }
  
  // Add memo to React import if not present
  if (content.includes('import React') && !content.includes('{ memo }') && !content.includes(', memo')) {
    // Pattern: import React from "react"
    if (content.match(/import React from ["']react["']/)) {
      content = content.replace(
        /import React from (["']react["'])/,
        'import React, { memo } from $1'
      );
    }
    // Pattern: import React, { useState } from "react"
    else if (content.match(/import React, \{([^}]+)\} from ["']react["']/)) {
      content = content.replace(
        /import React, \{([^}]+)\} from (["']react["'])/,
        'import React, { memo,$1 } from $2'
      );
    }
  }
  
  // Pattern 1: export default function ComponentName
  const defaultFunctionPattern = /^export default function ([A-Z][a-zA-Z0-9]*)/m;
  const defaultFunctionMatch = content.match(defaultFunctionPattern);
  
  if (defaultFunctionMatch) {
    const componentName = defaultFunctionMatch[1];
    
    // Find the function and its closing brace
    const functionStart = content.indexOf(defaultFunctionMatch[0]);
    let braceCount = 0;
    let inFunction = false;
    let functionEnd = -1;
    
    for (let i = functionStart; i < content.length; i++) {
      if (content[i] === '{') {
        braceCount++;
        inFunction = true;
      }
      if (content[i] === '}') {
        braceCount--;
        if (inFunction && braceCount === 0) {
          functionEnd = i + 1;
          break;
        }
      }
    }
    
    if (functionEnd > functionStart) {
      // Extract the function
      const functionCode = content.substring(functionStart, functionEnd);
      
      // Replace export default with memo wrapper
      const newCode = functionCode.replace(
        /^export default function ([A-Z][a-zA-Z0-9]*)/,
        'function $1'
      );
      
      content = content.substring(0, functionStart) + 
                newCode + 
                '\n\nexport default memo(' + componentName + ');' +
                content.substring(functionEnd);
      
      componentsMemoized++;
      fs.writeFileSync(filePath, content);
      console.log(`✅ Memoized: ${path.relative(rootDir, filePath)} (${componentName})`);
      return true;
    }
  }
  
  // Pattern 2: const ComponentName = () => { ... }; export default ComponentName;
  const constComponentPattern = /^(?:export )?const ([A-Z][a-zA-Z0-9]*)\s*[=:]/m;
  const constMatch = content.match(constComponentPattern);
  
  if (constMatch && content.includes(`export default ${constMatch[1]}`)) {
    const componentName = constMatch[1];
    
    // Wrap the export
    content = content.replace(
      new RegExp(`export default ${componentName};?`),
      `export default memo(${componentName});`
    );
    
    componentsMemoized++;
    fs.writeFileSync(filePath, content);
    console.log(`✅ Memoized: ${path.relative(rootDir, filePath)} (${componentName})`);
    return true;
  }
  
  if (content !== originalContent) {
    fs.writeFileSync(filePath, content);
    console.log(`✅ Modified imports: ${path.relative(rootDir, filePath)}`);
    return true;
  }
  
  console.log(`⏭️  Skipped (no pattern match): ${path.relative(rootDir, filePath)}`);
  componentsSkipped++;
  return false;
}

// Run memoization
console.log("🚀 Adding React.memo to high-impact components...\n");

for (const componentPath of TARGET_COMPONENTS) {
  const fullPath = path.join(rootDir, componentPath);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`⚠️  File not found: ${componentPath}`);
    continue;
  }
  
  try {
    memoizeComponent(fullPath);
  } catch (error) {
    console.error(`❌ Error processing ${componentPath}:`, error.message);
  }
}

console.log(`\n📊 Summary:`);
console.log(`   Processed: ${componentsProcessed}`);
console.log(`   Memoized:  ${componentsMemoized}`);
console.log(`   Skipped:   ${componentsSkipped}`);
console.log(`\n✅ React.memo optimization complete!`);
