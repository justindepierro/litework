#!/usr/bin/env node

/**
 * Audit script to find date/timestamp bugs and type mismatches
 * Checks for:
 * 1. DATE columns receiving toISOString() (should be date-only format)
 * 2. TIMESTAMP columns receiving date-only strings
 * 3. Inconsistent date handling across API routes
 * 4. Missing date conversions in fetch operations
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "../..");

// Database schema analysis - columns and their types
const DATABASE_SCHEMA = {
  workout_assignments: {
    scheduled_date: "DATE",
    assigned_date: "DATE",
    due_date: "DATE",
    created_at: "TIMESTAMP",
    updated_at: "TIMESTAMP",
  },
  workout_sessions: {
    date: "DATE",
    started_at: "TIMESTAMP",
    completed_at: "TIMESTAMP",
    created_at: "TIMESTAMP",
  },
  progress_entries: {
    date: "DATE",
    created_at: "TIMESTAMP",
  },
  athlete_kpis: {
    date: "DATE",
    created_at: "TIMESTAMP",
    updated_at: "TIMESTAMP",
  },
  notifications: {
    created_at: "TIMESTAMP",
    read_at: "TIMESTAMP",
  },
  users: {
    created_at: "TIMESTAMP",
    updated_at: "TIMESTAMP",
  },
};

const issues = [];
let filesScanned = 0;
let totalLines = 0;

// Patterns to detect
const PATTERNS = {
  // DATE column getting toISOString() - WRONG
  dateColumnWithISOString:
    /\.update\s*\(\s*\{[^}]*(?:scheduled_date|assigned_date|due_date|date):\s*[^}]*\.toISOString\(\)/gs,

  // TIMESTAMP column getting date-only format - potentially wrong
  timestampColumnWithDateOnly:
    /\.update\s*\(\s*\{[^}]*(?:created_at|updated_at|started_at|completed_at|read_at):\s*[^}]*\.split\(['"]T['"]\)\[0\]/gs,

  // Checking for proper date formatting
  toISOStringUsage: /\.toISOString\(\)/g,

  // Date constructor without conversion
  newDateWithoutConversion: /new Date\([^)]*\)(?!\s*\.)/g,

  // Supabase update/insert operations
  supabaseUpdate: /\.update\s*\(\s*\{[^}]+\}\s*\)/gs,
  supabaseInsert: /\.insert\s*\(\s*\{[^}]+\}\s*\)/gs,
};

function scanFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, "utf-8");
    const lines = content.split("\n");
    totalLines += lines.length;
    filesScanned++;

    const relativePath = path.relative(projectRoot, filePath);

    // Check for DATE columns with toISOString()
    let match;
    const dateColumnMatches = [
      ...content.matchAll(PATTERNS.dateColumnWithISOString),
    ];

    for (const match of dateColumnMatches) {
      const snippet = match[0].substring(0, 100);
      const lineNumber = content.substring(0, match.index).split("\n").length;

      issues.push({
        severity: "HIGH",
        type: "DATE_COLUMN_ISO_STRING",
        file: relativePath,
        line: lineNumber,
        message:
          'DATE column receiving toISOString() - should use .split("T")[0] for date-only',
        snippet: snippet,
        fix: 'Use: const dateOnly = date.toISOString().split("T")[0]; then use dateOnly',
      });
    }

    // Check for potential date conversion issues in fetch responses
    const fetchMatches = [...content.matchAll(/await fetch\([^)]+\)/g)];
    for (const match of fetchMatches) {
      const afterFetch = content.substring(match.index, match.index + 500);
      const hasDateConversion =
        afterFetch.includes("new Date(") ||
        afterFetch.includes("toISOString().split");

      if (!hasDateConversion && afterFetch.includes("setAssignments")) {
        const lineNumber = content.substring(0, match.index).split("\n").length;
        issues.push({
          severity: "MEDIUM",
          type: "MISSING_DATE_CONVERSION",
          file: relativePath,
          line: lineNumber,
          message:
            "Fetched data may contain date strings not converted to Date objects",
          snippet: match[0],
          fix: "Convert date strings to Date objects after fetch: new Date(item.scheduledDate)",
        });
      }
    }

    // Check for toISOString() in Supabase operations
    const updateMatches = [...content.matchAll(PATTERNS.supabaseUpdate)];
    for (const match of updateMatches) {
      const updateBlock = match[0];

      // Check each DATE column
      for (const [table, columns] of Object.entries(DATABASE_SCHEMA)) {
        for (const [column, type] of Object.entries(columns)) {
          if (type === "DATE" && updateBlock.includes(column)) {
            if (
              updateBlock.includes(".toISOString()") &&
              !updateBlock.includes(".split")
            ) {
              const lineNumber = content
                .substring(0, match.index)
                .split("\n").length;
              issues.push({
                severity: "HIGH",
                type: "DATE_TYPE_MISMATCH",
                file: relativePath,
                line: lineNumber,
                message: `Column "${column}" is DATE type but receiving timestamp format`,
                snippet: updateBlock.substring(0, 80) + "...",
                fix: `Use: ${column}: date.toISOString().split('T')[0]`,
              });
            }
          }
        }
      }
    }

    // Check TypeScript type definitions vs actual usage
    if (filePath.includes("types/index.ts")) {
      const dateTypeMatches = [...content.matchAll(/(\w+):\s*Date/g)];
      for (const match of dateTypeMatches) {
        const fieldName = match[1];
        const lineNumber = content.substring(0, match.index).split("\n").length;

        issues.push({
          severity: "INFO",
          type: "TYPE_DEFINITION",
          file: relativePath,
          line: lineNumber,
          message: `Field "${fieldName}" typed as Date - ensure API returns dates as strings and converts them`,
          snippet: match[0],
          fix: "Add date conversion in fetch: new Date(data." + fieldName + ")",
        });
      }
    }
  } catch (error) {
    if (error.code !== "ENOENT") {
      console.error(`Error scanning ${filePath}:`, error.message);
    }
  }
}

function scanDirectory(dir, extensions = [".ts", ".tsx", ".js", ".jsx"]) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    // Skip node_modules, .next, etc.
    if (
      entry.name === "node_modules" ||
      entry.name === ".next" ||
      entry.name === ".git"
    ) {
      continue;
    }

    if (entry.isDirectory()) {
      scanDirectory(fullPath, extensions);
    } else if (
      entry.isFile() &&
      extensions.some((ext) => entry.name.endsWith(ext))
    ) {
      scanFile(fullPath);
    }
  }
}

function generateReport() {
  console.log("\n=".repeat(80));
  console.log("DATE/TIMESTAMP BUG AUDIT REPORT");
  console.log("=".repeat(80));
  console.log(
    `\nScanned: ${filesScanned} files (${totalLines.toLocaleString()} lines)`
  );
  console.log(`Found: ${issues.length} potential issues\n`);

  // Group by severity
  const bySeverity = {
    HIGH: issues.filter((i) => i.severity === "HIGH"),
    MEDIUM: issues.filter((i) => i.severity === "MEDIUM"),
    LOW: issues.filter((i) => i.severity === "LOW"),
    INFO: issues.filter((i) => i.severity === "INFO"),
  };

  console.log("SUMMARY BY SEVERITY:");
  console.log(
    `  HIGH:   ${bySeverity.HIGH.length} (Critical bugs - fix immediately)`
  );
  console.log(
    `  MEDIUM: ${bySeverity.MEDIUM.length} (Potential bugs - review)`
  );
  console.log(`  LOW:    ${bySeverity.LOW.length} (Minor issues)`);
  console.log(`  INFO:   ${bySeverity.INFO.length} (Informational)\n`);

  // Print HIGH severity issues first
  if (bySeverity.HIGH.length > 0) {
    console.log("\n" + "=".repeat(80));
    console.log("HIGH SEVERITY ISSUES (Fix Immediately)");
    console.log("=".repeat(80));

    bySeverity.HIGH.forEach((issue, index) => {
      console.log(`\n${index + 1}. ${issue.type}`);
      console.log(`   File: ${issue.file}:${issue.line}`);
      console.log(`   Issue: ${issue.message}`);
      console.log(`   Code: ${issue.snippet}`);
      console.log(`   Fix: ${issue.fix}`);
    });
  }

  // Print MEDIUM severity issues
  if (bySeverity.MEDIUM.length > 0) {
    console.log("\n" + "=".repeat(80));
    console.log("MEDIUM SEVERITY ISSUES (Review and Fix)");
    console.log("=".repeat(80));

    bySeverity.MEDIUM.forEach((issue, index) => {
      console.log(`\n${index + 1}. ${issue.type}`);
      console.log(`   File: ${issue.file}:${issue.line}`);
      console.log(`   Issue: ${issue.message}`);
      console.log(`   Fix: ${issue.fix}`);
    });
  }

  // Group by file
  console.log("\n" + "=".repeat(80));
  console.log("ISSUES BY FILE");
  console.log("=".repeat(80));

  const byFile = {};
  issues.forEach((issue) => {
    if (!byFile[issue.file]) {
      byFile[issue.file] = [];
    }
    byFile[issue.file].push(issue);
  });

  Object.entries(byFile)
    .sort((a, b) => b[1].length - a[1].length) // Sort by issue count
    .forEach(([file, fileIssues]) => {
      const highCount = fileIssues.filter((i) => i.severity === "HIGH").length;
      const mediumCount = fileIssues.filter(
        (i) => i.severity === "MEDIUM"
      ).length;

      console.log(`\n${file}`);
      console.log(
        `  Total: ${fileIssues.length} issues (HIGH: ${highCount}, MEDIUM: ${mediumCount})`
      );

      fileIssues.slice(0, 3).forEach((issue) => {
        console.log(
          `    Line ${issue.line}: [${issue.severity}] ${issue.message}`
        );
      });

      if (fileIssues.length > 3) {
        console.log(`    ... and ${fileIssues.length - 3} more`);
      }
    });

  // Save detailed report
  const reportPath = path.join(projectRoot, "audit-date-bugs-report.json");
  fs.writeFileSync(
    reportPath,
    JSON.stringify(
      {
        timestamp: new Date().toISOString(),
        summary: {
          filesScanned,
          totalLines,
          totalIssues: issues.length,
          bySeverity: {
            high: bySeverity.HIGH.length,
            medium: bySeverity.MEDIUM.length,
            low: bySeverity.LOW.length,
            info: bySeverity.INFO.length,
          },
        },
        issues,
      },
      null,
      2
    )
  );

  console.log(`\n\nDetailed report saved to: ${reportPath}`);

  // Print recommendations
  console.log("\n" + "=".repeat(80));
  console.log("RECOMMENDATIONS");
  console.log("=".repeat(80));
  console.log(`
1. DATE Columns: Always use .split('T')[0] when updating DATE columns
   Example: scheduled_date: new Date().toISOString().split('T')[0]

2. TIMESTAMP Columns: Use full .toISOString() for timestamp columns
   Example: created_at: new Date().toISOString()

3. Fetch Operations: Always convert date strings to Date objects
   Example: scheduledDate: new Date(assignment.scheduledDate)

4. Type Safety: Ensure TypeScript types match actual API response formats

5. Testing: Test date operations across timezone boundaries
`);

  return issues.length;
}

// Run the audit
console.log("Starting date/timestamp bug audit...\n");

const srcDir = path.join(projectRoot, "src");
scanDirectory(srcDir);

const issueCount = generateReport();

process.exit(issueCount > 0 ? 1 : 0);
