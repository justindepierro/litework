#!/usr/bin/env node
/**
 * Export Database Schema and Data
 * Creates CSV files for all tables so we can inspect the current state
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: resolve(__dirname, '../../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Create export directory
const exportDir = resolve(__dirname, '../../database-export');
if (!fs.existsSync(exportDir)) {
  fs.mkdirSync(exportDir, { recursive: true });
}

console.log('🔍 Exporting Database Schema and Data\n');
console.log(`📁 Export directory: ${exportDir}\n`);

// List of tables to export (workout-related and core tables)
const tablesToExport = [
  'users',
  'athlete_groups',
  'workout_plans',
  'workout_exercises',
  'workout_exercise_groups',
  'workout_block_instances',
  'workout_sessions',
  'workout_assignments',
  'session_exercises',
  'set_records',
  'exercises',
  'exercise_muscle_groups',
  'exercise_analytics',
];

async function exportTableSchema(tableName) {
  console.log(`📊 Table: ${tableName}`);
  console.log('─'.repeat(80));

  try {
    // Get table schema
    const { data: columns, error } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable, column_default')
      .eq('table_schema', 'public')
      .eq('table_name', tableName)
      .order('ordinal_position');

    if (error) {
      // Try alternative method - direct RPC or just skip
      console.log(`   ⚠️  Could not fetch schema (table may not exist)\n`);
      return null;
    }

    if (!columns || columns.length === 0) {
      console.log(`   ❌ Table does not exist\n`);
      return null;
    }

    console.log(`   ✅ ${columns.length} columns found`);
    
    // Save schema to file
    const schemaFile = resolve(exportDir, `${tableName}_schema.csv`);
    const schemaCSV = [
      'column_name,data_type,is_nullable,column_default',
      ...columns.map(col => 
        `"${col.column_name}","${col.data_type}","${col.is_nullable}","${col.column_default || ''}"`
      )
    ].join('\n');
    
    fs.writeFileSync(schemaFile, schemaCSV);
    console.log(`   📝 Schema saved: ${tableName}_schema.csv`);

    return columns;

  } catch (err) {
    console.log(`   ❌ Error: ${err.message}\n`);
    return null;
  }
}

async function exportTableData(tableName) {
  try {
    // Get data from table
    const { data, error, count } = await supabase
      .from(tableName)
      .select('*', { count: 'exact' })
      .limit(1000); // Limit to prevent huge exports

    if (error) {
      console.log(`   ⚠️  Could not fetch data: ${error.message}`);
      return;
    }

    if (!data || data.length === 0) {
      console.log(`   📊 No data in table`);
      return;
    }

    console.log(`   📊 ${count || data.length} rows found`);

    // Convert to CSV
    const dataFile = resolve(exportDir, `${tableName}_data.csv`);
    
    // Get all unique keys from all objects (in case of varying schemas)
    const allKeys = new Set();
    data.forEach(row => {
      Object.keys(row).forEach(key => allKeys.add(key));
    });
    const headers = Array.from(allKeys);

    // Create CSV content
    const csvRows = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => {
          const value = row[header];
          if (value === null || value === undefined) return '';
          if (typeof value === 'object') return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
          if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value;
        }).join(',')
      )
    ];

    fs.writeFileSync(dataFile, csvRows.join('\n'));
    console.log(`   💾 Data saved: ${tableName}_data.csv`);

  } catch (err) {
    console.log(`   ⚠️  Error fetching data: ${err.message}`);
  }
}

async function exportAllTables() {
  for (const tableName of tablesToExport) {
    const schema = await exportTableSchema(tableName);
    
    if (schema) {
      await exportTableData(tableName);
    }
    
    console.log(''); // Empty line between tables
  }
}

// Create a summary report
async function createSummaryReport() {
  console.log('📋 Creating Summary Report...\n');

  const summaryFile = resolve(exportDir, 'SUMMARY.txt');
  const summaryLines = [
    '=' .repeat(80),
    'LiteWork Database Export Summary',
    `Generated: ${new Date().toISOString()}`,
    '=' .repeat(80),
    '',
    'TABLES FOUND:',
    '─'.repeat(80),
  ];

  // Check which files were created
  const files = fs.readdirSync(exportDir);
  const schemaFiles = files.filter(f => f.endsWith('_schema.csv'));
  const dataFiles = files.filter(f => f.endsWith('_data.csv'));

  schemaFiles.forEach(file => {
    const tableName = file.replace('_schema.csv', '');
    const hasData = dataFiles.includes(`${tableName}_data.csv`);
    const dataFile = resolve(exportDir, `${tableName}_data.csv`);
    
    let rowCount = 0;
    if (hasData && fs.existsSync(dataFile)) {
      const content = fs.readFileSync(dataFile, 'utf-8');
      rowCount = content.split('\n').length - 1; // Subtract header
    }

    summaryLines.push(`✅ ${tableName.padEnd(35)} | ${rowCount} rows`);
  });

  summaryLines.push('');
  summaryLines.push('MISSING TABLES (not found in database):');
  summaryLines.push('─'.repeat(80));

  const foundTables = schemaFiles.map(f => f.replace('_schema.csv', ''));
  const missingTables = tablesToExport.filter(t => !foundTables.includes(t));

  if (missingTables.length === 0) {
    summaryLines.push('✅ All tables found!');
  } else {
    missingTables.forEach(table => {
      summaryLines.push(`❌ ${table}`);
    });
  }

  summaryLines.push('');
  summaryLines.push('=' .repeat(80));
  summaryLines.push('FILES EXPORTED:');
  summaryLines.push('─'.repeat(80));
  summaryLines.push(`Total schema files: ${schemaFiles.length}`);
  summaryLines.push(`Total data files: ${dataFiles.length}`);
  summaryLines.push('');
  summaryLines.push('To share: Zip the database-export/ folder and share');
  summaryLines.push('=' .repeat(80));

  const summary = summaryLines.join('\n');
  fs.writeFileSync(summaryFile, summary);

  console.log(summary);
}

// Run the export
try {
  await exportAllTables();
  await createSummaryReport();
  
  console.log('\n');
  console.log('✅ Export Complete!');
  console.log('');
  console.log('📁 Files are in: database-export/');
  console.log('');
  console.log('To share with me:');
  console.log('  1. cd database-export');
  console.log('  2. Open the folder in Finder');
  console.log('  3. Share the SUMMARY.txt and any *_schema.csv files');
  console.log('');
  
} catch (err) {
  console.error('❌ Export failed:', err);
  process.exit(1);
}
