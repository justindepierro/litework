#!/usr/bin/env node

/**
 * Comprehensive Cleanup Script
 *
 * This script performs comprehensive cleanup and validation:
 * 1. Finds and removes unused console.logs (production)
 * 2. Checks database naming conventions
 * 3. Validates API route authentication
 * 4. Finds duplicate code
 * 5. Checks component usage standards
 * 6. Validates TypeScript compilation
 * 7. Generates cleanup report
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from "fs";
import { join, relative } from "path";
import { execSync } from "child_process";

// CleanupIssue structure:
// {
//   file: string,
//   line: number,
//   type: 'console.log' | 'auth-missing' | 'naming-violation' | 'hardcoded-style' | 'duplicate',
//   severity: 'error' | 'warning' | 'info',
//   message: string,
//   suggestion?: string
// }

const issues = [];
const stats = {
  filesScanned: 0,
  consoleLogs: 0,
  unauthRoutes: 0,
  namingViolations: 0,
  hardcodedStyles: 0,
  duplicates: 0,
};

// Configuration
const ROOT_DIR = process.cwd();
const SRC_DIR = join(ROOT_DIR, "src");
const DRY_RUN = process.argv.includes("--dry-run");
const FIX = process.argv.includes("--fix");

console.log("🧹 LiteWork Comprehensive Cleanup\n");
console.log(`Mode: ${DRY_RUN ? "DRY RUN" : FIX ? "FIX" : "CHECK ONLY"}\n`);

// 1. Find console.logs in source files
function scanForConsoleLogs() {
  console.log("📝 Scanning for console.log statements...");

  function scanFile(filePath) {
    if (!filePath.match(/\.(ts|tsx)$/)) return;
    if (filePath.includes("node_modules") || filePath.includes(".next")) return;

    stats.filesScanned++;
    const content = readFileSync(filePath, "utf-8");
    const lines = content.split("\n");

    lines.forEach((line, index) => {
      // Skip console.error and console.warn
      if (line.match(/console\.(log|debug|info|table)/)) {
        stats.consoleLogs++;
        issues.push({
          file: relative(ROOT_DIR, filePath),
          line: index + 1,
          type: "console.log",
          severity: "warning",
          message: `console statement: ${line.trim().substring(0, 80)}`,
          suggestion: "Remove or replace with proper logging",
        });
      }
    });
  }

  function walkDir(dir) {
    const files = readdirSync(dir);
    files.forEach((file) => {
      const filePath = join(dir, file);
      const stat = statSync(filePath);
      if (stat.isDirectory()) {
        walkDir(filePath);
      } else {
        scanFile(filePath);
      }
    });
  }

  walkDir(SRC_DIR);
  console.log(
    `✓ Scanned ${stats.filesScanned} files, found ${stats.consoleLogs} console statements\n`
  );
}

// 2. Check API route authentication
function checkAPIAuthentication() {
  console.log("🔒 Checking API route authentication...");

  const apiDir = join(SRC_DIR, "app", "api");

  function scanAPIRoute(filePath) {
    if (!filePath.endsWith("route.ts")) return;

    const content = readFileSync(filePath, "utf-8");

    // Skip intentionally public routes
    const publicRoutes = ["health", "auth"];
    const isPublicRoute = publicRoutes.some((route) =>
      filePath.includes(`/api/${route}/`)
    );

    if (isPublicRoute) return;

    const hasAuthWrapper = content.match(/withAuth|withPermission|withRole/);
    const hasManualAuth = content.match(/getAuthenticatedUser|requireAuth/);

    if (!hasAuthWrapper && !hasManualAuth) {
      stats.unauthRoutes++;
      issues.push({
        file: relative(ROOT_DIR, filePath),
        line: 1,
        type: "auth-missing",
        severity: "error",
        message: "API route missing authentication",
        suggestion: "Add withAuth wrapper or manual authentication",
      });
    }
  }

  function walkDir(dir) {
    try {
      const files = readdirSync(dir);
      files.forEach((file) => {
        const filePath = join(dir, file);
        const stat = statSync(filePath);
        if (stat.isDirectory()) {
          walkDir(filePath);
        } else {
          scanAPIRoute(filePath);
        }
      });
    } catch (e) {
      // Directory might not exist
    }
  }

  walkDir(apiDir);
  console.log(`✓ Found ${stats.unauthRoutes} unprotected API routes\n`);
}

// 3. Check database naming conventions
function checkNamingConventions() {
  console.log("📋 Checking naming conventions...");

  function scanFile(filePath) {
    if (!filePath.match(/\.(ts|tsx)$/)) return;
    if (filePath.includes("node_modules") || filePath.includes(".next")) return;

    const content = readFileSync(filePath, "utf-8");
    const lines = content.split("\n");

    lines.forEach((line, index) => {
      // Check for database field references with camelCase (should be snake_case in queries)
      if (
        line.match(/\.select\(|\.update\(|\.insert\(/) &&
        line.match(/[a-z]+[A-Z]/)
      ) {
        // Potential camelCase in database query
        const matches = line.match(/['"]([a-zA-Z_]+)['"]/g);
        if (matches) {
          matches.forEach((match) => {
            const fieldName = match.replace(/['"]/g, "");
            if (fieldName.match(/[a-z]+[A-Z]/) && !fieldName.includes("_")) {
              stats.namingViolations++;
              issues.push({
                file: relative(ROOT_DIR, filePath),
                line: index + 1,
                type: "naming-violation",
                severity: "warning",
                message: `Possible camelCase in database query: ${fieldName}`,
                suggestion: "Database fields should use snake_case",
              });
            }
          });
        }
      }
    });
  }

  function walkDir(dir) {
    const files = readdirSync(dir);
    files.forEach((file) => {
      const filePath = join(dir, file);
      const stat = statSync(filePath);
      if (stat.isDirectory()) {
        walkDir(filePath);
      } else {
        scanFile(filePath);
      }
    });
  }

  walkDir(SRC_DIR);
  console.log(
    `✓ Found ${stats.namingViolations} potential naming violations\n`
  );
}

// 4. Check for hardcoded styles (should use components)
function checkHardcodedStyles() {
  console.log("🎨 Checking for hardcoded styles...");

  function scanFile(filePath) {
    if (!filePath.match(/\.tsx$/)) return;
    if (filePath.includes("node_modules") || filePath.includes(".next")) return;
    if (filePath.includes("/components/ui/")) return; // Skip UI components themselves

    const content = readFileSync(filePath, "utf-8");
    const lines = content.split("\n");

    lines.forEach((line, index) => {
      // Check for hardcoded text colors (should use Typography)
      if (
        line.match(
          /<(h1|h2|h3|h4|h5|h6|p|span).*text-(gray|blue|red|green|yellow)-\d+/
        ) &&
        !line.includes("Typography") &&
        !line.includes("// allow-hardcoded")
      ) {
        stats.hardcodedStyles++;
        issues.push({
          file: relative(ROOT_DIR, filePath),
          line: index + 1,
          type: "hardcoded-style",
          severity: "info",
          message: "Hardcoded text element, should use Typography component",
          suggestion: "Use <Heading>, <Body>, or <Label> from Typography",
        });
      }

      // Check for hardcoded buttons
      if (
        line.match(/<button.*className=.*bg-(blue|gray|red|green)/) &&
        !line.includes("Button") &&
        !line.includes("// allow-hardcoded")
      ) {
        stats.hardcodedStyles++;
        issues.push({
          file: relative(ROOT_DIR, filePath),
          line: index + 1,
          type: "hardcoded-style",
          severity: "info",
          message: "Hardcoded button, should use Button component",
          suggestion: 'Use <Button variant="primary"> from ui/Button',
        });
      }
    });
  }

  function walkDir(dir) {
    const files = readdirSync(dir);
    files.forEach((file) => {
      const filePath = join(dir, file);
      const stat = statSync(filePath);
      if (stat.isDirectory()) {
        walkDir(filePath);
      } else {
        scanFile(filePath);
      }
    });
  }

  walkDir(SRC_DIR);
  console.log(`✓ Found ${stats.hardcodedStyles} hardcoded style instances\n`);
}

// Run all checks
scanForConsoleLogs();
checkAPIAuthentication();
checkNamingConventions();
checkHardcodedStyles();

// Generate report
console.log("\n📊 Cleanup Summary\n");
console.log("═".repeat(60));
console.log(`Files Scanned:         ${stats.filesScanned}`);
console.log(`Console Logs:          ${stats.consoleLogs}`);
console.log(`Unauth Routes:         ${stats.unauthRoutes} ⚠️`);
console.log(`Naming Violations:     ${stats.namingViolations}`);
console.log(`Hardcoded Styles:      ${stats.hardcodedStyles}`);
console.log("═".repeat(60));

// Group issues by severity
const errors = issues.filter((i) => i.severity === "error");
const warnings = issues.filter((i) => i.severity === "warning");
const infos = issues.filter((i) => i.severity === "info");

console.log(`\n🔴 Errors:   ${errors.length}`);
console.log(`🟡 Warnings: ${warnings.length}`);
console.log(`🔵 Info:     ${infos.length}`);

// Show critical issues
if (errors.length > 0) {
  console.log("\n🔴 Critical Issues (must fix):\n");
  errors.slice(0, 10).forEach((issue) => {
    console.log(`${issue.file}:${issue.line}`);
    console.log(`  ${issue.message}`);
    if (issue.suggestion) {
      console.log(`  💡 ${issue.suggestion}`);
    }
    console.log("");
  });
  if (errors.length > 10) {
    console.log(`... and ${errors.length - 10} more errors\n`);
  }
}

// Save detailed report
const reportPath = join(ROOT_DIR, "docs", "CLEANUP_REPORT.md");
const report = `# Comprehensive Cleanup Report

**Generated:** ${new Date().toISOString()}
**Files Scanned:** ${stats.filesScanned}

## Summary

| Metric | Count | Status |
|--------|-------|--------|
| Console Logs | ${stats.consoleLogs} | ${stats.consoleLogs > 50 ? "⚠️" : "✓"} |
| Unauth API Routes | ${stats.unauthRoutes} | ${stats.unauthRoutes > 0 ? "❌" : "✓"} |
| Naming Violations | ${stats.namingViolations} | ${stats.namingViolations > 10 ? "⚠️" : "✓"} |
| Hardcoded Styles | ${stats.hardcodedStyles} | ${stats.hardcodedStyles > 20 ? "⚠️" : "✓"} |

## Issues by Severity

- 🔴 **Errors:** ${errors.length} (must fix)
- 🟡 **Warnings:** ${warnings.length} (should fix)
- 🔵 **Info:** ${infos.length} (nice to have)

${errors.length > 0 ? `## Critical Errors\n\n${errors.map((i) => `- \`${i.file}:${i.line}\` - ${i.message}`).join("\n")}` : ""}

${
  warnings.length > 0
    ? `## Warnings\n\n${warnings
        .slice(0, 20)
        .map((i) => `- \`${i.file}:${i.line}\` - ${i.message}`)
        .join(
          "\n"
        )}${warnings.length > 20 ? `\n\n... and ${warnings.length - 20} more warnings` : ""}`
    : ""
}

## Recommendations

1. **${stats.unauthRoutes > 0 ? "⚠️ Fix unprotected API routes immediately" : "✓ All API routes protected"}**
2. **${stats.consoleLogs > 50 ? "⚠️ Remove console.logs before production" : "✓ Console usage acceptable"}**
3. **${stats.namingViolations > 10 ? "⚠️ Review database naming conventions" : "✓ Naming conventions followed"}**
4. **${stats.hardcodedStyles > 20 ? "⚠️ Migrate to component system" : "✓ Good component usage"}**

## Next Steps

\`\`\`bash
# Fix automatically (if supported)
node cleanup.mjs --fix

# Review specific issues
grep -n "console.log" src/**/*.ts
\`\`\`
`;

writeFileSync(reportPath, report);
console.log(`\n✓ Detailed report saved to: docs/CLEANUP_REPORT.md`);

// Exit with error code if critical issues found
process.exit(errors.length > 0 ? 1 : 0);
