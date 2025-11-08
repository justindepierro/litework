#!/usr/bin/env node
/**
 * Production Console.log Cleanup Script
 *
 * Strategy:
 * 1. Replace console.error → logger.error (keep error logging, just improve it)
 * 2. Replace console.warn → logger.warn (keep warnings)
 * 3. Comment out console.log and console.debug (remove verbose logging)
 * 4. Skip diagnose pages (diagnostic tool)
 * 5. Skip logger.ts itself
 */

import { readFileSync, writeFileSync } from "fs";
import { join } from "path";
import glob from "glob";

const projectRoot = process.cwd();
const srcDir = join(projectRoot, "src");

// Files to skip
const SKIP_PATTERNS = [
  "**/diagnose/**",
  "**/logger.ts",
  "**/*.test.ts",
  "**/*.test.tsx",
  "**/*.spec.ts",
  "**/*.spec.tsx",
];

// Find all TypeScript/TSX files
console.log("🔍 Scanning for console statements...\n");
const files = glob.sync("**/*.{ts,tsx}", {
  cwd: srcDir,
  absolute: true,
  ignore: SKIP_PATTERNS,
});

let totalFiles = 0;
let totalReplacements = 0;
const changes = [];

for (const filePath of files) {
  let content = readFileSync(filePath, "utf-8");
  const originalContent = content;
  let fileChanges = 0;

  // Check if file needs logger import
  const hasConsoleError = /console\.error/.test(content);
  const hasConsoleWarn = /console\.warn/.test(content);
  const needsLogger = hasConsoleError || hasConsoleWarn;
  const hasLoggerImport = /import.*logger.*from.*@\/lib\/logger/.test(content);

  if (needsLogger && !hasLoggerImport) {
    // Add logger import at the top after other imports
    const importMatch = content.match(/^(import[^;]+;[\n\r]+)+/m);
    if (importMatch) {
      const lastImportEnd = importMatch.index + importMatch[0].length;
      content =
        content.slice(0, lastImportEnd) +
        `import { logger } from "@/lib/logger";\n` +
        content.slice(lastImportEnd);
      fileChanges++;
    }
  }

  // Replace console.error with logger.error
  // Pattern: console.error("message", error) → logger.error("message", error instanceof Error ? { error: error.message } : { details: String(error) })
  const errorRegex = /console\.error\(/g;
  const errorMatches = content.match(errorRegex);
  if (errorMatches) {
    // Simple replacement - will need manual review for proper error handling
    content = content.replace(errorRegex, "logger.error(");
    fileChanges += errorMatches.length;
  }

  // Replace console.warn with logger.warn
  const warnRegex = /console\.warn\(/g;
  const warnMatches = content.match(warnRegex);
  if (warnMatches) {
    content = content.replace(warnRegex, "logger.warn(");
    fileChanges += warnMatches.length;
  }

  // Comment out console.log (for manual review)
  const logRegex = /^(\s*)(console\.log\(.*?\);?)/gm;
  const logMatches = content.match(logRegex);
  if (logMatches) {
    content = content.replace(logRegex, "$1// [REMOVED FOR PRODUCTION] $2");
    fileChanges += logMatches.length;
  }

  // Comment out console.debug
  const debugRegex = /^(\s*)(console\.debug\(.*?\);?)/gm;
  const debugMatches = content.match(debugRegex);
  if (debugMatches) {
    content = content.replace(debugRegex, "$1// [REMOVED FOR PRODUCTION] $2");
    fileChanges += debugMatches.length;
  }

  // Write file if changed
  if (content !== originalContent) {
    writeFileSync(filePath, content, "utf-8");
    totalFiles++;
    totalReplacements += fileChanges;

    const relativePath = filePath.replace(srcDir + "/", "");
    changes.push({
      file: relativePath,
      changes: fileChanges,
    });
  }
}

// Report results
console.log("✅ Console.log Cleanup Complete!\n");
console.log(`📊 Summary:`);
console.log(`   Files modified: ${totalFiles}`);
console.log(`   Total changes: ${totalReplacements}\n`);

if (changes.length > 0) {
  console.log("📝 Modified files:");
  changes.slice(0, 20).forEach(({ file, changes }) => {
    console.log(`   ${file} (${changes} changes)`);
  });

  if (changes.length > 20) {
    console.log(`   ... and ${changes.length - 20} more files\n`);
  }
}

console.log("\n✨ Next steps:");
console.log("   1. Review commented console.log statements");
console.log("   2. Run: git diff src/");
console.log("   3. Run: npm run lint");
console.log("   4. Run: npm run build");
console.log("   5. Test the application");

process.exit(0);
