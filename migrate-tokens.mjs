#!/usr/bin/env node

/**
 * CSS Token Migration Script
 * Automatically updates files to use optimized token system
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Token migration mappings
const tokenMappings = {
  // Color tokens
  "--color-navy-50": "--navy-1",
  "--color-navy-100": "--navy-1",
  "--color-navy-200": "--navy-2",
  "--color-navy-300": "--navy-3",
  "--color-navy-500": "--navy-5",
  "--color-navy-600": "--navy-6",
  "--color-navy-700": "--navy-7",
  "--color-navy-800": "--navy-8",
  "--color-navy": "--navy",

  "--color-silver-100": "--silver-1",
  "--color-silver-200": "--silver-2",
  "--color-silver-300": "--silver-3",
  "--color-silver-400": "--silver-4",
  "--color-silver-500": "--silver-5",
  "--color-silver": "--silver",

  "--color-accent-orange": "--orange",
  "--color-accent-green": "--green",
  "--color-accent-blue": "--blue",
  "--color-accent-red": "--red",
  "--color-accent-yellow": "--yellow",

  "--color-text-primary": "--text-1",
  "--color-text-secondary": "--text-2",
  "--color-text-tertiary": "--text-3",
  "--color-text-inverse": "--text-inverse",
  "--color-text-accent": "--text-accent",

  "--color-bg-primary": "--bg-1",
  "--color-bg-secondary": "--bg-2",
  "--color-bg-tertiary": "--bg-3",
  "--color-bg-surface": "--bg-surface",

  "--color-border-primary": "--border-1",
  "--color-border-secondary": "--border-2",
  "--color-border-focus": "--border-focus",

  "--color-success": "--success",
  "--color-error": "--error",
  "--color-warning": "--warning",
  "--color-info": "--info",

  // Spacing tokens
  "--spacing-1": "--s-1",
  "--spacing-2": "--s-2",
  "--spacing-3": "--s-3",
  "--spacing-4": "--s-4",
  "--spacing-5": "--s-5",
  "--spacing-6": "--s-6",
  "--spacing-8": "--s-8",
  "--spacing-10": "--s-10",
  "--spacing-12": "--s-12",
  "--spacing-16": "--s-16",

  // Typography tokens
  "--font-family-primary": "--font-base",
  "--font-family-heading": "--font-heading",
  "--font-size-xs": "--text-xs",
  "--font-size-sm": "--text-sm",
  "--font-size-base": "--text-base",
  "--font-size-lg": "--text-lg",
  "--font-size-xl": "--text-xl",
  "--font-size-2xl": "--text-2xl",
  "--font-size-3xl": "--text-3xl",
  "--font-weight-normal": "--weight-normal",
  "--font-weight-medium": "--weight-medium",
  "--font-weight-semibold": "--weight-medium",
  "--font-weight-bold": "--weight-bold",

  // Effects tokens
  "--shadow-sm": "--shadow-sm",
  "--shadow-base": "--shadow",
  "--shadow-md": "--shadow-md",
  "--shadow-lg": "--shadow-lg",
  "--radius-sm": "--radius-sm",
  "--radius-base": "--radius",
  "--radius-md": "--radius-md",
  "--radius-lg": "--radius-lg",
  "--radius-xl": "--radius-xl",
  "--radius-full": "--radius-full",
  "--transition-all": "--transition",
  "--transition-fast": "--transition-fast",

  // Layout tokens
  "--layout-header-height": "--header-h",
  "--layout-nav-width": "--nav-w",
  "--container-sm": "--container-sm",
  "--container-md": "--container-md",
  "--container-lg": "--container-lg",
  "--container-xl": "--container-xl",
};

// Utility class mappings
const utilityMappings = {
  "text-heading-primary": "text-navy-7 font-heading font-bold",
  "text-heading-secondary": "text-navy-6 font-heading font-medium",
  "text-heading-accent": "text-orange font-heading font-bold",
  "text-body-primary": "text-navy-7",
  "text-body-secondary": "text-navy-6",
  "text-body-small": "text-navy-5 text-sm",
  "card-primary": "card",
  "card-elevated": "card shadow-lg",
  "btn-primary": "btn-primary",
  "btn-secondary": "btn-secondary",
  "status-success": "status-success",
  "status-error": "status-error",
  "status-warning": "status-warning",
  "container-responsive": "container-responsive",
  "workout-accent-strength": "accent-strength",
  "workout-accent-progress": "accent-progress",
  "workout-accent-intensity": "accent-intensity",
  "workout-accent-schedule": "accent-schedule",
  "workout-accent-warning": "accent-warning",
};

function migrateFile(filePath) {
  if (!fs.existsSync(filePath)) {
    console.log(`❌ File not found: ${filePath}`);
    return false;
  }

  let content = fs.readFileSync(filePath, "utf8");
  let modified = false;

  // Migrate CSS custom properties
  for (const [oldToken, newToken] of Object.entries(tokenMappings)) {
    const regex = new RegExp(
      `var\\(${oldToken.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&")}\\)`,
      "g"
    );
    if (regex.test(content)) {
      content = content.replace(regex, `var(${newToken})`);
      modified = true;
    }

    // Also replace direct token references
    const directRegex = new RegExp(
      oldToken.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&"),
      "g"
    );
    if (directRegex.test(content)) {
      content = content.replace(directRegex, newToken);
      modified = true;
    }
  }

  // Migrate utility classes
  for (const [oldClass, newClass] of Object.entries(utilityMappings)) {
    const regex = new RegExp(`\\b${oldClass}\\b`, "g");
    if (regex.test(content)) {
      content = content.replace(regex, newClass);
      modified = true;
    }
  }

  if (modified) {
    fs.writeFileSync(filePath, content, "utf8");
    console.log(`✅ Migrated: ${filePath}`);
    return true;
  } else {
    console.log(`⚪ No changes needed: ${filePath}`);
    return false;
  }
}

function findFilesToMigrate(
  dir,
  extensions = [".css", ".tsx", ".ts", ".jsx", ".js"]
) {
  const files = [];

  function traverse(currentDir) {
    const items = fs.readdirSync(currentDir);

    for (const item of items) {
      const fullPath = path.join(currentDir, item);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        // Skip node_modules and .git directories
        if (
          !["node_modules", ".git", ".next", "dist", "build"].includes(item)
        ) {
          traverse(fullPath);
        }
      } else if (extensions.some((ext) => item.endsWith(ext))) {
        files.push(fullPath);
      }
    }
  }

  traverse(dir);
  return files;
}

// Main migration function
function runMigration() {
  console.log("🚀 Starting CSS Token Migration\n");

  const srcDir = path.join(__dirname, "src");
  const files = findFilesToMigrate(srcDir);

  console.log(`📁 Found ${files.length} files to check for migration\n`);

  let migratedCount = 0;
  let checkedCount = 0;

  for (const file of files) {
    checkedCount++;
    if (migrateFile(file)) {
      migratedCount++;
    }
  }

  console.log(`\n📊 Migration Summary:`);
  console.log(`Files checked: ${checkedCount}`);
  console.log(`Files migrated: ${migratedCount}`);
  console.log(`Files unchanged: ${checkedCount - migratedCount}`);

  if (migratedCount > 0) {
    console.log("\n✨ Migration completed successfully!");
    console.log("\n📋 Next steps:");
    console.log("1. Update your imports to use tokens-optimized.ts");
    console.log("2. Replace design-tokens.css with tokens-optimized.css");
    console.log(
      "3. Update tailwind.config.ts with tailwind-optimized.config.ts"
    );
    console.log("4. Test your application thoroughly");
    console.log("5. Run npm run build to verify everything works");
  } else {
    console.log(
      "\n🎯 No files needed migration - you might already be using optimized tokens!"
    );
  }
}

// Create backup function
function createBackup() {
  const backupDir = path.join(__dirname, "backup-tokens");
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir);
  }

  const filesToBackup = [
    "src/styles/design-tokens.css",
    "src/styles/tokens.ts",
    "src/styles/theme.ts",
    "tailwind.config.ts",
  ];

  console.log("💾 Creating backup of original token files...\n");

  for (const file of filesToBackup) {
    const srcPath = path.join(__dirname, file);
    if (fs.existsSync(srcPath)) {
      const backupPath = path.join(backupDir, path.basename(file));
      fs.copyFileSync(srcPath, backupPath);
      console.log(`✅ Backed up: ${file}`);
    }
  }

  console.log(`\n📁 Backup created in: ${backupDir}\n`);
}

// Run migration
if (process.argv.includes("--backup")) {
  createBackup();
}

if (process.argv.includes("--migrate")) {
  runMigration();
} else {
  console.log("🎨 CSS Token Migration Tool\n");
  console.log("Usage:");
  console.log(
    "  node migrate-tokens.mjs --backup    # Create backup of current files"
  );
  console.log("  node migrate-tokens.mjs --migrate   # Run the migration");
  console.log(
    "  node migrate-tokens.mjs --backup --migrate  # Backup and migrate"
  );
  console.log(
    "\n💡 Tip: Always run --backup first to save your current tokens!"
  );
}

export { migrateFile, findFilesToMigrate, tokenMappings, utilityMappings };
