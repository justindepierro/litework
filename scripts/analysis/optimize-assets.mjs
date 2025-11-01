#!/usr/bin/env node

// Asset Optimization Script
// Analyzes and optimizes images and assets for better performance

import fs from "fs";
import path from "path";

const ASSETS_DIR = "./public";
const ICONS_DIR = "./public/icons";

console.log("🔍 Analyzing asset optimization opportunities...\n");

// Function to analyze file sizes
function analyzeDirectory(dir, label) {
  try {
    const files = fs.readdirSync(dir);
    let totalSize = 0;

    console.log(`📁 ${label}:`);

    files.forEach((file) => {
      const filePath = path.join(dir, file);
      const stats = fs.statSync(filePath);

      if (stats.isFile()) {
        const sizeKB = (stats.size / 1024).toFixed(2);
        totalSize += stats.size;

        // Color code by size
        const color =
          stats.size > 50000 ? "🔴" : stats.size > 20000 ? "🟡" : "🟢";
        console.log(`  ${color} ${file}: ${sizeKB} KB`);

        // Recommendations for large files
        if (stats.size > 50000) {
          console.log(`    ⚠️  Consider optimizing ${file} (> 50KB)`);
        }
      }
    });

    console.log(`  📊 Total: ${(totalSize / 1024).toFixed(2)} KB\n`);
    return totalSize;
  } catch (error) {
    console.log(`  ❌ Could not analyze ${dir}: Directory not found\n`);
    return 0;
  }
}

// Analyze asset directories
let totalAssetSize = 0;
totalAssetSize += analyzeDirectory(ASSETS_DIR, "Public Assets");
totalAssetSize += analyzeDirectory(ICONS_DIR, "App Icons");

console.log("🚀 Asset Optimization Recommendations:");

// Image optimization recommendations
console.log("\n📸 Image Optimization:");
console.log("✅ Use WebP/AVIF formats for better compression");
console.log("✅ Implement responsive images with srcset");
console.log("✅ Add lazy loading for non-critical images");
console.log("✅ Optimize SVGs by removing unnecessary metadata");

// Caching recommendations
console.log("\n💾 Caching Strategy:");
console.log("✅ Set long cache headers for immutable assets");
console.log("✅ Use versioning or hashing for cache busting");
console.log("✅ Implement service worker for offline caching");

// Performance recommendations
console.log("\n⚡ Performance Enhancements:");
console.log("✅ Preload critical assets");
console.log("✅ Use resource hints (preconnect, dns-prefetch)");
console.log("✅ Compress assets with gzip/brotli");
console.log("✅ Serve assets from CDN when possible");

// Next.js specific optimizations
console.log("\n🔧 Next.js Optimizations:");
console.log("✅ Use next/image component for automatic optimization");
console.log("✅ Configure image domains and formats in next.config.ts");
console.log("✅ Enable experimental features for better performance");

console.log(`\n📊 Total asset size: ${(totalAssetSize / 1024).toFixed(2)} KB`);

// Check if assets are reasonably sized
if (totalAssetSize < 500000) {
  // 500KB
  console.log("🎉 Asset sizes are well optimized!");
} else if (totalAssetSize < 1000000) {
  // 1MB
  console.log("⚠️  Asset sizes are acceptable but could be improved");
} else {
  console.log("🔴 Asset sizes are large and should be optimized");
}

console.log("\n✨ Asset optimization analysis complete!");
