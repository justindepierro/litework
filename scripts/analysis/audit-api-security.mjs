#!/usr/bin/env node

/**
 * Security Audit Script
 *
 * Checks all API routes for:
 * 1. Proper authentication (withAuth, withPermission, withRole)
 * 2. Identifies potentially unprotected routes
 * 3. Verifies public routes are intentionally public
 */

import { readFileSync, readdirSync, statSync } from "fs";
import { join } from "path";

// Colors for terminal output
const colors = {
  reset: "\x1b[0m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
};

// Routes that are intentionally public
const PUBLIC_ROUTES = [
  "/api/health", // Health check
  "/api/invites/accept", // Public invite acceptance
  "/api/invites/validate", // Public invite validation
  "/api/cron", // Cron jobs (should have secret token check)
  "/api/auth/diagnose", // Debug endpoint (should be removed in production)
];

// Authentication patterns to look for
const AUTH_PATTERNS = [
  "withAuth",
  "withPermission",
  "withRole",
  "requireAuth",
  "requirePermission",
];

// RouteInfo structure:
// {
//   path: string,
//   methods: string[],
//   hasAuth: boolean,
//   authType: string | null,
//   isPublic: boolean,
// }

function getAllRoutes(dir, baseDir = dir) {
  const routes = [];
  const items = readdirSync(dir);

  for (const item of items) {
    const fullPath = join(dir, item);
    const stat = statSync(fullPath);

    if (stat.isDirectory()) {
      routes.push(...getAllRoutes(fullPath, baseDir));
    } else if (item === "route.ts") {
      const content = readFileSync(fullPath, "utf-8");
      const relativePath = fullPath
        .replace(baseDir, "")
        .replace("/route.ts", "")
        .replace(/\[([^\]]+)\]/g, ":$1"); // Convert [id] to :id

      // Extract HTTP methods
      const methods = [];
      const methodRegex =
        /export\s+async\s+function\s+(GET|POST|PUT|DELETE|PATCH)/g;
      let match;
      while ((match = methodRegex.exec(content)) !== null) {
        methods.push(match[1]);
      }

      // Check for authentication
      let hasAuth = false;
      let authType = null;

      for (const pattern of AUTH_PATTERNS) {
        if (content.includes(pattern)) {
          hasAuth = true;
          authType = pattern;
          break;
        }
      }

      // Check if route is intentionally public
      const isPublic = PUBLIC_ROUTES.some((pubRoute) =>
        relativePath.startsWith(pubRoute)
      );

      routes.push({
        path: relativePath,
        methods,
        hasAuth,
        authType,
        isPublic,
      });
    }
  }

  return routes;
}

function analyzeRoutes() {
  console.log(`${colors.cyan}🔍 LiteWork API Security Audit${colors.reset}\n`);

  const apiDir = join(process.cwd(), "src/app/api");
  const routes = getAllRoutes(apiDir);

  const protectedRoutes = routes.filter((r) => r.hasAuth);
  const unprotectedRoutes = routes.filter((r) => !r.hasAuth && !r.isPublic);
  const publicRoutes = routes.filter((r) => !r.hasAuth && r.isPublic);

  console.log(`📊 Summary:`);
  console.log(`   Total routes: ${routes.length}`);
  console.log(
    `   ${colors.green}✓ Protected: ${protectedRoutes.length}${colors.reset}`
  );
  console.log(
    `   ${colors.yellow}⚠ Unprotected: ${unprotectedRoutes.length}${colors.reset}`
  );
  console.log(
    `   ${colors.blue}ℹ Public (intentional): ${publicRoutes.length}${colors.reset}\n`
  );

  // Show unprotected routes that need attention
  if (unprotectedRoutes.length > 0) {
    console.log(
      `${colors.red}❌ UNPROTECTED ROUTES (Need Review):${colors.reset}`
    );
    unprotectedRoutes.forEach((route) => {
      console.log(`   ${colors.red}✗${colors.reset} ${route.path}`);
      console.log(`      Methods: ${route.methods.join(", ")}`);
    });
    console.log();
  }

  // Show public routes for verification
  if (publicRoutes.length > 0) {
    console.log(
      `${colors.blue}ℹ PUBLIC ROUTES (Verify intentional):${colors.reset}`
    );
    publicRoutes.forEach((route) => {
      console.log(`   ${colors.blue}○${colors.reset} ${route.path}`);
      console.log(`      Methods: ${route.methods.join(", ")}`);
    });
    console.log();
  }

  // Show protected routes summary
  console.log(`${colors.green}✓ PROTECTED ROUTES:${colors.reset}`);
  const authTypes = protectedRoutes.reduce((acc, route) => {
    const type = route.authType || "unknown";
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {});

  Object.entries(authTypes).forEach(([type, count]) => {
    console.log(`   ${type}: ${count} routes`);
  });
  console.log();

  // Recommendations
  console.log(`${colors.yellow}📋 Recommendations:${colors.reset}`);

  if (unprotectedRoutes.length > 0) {
    console.log(
      `   ${colors.red}1. CRITICAL: Review ${unprotectedRoutes.length} unprotected routes${colors.reset}`
    );
    console.log(`      Add withAuth() wrapper or mark as intentionally public`);
  } else {
    console.log(
      `   ${colors.green}1. ✓ All non-public routes are protected${colors.reset}`
    );
  }

  console.log(`   2. Verify public routes truly need to be public`);
  console.log(`   3. Consider adding rate limiting to public endpoints`);
  console.log(`   4. Verify cron jobs use secret token authentication`);
  console.log(`   5. Remove debug endpoints before production deployment`);
  console.log();

  // Exit with error if unprotected routes found
  if (unprotectedRoutes.length > 0) {
    process.exit(1);
  } else {
    console.log(`${colors.green}✅ Security audit passed!${colors.reset}\n`);
    process.exit(0);
  }
}

// Run the audit
analyzeRoutes();
