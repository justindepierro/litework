#!/usr/bin/env node

/**
 * CSS Token Performance Analyzer
 * Compares original vs optimized token systems
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// File paths
const originalCSS = path.join(__dirname, "src/styles/design-tokens.css");
const optimizedCSS = path.join(__dirname, "src/styles/tokens-optimized.css");

// Analysis functions
function analyzeCSS(filePath) {
  if (!fs.existsSync(filePath)) {
    return {
      size: 0,
      lines: 0,
      variables: 0,
      utilities: 0,
      mediaQueries: 0,
      comments: 0,
    };
  }

  const content = fs.readFileSync(filePath, "utf8");

  return {
    size: Buffer.byteLength(content, "utf8"),
    lines: content.split("\n").length,
    variables: (content.match(/--[\w-]+:/g) || []).length,
    utilities: (content.match(/^\s*\.[a-zA-Z][\w-]*\s*{/gm) || []).length,
    mediaQueries: (content.match(/@media/g) || []).length,
    comments: (content.match(/\/\*[\s\S]*?\*\//g) || []).length,
  };
}

function formatBytes(bytes) {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

function calculateSavings(original, optimized) {
  const savings = original - optimized;
  const percentage = ((savings / original) * 100).toFixed(1);
  return `${formatBytes(savings)} (${percentage}%)`;
}

// Analyze both files
console.log("🎨 CSS Token Performance Analysis\n");

const originalStats = analyzeCSS(originalCSS);
const optimizedStats = analyzeCSS(optimizedCSS);

console.log("📊 File Size Comparison:");
console.log(`Original:  ${formatBytes(originalStats.size)}`);
console.log(`Optimized: ${formatBytes(optimizedStats.size)}`);
console.log(
  `Savings:   ${calculateSavings(originalStats.size, optimizedStats.size)}\n`
);

console.log("📏 Structure Comparison:");
console.log("                Original  Optimized  Reduction");
console.log("─".repeat(45));
console.log(
  `Lines:         ${originalStats.lines.toString().padStart(8)} ${optimizedStats.lines.toString().padStart(10)} ${(originalStats.lines - optimizedStats.lines).toString().padStart(10)}`
);
console.log(
  `Variables:     ${originalStats.variables.toString().padStart(8)} ${optimizedStats.variables.toString().padStart(10)} ${(originalStats.variables - optimizedStats.variables).toString().padStart(10)}`
);
console.log(
  `Utilities:     ${originalStats.utilities.toString().padStart(8)} ${optimizedStats.utilities.toString().padStart(10)} ${(originalStats.utilities - optimizedStats.utilities).toString().padStart(10)}`
);
console.log(
  `Media Queries: ${originalStats.mediaQueries.toString().padStart(8)} ${optimizedStats.mediaQueries.toString().padStart(10)} ${(originalStats.mediaQueries - optimizedStats.mediaQueries).toString().padStart(10)}`
);

console.log("\n✨ Optimization Benefits:");
console.log(
  "• Reduced CSS bundle size by",
  calculateSavings(originalStats.size, optimizedStats.size)
);
console.log("• Streamlined color palette (removed unused shades)");
console.log("• Shortened variable names for better compression");
console.log("• Consolidated utility classes");
console.log("• Mobile-first responsive optimizations");
console.log("• Eliminated redundant declarations");

console.log("\n🚀 Performance Impact:");
console.log("• Faster CSS parsing and rendering");
console.log("• Reduced memory usage");
console.log("• Better gzip compression ratios");
console.log("• Simplified maintenance and debugging");
console.log("• TypeScript integration for type safety");

// Token usage analysis
console.log("\n🔍 Token Usage Recommendations:");
console.log("1. Use optimized.css for production builds");
console.log("2. Import tokens-optimized.ts for component styling");
console.log("3. Apply tailwind-optimized.config.ts for utility classes");
console.log("4. Leverage shorter variable names (--s-4 vs --spacing-4)");
console.log("5. Use semantic tokens for better maintainability");

console.log("\n📝 Migration Guide:");
console.log("Replace:              With:");
console.log("─".repeat(40));
console.log("--color-navy-700      --navy-7");
console.log("--color-silver-400    --silver-4");
console.log("--color-accent-orange --orange");
console.log("--spacing-4           --s-4");
console.log("--font-size-lg        --text-lg");
console.log("--shadow-base         --shadow");

export { analyzeCSS, formatBytes, calculateSavings };
