#!/usr/bin/env node

/**
 * Console.log Cleanup Script
 *
 * Automatically removes production console.log statements while preserving:
 * - console.error (needed for error tracking)
 * - console.warn (needed for warnings)
 * - Lines with // keep-console comment
 * - Already commented lines with // [REMOVED]
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from "fs";
import { join, relative } from "path";

const ROOT_DIR = process.cwd();
const SRC_DIR = join(ROOT_DIR, "src");
const DRY_RUN = process.argv.includes("--dry-run");

let filesModified = 0;
let linesRemoved = 0;
let linesCommented = 0;

console.log("🧹 Console.log Cleanup\n");
console.log(
  `Mode: ${DRY_RUN ? "🔍 DRY RUN (no changes)" : "✏️  WRITE MODE (will modify files)"}\n`
);

function cleanFile(filePath) {
  if (!filePath.match(/\.(ts|tsx)$/)) return;
  if (filePath.includes("node_modules") || filePath.includes(".next")) return;

  // Skip logging utilities - they intentionally use console
  if (
    filePath.includes("/logger.ts") ||
    filePath.includes("/dev-logger.ts") ||
    filePath.includes("/auth-logger.ts") ||
    filePath.includes("/performance.ts")
  ) {
    return;
  }

  const content = readFileSync(filePath, "utf-8");
  const lines = content.split("\n");
  const newLines = [];
  let modified = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Keep console.error and console.warn
    if (trimmed.match(/console\.(error|warn)/)) {
      newLines.push(line);
      continue;
    }

    // Keep lines with keep-console comment
    if (line.includes("// keep-console")) {
      newLines.push(line);
      continue;
    }

    // Skip already commented lines
    if (trimmed.startsWith("// [REMOVED]") || trimmed.startsWith("//")) {
      newLines.push(line);
      continue;
    }

    // Check for console.log, console.debug, console.info, console.table
    const consoleMatch = line.match(/console\.(log|debug|info|table)/);

    if (consoleMatch) {
      modified = true;

      // Check if this is a standalone console statement
      if (trimmed.startsWith("console.")) {
        // Comment out the line
        const indent = line.match(/^(\s*)/)[1];
        newLines.push(`${indent}// [REMOVED] ${trimmed}`);
        linesCommented++;
      } else {
        // Part of a larger expression - just comment it out
        const indent = line.match(/^(\s*)/)[1];
        newLines.push(`${indent}// [REMOVED] ${trimmed}`);
        linesCommented++;
      }
    } else {
      newLines.push(line);
    }
  }

  if (modified) {
    filesModified++;
    const relativePath = relative(ROOT_DIR, filePath);

    if (!DRY_RUN) {
      writeFileSync(filePath, newLines.join("\n"));
      console.log(`✓ ${relativePath}`);
    } else {
      console.log(`[DRY RUN] Would modify: ${relativePath}`);
    }
  }
}

function walkDir(dir) {
  const files = readdirSync(dir);
  files.forEach((file) => {
    const filePath = join(dir, file);
    const stat = statSync(filePath);
    if (stat.isDirectory()) {
      walkDir(filePath);
    } else {
      cleanFile(filePath);
    }
  });
}

walkDir(SRC_DIR);

console.log("\n" + "═".repeat(60));
console.log(`Files Modified:     ${filesModified}`);
console.log(`Lines Commented:    ${linesCommented}`);
console.log("═".repeat(60));

if (DRY_RUN) {
  console.log("\n💡 Run without --dry-run to apply changes");
  console.log("   node scripts/dev/console-cleanup.mjs");
} else {
  console.log("\n✅ Cleanup complete!");
  console.log("\n💡 Next steps:");
  console.log("   1. Review changes: git diff");
  console.log("   2. Test build: npm run build");
  console.log("   3. Run typecheck: npm run typecheck");
}

process.exit(0);
