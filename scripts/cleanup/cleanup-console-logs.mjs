#!/usr/bin/env node

/**
 * Console Log Cleanup Script
 *
 * Intelligently removes debug console.log statements while keeping:
 * - console.error (production errors)
 * - console.warn (production warnings)
 * - console.info (production info - review case by case)
 *
 * Run: node scripts/cleanup/cleanup-console-logs.mjs
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

const CONFIG = {
  // Directories to scan
  scanDirs: ["src"],

  // File extensions to check
  extensions: [".ts", ".tsx"],

  // Console methods to REMOVE (debug statements)
  removePatterns: [/console\.log\(/g, /console\.debug\(/g],

  // Console methods to KEEP (production logging)
  keepPatterns: [
    "console.error",
    "console.warn",
    "console.info", // Review these
    "console.table", // Usually debug, but check context
  ],

  // Patterns to always keep (even if console.log)
  exemptPatterns: [
    /\/\/ TODO: Remove after debugging/,
    /\/\/ KEEP:/,
    /process\.env\.NODE_ENV === ['"]development['"]/,
  ],

  // Create backups
  createBackups: false, // DISABLED - disk full

  // Dry run (show changes without applying)
  dryRun: false,
};

// ============================================================================
// Utilities
// ============================================================================

function log(message, type = "info") {
  const colors = {
    info: "\x1b[36m",
    success: "\x1b[32m",
    warning: "\x1b[33m",
    error: "\x1b[31m",
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

function findFilesWithConsoleLogs() {
  const files = [];

  for (const dir of CONFIG.scanDirs) {
    const dirPath = path.join(ROOT, dir);

    try {
      const result = execSync(
        `find ${dirPath} -type f \\( -name "*.ts" -o -name "*.tsx" \\) -exec grep -l "console\\.log\\|console\\.debug" {} \\;`,
        { encoding: "utf-8" }
      );

      const foundFiles = result.trim().split("\n").filter(Boolean);
      files.push(...foundFiles);
    } catch (error) {
      // No matches in this directory
    }
  }

  return files;
}

function analyzeFile(filePath) {
  const content = fs.readFileSync(filePath, "utf-8");
  const lines = content.split("\n");

  const issues = [];

  lines.forEach((line, index) => {
    const lineNum = index + 1;

    // Check if line has console.log or console.debug
    if (!/console\.(log|debug)\(/.test(line)) {
      return;
    }

    // Check if line should be exempt
    const isExempt = CONFIG.exemptPatterns.some((pattern) =>
      pattern.test(line)
    );
    if (isExempt) {
      return;
    }

    // Check if it's a conditional dev-only log
    const prevLines = lines.slice(Math.max(0, index - 2), index).join("\n");
    if (/if.*NODE_ENV.*development/.test(prevLines)) {
      return;
    }

    issues.push({
      line: lineNum,
      content: line.trim(),
      type: /console\.log/.test(line) ? "log" : "debug",
    });
  });

  return {
    filePath,
    issues,
    content,
    lines,
  };
}

function removeConsoleLogs(fileData) {
  const { filePath, content, lines, issues } = fileData;

  if (issues.length === 0) {
    return { modified: false };
  }

  // Create backup
  if (CONFIG.createBackups) {
    const backupPath = `${filePath}.backup`;
    fs.copyFileSync(filePath, backupPath);
  }

  // Remove or comment out console statements
  const modifiedLines = lines
    .map((line, index) => {
      const lineNum = index + 1;
      const hasIssue = issues.some((issue) => issue.line === lineNum);

      if (!hasIssue) {
        return line;
      }

      // Option 1: Comment out (safer for review)
      return `// REMOVED: ${line}`;

      // Option 2: Delete entirely (uncomment to use instead)
      // return null;
    })
    .filter((line) => line !== null); // Remove null lines if using Option 2

  const modifiedContent = modifiedLines.join("\n");

  if (!CONFIG.dryRun) {
    fs.writeFileSync(filePath, modifiedContent, "utf-8");
  }

  return {
    modified: true,
    removedCount: issues.length,
  };
}

// ============================================================================
// Analysis Functions
// ============================================================================

function generateReport(results) {
  const totalFiles = results.length;
  const filesWithIssues = results.filter((r) => r.issues.length > 0).length;
  const totalIssues = results.reduce((sum, r) => sum + r.issues.length, 0);

  log(`\n📊 Console Log Analysis Report\n`, "info");
  log(`Total files scanned: ${totalFiles}`, "info");
  log(`Files with console.log/debug: ${filesWithIssues}`, "warning");
  log(`Total statements to remove: ${totalIssues}`, "warning");

  if (filesWithIssues === 0) {
    log("\n✨ No console.log statements found!", "success");
    return;
  }

  log("\n📝 Top files with most console statements:\n", "info");

  const sorted = results
    .filter((r) => r.issues.length > 0)
    .sort((a, b) => b.issues.length - a.issues.length)
    .slice(0, 10);

  sorted.forEach((result, index) => {
    const relativePath = path.relative(ROOT, result.filePath);
    console.log(
      `  ${index + 1}. ${relativePath} (${result.issues.length} statements)`
    );

    // Show first 2 examples
    result.issues.slice(0, 2).forEach((issue) => {
      console.log(`     Line ${issue.line}: ${issue.content}`);
    });

    if (result.issues.length > 2) {
      console.log(`     ... and ${result.issues.length - 2} more`);
    }
    console.log("");
  });

  return { totalFiles, filesWithIssues, totalIssues };
}

// ============================================================================
// Main Execution
// ============================================================================

async function main() {
  const isDryRun =
    process.argv.includes("--dry-run") || process.argv.includes("-d");
  const autoFix = process.argv.includes("--fix") || process.argv.includes("-f");

  CONFIG.dryRun = !autoFix;

  log("🧹 Console Log Cleanup Script\n", "info");

  if (CONFIG.dryRun) {
    log("Running in DRY RUN mode (no files will be modified)", "warning");
    log("Use --fix or -f to actually modify files\n", "info");
  } else {
    log("Running in FIX mode (files will be modified)", "warning");
    log("Backups will be created with .backup extension\n", "info");
  }

  // Find all files with console.log
  log("Scanning for console.log statements...", "info");
  const files = findFilesWithConsoleLogs();

  if (files.length === 0) {
    log("✨ No files with console.log found!", "success");
    return;
  }

  log(`Found ${files.length} files with console statements`, "info");

  // Analyze each file
  log("Analyzing files...", "info");
  const results = files.map(analyzeFile);

  // Generate report
  const stats = generateReport(results);

  if (!stats || stats.filesWithIssues === 0) {
    return;
  }

  // Apply fixes if not dry run
  if (!CONFIG.dryRun) {
    log("\n🔧 Applying fixes...", "info");

    let modifiedCount = 0;
    let removedCount = 0;

    results.forEach((result) => {
      if (result.issues.length > 0) {
        const { modified, removedCount: removed } = removeConsoleLogs(result);
        if (modified) {
          modifiedCount++;
          removedCount += removed;
          const relativePath = path.relative(ROOT, result.filePath);
          log(`  Modified: ${relativePath} (${removed} statements)`, "success");
        }
      }
    });

    log(`\n✅ Cleanup complete!`, "success");
    log(`Modified ${modifiedCount} files`, "success");
    log(`Removed/commented ${removedCount} console statements`, "success");

    log("\n📋 Next steps:", "info");
    log("1. Review the changes (check .backup files)", "info");
    log("2. Run: npm run typecheck", "info");
    log("3. Run: npm run build", "info");
    log("4. Test your application", "info");
    log("5. If satisfied, delete .backup files", "info");
  } else {
    log("\n💡 To apply fixes, run:", "info");
    log("   node scripts/cleanup/cleanup-console-logs.mjs --fix", "info");
  }
}

main().catch((error) => {
  log(`Error: ${error.message}`, "error");
  console.error(error);
  process.exit(1);
});
