#!/usr/bin/env node

/**
 * Production Cleanup Script
 * Comprehensive cleanup for production deployment
 */

import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "../..");

console.log("🚀 Starting Production Cleanup...\n");

const issues = [];
let fixedCount = 0;

// Helper to run commands
function run(command, description) {
  console.log(`⚙️  ${description}...`);
  try {
    const output = execSync(command, {
      cwd: projectRoot,
      encoding: "utf8",
      stdio: "pipe",
    });
    console.log(`✅ ${description} complete\n`);
    return output;
  } catch (error) {
    console.log(`⚠️  ${description} had issues\n`);
    return error.stdout || error.stderr || error.message;
  }
}

// 1. Check TypeScript
console.log("📝 STEP 1: TypeScript Check");
const tsOutput = run("npm run typecheck", "TypeScript compilation");
if (tsOutput.includes("error TS")) {
  issues.push("TypeScript errors found");
  console.log(tsOutput);
} else {
  console.log("✅ No TypeScript errors!\n");
}

// 2. Run ESLint with auto-fix
console.log("🔍 STEP 2: ESLint Auto-fix");
try {
  execSync("npm run lint -- --fix", {
    cwd: projectRoot,
    stdio: "inherit",
  });
  fixedCount++;
  console.log("✅ ESLint auto-fix complete\n");
} catch (error) {
  console.log("⚠️  Some ESLint issues could not be auto-fixed\n");
}

// 3. Search for console.logs
console.log("🔎 STEP 3: Searching for console.log statements");
const consoleLogFiles = [];
function searchConsoleLogs(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      if (
        !file.startsWith(".") &&
        file !== "node_modules" &&
        file !== "out" &&
        file !== "build"
      ) {
        searchConsoleLogs(filePath);
      }
    } else if (
      file.endsWith(".ts") ||
      file.endsWith(".tsx") ||
      file.endsWith(".js") ||
      file.endsWith(".jsx")
    ) {
      const content = fs.readFileSync(filePath, "utf8");
      const lines = content.split("\n");
      lines.forEach((line, index) => {
        if (line.includes("console.log") && !line.trim().startsWith("//")) {
          consoleLogFiles.push({
            file: filePath.replace(projectRoot + "/", ""),
            line: index + 1,
            content: line.trim(),
          });
        }
      });
    }
  }
}

searchConsoleLogs(path.join(projectRoot, "src"));
if (consoleLogFiles.length > 0) {
  console.log(`⚠️  Found ${consoleLogFiles.length} console.log statements:`);
  consoleLogFiles.slice(0, 10).forEach((item) => {
    console.log(`   ${item.file}:${item.line}`);
  });
  if (consoleLogFiles.length > 10) {
    console.log(`   ... and ${consoleLogFiles.length - 10} more`);
  }
  issues.push(`${consoleLogFiles.length} console.log statements found`);
} else {
  console.log("✅ No console.log statements found\n");
}

// 4. Check for TODO/FIXME comments
console.log("\n📋 STEP 4: Searching for TODO/FIXME comments");
const todoFiles = [];
function searchTodos(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      if (
        !file.startsWith(".") &&
        file !== "node_modules" &&
        file !== "out" &&
        file !== "build"
      ) {
        searchTodos(filePath);
      }
    } else if (
      file.endsWith(".ts") ||
      file.endsWith(".tsx") ||
      file.endsWith(".js") ||
      file.endsWith(".jsx")
    ) {
      const content = fs.readFileSync(filePath, "utf8");
      const lines = content.split("\n");
      lines.forEach((line, index) => {
        if (line.includes("TODO") || line.includes("FIXME")) {
          todoFiles.push({
            file: filePath.replace(projectRoot + "/", ""),
            line: index + 1,
            content: line.trim(),
          });
        }
      });
    }
  }
}

searchTodos(path.join(projectRoot, "src"));
if (todoFiles.length > 0) {
  console.log(`📝 Found ${todoFiles.length} TODO/FIXME comments:`);
  todoFiles.slice(0, 5).forEach((item) => {
    console.log(`   ${item.file}:${item.line}`);
    console.log(`      ${item.content.substring(0, 80)}`);
  });
  if (todoFiles.length > 5) {
    console.log(`   ... and ${todoFiles.length - 5} more`);
  }
} else {
  console.log("✅ No TODO/FIXME comments found\n");
}

// 5. Check for .env.example
console.log("\n🔐 STEP 5: Environment Variables Check");
const envExample = path.join(projectRoot, ".env.example");
const envLocal = path.join(projectRoot, ".env.local");

if (!fs.existsSync(envExample)) {
  issues.push(".env.example file missing");
  console.log("⚠️  .env.example file not found");
} else {
  console.log("✅ .env.example exists");
}

if (!fs.existsSync(envLocal)) {
  console.log("⚠️  .env.local file not found (may be expected)");
} else {
  console.log("✅ .env.local exists");
}

// 6. Run production build test
console.log("\n🏗️  STEP 6: Production Build Test");
try {
  execSync("npm run build", {
    cwd: projectRoot,
    stdio: "inherit",
  });
  console.log("✅ Production build successful!\n");
  fixedCount++;
} catch (error) {
  issues.push("Production build failed");
  console.log("❌ Production build failed\n");
}

// 7. Check package.json scripts
console.log("📦 STEP 7: Package.json Check");
const packageJson = JSON.parse(
  fs.readFileSync(path.join(projectRoot, "package.json"), "utf8")
);
const requiredScripts = ["dev", "build", "start", "lint", "typecheck"];
const missingScripts = requiredScripts.filter((s) => !packageJson.scripts[s]);

if (missingScripts.length > 0) {
  issues.push(`Missing scripts: ${missingScripts.join(", ")}`);
  console.log(`⚠️  Missing scripts: ${missingScripts.join(", ")}`);
} else {
  console.log("✅ All required scripts present\n");
}

// Summary
console.log("\n" + "=".repeat(50));
console.log("📊 CLEANUP SUMMARY");
console.log("=".repeat(50));
console.log(`✅ Auto-fixed items: ${fixedCount}`);
console.log(`⚠️  Issues found: ${issues.length}`);

if (issues.length > 0) {
  console.log("\n⚠️  Issues requiring attention:");
  issues.forEach((issue, index) => {
    console.log(`   ${index + 1}. ${issue}`);
  });
}

console.log("\n" + "=".repeat(50));

if (issues.length === 0) {
  console.log("🎉 Production cleanup complete! Ready to deploy!");
} else {
  console.log(
    "⚠️  Please review and fix the issues above before deploying."
  );
}

console.log("=".repeat(50) + "\n");

process.exit(issues.length > 0 ? 1 : 0);
