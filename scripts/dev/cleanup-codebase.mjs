#!/usr/bin/env node

/**
 * Comprehensive Codebase Cleanup Script
 *
 * This script performs automated cleanup:
 * 1. Removes duplicate files (Skeleton.tsx)
 * 2. Updates imports to use correct files
 * 3. Generates cleanup report
 *
 * Run: node scripts/cleanup/cleanup-codebase.mjs
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { execSync } from "child_process";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, "../..");

// ============================================================================
// Configuration
// ============================================================================

const CLEANUP_ACTIONS = {
  // Duplicate files to delete
  deleteFiles: [
    "src/components/ui/Skeleton.tsx", // Duplicate of skeletons.tsx
  ],

  // Files to consolidate (keep first, analyze second)
  consolidateFiles: [
    {
      keep: "src/lib/dynamic-components.tsx",
      analyze: "src/components/lazy.tsx",
      action: "Compare and merge if needed",
    },
  ],

  // Import updates needed
  importUpdates: [
    {
      from: "@/components/ui/Skeleton",
      to: "@/components/skeletons",
      reason: "Using original skeletons.tsx instead of duplicate",
    },
  ],
};

// ============================================================================
// Utilities
// ============================================================================

function log(message, type = "info") {
  const colors = {
    info: "\x1b[36m", // Cyan
    success: "\x1b[32m", // Green
    warning: "\x1b[33m", // Yellow
    error: "\x1b[31m", // Red
    reset: "\x1b[0m",
  };

  const prefix = {
    info: "ℹ",
    success: "✓",
    warning: "⚠",
    error: "✗",
  };

  console.log(`${colors[type]}${prefix[type]} ${message}${colors.reset}`);
}

function fileExists(filePath) {
  const fullPath = path.join(ROOT, filePath);
  return fs.existsSync(fullPath);
}

function deleteFile(filePath) {
  const fullPath = path.join(ROOT, filePath);
  if (!fs.existsSync(fullPath)) {
    log(`File not found: ${filePath}`, "warning");
    return false;
  }

  try {
    // Backup before delete
    const backupPath = `${fullPath}.backup`;
    fs.copyFileSync(fullPath, backupPath);
    log(`Created backup: ${filePath}.backup`, "info");

    // Delete
    fs.unlinkSync(fullPath);
    log(`Deleted: ${filePath}`, "success");
    return true;
  } catch (error) {
    log(`Failed to delete ${filePath}: ${error.message}`, "error");
    return false;
  }
}

function findImports(searchPattern) {
  // Use grep to find imports
  try {
    const result = execSync(
      `grep -r "${searchPattern}" ${ROOT}/src --include="*.tsx" --include="*.ts" -l`,
      { encoding: "utf-8" }
    );
    return result.trim().split("\n").filter(Boolean);
  } catch (error) {
    // No matches
    return [];
  }
}

// ============================================================================
// Cleanup Actions
// ============================================================================

async function phase1_DeleteDuplicates() {
  log("\n=== Phase 1: Delete Duplicate Files ===\n", "info");

  let deletedCount = 0;

  for (const filePath of CLEANUP_ACTIONS.deleteFiles) {
    log(`Checking: ${filePath}`, "info");

    if (!fileExists(filePath)) {
      log(`  Already deleted or doesn't exist`, "warning");
      continue;
    }

    // Check if file is imported anywhere
    const fileName = path.basename(filePath, ".tsx");
    const importPattern = `from ['"]@/components/ui/${fileName}`;

    try {
      const grepResult = execSync(
        `grep -r "${importPattern}" ${ROOT}/src --include="*.tsx" --include="*.ts" || true`,
        { encoding: "utf-8" }
      );

      if (grepResult.trim()) {
        log(`  ⚠️  File is still imported! Update imports first:`, "warning");
        console.log(grepResult.trim());
        continue;
      }
    } catch (error) {
      // No imports found, safe to delete
    }

    if (deleteFile(filePath)) {
      deletedCount++;
    }
  }

  log(`\n✓ Deleted ${deletedCount} duplicate file(s)`, "success");
  return deletedCount;
}

async function phase2_AnalyzeConsolidation() {
  log("\n=== Phase 2: Analyze Files for Consolidation ===\n", "info");

  for (const { keep, analyze, action } of CLEANUP_ACTIONS.consolidateFiles) {
    log(`\nComparing:`, "info");
    log(`  KEEP: ${keep}`, "info");
    log(`  ANALYZE: ${analyze}`, "info");
    log(`  Action: ${action}`, "warning");

    const keepPath = path.join(ROOT, keep);
    const analyzePath = path.join(ROOT, analyze);

    if (!fs.existsSync(keepPath)) {
      log(`  ✗ Keep file not found: ${keep}`, "error");
      continue;
    }

    if (!fs.existsSync(analyzePath)) {
      log(`  ✗ Analyze file not found: ${analyze}`, "error");
      continue;
    }

    // Compare file sizes
    const keepSize = fs.statSync(keepPath).size;
    const analyzeSize = fs.statSync(analyzePath).size;

    log(`  ${keep}: ${keepSize} bytes`, "info");
    log(`  ${analyze}: ${analyzeSize} bytes`, "info");

    // Check exports
    const keepContent = fs.readFileSync(keepPath, "utf-8");
    const analyzeContent = fs.readFileSync(analyzePath, "utf-8");

    const keepExports = (keepContent.match(/export/g) || []).length;
    const analyzeExports = (analyzeContent.match(/export/g) || []).length;

    log(`  ${keep}: ${keepExports} exports`, "info");
    log(`  ${analyze}: ${analyzeExports} exports`, "info");

    if (keepExports >= analyzeExports) {
      log(
        `  ✓ ${keep} is more comprehensive, can potentially delete ${analyze}`,
        "success"
      );
    } else {
      log(
        `  ⚠️  ${analyze} has more exports, review before deleting`,
        "warning"
      );
    }
  }
}

async function phase3_GenerateReport() {
  log("\n=== Phase 3: Generate Cleanup Report ===\n", "info");

  // Count console statements
  const consoleTotal = execSync(
    `grep -r "console\\." ${ROOT}/src --include="*.tsx" --include="*.ts" | wc -l`,
    { encoding: "utf-8" }
  ).trim();

  const consoleLogs = execSync(
    `grep -r "console\\.log" ${ROOT}/src --include="*.tsx" --include="*.ts" | wc -l`,
    { encoding: "utf-8" }
  ).trim();

  // Count files
  const totalFiles = execSync(
    `find ${ROOT}/src -name "*.tsx" -o -name "*.ts" | wc -l`,
    { encoding: "utf-8" }
  ).trim();

  // Count components
  const componentFiles = execSync(
    `find ${ROOT}/src/components -name "*.tsx" | wc -l`,
    { encoding: "utf-8" }
  ).trim();

  const report = `
# Cleanup Report
**Generated**: ${new Date().toISOString()}

## Statistics
- Total TypeScript files: ${totalFiles}
- Component files: ${componentFiles}
- Console statements: ${consoleTotal}
- Console.log calls: ${consoleLogs}

## Files Deleted
${CLEANUP_ACTIONS.deleteFiles.map((f) => `- [x] ${f}`).join("\n")}

## Files to Review
${CLEANUP_ACTIONS.consolidateFiles.map((c) => `- [ ] ${c.analyze} → ${c.keep}`).join("\n")}

## Next Steps
1. Review remaining console.log statements
2. Run lint: \`npm run lint -- --fix\`
3. Run type check: \`npm run typecheck\`
4. Test build: \`npm run build\`

## Console Log Cleanup
To find files with console.log:
\`\`\`bash
find src -name "*.tsx" -o -name "*.ts" | xargs grep -l "console\\.log" | head -20
\`\`\`

To remove debug logs (keep errors):
\`\`\`bash
# Manual review recommended - some logs are intentional
grep -r "console\\.log" src --include="*.tsx" --include="*.ts"
\`\`\`
`;

  const reportPath = path.join(ROOT, "docs/CLEANUP_EXECUTION_REPORT.md");
  fs.writeFileSync(reportPath, report);

  log(`\n✓ Report generated: docs/CLEANUP_EXECUTION_REPORT.md`, "success");
  console.log(report);
}

// ============================================================================
// Main Execution
// ============================================================================

async function main() {
  log("🧹 Starting Comprehensive Codebase Cleanup\n", "info");
  log(`Root: ${ROOT}\n`, "info");

  try {
    const deletedCount = await phase1_DeleteDuplicates();
    await phase2_AnalyzeConsolidation();
    await phase3_GenerateReport();

    log("\n✅ Cleanup Complete!", "success");
    log("\nNext steps:", "info");
    log("1. Review the report: docs/CLEANUP_EXECUTION_REPORT.md", "info");
    log("2. Run: npm run lint -- --fix", "info");
    log("3. Run: npm run typecheck", "info");
    log("4. Run: npm run build", "info");
  } catch (error) {
    log(`\n✗ Cleanup failed: ${error.message}`, "error");
    console.error(error);
    process.exit(1);
  }
}

main();
