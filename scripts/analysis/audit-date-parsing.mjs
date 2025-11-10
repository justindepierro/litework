#!/usr/bin/env node
/**
 * Date Parsing Audit Script
 * 
 * Finds all instances of `new Date()` that might be parsing date-only strings
 * and could cause timezone issues.
 * 
 * ISSUE: PostgreSQL DATE columns (YYYY-MM-DD) parsed with `new Date()` 
 * are interpreted as midnight UTC, causing day shifts in local timezones.
 * 
 * SOLUTION: Use `parseDate()` from date-utils.ts instead.
 */

import { execSync } from 'child_process';
import chalk from 'chalk';

console.log(chalk.bold.blue('\n🔍 Date Parsing Audit\n'));
console.log(chalk.gray('Searching for potentially problematic date parsing...\n'));

const problematicPatterns = [
  {
    name: 'new Date() with date-like variables',
    pattern: 'new Date\\([^)]*\\b(date|Date|scheduled|assigned|created_at|updated_at)\\b[^)]*\\)',
    severity: 'medium',
    description: 'May be parsing date-only strings incorrectly'
  },
  {
    name: 'scheduled_date without parseDate',
    pattern: 'new Date\\([^)]*scheduled_date',
    severity: 'high',
    description: 'scheduled_date is a DATE column, must use parseDate()'
  },
  {
    name: 'assignment.scheduledDate without parseDate',
    pattern: 'new Date\\(assignment\\.scheduledDate',
    severity: 'high',
    description: 'scheduledDate should already be parsed in getAllAssignments()'
  }
];

let totalIssues = 0;
const issuesByFile = new Map();

problematicPatterns.forEach(({ name, pattern, severity, description }) => {
  console.log(chalk.bold.yellow(`\n📋 ${name}`));
  console.log(chalk.gray(`   Pattern: ${pattern}`));
  console.log(chalk.gray(`   Severity: ${severity}`));
  console.log(chalk.gray(`   Issue: ${description}\n`));

  try {
    // Use git grep to search only tracked files
    const results = execSync(
      `git grep -n -E "${pattern}" -- "*.ts" "*.tsx" "*.js" "*.jsx" || true`,
      { encoding: 'utf-8', cwd: process.cwd() }
    );

    if (results.trim()) {
      const lines = results.trim().split('\n');
      
      // Filter out safe files
      const filtered = lines.filter(line => {
        // Skip date-utils.ts (it's the solution!)
        if (line.includes('date-utils.ts')) return false;
        // Skip test files
        if (line.includes('.test.') || line.includes('.spec.')) return false;
        return true;
      });

      if (filtered.length > 0) {
        filtered.forEach(line => {
          const [file, ...rest] = line.split(':');
          const lineNum = rest[0];
          const code = rest.slice(1).join(':').trim();
          
          console.log(chalk.yellow(`   ${file}:${lineNum}`));
          console.log(chalk.gray(`   ${code}\n`));
          
          if (!issuesByFile.has(file)) {
            issuesByFile.set(file, []);
          }
          issuesByFile.get(file).push({
            line: lineNum,
            code,
            pattern: name,
            severity
          });
        });
        totalIssues += filtered.length;
      } else {
        console.log(chalk.green('   ✓ No issues found\n'));
      }
    } else {
      console.log(chalk.green('   ✓ No issues found\n'));
    }
  } catch (error) {
    // Git grep returns exit code 1 when no matches found
    if (!error.message.includes('Command failed')) {
      console.error(chalk.red(`   Error: ${error.message}\n`));
    }
  }
});

// Summary
console.log(chalk.bold.blue('\n📊 Summary\n'));
console.log(`Total potential issues: ${chalk.yellow(totalIssues)}`);
console.log(`Files affected: ${chalk.yellow(issuesByFile.size)}\n`);

if (issuesByFile.size > 0) {
  console.log(chalk.bold.yellow('Files with issues:\n'));
  issuesByFile.forEach((issues, file) => {
    const highSeverity = issues.filter(i => i.severity === 'high').length;
    const mediumSeverity = issues.filter(i => i.severity === 'medium').length;
    
    console.log(chalk.yellow(`  ${file}`));
    if (highSeverity > 0) {
      console.log(chalk.red(`    ${highSeverity} high severity`));
    }
    if (mediumSeverity > 0) {
      console.log(chalk.yellow(`    ${mediumSeverity} medium severity`));
    }
  });
}

console.log(chalk.bold.blue('\n💡 Recommendations\n'));
console.log(chalk.gray('1. Review each instance of new Date() with date variables'));
console.log(chalk.gray('2. If parsing DATE columns (YYYY-MM-DD), use parseDate() from date-utils.ts'));
console.log(chalk.gray('3. If parsing TIMESTAMP columns (ISO 8601), new Date() is fine'));
console.log(chalk.gray('4. Add JSDoc comments to clarify what format each variable contains\n'));

// Exit with error code if high severity issues found
const highSeverityCount = Array.from(issuesByFile.values())
  .flat()
  .filter(i => i.severity === 'high').length;

if (highSeverityCount > 0) {
  console.log(chalk.red(`⚠️  Found ${highSeverityCount} high severity issues that need attention\n`));
  process.exit(1);
} else if (totalIssues > 0) {
  console.log(chalk.yellow(`⚠️  Found ${totalIssues} issues to review\n`));
  process.exit(0);
} else {
  console.log(chalk.green('✅ No critical date parsing issues found!\n'));
  process.exit(0);
}
