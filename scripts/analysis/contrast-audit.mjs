#!/usr/bin/env node

/**
 * CONTRAST AUDIT SCRIPT
 * Scans codebase for WCAG contrast violations
 */

import { readFileSync, readdirSync, statSync } from "fs";
import { join } from "path";

// WCAG 2.1 Level AA Contrast Requirements
const WCAG_AA_NORMAL = 4.5; // For text < 18px or < 14px bold
const WCAG_AA_LARGE = 3.0; // For text >= 18px or >= 14px bold

// Known problematic color combinations (contrast ratio too low)
const LOW_CONTRAST_PATTERNS = [
  // Text colors that are too light on dark backgrounds (< 4.5:1)
  { pattern: /text-slate-[2-4]00(?!\d)/, bg: "dark", description: "Light gray text on dark bg (slate-200 to slate-400)" },
  { pattern: /text-gray-[2-4]00(?!\d)/, bg: "dark", description: "Light gray text on dark bg (gray-200 to gray-400)" },
  { pattern: /text-zinc-[2-4]00(?!\d)/, bg: "dark", description: "Light zinc text on dark bg (zinc-200 to zinc-400)" },
  
  // Text colors that are too light on light backgrounds (< 4.5:1)
  { pattern: /text-slate-[5-6]00(?!\d)/, bg: "light", description: "Mid-gray text on light bg (slate-500 to slate-600)" },
  { pattern: /text-gray-[5-6]00(?!\d)/, bg: "light", description: "Mid-gray text on light bg (gray-500 to gray-600)" },
  
  // Accent colors with poor contrast on light backgrounds
  { pattern: /text-orange-[3-4]00(?!\d)/, bg: "light", description: "Light orange text (insufficient contrast)" },
  { pattern: /text-green-[3-4]00(?!\d)/, bg: "light", description: "Light green text (insufficient contrast)" },
  { pattern: /text-blue-[3-4]00(?!\d)/, bg: "light", description: "Light blue text (insufficient contrast)" },
  
  // Background + text combinations that are clearly problematic
  { pattern: /bg-slate-900.*text-slate-[2-4]00/, description: "Low contrast slate combo" },
  { pattern: /bg-slate-800.*text-slate-[2-4]00/, description: "Low contrast slate combo" },
];

// Good contrast patterns (approved combinations)
const GOOD_CONTRAST_PATTERNS = [
  /text-white/,
  /text-slate-950/,
  /text-slate-900/,
  /text-slate-100/,
  /text-slate-200/,  // Good on dark backgrounds
  /text-slate-700/,  // Good on light backgrounds
  /text-gray-900/,
  /text-gray-800/,
  /text-gray-700/,   // Good on light backgrounds (8.6:1)
  /text-black/,
];

function findFiles(dir, ext = [".tsx", ".ts"]) {
  let results = [];
  const files = readdirSync(dir);

  for (const file of files) {
    const filePath = join(dir, file);
    const stat = statSync(filePath);

    if (stat.isDirectory()) {
      if (!file.startsWith(".") && file !== "node_modules") {
        results = results.concat(findFiles(filePath, ext));
      }
    } else if (ext.some((e) => file.endsWith(e))) {
      results.push(filePath);
    }
  }

  return results;
}

function analyzeFile(filePath) {
  const content = readFileSync(filePath, "utf-8");
  const lines = content.split("\n");
  const violations = [];

  lines.forEach((line, index) => {
    // Skip comments
    if (line.trim().startsWith("//") || line.trim().startsWith("*")) {
      return;
    }

    // Check for low contrast patterns
    LOW_CONTRAST_PATTERNS.forEach((pattern) => {
      if (pattern.pattern.test(line)) {
        // Check if it's not in a good context
        const hasGoodPattern = GOOD_CONTRAST_PATTERNS.some((good) => good.test(line));
        if (!hasGoodPattern) {
          violations.push({
            file: filePath,
            line: index + 1,
            code: line.trim(),
            issue: pattern.description,
            severity: "high",
          });
        }
      }
    });

    // Check for specific bad combinations
    if (line.includes("text-slate-300") && (line.includes("bg-slate-900") || line.includes("bg-slate-950"))) {
      violations.push({
        file: filePath,
        line: index + 1,
        code: line.trim(),
        issue: "text-slate-300 on dark background - use text-white instead",
        severity: "critical",
      });
    }

    if (line.includes("text-slate-400")) {
      violations.push({
        file: filePath,
        line: index + 1,
        code: line.trim(),
        issue: "text-slate-400 is too subtle - use text-slate-100 or text-white",
        severity: "high",
      });
    }

    // Check for small text with low contrast
    if (line.includes("text-sm") && /text-(slate|gray|zinc)-[4-6]00/.test(line)) {
      violations.push({
        file: filePath,
        line: index + 1,
        code: line.trim(),
        issue: "Small text with insufficient contrast",
        severity: "high",
      });
    }
  });

  return violations;
}

function main() {
  console.log("🔍 CONTRAST AUDIT - Scanning codebase for WCAG violations\n");
  console.log(`WCAG 2.1 Level AA Standards:`);
  console.log(`  - Normal text: ${WCAG_AA_NORMAL}:1 minimum`);
  console.log(`  - Large text (18px+): ${WCAG_AA_LARGE}:1 minimum\n`);

  const srcDir = join(process.cwd(), "src");
  const files = findFiles(srcDir);

  console.log(`Scanning ${files.length} files...\n`);

  let allViolations = [];
  const violationsByFile = {};

  files.forEach((file) => {
    const violations = analyzeFile(file);
    if (violations.length > 0) {
      allViolations = allViolations.concat(violations);
      violationsByFile[file] = violations;
    }
  });

  // Group by severity
  const critical = allViolations.filter((v) => v.severity === "critical");
  const high = allViolations.filter((v) => v.severity === "high");
  const medium = allViolations.filter((v) => v.severity === "medium");

  console.log("=" .repeat(80));
  console.log("AUDIT RESULTS");
  console.log("=".repeat(80));
  console.log(`\n📊 Summary:`);
  console.log(`  🔴 Critical: ${critical.length}`);
  console.log(`  🟠 High: ${high.length}`);
  console.log(`  🟡 Medium: ${medium.length}`);
  console.log(`  📁 Files affected: ${Object.keys(violationsByFile).length}`);
  console.log(`  📝 Total violations: ${allViolations.length}\n`);

  if (allViolations.length === 0) {
    console.log("✅ No contrast violations found! Great job!\n");
    return;
  }

  // Print violations by file
  console.log("=".repeat(80));
  console.log("VIOLATIONS BY FILE");
  console.log("=".repeat(80));
  console.log();

  Object.entries(violationsByFile).forEach(([file, violations]) => {
    const shortPath = file.replace(process.cwd(), "");
    console.log(`\n📄 ${shortPath} (${violations.length} issues)`);
    console.log("-".repeat(80));

    violations.forEach((v) => {
      const icon = v.severity === "critical" ? "🔴" : v.severity === "high" ? "🟠" : "🟡";
      console.log(`${icon} Line ${v.line}: ${v.issue}`);
      console.log(`   ${v.code.substring(0, 100)}${v.code.length > 100 ? "..." : ""}`);
      console.log();
    });
  });

  // Recommendations
  console.log("=".repeat(80));
  console.log("RECOMMENDATIONS");
  console.log("=".repeat(80));
  console.log(`
✅ APPROVED COLOR COMBINATIONS:

Dark Backgrounds (slate-950, slate-900):
  - text-white ✅ (19:1 contrast)
  - text-slate-100 ✅ (16:1 contrast)
  
Light Backgrounds (white, slate-50):
  - text-slate-950 ✅ (19:1 contrast)
  - text-slate-900 ✅ (17:1 contrast)
  - text-slate-700 ✅ (8.6:1 contrast)

❌ AVOID:
  - text-slate-300 on dark (too subtle)
  - text-slate-400 on any background (too gray)
  - text-slate-500 on light (insufficient contrast)
  - Small text (< 18px) with mid-tones

🔧 QUICK FIXES:
  1. Replace text-slate-300 → text-white (on dark)
  2. Replace text-slate-400 → text-slate-100 (on dark)
  3. Replace text-slate-500 → text-slate-700 (on light)
  4. Replace text-gray-600 → text-gray-900 (on light)

📚 See docs/guides/CONTRAST_GUIDELINES.md for complete reference.
`);

  console.log("=".repeat(80));
  process.exit(allViolations.length > 0 ? 1 : 0);
}

main();
