#!/usr/bin/env node
/**
 * Performance & Efficiency Audit Script
 * 
 * Analyzes the codebase for:
 * 1. Database query inefficiencies (N+1, select *, missing joins)
 * 2. React performance issues (missing memo, expensive renders)
 * 3. Bundle size problems (large dependencies, duplicate code)
 * 4. Runtime performance (inefficient algorithms, unnecessary work)
 */

import { execSync } from 'child_process';
import { readFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';
import chalk from 'chalk';

const ROOT = process.cwd();
const SRC = join(ROOT, 'src');

console.log(chalk.bold.blue('\n🔍 Performance & Efficiency Audit\n'));

let totalIssues = 0;
const issuesByCategory = {
  database: [],
  react: [],
  bundle: [],
  runtime: []
};

// ==========================================
// 1. DATABASE QUERY ANALYSIS
// ==========================================
console.log(chalk.bold.yellow('📊 Database Query Analysis\n'));

// Check for select * patterns
console.log(chalk.gray('Checking for inefficient SELECT * queries...'));
try {
  const selectStarResults = execSync(
    `git grep -n "\\.select\\(.*\*" -- "src/**/*.ts" "src/**/*.tsx" || true`,
    { encoding: 'utf-8' }
  );
  
  if (selectStarResults.trim()) {
    const lines = selectStarResults.trim().split('\n');
    const filtered = lines.filter(line => 
      !line.includes('select("*")') && // Allow explicit select("*")
      !line.includes('// OK') && // Allow commented exceptions
      line.includes('.select(')
    );
    
    if (filtered.length > 0) {
      console.log(chalk.yellow(`  ⚠️  Found ${filtered.length} potential SELECT * issues\n`));
      filtered.slice(0, 5).forEach(line => {
        const [file, ...rest] = line.split(':');
        console.log(chalk.gray(`     ${file}:${rest[0]}`));
      });
      if (filtered.length > 5) {
        console.log(chalk.gray(`     ... and ${filtered.length - 5} more\n`));
      }
      issuesByCategory.database.push({
        type: 'SELECT *',
        count: filtered.length,
        severity: 'medium',
        recommendation: 'Specify exact columns needed to reduce data transfer'
      });
      totalIssues += filtered.length;
    } else {
      console.log(chalk.green('  ✓ No problematic SELECT * patterns found\n'));
    }
  } else {
    console.log(chalk.green('  ✓ No SELECT * patterns found\n'));
  }
} catch (error) {
  // No matches
  console.log(chalk.green('  ✓ No SELECT * patterns found\n'));
}

// Check for queries in loops (N+1 pattern)
console.log(chalk.gray('Checking for N+1 query patterns...'));
try {
  const files = execSync(
    `find ${SRC} -name "*.ts" -o -name "*.tsx"`,
    { encoding: 'utf-8' }
  ).trim().split('\n');
  
  let n1Issues = [];
  files.forEach(file => {
    try {
      const content = readFileSync(file, 'utf-8');
      const lines = content.split('\n');
      
      lines.forEach((line, idx) => {
        // Check for await supabase inside loops
        if (line.includes('await supabase') && idx > 0) {
          const prevLines = lines.slice(Math.max(0, idx - 5), idx).join(' ');
          if (prevLines.match(/\.(map|forEach|for)\s*\(/)) {
            n1Issues.push({
              file: file.replace(ROOT + '/', ''),
              line: idx + 1,
              code: line.trim()
            });
          }
        }
      });
    } catch (err) {
      // Skip unreadable files
    }
  });
  
  if (n1Issues.length > 0) {
    console.log(chalk.red(`  ❌ Found ${n1Issues.length} potential N+1 query patterns\n`));
    n1Issues.slice(0, 3).forEach(issue => {
      console.log(chalk.red(`     ${issue.file}:${issue.line}`));
      console.log(chalk.gray(`     ${issue.code}\n`));
    });
    issuesByCategory.database.push({
      type: 'N+1 queries',
      count: n1Issues.length,
      severity: 'high',
      recommendation: 'Use batch queries or joins to fetch related data'
    });
    totalIssues += n1Issues.length;
  } else {
    console.log(chalk.green('  ✓ No N+1 query patterns detected\n'));
  }
} catch (error) {
  console.log(chalk.yellow('  ⚠️  Could not analyze N+1 patterns\n'));
}

// Check for missing indexes
console.log(chalk.gray('Checking database index coverage...'));
try {
  const indexFile = join(ROOT, 'database/performance-indexes-nov-2025.sql');
  const indexContent = readFileSync(indexFile, 'utf-8');
  const indexCount = (indexContent.match(/CREATE INDEX/gi) || []).length;
  console.log(chalk.green(`  ✓ Found ${indexCount} performance indexes defined\n`));
} catch (error) {
  console.log(chalk.yellow('  ⚠️  No index file found (database/performance-indexes-nov-2025.sql)\n'));
  issuesByCategory.database.push({
    type: 'Missing indexes',
    severity: 'high',
    recommendation: 'Create performance indexes for frequently queried columns'
  });
  totalIssues++;
}

// ==========================================
// 2. REACT PERFORMANCE ANALYSIS
// ==========================================
console.log(chalk.bold.yellow('⚛️  React Performance Analysis\n'));

// Check for components without React.memo
console.log(chalk.gray('Analyzing component memoization...'));
try {
  const componentFiles = execSync(
    `find ${SRC}/components -name "*.tsx" | grep -v ".test." || true`,
    { encoding: 'utf-8' }
  ).trim().split('\n').filter(Boolean);
  
  let unmemoizedComponents = [];
  componentFiles.forEach(file => {
    try {
      const content = readFileSync(file, 'utf-8');
      const hasExport = /export (default )?function|export const \w+ = /.test(content);
      const hasMemo = /React\.memo|memo\(/.test(content);
      const isLarge = content.length > 500; // Files > 500 chars are "substantial"
      
      if (hasExport && !hasMemo && isLarge) {
        unmemoizedComponents.push(file.replace(ROOT + '/', ''));
      }
    } catch (err) {
      // Skip
    }
  });
  
  if (unmemoizedComponents.length > 0) {
    console.log(chalk.yellow(`  ⚠️  ${unmemoizedComponents.length} components could benefit from React.memo\n`));
    unmemoizedComponents.slice(0, 5).forEach(file => {
      console.log(chalk.gray(`     ${file}`));
    });
    if (unmemoizedComponents.length > 5) {
      console.log(chalk.gray(`     ... and ${unmemoizedComponents.length - 5} more\n`));
    }
    issuesByCategory.react.push({
      type: 'Missing React.memo',
      count: unmemoizedComponents.length,
      severity: 'medium',
      recommendation: 'Wrap components in React.memo to prevent unnecessary re-renders'
    });
    totalIssues += unmemoizedComponents.length;
  } else {
    console.log(chalk.green('  ✓ Component memoization looks good\n'));
  }
} catch (error) {
  console.log(chalk.yellow('  ⚠️  Could not analyze component memoization\n'));
}

// Check for missing useMemo/useCallback
console.log(chalk.gray('Checking for expensive computations without memoization...'));
try {
  const expensivePatterns = [
    '\\.filter\\(',
    '\\.map\\(',
    '\\.sort\\(',
    '\\.reduce\\(',
    'new Date\\(',
    'JSON\\.parse\\(',
    'JSON\\.stringify\\('
  ];
  
  let expensiveWithoutMemo = [];
  const componentFiles = execSync(
    `find ${SRC}/components -name "*.tsx" || true`,
    { encoding: 'utf-8' }
  ).trim().split('\n').filter(Boolean);
  
  componentFiles.forEach(file => {
    try {
      const content = readFileSync(file, 'utf-8');
      const lines = content.split('\n');
      
      lines.forEach((line, idx) => {
        expensivePatterns.forEach(pattern => {
          const regex = new RegExp(pattern);
          if (regex.test(line)) {
            // Check if it's inside a function component
            const prevLines = lines.slice(Math.max(0, idx - 10), idx).join('\n');
            const nextLines = lines.slice(idx, Math.min(lines.length, idx + 3)).join('\n');
            
            const inComponent = /function \w+\(|const \w+ = \(/.test(prevLines);
            const hasMemo = /useMemo|useCallback/.test(nextLines);
            
            if (inComponent && !hasMemo && !line.includes('useMemo') && !line.includes('useCallback')) {
              expensiveWithoutMemo.push({
                file: file.replace(ROOT + '/', ''),
                line: idx + 1,
                pattern: pattern.replace(/\\/g, '')
              });
            }
          }
        });
      });
    } catch (err) {
      // Skip
    }
  });
  
  // Deduplicate and limit
  const uniqueFiles = [...new Set(expensiveWithoutMemo.map(i => i.file))];
  
  if (uniqueFiles.length > 0) {
    console.log(chalk.yellow(`  ⚠️  ${uniqueFiles.length} files with potentially expensive unmemoized operations\n`));
    uniqueFiles.slice(0, 3).forEach(file => {
      console.log(chalk.gray(`     ${file}`));
    });
    if (uniqueFiles.length > 3) {
      console.log(chalk.gray(`     ... and ${uniqueFiles.length - 3} more\n`));
    }
    issuesByCategory.react.push({
      type: 'Missing useMemo/useCallback',
      count: uniqueFiles.length,
      severity: 'low',
      recommendation: 'Consider memoizing expensive computations and callback functions'
    });
    totalIssues += uniqueFiles.length;
  } else {
    console.log(chalk.green('  ✓ Memoization patterns look good\n'));
  }
} catch (error) {
  console.log(chalk.yellow('  ⚠️  Could not analyze expensive computations\n'));
}

// ==========================================
// 3. BUNDLE SIZE ANALYSIS
// ==========================================
console.log(chalk.bold.yellow('📦 Bundle Size Analysis\n'));

// Check for large dependencies
console.log(chalk.gray('Analyzing package.json for large dependencies...'));
try {
  const packageJson = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf-8'));
  const allDeps = { ...packageJson.dependencies, ...packageJson.devDependencies };
  
  const heavyDeps = [
    { name: 'moment', size: '~70KB', alternative: 'date-fns or native Date' },
    { name: 'lodash', size: '~70KB', alternative: 'lodash-es with tree-shaking' },
    { name: '@mui/material', size: '~300KB', alternative: 'headless UI + custom styles' },
    { name: 'axios', size: '~13KB', alternative: 'native fetch' },
  ];
  
  const foundHeavy = heavyDeps.filter(dep => allDeps[dep.name]);
  
  if (foundHeavy.length > 0) {
    console.log(chalk.yellow(`  ⚠️  Found ${foundHeavy.length} potentially heavy dependencies\n`));
    foundHeavy.forEach(dep => {
      console.log(chalk.yellow(`     ${dep.name} (${dep.size})`));
      console.log(chalk.gray(`     Consider: ${dep.alternative}\n`));
    });
    issuesByCategory.bundle.push({
      type: 'Heavy dependencies',
      count: foundHeavy.length,
      severity: 'medium',
      recommendation: 'Consider lighter alternatives or ensure proper tree-shaking'
    });
    totalIssues += foundHeavy.length;
  } else {
    console.log(chalk.green('  ✓ No obviously heavy dependencies found\n'));
  }
} catch (error) {
  console.log(chalk.yellow('  ⚠️  Could not analyze dependencies\n'));
}

// Check for duplicate code
console.log(chalk.gray('Checking for potential code duplication...'));
try {
  // Check for similar function names across files
  const functionNames = execSync(
    `git grep -h "^\\s*function \\|^\\s*const .* = " -- "src/**/*.ts" "src/**/*.tsx" | sed 's/.*function \\|.*const //' | sed 's/[=(].*//' | sort || true`,
    { encoding: 'utf-8' }
  ).trim().split('\n').filter(Boolean);
  
  const nameCounts = {};
  functionNames.forEach(name => {
    const cleaned = name.trim();
    if (cleaned) {
      nameCounts[cleaned] = (nameCounts[cleaned] || 0) + 1;
    }
  });
  
  const duplicates = Object.entries(nameCounts)
    .filter(([name, count]) => count > 2 && name.length > 5)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
  
  if (duplicates.length > 0) {
    console.log(chalk.yellow(`  ⚠️  Found ${duplicates.length} potentially duplicated function names\n`));
    duplicates.forEach(([name, count]) => {
      console.log(chalk.gray(`     ${name} (${count} occurrences)`));
    });
    console.log(chalk.gray('\n     Consider extracting to shared utilities\n'));
    issuesByCategory.bundle.push({
      type: 'Code duplication',
      count: duplicates.length,
      severity: 'low',
      recommendation: 'Extract common functionality to shared utilities'
    });
    totalIssues += duplicates.length;
  } else {
    console.log(chalk.green('  ✓ No significant code duplication detected\n'));
  }
} catch (error) {
  console.log(chalk.yellow('  ⚠️  Could not analyze code duplication\n'));
}

// ==========================================
// 4. RUNTIME PERFORMANCE ANALYSIS
// ==========================================
console.log(chalk.bold.yellow('⚡ Runtime Performance Analysis\n'));

// Check for console.log in production code
console.log(chalk.gray('Checking for console statements...'));
try {
  const consoleResults = execSync(
    `git grep -n "console\\." -- "src/**/*.ts" "src/**/*.tsx" | grep -v "console.error\\|console.warn\\|// OK\\|/\\*.*console" || true`,
    { encoding: 'utf-8' }
  );
  
  if (consoleResults.trim()) {
    const lines = consoleResults.trim().split('\n').filter(line => 
      !line.includes('console.error') &&
      !line.includes('console.warn') &&
      !line.includes('// OK') &&
      !line.includes('logger')
    );
    
    if (lines.length > 0) {
      console.log(chalk.yellow(`  ⚠️  Found ${lines.length} console statements (should be removed in production)\n`));
      console.log(chalk.gray(`     Run: node scripts/dev/console-cleanup.mjs\n`));
      issuesByCategory.runtime.push({
        type: 'Console statements',
        count: lines.length,
        severity: 'low',
        recommendation: 'Remove console.log statements from production code'
      });
      totalIssues += lines.length;
    } else {
      console.log(chalk.green('  ✓ No problematic console statements\n'));
    }
  } else {
    console.log(chalk.green('  ✓ No problematic console statements\n'));
  }
} catch (error) {
  console.log(chalk.green('  ✓ No problematic console statements\n'));
}

// Check for inefficient array operations
console.log(chalk.gray('Checking for inefficient array operations...'));
try {
  const inefficientPatterns = [
    { pattern: '\\.includes\\(.*\\.find\\(', issue: 'Nested find() + includes()' },
    { pattern: 'for.*for', issue: 'Nested loops' },
    { pattern: '\\.map\\(.*\\.map\\(', issue: 'Nested map() calls' },
  ];
  
  let inefficientOps = [];
  inefficientPatterns.forEach(({ pattern, issue }) => {
    try {
      const results = execSync(
        `git grep -n "${pattern}" -- "src/**/*.ts" "src/**/*.tsx" || true`,
        { encoding: 'utf-8' }
      );
      if (results.trim()) {
        const lines = results.trim().split('\n');
        inefficientOps.push({ issue, count: lines.length });
      }
    } catch (e) {
      // No matches
    }
  });
  
  if (inefficientOps.length > 0) {
    console.log(chalk.yellow(`  ⚠️  Found ${inefficientOps.length} types of potentially inefficient operations\n`));
    inefficientOps.forEach(op => {
      console.log(chalk.gray(`     ${op.issue}: ${op.count} occurrences`));
    });
    console.log();
    issuesByCategory.runtime.push({
      type: 'Inefficient operations',
      count: inefficientOps.reduce((sum, op) => sum + op.count, 0),
      severity: 'medium',
      recommendation: 'Review nested loops and array operations for optimization'
    });
    totalIssues += inefficientOps.length;
  } else {
    console.log(chalk.green('  ✓ No obvious inefficient operations detected\n'));
  }
} catch (error) {
  console.log(chalk.yellow('  ⚠️  Could not analyze array operations\n'));
}

// ==========================================
// SUMMARY & RECOMMENDATIONS
// ==========================================
console.log(chalk.bold.blue('\n📊 Performance Audit Summary\n'));

const severityCounts = {
  high: 0,
  medium: 0,
  low: 0
};

Object.values(issuesByCategory).flat().forEach(issue => {
  severityCounts[issue.severity]++;
});

console.log(`Total issues found: ${chalk.yellow(totalIssues)}`);
console.log(`  ${chalk.red('High severity:')} ${severityCounts.high}`);
console.log(`  ${chalk.yellow('Medium severity:')} ${severityCounts.medium}`);
console.log(`  ${chalk.gray('Low severity:')} ${severityCounts.low}\n`);

if (totalIssues > 0) {
  console.log(chalk.bold.yellow('🎯 Top Recommendations:\n'));
  
  // Prioritize recommendations
  const allIssues = Object.entries(issuesByCategory)
    .flatMap(([category, issues]) => 
      issues.map(issue => ({ ...issue, category }))
    )
    .sort((a, b) => {
      const severityOrder = { high: 0, medium: 1, low: 2 };
      return severityOrder[a.severity] - severityOrder[b.severity];
    });
  
  allIssues.slice(0, 5).forEach((issue, idx) => {
    const icon = issue.severity === 'high' ? '🔴' : issue.severity === 'medium' ? '🟡' : '⚪';
    console.log(`${idx + 1}. ${icon} ${issue.type} (${issue.category})`);
    console.log(chalk.gray(`   ${issue.recommendation}\n`));
  });
  
  console.log(chalk.bold.blue('💡 Quick Wins:\n'));
  console.log(chalk.gray('1. Run database performance indexes: database/performance-indexes-nov-2025.sql'));
  console.log(chalk.gray('2. Remove console.log statements: node scripts/dev/console-cleanup.mjs'));
  console.log(chalk.gray('3. Add React.memo to large components'));
  console.log(chalk.gray('4. Review N+1 queries and add batch loading\n'));
  
  process.exit(1);
} else {
  console.log(chalk.green('✅ No critical performance issues found!'));
  console.log(chalk.gray('The codebase appears well-optimized.\n'));
  process.exit(0);
}
