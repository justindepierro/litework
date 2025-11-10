#!/usr/bin/env node

/**
 * API Error Migration Helper
 * Analyzes API routes and suggests error system migrations
 */

import { readFileSync, readdirSync, statSync } from "fs";
import { join, relative } from "path";

const ROOT_DIR = process.cwd();
const API_DIR = join(ROOT_DIR, "src", "app", "api");

const stats = {
  totalRoutes: 0,
  alreadyMigrated: 0,
  needsMigration: 0,
  priorities: {
    high: [],
    medium: [],
    low: [],
  },
};

// High-traffic endpoints based on typical usage
const HIGH_TRAFFIC = [
  "assignments",
  "sessions",
  "workouts",
  "analytics",
  "dashboard",
];
const MEDIUM_TRAFFIC = ["athletes", "groups", "kpis", "progress", "exercises"];

console.log("🔍 API Error System Migration Analysis\n");

function analyzeRoute(filePath) {
  const content = readFileSync(filePath, "utf-8");
  const relativePath = relative(ROOT_DIR, filePath);

  // Check if already using new error system
  const usesNewSystem =
    content.includes('from "@/lib/api-errors"') ||
    content.includes("from '@/lib/api-errors'");

  // Count manual error responses
  const manualErrors = (
    content.match(
      /NextResponse\.json\([^)]*error[^)]*\{[^}]*status:[^}]*\d+/g
    ) || []
  ).length;
  const hasManualAuth = content.match(/return NextResponse\.json.*401/);
  const hasManual404 = content.match(/return NextResponse\.json.*404/);
  const hasManual500 = content.match(/return NextResponse\.json.*500/);

  stats.totalRoutes++;

  if (usesNewSystem) {
    stats.alreadyMigrated++;
    return null;
  }

  if (manualErrors === 0) {
    return null; // No errors to migrate
  }

  stats.needsMigration++;

  // Determine priority based on path and error count
  const pathParts = relativePath.split("/");
  let priority = "low";

  for (const part of pathParts) {
    if (HIGH_TRAFFIC.some((p) => part.includes(p))) {
      priority = "high";
      break;
    }
    if (MEDIUM_TRAFFIC.some((p) => part.includes(p))) {
      priority = "medium";
    }
  }

  return {
    path: relativePath,
    priority,
    manualErrors,
    hasManualAuth: !!hasManualAuth,
    hasManual404: !!hasManual404,
    hasManual500: !!hasManual500,
    suggestions: generateSuggestions(hasManualAuth, hasManual404, hasManual500),
  };
}

function generateSuggestions(hasAuth, has404, has500) {
  const suggestions = [];

  if (hasAuth) {
    suggestions.push("Replace auth checks with authenticationError()");
  }
  if (has404) {
    suggestions.push('Replace 404s with errorResponse("NOT_FOUND")');
  }
  if (has500) {
    suggestions.push('Replace 500s with errorResponse("INTERNAL_ERROR")');
  }

  return suggestions;
}

function walkDir(dir) {
  try {
    const files = readdirSync(dir);
    files.forEach((file) => {
      const filePath = join(dir, file);
      const stat = statSync(filePath);
      if (stat.isDirectory()) {
        walkDir(filePath);
      } else if (file === "route.ts") {
        const result = analyzeRoute(filePath);
        if (result) {
          stats.priorities[result.priority].push(result);
        }
      }
    });
  } catch (e) {
    // Skip if directory doesn't exist
  }
}

walkDir(API_DIR);

console.log("📊 Migration Statistics\n");
console.log("═".repeat(60));
console.log(`Total API Routes:      ${stats.totalRoutes}`);
console.log(`Already Migrated:      ${stats.alreadyMigrated} ✅`);
console.log(`Need Migration:        ${stats.needsMigration}`);
console.log("═".repeat(60));

if (stats.needsMigration > 0) {
  console.log("\n🔴 HIGH PRIORITY (High-traffic routes)\n");
  if (stats.priorities.high.length === 0) {
    console.log("  ✅ All high-priority routes migrated!\n");
  } else {
    stats.priorities.high.forEach((route) => {
      console.log(`  ${route.path}`);
      console.log(`    Errors: ${route.manualErrors}`);
      route.suggestions.forEach((s) => console.log(`    • ${s}`));
      console.log("");
    });
  }

  console.log("🟡 MEDIUM PRIORITY\n");
  if (stats.priorities.medium.length === 0) {
    console.log("  ✅ All medium-priority routes migrated!\n");
  } else {
    stats.priorities.medium.slice(0, 5).forEach((route) => {
      console.log(`  ${route.path} (${route.manualErrors} errors)`);
    });
    if (stats.priorities.medium.length > 5) {
      console.log(`  ... and ${stats.priorities.medium.length - 5} more\n`);
    }
  }

  console.log("🟢 LOW PRIORITY\n");
  console.log(`  ${stats.priorities.low.length} routes\n`);
}

console.log("💡 Migration Steps:\n");
console.log(
  '1. Add import: import { errorResponse, authenticationError } from "@/lib/api-errors"'
);
console.log('2. Replace: NextResponse.json({ error: "..." }, { status: 401 })');
console.log("   With:    authenticationError()");
console.log('3. Replace: NextResponse.json({ error: "..." }, { status: 404 })');
console.log('   With:    errorResponse("NOT_FOUND", "Custom message")');
console.log("4. Test endpoint after migration");
console.log("5. Repeat for next route\n");

process.exit(0);
