#!/usr/bin/env node

/**
 * build-all-projects.js
 * Runs build across all projects in the examples-hub monorepo
 * Skips projects that don't have build scripts configured
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

async function runBuildAll() {
  console.log('🔨 Running build across all projects (parallel execution)');
  console.log('============================================================');
  
  const projectDirs = findProjectDirectories();
  const concurrencyLimit = 4;
  const limiter = new ConcurrencyLimiter(concurrencyLimit);
  
  let total = 0;
  let buildPassed = 0;
  let buildFailed = 0;
  let buildSkipped = 0;
  
  const buildTasks = [];
  
  // Prepare build tasks
  for (const dir of projectDirs) {
    total++;
    
    if (hasScript(dir, 'build')) {
      const task = async () => {
        console.log(`🔨 Running build: ${dir}`);
        try {
          execSync('yarn build', {
            cwd: dir,
            stdio: 'pipe',
            timeout: 300000 // 5 minute timeout per build
          });
          console.log(`✅ Build passed: ${dir}`);
          return { dir, type: 'build', status: 'passed' };
        } catch (error) {
          console.log(`❌ Build failed: ${dir}`);
          return { dir, type: 'build', status: 'failed', error: error.message.split('\n')[0] };
        }
      };
      buildTasks.push(limiter.run(task));
    } else {
      buildSkipped++;
      console.log(`⏭️ Build skipped (no script): ${dir}`);
    }
  }
  
  console.log(`\n🔄 Starting parallel builds (max ${concurrencyLimit} concurrent)...`);
  
  // Execute all tasks in parallel
  const results = await Promise.all(buildTasks);
  
  // Count results
  for (const result of results) {
    if (result.status === 'passed') {
      buildPassed++;
    } else {
      buildFailed++;
    }
  }
  
  console.log('');
  console.log('============================================================');
  console.log('📊 Build Summary:');
  console.log(`   Total projects: ${total}`);
  console.log('');
  console.log('   Build Results:');
  console.log(`     ✅ Passed: ${buildPassed}`);
  console.log(`     ❌ Failed: ${buildFailed}`);
  console.log(`     ⏭️ Skipped: ${buildSkipped}`);
  console.log('============================================================');
  
  if (buildFailed > 0) {
    console.log('⚠️ Some builds failed. Review the output above for details.');
    process.exit(1);
  } else {
    console.log('🎉 All build operations completed successfully!');
    process.exit(0);
  }
}

// Handle command line arguments
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log('Usage: node build-all-projects.js');
  console.log('');
  console.log('Runs build on all projects that have build scripts configured');
  console.log('Skips projects without build scripts');
  process.exit(0);
}

runBuildAll();