#!/usr/bin/env node

/**
 * Database Field Transformation Audit Script
 *
 * Scans all API routes and components for potential snake_case/camelCase issues
 * Checks for:
 * 1. Direct supabase queries without transformation
 * 2. API responses that may return snake_case
 * 3. Components accessing snake_case fields
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, "..", "..");

const SNAKE_CASE_PATTERNS = [
  "first_name",
  "last_name",
  "full_name",
  "group_ids",
  "coach_id",
  "athlete_ids",
  "created_at",
  "updated_at",
  "date_of_birth",
  "injury_status",
  "personal_records",
  "notification_preferences",
  "workout_plan_id",
  "workout_plan_name",
  "assigned_by",
  "assigned_to_user_id",
  "assigned_to_group_id",
  "scheduled_date",
  "assigned_date",
  "assignment_type",
  "start_time",
  "end_time",
  "estimated_duration",
  "target_group_id",
  "created_by",
  "exercise_id",
  "exercise_name",
  "weight_type",
  "rest_time",
  "order_index",
  "group_id",
];

const TRANSFORMATION_KEYWORDS = [
  "transformToCamel",
  "transformToSnake",
  "camelCase",
  "snake_case",
];

function scanFile(filePath) {
  const content = fs.readFileSync(filePath, "utf8");
  const results = {
    file: filePath.replace(rootDir, ""),
    issues: [],
    hasTransformation: false,
    hasDirectQuery: false,
    snakeCaseFields: [],
  };

  // Check if file uses transformation utilities
  results.hasTransformation = TRANSFORMATION_KEYWORDS.some((keyword) =>
    content.includes(keyword)
  );

  // Check for direct supabase queries
  const queryPatterns = [
    /supabase\.from\([^)]+\)\.select\([^)]*\)/g,
    /supabase\.from\([^)]+\)\.insert\([^)]*\)/g,
    /supabase\.from\([^)]+\)\.update\([^)]*\)/g,
  ];

  queryPatterns.forEach((pattern) => {
    if (pattern.test(content)) {
      results.hasDirectQuery = true;
    }
  });

  // Check for snake_case field access
  SNAKE_CASE_PATTERNS.forEach((field) => {
    const accessPatterns = [
      new RegExp(`\\.${field}\\b`, "g"), // object.field_name
      new RegExp(`\\['${field}'\\]`, "g"), // object['field_name']
      new RegExp(`"${field}"`, "g"), // "field_name" in queries
    ];

    accessPatterns.forEach((pattern) => {
      const matches = content.match(pattern);
      if (matches && matches.length > 0) {
        if (!results.snakeCaseFields.includes(field)) {
          results.snakeCaseFields.push(field);
        }
      }
    });
  });

  // Determine severity
  if (
    results.hasDirectQuery &&
    !results.hasTransformation &&
    results.snakeCaseFields.length > 0
  ) {
    results.issues.push({
      severity: "HIGH",
      message: `Has direct database queries with snake_case fields but no transformation`,
      fields: results.snakeCaseFields,
    });
  } else if (results.hasDirectQuery && !results.hasTransformation) {
    results.issues.push({
      severity: "MEDIUM",
      message: `Has direct database queries without transformation utilities`,
    });
  } else if (results.snakeCaseFields.length > 0 && !results.hasTransformation) {
    results.issues.push({
      severity: "MEDIUM",
      message: `Accesses snake_case fields without transformation`,
      fields: results.snakeCaseFields,
    });
  }

  return results.issues.length > 0 ? results : null;
}

function scanDirectory(dir, pattern) {
  const results = [];

  function walk(currentPath) {
    const files = fs.readdirSync(currentPath);

    files.forEach((file) => {
      const filePath = path.join(currentPath, file);
      const stat = fs.statSync(filePath);

      if (stat.isDirectory()) {
        if (!file.startsWith(".") && !file.includes("node_modules")) {
          walk(filePath);
        }
      } else if (file.match(pattern)) {
        const result = scanFile(filePath);
        if (result) {
          results.push(result);
        }
      }
    });
  }

  walk(dir);
  return results;
}

// Scan API routes
console.log("🔍 Scanning API routes...\n");
const apiRoutes = scanDirectory(
  path.join(rootDir, "src/app/api"),
  /route\.(ts|tsx)$/
);

// Scan components
console.log("🔍 Scanning components...\n");
const components = scanDirectory(
  path.join(rootDir, "src/components"),
  /\.(ts|tsx)$/
);

// Scan pages
console.log("🔍 Scanning pages...\n");
const pages = scanDirectory(path.join(rootDir, "src/app"), /page\.(ts|tsx)$/);

// Generate report
console.log("📊 AUDIT REPORT");
console.log("=".repeat(80));
console.log("");

const allResults = [...apiRoutes, ...pages, ...components];
const highSeverity = allResults.filter((r) =>
  r.issues.some((i) => i.severity === "HIGH")
);
const mediumSeverity = allResults.filter((r) =>
  r.issues.some((i) => i.severity === "MEDIUM")
);

console.log(`Total files scanned: ${allResults.length}`);
console.log(`High severity issues: ${highSeverity.length}`);
console.log(`Medium severity issues: ${mediumSeverity.length}`);
console.log("");

if (highSeverity.length > 0) {
  console.log("🚨 HIGH SEVERITY ISSUES:");
  console.log("-".repeat(80));
  highSeverity.forEach((result) => {
    console.log(`\n📁 ${result.file}`);
    result.issues.forEach((issue) => {
      if (issue.severity === "HIGH") {
        console.log(`   ⚠️  ${issue.message}`);
        if (issue.fields) {
          console.log(`      Fields: ${issue.fields.join(", ")}`);
        }
      }
    });
  });
  console.log("");
}

if (mediumSeverity.length > 0) {
  console.log("⚠️  MEDIUM SEVERITY ISSUES:");
  console.log("-".repeat(80));
  mediumSeverity.forEach((result) => {
    console.log(`\n📁 ${result.file}`);
    result.issues.forEach((issue) => {
      if (issue.severity === "MEDIUM") {
        console.log(`   ⚡ ${issue.message}`);
        if (issue.fields) {
          console.log(
            `      Fields: ${issue.fields.slice(0, 5).join(", ")}${issue.fields.length > 5 ? "..." : ""}`
          );
        }
      }
    });
  });
  console.log("");
}

// Summary recommendations
console.log("💡 RECOMMENDATIONS:");
console.log("-".repeat(80));
if (highSeverity.length > 0) {
  console.log(
    "1. Fix HIGH severity issues immediately - they will cause data display bugs"
  );
}
if (mediumSeverity.length > 0) {
  console.log(
    "2. Review MEDIUM severity issues - may need transformation utilities"
  );
}
console.log("3. Run validation in development mode to catch runtime issues");
console.log(
  "4. Use transformToCamel/transformToSnake from /src/lib/case-transform.ts"
);
console.log("5. Add devValidate() calls to verify transformations");
console.log("");

// Export detailed report to JSON
const reportPath = path.join(rootDir, "audit-report.json");
fs.writeFileSync(
  reportPath,
  JSON.stringify(
    {
      timestamp: new Date().toISOString(),
      summary: {
        totalFiles: allResults.length,
        highSeverity: highSeverity.length,
        mediumSeverity: mediumSeverity.length,
      },
      results: allResults,
    },
    null,
    2
  )
);

console.log(`📄 Detailed report saved to: audit-report.json`);
console.log("");

process.exit(highSeverity.length > 0 ? 1 : 0);
