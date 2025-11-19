#!/usr/bin/env node

/**
 * Unified deployment verification script
 *
 * Usage examples:
 *   node scripts/deployment/deploy-verify.mjs                # Local run (npm install)
 *   node scripts/deployment/deploy-verify.mjs --ci           # CI run (npm ci)
 *   node scripts/deployment/deploy-verify.mjs --skip-install # Re-use existing node_modules
 *   node scripts/deployment/deploy-verify.mjs --with-tests   # Also run npm test
 *   node scripts/deployment/deploy-verify.mjs --with-perf-audit # Run performance audit script after build
 */

import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "../..");

const args = process.argv.slice(2);
const flags = new Set(args);

const isCI = flags.has("--ci");
const skipInstall = flags.has("--skip-install");
const skipTests = !flags.has("--with-tests");
const runAudit = flags.has("--audit");
const verbose = flags.has("--verbose");
const runPerfAudit = flags.has("--with-perf-audit");

const envFlag = args.find((arg) => arg.startsWith("--env="));
const envFile = envFlag ? envFlag.split("=")[1] : ".env.local";
const envPath = path.join(projectRoot, envFile);

const requiredEnvVars = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
];

const log = (message) => console.log(message);

const logStep = (title) => {
  log(`\n\u2728 ${title}`);
  log("".padStart(title.length + 4, "="));
};

function runCommand(command, description) {
  log(`\n▶ ${description}`);
  if (verbose) {
    log(`$ ${command}`);
  }

  execSync(command, {
    cwd: projectRoot,
    stdio: "inherit",
    env: process.env,
  });
}

function ensureProjectRoot() {
  const packageJsonPath = path.join(projectRoot, "package.json");
  if (!fs.existsSync(packageJsonPath)) {
    throw new Error("package.json not found. Run from repo root.");
  }
}

function loadEnvFile() {
  if (!fs.existsSync(envPath)) {
    throw new Error(
      `Environment file '${envFile}' not found. Pass --env=<path> if needed.`
    );
  }

  const result = dotenv.config({ path: envPath });
  if (result.error) {
    throw result.error;
  }

  const missing = requiredEnvVars.filter((key) => {
    const value = process.env[key];
    return !value || value.trim().length === 0;
  });

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables in ${envFile}: ${missing.join(", ")}`
    );
  }
}

function getPackageJson() {
  const pkgPath = path.join(projectRoot, "package.json");
  return JSON.parse(fs.readFileSync(pkgPath, "utf8"));
}

async function main() {
  try {
    ensureProjectRoot();
    logStep("Validating environment");
    loadEnvFile();
    log("✅ Environment variables loaded");

    if (!skipInstall) {
      const installCommand = isCI ? "npm ci" : "npm install --prefer-offline";
      logStep(
        isCI ? "Installing dependencies (npm ci)" : "Installing dependencies"
      );
      runCommand(installCommand, "Installing project dependencies");
    } else {
      log("⚠️  Skipping dependency installation (--skip-install)");
    }

    const pkg = getPackageJson();
    const steps = [];

    if (pkg.scripts?.lint) {
      steps.push({ command: "npm run lint", description: "Running ESLint" });
    }

    if (pkg.scripts?.typecheck) {
      steps.push({
        command: "npm run typecheck",
        description: "Running TypeScript typecheck",
      });
    }

    if (!skipTests && pkg.scripts?.test) {
      steps.push({ command: "npm run test", description: "Running tests" });
    } else if (skipTests) {
      log("⚠️  Skipping tests (use --with-tests to include)");
    }

    steps.push({
      command: "npm run build",
      description: "Building Next.js app",
    });

    for (const step of steps) {
      logStep(step.description);
      runCommand(step.command, step.description);
      log("✅ Success");
    }

    if (runPerfAudit) {
      logStep("Running performance audit");
      runCommand(
        "node ./scripts/analysis/audit-performance.mjs",
        "Performance audit"
      );
      log("✅ Performance audit complete");
    }

    if (runAudit) {
      logStep("Running npm audit");
      try {
        runCommand("npm audit --audit-level=moderate", "Security audit");
        log("✅ npm audit passed");
      } catch (error) {
        log("⚠️  npm audit reported issues (review required)");
        throw error;
      }
    }

    log("\n\u2705 Deployment verification complete");
  } catch (error) {
    console.error(
      "\n❌ Deployment verification failed:",
      error instanceof Error ? error.message : error
    );
    process.exit(1);
  }
}

await main();
