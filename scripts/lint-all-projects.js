#!/usr/bin/env node

/**
 * lint-all-projects.js
 * Runs lint and typecheck across all projects in the examples-hub monorepo
 * Skips projects that don't have these scripts configured
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function findProjectDirectories() {
  const projectDirs = new Set();
  
  function traverse(dir, depth = 0) {
    if (depth > 4) return;
    
    const skipDirs = ['node_modules', '.next', '.output', 'dist', '.yarn', 'build', '.cache', '.git'];
    const dirName = path.basename(dir);
    if (skipDirs.includes(dirName)) return;
    
    try {
      const items = fs.readdirSync(dir);
      
      if (items.includes('package.json')) {
        projectDirs.add(dir);
      }
      
      for (const item of items) {
        const fullPath = path.join(dir, item);
        try {
          const stat = fs.statSync(fullPath);
          if (stat.isDirectory()) {
            traverse(fullPath, depth + 1);
          }
        } catch (err) {
          // Skip inaccessible directories
        }
      }
    } catch (err) {
      // Skip inaccessible directories
    }
  }
  
  traverse('.');
  return Array.from(projectDirs).sort();
}

function hasScript(dir, scriptName) {
  try {
    const packageJsonPath = path.join(dir, 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    return packageJson.scripts && packageJson.scripts[scriptName];
  } catch (err) {
    return false;
  }
}

function runLintAndTypecheck() {
  console.log('🔍 Running lint and typecheck across all projects');
  console.log('============================================================');
  
  const projectDirs = findProjectDirectories();
  let total = 0;
  let lintPassed = 0;
  let lintFailed = 0;
  let lintSkipped = 0;
  let typecheckPassed = 0;
  let typecheckFailed = 0;
  let typecheckSkipped = 0;
  
  for (const dir of projectDirs) {
    total++;
    
    console.log('');
    console.log(`📦 Processing: ${dir}`);
    
    // Check for lint script
    if (hasScript(dir, 'lint')) {
      console.log('🔍 Running lint...');
      try {
        execSync('yarn lint', {
          cwd: dir,
          stdio: 'pipe',
          timeout: 60000
        });
        console.log('  ✅ Lint passed');
        lintPassed++;
      } catch (error) {
        console.log('  ❌ Lint failed');
        lintFailed++;
      }
    } else {
      console.log('  ⏭️ Lint: no script');
      lintSkipped++;
    }
    
    // Check for typecheck script
    if (hasScript(dir, 'typecheck')) {
      console.log('📝 Running typecheck...');
      try {
        execSync('yarn typecheck', {
          cwd: dir,
          stdio: 'pipe',
          timeout: 60000
        });
        console.log('  ✅ Typecheck passed');
        typecheckPassed++;
      } catch (error) {
        console.log('  ❌ Typecheck failed');
        typecheckFailed++;
      }
    } else {
      console.log('  ⏭️ Typecheck: no script');
      typecheckSkipped++;
    }
  }
  
  console.log('');
  console.log('============================================================');
  console.log('📊 Lint & Typecheck Summary:');
  console.log(`   Total projects: ${total}`);
  console.log('');
  console.log('   Lint Results:');
  console.log(`     ✅ Passed: ${lintPassed}`);
  console.log(`     ❌ Failed: ${lintFailed}`);
  console.log(`     ⏭️ Skipped: ${lintSkipped}`);
  console.log('');
  console.log('   Typecheck Results:');
  console.log(`     ✅ Passed: ${typecheckPassed}`);
  console.log(`     ❌ Failed: ${typecheckFailed}`);
  console.log(`     ⏭️ Skipped: ${typecheckSkipped}`);
  console.log('============================================================');
  
  if (lintFailed > 0 || typecheckFailed > 0) {
    console.log('⚠️ Some checks failed. Review the output above for details.');
    process.exit(1);
  } else {
    console.log('🎉 All lint and typecheck operations completed successfully!');
    process.exit(0);
  }
}

// Handle command line arguments
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log('Usage: node lint-all-projects.js');
  console.log('');
  console.log('Runs lint and typecheck on all projects that have these scripts configured');
  console.log('Skips projects without lint/typecheck scripts');
  process.exit(0);
}

runLintAndTypecheck();