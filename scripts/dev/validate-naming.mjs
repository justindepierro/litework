#!/usr/bin/env node

/**
 * Naming Convention Validator
 *
 * Enforces consistent naming conventions across the codebase:
 * - Database columns: snake_case
 * - TypeScript: camelCase (variables, functions, properties)
 * - Components: PascalCase
 * - Files: kebab-case.tsx (utilities), PascalCase.tsx (components)
 * - Constants: SCREAMING_SNAKE_CASE
 *
 * Run: node scripts/cleanup/validate-naming.mjs
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

const RULES = {
  // Database field naming (should be snake_case)
  database: {
    pattern: /^[a-z][a-z0-9_]*$/,
    description: "snake_case",
    example: "user_id, created_at, workout_plan",
  },

  // TypeScript variable/function naming (should be camelCase)
  typescript: {
    pattern: /^[a-z][a-zA-Z0-9]*$/,
    description: "camelCase",
    example: "userId, createdAt, workoutPlan",
  },

  // Component naming (should be PascalCase)
  component: {
    pattern: /^[A-Z][a-zA-Z0-9]*$/,
    description: "PascalCase",
    example: "WorkoutEditor, UserProfile, ExerciseList",
  },

  // Constant naming (should be SCREAMING_SNAKE_CASE)
  constant: {
    pattern: /^[A-Z][A-Z0-9_]*$/,
    description: "SCREAMING_SNAKE_CASE",
    example: "MAX_EXERCISES, API_URL, DEFAULT_TIMEOUT",
  },

  // File naming
  file: {
    componentFile: /^[A-Z][a-zA-Z0-9]*\.tsx$/, // PascalCase.tsx
    utilityFile: /^[a-z][a-z0-9-]*\.(ts|tsx)$/, // kebab-case.ts
    description: "PascalCase.tsx for components, kebab-case.ts for utilities",
    example: "WorkoutEditor.tsx, api-client.ts, auth-utils.ts",
  },
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

// ============================================================================
// Validation Functions
// ============================================================================

function validateDatabaseNaming() {
  log("\n=== Validating Database Field Names ===\n", "info");

  const issues = [];

  // Check SQL schema files
  const schemaFiles = [
    "database/schema.sql",
    "database-export/schema-dump.sql",
  ];

  schemaFiles.forEach((file) => {
    const filePath = path.join(ROOT, file);
    if (!fs.existsSync(filePath)) return;

    const content = fs.readFileSync(filePath, "utf-8");
    const lines = content.split("\n");

    lines.forEach((line, index) => {
      // Match column definitions (simplified)
      const columnMatch = line.match(
        /^\s+([a-zA-Z_][a-zA-Z0-9_]*)\s+(text|varchar|integer|bigint|timestamp|boolean|jsonb|uuid)/i
      );

      if (columnMatch) {
        const columnName = columnMatch[1];

        // Check if follows snake_case
        if (!RULES.database.pattern.test(columnName)) {
          issues.push({
            file,
            line: index + 1,
            name: columnName,
            expected: "snake_case",
            severity: "error",
          });
        }
      }
    });
  });

  if (issues.length === 0) {
    log("✓ All database field names follow snake_case", "success");
  } else {
    log(`⚠ Found ${issues.length} database naming issues:`, "warning");
    issues.forEach((issue) => {
      console.log(
        `  ${issue.file}:${issue.line} - "${issue.name}" should be ${issue.expected}`
      );
    });
  }

  return issues;
}

function validateTypeScriptNaming() {
  log("\n=== Validating TypeScript Naming Conventions ===\n", "info");

  const issues = [];

  // Check for snake_case in TypeScript files (likely database field leakage)
  try {
    const result = execSync(
      `grep -rn "[^_][a-z]+_[a-z]" ${ROOT}/src --include="*.ts" --include="*.tsx" | grep -v "snake_case" | grep -v "camelCase" | head -20`,
      { encoding: "utf-8" }
    );

    const matches = result.trim().split("\n").filter(Boolean);

    matches.forEach((match) => {
      const [location, ...rest] = match.split(":");
      const content = rest.join(":");

      // Filter out comments and strings
      if (!content.includes("//") && !content.includes("/*")) {
        issues.push({
          location,
          content: content.trim(),
          type: "snake_case_in_typescript",
          severity: "warning",
        });
      }
    });
  } catch (error) {
    // No matches found (good!)
  }

  if (issues.length === 0) {
    log("✓ No snake_case found in TypeScript files", "success");
  } else {
    log(
      `⚠ Found ${issues.length} potential snake_case issues in TypeScript:`,
      "warning"
    );
    issues.slice(0, 10).forEach((issue) => {
      console.log(`  ${issue.location}`);
      console.log(`    ${issue.content}`);
    });
    if (issues.length > 10) {
      console.log(`  ... and ${issues.length - 10} more`);
    }
  }

  return issues;
}

function validateFileNaming() {
  log("\n=== Validating File Naming Conventions ===\n", "info");

  const issues = [];

  // Get all TypeScript files
  const files = execSync(
    `find ${ROOT}/src -type f \\( -name "*.ts" -o -name "*.tsx" \\) | grep -v ".d.ts"`,
    { encoding: "utf-8" }
  )
    .trim()
    .split("\n")
    .filter(Boolean);

  files.forEach((file) => {
    const basename = path.basename(file);
    const dir = path.dirname(file);

    // Skip special files
    if (
      [
        "layout.tsx",
        "page.tsx",
        "route.ts",
        "error.tsx",
        "loading.tsx",
        "not-found.tsx",
      ].includes(basename)
    ) {
      return;
    }

    // Determine expected pattern based on directory
    const isComponent = dir.includes("/components") || dir.includes("/app/");
    const isUtility =
      dir.includes("/lib") || dir.includes("/utils") || dir.includes("/hooks");

    let valid = false;
    let expectedPattern = "";

    if (isComponent && basename.endsWith(".tsx")) {
      // Components should be PascalCase.tsx
      valid = RULES.file.componentFile.test(basename);
      expectedPattern = "PascalCase.tsx";
    } else if (isUtility) {
      // Utilities should be kebab-case.ts
      valid = RULES.file.utilityFile.test(basename);
      expectedPattern = "kebab-case.ts";
    } else {
      // Default to either pattern
      valid =
        RULES.file.componentFile.test(basename) ||
        RULES.file.utilityFile.test(basename);
      expectedPattern = "PascalCase.tsx or kebab-case.ts";
    }

    if (!valid) {
      issues.push({
        file: path.relative(ROOT, file),
        name: basename,
        expected: expectedPattern,
        severity: "warning",
      });
    }
  });

  if (issues.length === 0) {
    log("✓ All files follow naming conventions", "success");
  } else {
    log(`⚠ Found ${issues.length} file naming issues:`, "warning");
    issues.slice(0, 15).forEach((issue) => {
      console.log(`  ${issue.file}`);
      console.log(`    Expected: ${issue.expected}`);
    });
    if (issues.length > 15) {
      console.log(`  ... and ${issues.length - 15} more`);
    }
  }

  return issues;
}

function validateDatabaseTransformations() {
  log("\n=== Validating Database Transformation Usage ===\n", "info");

  // Check that API routes use transformation utilities
  const apiRoutes = execSync(`find ${ROOT}/src/app/api -name "route.ts"`, {
    encoding: "utf-8",
  })
    .trim()
    .split("\n")
    .filter(Boolean);

  const issues = [];

  apiRoutes.forEach((file) => {
    const content = fs.readFileSync(file, "utf-8");

    // Check if file queries database
    const hasSupabaseQuery = /supabase\.from\(/.test(content);

    if (hasSupabaseQuery) {
      // Check if it uses transformation utilities
      const usesTransform =
        /transformFromDatabase|transformToDatabase|case-transform/.test(
          content
        );
      const usesService = /database-service/.test(content);

      if (!usesTransform && !usesService) {
        issues.push({
          file: path.relative(ROOT, file),
          issue: "Database query without transformation utilities",
          severity: "warning",
          suggestion:
            "Import and use transformFromDatabase/transformToDatabase",
        });
      }
    }
  });

  if (issues.length === 0) {
    log("✓ All API routes properly use database transformations", "success");
  } else {
    log(
      `⚠ Found ${issues.length} API routes that may need transformation utilities:`,
      "warning"
    );
    issues.forEach((issue) => {
      console.log(`  ${issue.file}`);
      console.log(`    ${issue.suggestion}`);
    });
  }

  return issues;
}

// ============================================================================
// Report Generation
// ============================================================================

function generateReport(results) {
  const { databaseIssues, typescriptIssues, fileIssues, transformIssues } =
    results;

  const totalIssues =
    databaseIssues.length +
    typescriptIssues.length +
    fileIssues.length +
    transformIssues.length;

  const report = `
# Naming Convention Validation Report
**Generated**: ${new Date().toISOString()}

## Summary
- Database field issues: ${databaseIssues.length}
- TypeScript snake_case leaks: ${typescriptIssues.length}
- File naming issues: ${fileIssues.length}
- Database transformation issues: ${transformIssues.length}
- **Total Issues**: ${totalIssues}

## Naming Convention Standards

### Database (PostgreSQL)
- **Pattern**: snake_case
- **Example**: \`user_id\`, \`created_at\`, \`workout_plan\`
- **Why**: PostgreSQL convention, case-insensitive by default

### TypeScript/JavaScript
- **Variables/Functions**: camelCase
- **Example**: \`userId\`, \`createdAt\`, \`workoutPlan\`
- **Components**: PascalCase
- **Example**: \`WorkoutEditor\`, \`UserProfile\`
- **Constants**: SCREAMING_SNAKE_CASE
- **Example**: \`MAX_EXERCISES\`, \`API_URL\`

### Files
- **Components**: PascalCase.tsx
- **Example**: \`WorkoutEditor.tsx\`, \`UserProfile.tsx\`
- **Utilities**: kebab-case.ts
- **Example**: \`api-client.ts\`, \`auth-utils.ts\`

## Database Transformation Layer

We have utilities to handle snake_case ↔ camelCase conversion:
- \`src/lib/case-transform.ts\` - Conversion functions
- \`src/lib/database-service.ts\` - Automatic transformations
- \`src/lib/db-validation.ts\` - Validation

**Usage in API routes**:
\`\`\`typescript
import { transformFromDatabase, transformToDatabase } from '@/lib/case-transform';

// After database query
const data = await supabase.from('workout_plans').select('*');
const transformed = data.data?.map(transformFromDatabase);

// Before database insert/update
const dbData = transformToDatabase(frontendData);
await supabase.from('workout_plans').insert(dbData);
\`\`\`

## Issues Found

### Database Field Names
${databaseIssues.length === 0 ? "✓ No issues" : databaseIssues.map((i) => `- ${i.file}:${i.line} - "${i.name}" should be ${i.expected}`).join("\n")}

### TypeScript snake_case Leaks
${typescriptIssues.length === 0 ? "✓ No issues" : `Found ${typescriptIssues.length} potential snake_case in TypeScript files`}

### File Naming
${fileIssues.length === 0 ? "✓ No issues" : `Found ${fileIssues.length} files with naming issues`}

### Database Transformation Usage
${transformIssues.length === 0 ? "✓ All routes use transformations" : `${transformIssues.length} routes may need transformation utilities`}

## Recommendations

${
  totalIssues === 0
    ? "✅ Excellent! All naming conventions are followed correctly."
    : `
1. Review and fix ${totalIssues} naming issues above
2. Use transformation utilities in all API routes that query the database
3. Run this validator regularly during development
4. Add pre-commit hook to enforce naming conventions
`
}
`;

  const reportPath = path.join(ROOT, "docs/NAMING_VALIDATION_REPORT.md");
  fs.writeFileSync(reportPath, report);

  log(`\n✓ Report generated: docs/NAMING_VALIDATION_REPORT.md`, "success");

  return totalIssues;
}

// ============================================================================
// Main Execution
// ============================================================================

async function main() {
  log("🔍 Naming Convention Validator\n", "info");

  const databaseIssues = validateDatabaseNaming();
  const typescriptIssues = validateTypeScriptNaming();
  const fileIssues = validateFileNaming();
  const transformIssues = validateDatabaseTransformations();

  const totalIssues = generateReport({
    databaseIssues,
    typescriptIssues,
    fileIssues,
    transformIssues,
  });

  if (totalIssues === 0) {
    log("\n✅ All naming conventions are correct!", "success");
  } else {
    log(`\n⚠️  Found ${totalIssues} naming issues`, "warning");
    log("Review the report: docs/NAMING_VALIDATION_REPORT.md", "info");
  }
}

main().catch((error) => {
  log(`Error: ${error.message}`, "error");
  console.error(error);
  process.exit(1);
});
