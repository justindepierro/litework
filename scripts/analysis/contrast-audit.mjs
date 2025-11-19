#!/usr/bin/env node

/**
 * CONTRAST AUDIT SCRIPT
 * Scans codebase for WCAG contrast violations
 */

import { readFileSync, readdirSync, statSync, existsSync } from "fs";
import { join } from "path";

// WCAG 2.1 Level AA Contrast Requirements
const WCAG_AA_NORMAL = 4.5; // For text < 18px or < 14px bold
const WCAG_AA_LARGE = 3.0; // For text >= 18px or >= 14px bold

// Known problematic color combinations (contrast ratio too low)
const LOW_CONTRAST_PATTERNS = [
  // Text colors that are too light on dark backgrounds (< 4.5:1)
  {
    pattern: /text-slate-[2-4]00(?!\d)/,
    bg: "dark",
    description: "Light gray text on dark bg (slate-200 to slate-400)",
  },
  {
    pattern: /text-gray-[2-4]00(?!\d)/,
    bg: "dark",
    description: "Light gray text on dark bg (gray-200 to gray-400)",
  },
  {
    pattern: /text-zinc-[2-4]00(?!\d)/,
    bg: "dark",
    description: "Light zinc text on dark bg (zinc-200 to zinc-400)",
  },

  // Text colors that are too light on light backgrounds (< 4.5:1)
  {
    pattern: /text-slate-[5-6]00(?!\d)/,
    bg: "light",
    description: "Mid-gray text on light bg (slate-500 to slate-600)",
  },
  {
    pattern: /text-gray-[5-6]00(?!\d)/,
    bg: "light",
    description: "Mid-gray text on light bg (gray-500 to gray-600)",
  },

  // Accent colors with poor contrast on light backgrounds
  {
    pattern: /text-orange-[3-4]00(?!\d)/,
    bg: "light",
    description: "Light orange text (insufficient contrast)",
  },
  {
    pattern: /text-green-[3-4]00(?!\d)/,
    bg: "light",
    description: "Light green text (insufficient contrast)",
  },
  {
    pattern: /text-blue-[3-4]00(?!\d)/,
    bg: "light",
    description: "Light blue text (insufficient contrast)",
  },

  // Background + text combinations that are clearly problematic
  {
    pattern: /bg-slate-900.*text-slate-[2-4]00/,
    description: "Low contrast slate combo",
  },
  {
    pattern: /bg-slate-800.*text-slate-[2-4]00/,
    description: "Low contrast slate combo",
  },
];

// Good contrast patterns (approved combinations)
const GOOD_CONTRAST_PATTERNS = [
  /text-white/,
  /text-slate-950/,
  /text-slate-900/,
  /text-slate-100/,
  /text-slate-200/, // Good on dark backgrounds
  /text-slate-700/, // Good on light backgrounds
  /text-gray-900/,
  /text-gray-800/,
  /text-gray-700/, // Good on light backgrounds (8.6:1)
  /text-black/,
];

const TOKEN_FILES = [
  join(process.cwd(), "src/styles/design-tokens.css"),
  join(process.cwd(), "src/styles/tokens.css"),
];

const NAMED_COLORS = {
  white: "#ffffff",
  black: "#000000",
  transparent: "rgba(0,0,0,0)",
};

const tokenValueMap = loadTokenValues();
const resolvedTokenCache = new Map();

function loadTokenValues() {
  const map = {};
  TOKEN_FILES.forEach((filePath) => {
    if (existsSync(filePath)) {
      Object.assign(map, parseCssVariables(filePath));
    }
  });
  return map;
}

function parseCssVariables(filePath) {
  const content = readFileSync(filePath, "utf-8");
  const regex = /--([a-z0-9-]+)\s*:\s*([^;]+);/gi;
  const vars = {};
  let match;
  while ((match = regex.exec(content)) !== null) {
    const [, name, value] = match;
    vars[`--${name}`] = value.replace(/!important/g, "").trim();
  }
  return vars;
}

function normalizeTokenName(tokenName) {
  if (!tokenName) return tokenName;
  return tokenName.startsWith("--") ? tokenName : `--${tokenName}`;
}

function resolveTokenColor(tokenName, stack = []) {
  const normalized = normalizeTokenName(tokenName);
  if (!normalized) return null;

  if (stack.includes(normalized)) {
    resolvedTokenCache.set(normalized, null);
    return null;
  }

  if (resolvedTokenCache.has(normalized)) {
    return resolvedTokenCache.get(normalized);
  }

  const rawValue = tokenValueMap[normalized];
  if (!rawValue) {
    resolvedTokenCache.set(normalized, null);
    return null;
  }

  if (rawValue.startsWith("var(")) {
    const innerMatch = rawValue.match(
      /var\((--[a-z0-9-]+)(?:,\s*([^\)]+))?\)/i
    );
    if (innerMatch) {
      const [, innerToken, fallback] = innerMatch;
      const resolved =
        resolveTokenColor(innerToken, [...stack, normalized]) ||
        parseColorValue(fallback);
      resolvedTokenCache.set(normalized, resolved);
      return resolved;
    }
  }

  const parsed = parseColorValue(rawValue);
  resolvedTokenCache.set(normalized, parsed);
  return parsed;
}

function parseColorValue(value) {
  if (!value) return null;
  const trimmed = value.trim().toLowerCase();

  if (trimmed.startsWith("var(")) {
    const refMatch = trimmed.match(/var\((--[a-z0-9-]+)/i);
    if (refMatch) {
      return resolveTokenColor(refMatch[1]);
    }
  }

  if (trimmed.startsWith("#")) {
    return hexToRgb(trimmed);
  }

  if (trimmed.startsWith("rgb")) {
    const rgbaMatch = trimmed.match(/rgba?\(([^)]+)\)/i);
    if (rgbaMatch) {
      const [r, g, b, a] = rgbaMatch[1]
        .split(",")
        .map((component) => component.trim())
        .map((component, index) =>
          index < 3 ? Number(component) : Number(component)
        );
      if ([r, g, b].every((channel) => Number.isFinite(channel))) {
        return { r, g, b, a: Number.isFinite(a) ? a : 1 };
      }
    }
  }

  if (NAMED_COLORS[trimmed]) {
    return hexToRgb(NAMED_COLORS[trimmed]);
  }

  return null;
}

function hexToRgb(hex) {
  if (!hex) return null;
  let normalized = hex.replace("#", "");
  if (normalized.length === 3) {
    normalized = normalized
      .split("")
      .map((char) => char + char)
      .join("");
  }
  const r = parseInt(normalized.substring(0, 2), 16);
  const g = parseInt(normalized.substring(2, 4), 16);
  const b = parseInt(normalized.substring(4, 6), 16);
  if ([r, g, b].some((channel) => Number.isNaN(channel))) {
    return null;
  }
  return { r, g, b, a: 1 };
}

function rgbToHex({ r, g, b }) {
  const toHex = (value) => value.toString(16).padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function applyAlpha(color) {
  if (!color) return null;
  if (color.a === undefined || color.a === 1) {
    return { r: color.r, g: color.g, b: color.b };
  }
  const alpha = Math.max(0, Math.min(1, color.a));
  const blendChannel = (channel) =>
    Math.round(channel * alpha + 255 * (1 - alpha));
  return {
    r: blendChannel(color.r),
    g: blendChannel(color.g),
    b: blendChannel(color.b),
  };
}

function relativeLuminance({ r, g, b }) {
  const transform = (channel) => {
    const normalized = channel / 255;
    return normalized <= 0.03928
      ? normalized / 12.92
      : Math.pow((normalized + 0.055) / 1.055, 2.4);
  };

  const R = transform(r);
  const G = transform(g);
  const B = transform(b);
  return 0.2126 * R + 0.7152 * G + 0.0722 * B;
}

function contrastRatio(colorA, colorB) {
  if (!colorA || !colorB) return null;
  const lumA = relativeLuminance(colorA);
  const lumB = relativeLuminance(colorB);
  const lighter = Math.max(lumA, lumB);
  const darker = Math.min(lumA, lumB);
  return (lighter + 0.05) / (darker + 0.05);
}

function getTokenColorInfo(tokenName, source) {
  const resolved = resolveTokenColor(tokenName);
  if (!resolved) return null;
  const rgb = applyAlpha(resolved);
  if (!rgb) return null;
  return {
    token: normalizeTokenName(tokenName),
    source,
    rgb,
    hex: rgbToHex(rgb),
  };
}

function extractTokenColors(line, type) {
  const results = [];
  const parenRegex = new RegExp(`${type}-\\((--[a-z0-9-]+)\\)`, "gi");
  const bracketRegex = new RegExp(
    `${type}-\\[var\\((--[a-z0-9-]+)\\)\\]`,
    "gi"
  );

  let match;
  while ((match = parenRegex.exec(line)) !== null) {
    const token = match[1];
    const info = getTokenColorInfo(token, match[0]);
    if (info) results.push(info);
  }

  while ((match = bracketRegex.exec(line)) !== null) {
    const token = match[1];
    const info = getTokenColorInfo(token, match[0]);
    if (info) results.push(info);
  }

  return results;
}

function analyzeTokenContrast(line, lineNumber) {
  const textColors = extractTokenColors(line, "text");
  const bgColors = extractTokenColors(line, "bg");
  const issues = [];

  if (textColors.length === 0 || bgColors.length === 0) {
    return issues;
  }

  textColors.forEach((textColor) => {
    bgColors.forEach((bgColor) => {
      const ratio = contrastRatio(textColor.rgb, bgColor.rgb);
      if (!ratio) return;
      if (ratio < WCAG_AA_NORMAL) {
        const severity = ratio < WCAG_AA_LARGE ? "critical" : "high";
        issues.push({
          line: lineNumber,
          code: line.trim(),
          issue: `Low contrast between ${textColor.source} (${textColor.hex}) and ${bgColor.source} (${bgColor.hex}) - ${ratio.toFixed(2)}:1`,
          severity,
        });
      }
    });
  });

  return issues;
}

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
        const hasGoodPattern = GOOD_CONTRAST_PATTERNS.some((good) =>
          good.test(line)
        );
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
    if (
      line.includes("text-slate-300") &&
      (line.includes("bg-slate-900") || line.includes("bg-slate-950"))
    ) {
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
        issue:
          "text-slate-400 is too subtle - use text-slate-100 or text-white",
        severity: "high",
      });
    }

    // Check for small text with low contrast
    if (
      line.includes("text-sm") &&
      /text-(slate|gray|zinc)-[4-6]00/.test(line)
    ) {
      violations.push({
        file: filePath,
        line: index + 1,
        code: line.trim(),
        issue: "Small text with insufficient contrast",
        severity: "high",
      });
    }

    const tokenViolations = analyzeTokenContrast(line, index + 1);
    if (tokenViolations.length > 0) {
      tokenViolations.forEach((violation) =>
        violations.push({
          file: filePath,
          line: violation.line,
          code: violation.code,
          issue: violation.issue,
          severity: violation.severity,
        })
      );
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

  console.log("=".repeat(80));
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
      const icon =
        v.severity === "critical" ? "🔴" : v.severity === "high" ? "🟠" : "🟡";
      console.log(`${icon} Line ${v.line}: ${v.issue}`);
      console.log(
        `   ${v.code.substring(0, 100)}${v.code.length > 100 ? "..." : ""}`
      );
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
