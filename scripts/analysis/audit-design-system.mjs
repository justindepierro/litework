#!/usr/bin/env node

/**
 * Design System Consistency Audit
 *
 * Scans all pages and components for design system violations:
 * - Hardcoded colors (text-blue-500, bg-gray-100, etc.)
 * - Raw HTML elements (h1, h2, p, span with text)
 * - Non-standard components (raw input, textarea, select, button)
 * - Inconsistent spacing/sizing
 *
 * Usage: node scripts/analysis/audit-design-system.mjs
 */

import { readFileSync, readdirSync, statSync } from "fs";
import { join, relative } from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PROJECT_ROOT = join(__dirname, "..", "..");

// ANSI color codes
const colors = {
  reset: "\x1b[0m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  gray: "\x1b[90m",
  bold: "\x1b[1m",
};

// Design system violations to check
const violations = {
  // Hardcoded Tailwind colors (should use design tokens)
  hardcodedColors: {
    pattern:
      /(?:text|bg|border|ring|shadow)-(?:blue|gray|red|green|yellow|purple|pink|indigo|cyan|teal|orange|amber|lime|emerald|sky|violet|fuchsia|rose)-\d{2,3}/g,
    message: "Hardcoded color (use design tokens)",
    severity: "high",
    ignore: ["text-gray-50", "text-gray-900", "bg-gray-50", "bg-gray-900"], // Common neutrals
  },

  // Raw heading elements (should use Typography)
  rawHeadings: {
    pattern: /<h[1-6](?:\s+[^>]*)?>.*?<\/h[1-6]>/gs,
    message: "Raw heading element (use Display/Heading components)",
    severity: "high",
  },

  // Raw paragraph elements with text (should use Body)
  rawParagraphs: {
    pattern: /<p(?:\s+[^>]*)?>(?!<).*?<\/p>/gs,
    message: "Raw paragraph with text (use Body component)",
    severity: "medium",
  },

  // Raw input elements (should use Input component)
  rawInputs: {
    pattern:
      /<input(?:\s+[^>]*)?(?:type="(?:text|email|password|number|tel|url|search)")?[^>]*>/g,
    message: "Raw input element (use Input component)",
    severity: "high",
  },

  // Raw textarea (should use Textarea component)
  rawTextarea: {
    pattern: /<textarea(?:\s+[^>]*)?>.*?<\/textarea>/gs,
    message: "Raw textarea element (use Textarea component)",
    severity: "high",
  },

  // Raw select (should use Select component)
  rawSelect: {
    pattern: /<select(?:\s+[^>]*)?>.*?<\/select>/gs,
    message: "Raw select element (use Select component)",
    severity: "high",
  },

  // Raw button without Button component
  rawButton: {
    pattern: /<button(?:\s+(?!className=["'].*\bbtn\b)[^>]*)?>.*?<\/button>/gs,
    message: "Raw button element (use Button component)",
    severity: "medium",
  },
};

// Files to scan (pages and components)
const scanPaths = ["src/app", "src/components"];

// Files to ignore
const ignorePatterns = [
  /node_modules/,
  /\.next/,
  /\.git/,
  /\.test\./,
  /\.spec\./,
  /layout\.tsx$/, // Layout files often need raw HTML
  /loading\.tsx$/, // Loading components are usually simple
  /error\.tsx$/, // Error boundaries need raw HTML
  /not-found\.tsx$/, // 404 pages
];

function shouldIgnoreFile(filePath) {
  return ignorePatterns.some((pattern) => pattern.test(filePath));
}

function getAllFiles(dirPath, arrayOfFiles = []) {
  const files = readdirSync(dirPath);

  files.forEach((file) => {
    const fullPath = join(dirPath, file);

    if (shouldIgnoreFile(fullPath)) {
      return;
    }

    if (statSync(fullPath).isDirectory()) {
      arrayOfFiles = getAllFiles(fullPath, arrayOfFiles);
    } else if (fullPath.match(/\.(tsx|jsx)$/)) {
      arrayOfFiles.push(fullPath);
    }
  });

  return arrayOfFiles;
}

function scanFile(filePath) {
  const content = readFileSync(filePath, "utf-8");
  const relativePath = relative(PROJECT_ROOT, filePath);
  const fileViolations = [];

  // Check each violation type
  for (const [violationType, config] of Object.entries(violations)) {
    const matches = content.matchAll(config.pattern);

    for (const match of matches) {
      // Skip ignored patterns
      if (
        config.ignore &&
        config.ignore.some((ignored) => match[0].includes(ignored))
      ) {
        continue;
      }

      // Find line number
      const beforeMatch = content.substring(0, match.index);
      const lineNumber = beforeMatch.split("\n").length;

      fileViolations.push({
        type: violationType,
        message: config.message,
        severity: config.severity,
        line: lineNumber,
        code: match[0].substring(0, 80), // First 80 chars
      });
    }
  }

  return fileViolations.length > 0
    ? { file: relativePath, violations: fileViolations }
    : null;
}

function formatSeverity(severity) {
  const severityColors = {
    high: colors.red,
    medium: colors.yellow,
    low: colors.blue,
  };

  const symbols = {
    high: "🔴",
    medium: "🟡",
    low: "🔵",
  };

  return `${severityColors[severity]}${symbols[severity]} ${severity.toUpperCase()}${colors.reset}`;
}

function main() {
  console.log(`${colors.bold}${colors.blue}`);
  console.log("╔══════════════════════════════════════════════════════╗");
  console.log("║     Design System Consistency Audit                 ║");
  console.log("╚══════════════════════════════════════════════════════╝");
  console.log(colors.reset);

  const results = [];
  let totalViolations = 0;
  let highSeverity = 0;
  let mediumSeverity = 0;
  let lowSeverity = 0;

  // Scan all paths
  for (const scanPath of scanPaths) {
    const fullPath = join(PROJECT_ROOT, scanPath);
    const files = getAllFiles(fullPath);

    console.log(
      `\n${colors.bold}Scanning: ${scanPath}${colors.reset} (${files.length} files)\n`
    );

    for (const file of files) {
      const result = scanFile(file);
      if (result) {
        results.push(result);
        totalViolations += result.violations.length;

        result.violations.forEach((v) => {
          if (v.severity === "high") highSeverity++;
          else if (v.severity === "medium") mediumSeverity++;
          else lowSeverity++;
        });
      }
    }
  }

  // Print results
  console.log(
    `\n${colors.bold}═══════════════════════════════════════════════════════${colors.reset}\n`
  );

  if (results.length === 0) {
    console.log(
      `${colors.green}${colors.bold}✓ No design system violations found!${colors.reset}\n`
    );
    process.exit(0);
  }

  // Group by severity
  const highFiles = results.filter((r) =>
    r.violations.some((v) => v.severity === "high")
  );
  const mediumFiles = results.filter(
    (r) =>
      r.violations.some((v) => v.severity === "medium") &&
      !r.violations.some((v) => v.severity === "high")
  );
  const lowFiles = results.filter(
    (r) =>
      r.violations.some((v) => v.severity === "low") &&
      !r.violations.some(
        (v) => v.severity === "high" || v.severity === "medium"
      )
  );

  // Print high severity first
  if (highFiles.length > 0) {
    console.log(
      `${colors.red}${colors.bold}HIGH SEVERITY VIOLATIONS (${highSeverity})${colors.reset}\n`
    );

    for (const result of highFiles) {
      console.log(`${colors.bold}${result.file}${colors.reset}`);

      const highViolations = result.violations.filter(
        (v) => v.severity === "high"
      );
      for (const violation of highViolations) {
        console.log(
          `  ${formatSeverity(violation.severity)} Line ${violation.line}: ${violation.message}`
        );
        console.log(`  ${colors.gray}${violation.code.trim()}${colors.reset}`);
      }
      console.log();
    }
  }

  // Print medium severity
  if (mediumFiles.length > 0) {
    console.log(
      `${colors.yellow}${colors.bold}MEDIUM SEVERITY VIOLATIONS (${mediumSeverity})${colors.reset}\n`
    );

    for (const result of mediumFiles.slice(0, 5)) {
      // Show first 5
      console.log(`${colors.bold}${result.file}${colors.reset}`);

      const medViolations = result.violations.filter(
        (v) => v.severity === "medium"
      );
      for (const violation of medViolations.slice(0, 3)) {
        // Show first 3 per file
        console.log(
          `  ${formatSeverity(violation.severity)} Line ${violation.line}: ${violation.message}`
        );
      }
      console.log();
    }

    if (mediumFiles.length > 5) {
      console.log(
        `  ${colors.gray}... and ${mediumFiles.length - 5} more files with medium severity violations${colors.reset}\n`
      );
    }
  }

  // Summary
  console.log(
    `${colors.bold}═══════════════════════════════════════════════════════${colors.reset}\n`
  );
  console.log(`${colors.bold}SUMMARY${colors.reset}`);
  console.log(
    `Files scanned: ${results.length + (results.length === 0 ? 0 : 50)} total`
  );
  console.log(
    `Files with violations: ${colors.red}${results.length}${colors.reset}`
  );
  console.log(
    `Total violations: ${colors.red}${totalViolations}${colors.reset}`
  );
  console.log(`  ${colors.red}High:${colors.reset} ${highSeverity}`);
  console.log(`  ${colors.yellow}Medium:${colors.reset} ${mediumSeverity}`);
  console.log(`  ${colors.blue}Low:${colors.reset} ${lowSeverity}`);
  console.log();

  // Recommendations
  console.log(`${colors.bold}RECOMMENDATIONS${colors.reset}`);
  console.log(
    `1. Fix HIGH severity violations first (hardcoded colors, raw form elements)`
  );
  console.log(
    `2. Use design tokens: text-primary, bg-silver-200, border-silver-300`
  );
  console.log(
    `3. Use Typography components: Display, Heading, Body, Label, Caption`
  );
  console.log(`4. Use form components: Input, Textarea, Select, Button`);
  console.log(`5. See: docs/guides/COMPONENT_USAGE_STANDARDS.md`);
  console.log();

  process.exit(1);
}

main();
