#!/usr/bin/env node

/**
 * typecheck-all-projects.js
 * Runs typecheck across all projects in the examples-hub monorepo
 * Skips projects that don't have typecheck scripts configured
 * Supports parallel execution with concurrency limits
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Simple concurrency limiter
class ConcurrencyLimiter {
  constructor(limit) {
    this.limit = limit;
    this.running = 0;
    this.queue = [];
  }

  async run(task) {
    return new Promise((resolve, reject) => {
      this.queue.push({ task, resolve, reject });
      this.process();
    });
  }

  async process() {
    if (this.running >= this.limit || this.queue.length === 0) {
      return;
    }

    this.running++;
    const { task, resolve, reject } = this.queue.shift();

    try {
      const result = await task();
      resolve(result);
    } catch (error) {
      reject(error);
    } finally {
      this.running--;
      this.process();
    }
  }
}

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

async function runTypecheckAll() {
  console.log('📝 Running typecheck across all projects (parallel execution)');
  console.log('============================================================');
  
  const projectDirs = findProjectDirectories();
  const concurrencyLimit = 4;
  const limiter = new ConcurrencyLimiter(concurrencyLimit);
  
  let total = 0;
  let typecheckPassed = 0;
  let typecheckFailed = 0;
  let typecheckSkipped = 0;
  
  const typecheckTasks = [];
  
  // Prepare typecheck tasks
  for (const dir of projectDirs) {
    total++;
    
    if (hasScript(dir, 'typecheck')) {
      const task = async () => {
        console.log(`📝 Running typecheck: ${dir}`);
        try {
          execSync('yarn typecheck', {
            cwd: dir,
            stdio: 'pipe',
            timeout: 300000 // 5 minute timeout per typecheck
          });
          console.log(`✅ Typecheck passed: ${dir}`);
          return { dir, type: 'typecheck', status: 'passed' };
        } catch (error) {
          console.log(`❌ Typecheck failed: ${dir}`);
          return { dir, type: 'typecheck', status: 'failed', error: error.message.split('\n')[0] };
        }
      };
      typecheckTasks.push(limiter.run(task));
    } else {
      typecheckSkipped++;
      console.log(`⏭️ Typecheck skipped (no script): ${dir}`);
    }
  }
  
  console.log(`\n🔄 Starting parallel typecheck (max ${concurrencyLimit} concurrent)...`);
  
  // Execute all tasks in parallel
  const results = await Promise.all(typecheckTasks);
  
  // Count results
  for (const result of results) {
    if (result.status === 'passed') {
      typecheckPassed++;
    } else {
      typecheckFailed++;
    }
  }
  
  console.log('');
  console.log('============================================================');
  console.log('📊 Typecheck Summary:');
  console.log(`   Total projects: ${total}`);
  console.log('');
  console.log('   Typecheck Results:');
  console.log(`     ✅ Passed: ${typecheckPassed}`);
  console.log(`     ❌ Failed: ${typecheckFailed}`);
  console.log(`     ⏭️ Skipped: ${typecheckSkipped}`);
  console.log('============================================================');
  
  if (typecheckFailed > 0) {
    console.log('⚠️ Some typechecks failed. Review the output above for details.');
    process.exit(1);
  } else {
    console.log('🎉 All typecheck operations completed successfully!');
    process.exit(0);
  }
}

// Handle command line arguments
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log('Usage: node typecheck-all-projects.js');
  console.log('');
  console.log('Runs typecheck on all projects that have typecheck scripts configured');
  console.log('Skips projects without typecheck scripts');
  process.exit(0);
}

runTypecheckAll();