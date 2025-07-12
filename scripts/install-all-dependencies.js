#!/usr/bin/env node

/**
 * install-all-dependencies.js
 * Runs yarn install across all projects in the examples-hub monorepo
 * Uses Yarn 4.9.2 as configured in .yarnrc.yml
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
    // Limit traversal depth to avoid infinite loops
    if (depth > 4) return;
    
    // Skip certain directories
    const skipDirs = ['node_modules', '.next', '.output', 'dist', '.yarn', 'build', '.cache', '.git'];
    const dirName = path.basename(dir);
    if (skipDirs.includes(dirName)) return;
    
    try {
      const items = fs.readdirSync(dir);
      
      // Check if this directory has a package.json
      if (items.includes('package.json')) {
        projectDirs.add(dir);
      }
      
      // Recursively check subdirectories
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

// Retry function with exponential backoff
async function retryInstall(installCommand, dir, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      execSync(installCommand, {
        cwd: dir,
        stdio: 'pipe',
        timeout: 120000 // 2 minute timeout per project
      });
      return { success: true };
    } catch (error) {
      if (attempt === maxRetries) {
        return { success: false, error: error.message.split('\n')[0] };
      }
      // Wait before retry (exponential backoff: 1s, 2s, 4s)
      await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempt - 1)));
    }
  }
}

async function installDependencies() {
  console.log('🚀 Installing dependencies across all projects with Yarn 4.9.2 (parallel execution)');
  console.log('============================================================');
  
  const projectDirs = findProjectDirectories();
  const concurrencyLimit = 4;
  const limiter = new ConcurrencyLimiter(concurrencyLimit);
  
  let total = 0;
  let success = 0;
  let failed = 0;
  const results = [];
  const retryQueue = [];
  
  // Prepare installation tasks
  const installTasks = [];
  
  for (const dir of projectDirs) {
    // Check if package.json exists (should exist due to our search)
    const packageJsonPath = path.join(dir, 'package.json');
    if (!fs.existsSync(packageJsonPath)) {
      results.push({ dir, status: 'skipped', reason: 'no package.json' });
      continue;
    }
    
    // Determine which package manager to use based on project type
    let installCommand = 'yarn install --network-timeout 60000 --mode=update-lockfile';
    let packageManager = 'yarn';
    
    if (dir.includes('server/with-bun')) {
      installCommand = 'bun install';
      packageManager = 'bun';
    } else if (dir.includes('server/with-deno')) {
      // Deno projects typically don't need install, but check if they have deps
      const packageJson = JSON.parse(fs.readFileSync(path.join(dir, 'package.json'), 'utf8'));
      if (packageJson.scripts && packageJson.scripts.install) {
        installCommand = 'deno task install';
        packageManager = 'deno';
      } else {
        results.push({ dir, status: 'skipped', reason: 'Deno project with no install script' });
        continue;
      }
    }
    
    total++;
    
    // Create installation task
    const task = async () => {
      console.log(`📦 Processing: ${dir}`);
      console.log(`🔄 Running ${packageManager} install...`);
      
      const result = await retryInstall(installCommand, dir, 2); // Initial attempt with only 2 retries
      
      if (result.success) {
        console.log(`✅ Success: ${dir}`);
        return { dir, status: 'success', packageManager };
      } else {
        console.log(`⏳ Queuing for retry: ${dir}`);
        retryQueue.push({ dir, installCommand, packageManager });
        return { dir, status: 'queued_for_retry', error: result.error, packageManager };
      }
    };
    
    installTasks.push(limiter.run(task));
  }
  
  console.log(`\n🔄 Starting parallel installation (max ${concurrencyLimit} concurrent)...`);
  
  // Execute all installation tasks in parallel
  const taskResults = await Promise.all(installTasks);
  results.push(...taskResults);
  
  // Process retry queue with exponential backoff and rate limiting
  if (retryQueue.length > 0) {
    console.log('');
    console.log('🔁 Processing retry queue with rate limiting protection...');
    console.log(`   Found ${retryQueue.length} projects that need retry`);
    
    const retryLimiter = new ConcurrencyLimiter(2); // Reduce concurrency for retries
    const retryTasks = [];
    
    for (let i = 0; i < retryQueue.length; i++) {
      const { dir, installCommand, packageManager } = retryQueue[i];
      
      const retryTask = async () => {
        // Progressive delay: 5s + (index * 2s) to spread out retry attempts
        const baseDelay = 5000 + (i * 2000);
        console.log(`⏳ Waiting ${baseDelay/1000}s before retrying: ${dir}`);
        await new Promise(resolve => setTimeout(resolve, baseDelay));
        
        console.log(`🔄 Retry attempt for: ${dir}`);
        const result = await retryInstall(installCommand, dir, 4); // More retries for queued items
        
        if (result.success) {
          console.log(`✅ Retry success: ${dir}`);
          return { dir, status: 'success', packageManager, wasRetry: true };
        } else {
          console.log(`❌ Retry failed: ${dir}`);
          console.log(`   Final error: ${result.error}`);
          return { dir, status: 'failed', error: result.error, packageManager, wasRetry: true };
        }
      };
      
      retryTasks.push(retryLimiter.run(retryTask));
    }
    
    const retryResults = await Promise.all(retryTasks);
    
    // Update results array - replace queued items with retry results
    for (const retryResult of retryResults) {
      const index = results.findIndex(r => r.dir === retryResult.dir && r.status === 'queued_for_retry');
      if (index !== -1) {
        results[index] = retryResult;
      }
    }
  }
  
  // Count final results
  success = 0;
  failed = 0;
  for (const result of results) {
    if (result.status === 'success') {
      success++;
    } else if (result.status === 'failed') {
      failed++;
    }
  }
  
  console.log('');
  console.log('============================================================');
  console.log('📊 Installation Summary:');
  console.log(`   Total projects: ${total}`);
  console.log(`   ✅ Successful: ${success}`);
  console.log(`   ❌ Failed: ${failed}`);
  console.log(`   ⏭️ Skipped: ${results.filter(r => r.status === 'skipped').length}`);
  console.log(`   🔁 Retries processed: ${retryQueue.length}`);
  console.log('============================================================');
  
  if (failed > 0) {
    console.log('⚠️  Some installations failed even after retries. Check the output above for details.');
    console.log('🔧 Failed projects:');
    results.filter(r => r.status === 'failed').forEach(r => {
      console.log(`   • ${r.dir}: ${r.error}`);
    });
    process.exit(1);
  } else {
    console.log('🎉 All installations completed successfully!');
    process.exit(0);
  }
}

// Handle command line arguments
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log('Usage: node install-all-dependencies.js');
  console.log('');
  console.log('Installs dependencies in all projects containing package.json files');
  console.log('Uses Yarn 4.9.2 as configured in .yarnrc.yml');
  process.exit(0);
}

// Run the installation
installDependencies();