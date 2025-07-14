#!/usr/bin/env node

/**
 * build-all-projects.js
 * Runs build across all projects in the examples-hub monorepo
 * Skips projects that don't have build scripts configured
 * Supports parallel execution with concurrency limits
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

// Simple concurrency limiter
class ConcurrencyLimiter {
  private limit: number;
  private running: number = 0;
  private queue: Array<{ task: () => Promise<any>; resolve: (value: any) => void; reject: (reason?: any) => void }> = [];

  constructor(limit: number) {
    this.limit = limit;
  }

  async run(task: () => Promise<any>): Promise<any> {
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
    const queueItem = this.queue.shift();
    if (!queueItem) return;
    const { task, resolve, reject } = queueItem;

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
  
  function traverse(dir: string, depth = 0) {
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

function hasScript(dir: string, scriptName: string): boolean {
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
  
  const buildTasks: Promise<{ dir: string; type: string; status: string; error?: string }>[] = [];
  
  // Prepare build tasks
  for (const dir of projectDirs) {
    total++;
    
    if (hasScript(dir as string, 'build')) {
      const task = async () => {
        console.log(`🔨 Running build: ${dir}`);
        try {
          execSync('yarn build', {
            cwd: dir as string,
            stdio: 'pipe',
            timeout: 300000 // 5 minute timeout per build
          });
          
          // Clean up dist/build directories after successful build
          try {
            execSync('find . -path "*/node_modules" -prune -o \\( -name "dist" -o -name "build" -o -name ".next" -o -name ".output" \\) -type d -print -exec rm -rf {} + 2>/dev/null || true', {
              cwd: dir as string,
              stdio: 'pipe'
            });
            console.log(`✅ Build passed and cleaned: ${dir}`);
          } catch (cleanError) {
            console.log(`✅ Build passed (cleanup warning): ${dir}`);
          }
          
          return { dir, type: 'build', status: 'passed' } as const;
        } catch (error) {
          console.log(`❌ Build failed: ${dir}`);
          return { dir, type: 'build', status: 'failed', error: error.message.split('\n')[0] } as const;
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