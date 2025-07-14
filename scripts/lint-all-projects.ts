#!/usr/bin/env node

/**
 * lint-all-projects.js
 * Runs lint across all projects in the examples-hub monorepo
 * Skips projects that don't have lint scripts configured
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

async function runLint() {
  console.log('🔍 Running lint across all projects (parallel execution)');
  console.log('============================================================');
  
  const projectDirs = findProjectDirectories();
  const concurrencyLimit = 4; // Lower limit for lint to avoid overwhelming CPU
  const limiter = new ConcurrencyLimiter(concurrencyLimit);
  
  let total = 0;
  let lintPassed = 0;
  let lintFailed = 0;
  let lintSkipped = 0;
  
  const lintTasks: Promise<{ dir: string; status: string; error?: string }>[] = [];
  
  // Prepare lint tasks
  for (const dir of projectDirs) {
    total++;
    
    if (hasScript(dir as string, 'lint')) {
      const task = async () => {
        console.log(`🔍 Running lint: ${dir as string}`);
        try {
          execSync('yarn lint', {
            cwd: dir as string,
            stdio: 'pipe',
            timeout: 60000
          });
          console.log(`✅ Lint passed: ${dir}`);
          return { dir, status: 'passed' } as const;
        } catch (error: any) {
          const errorMsg = error.message.split('\n')[0];
          console.log(`❌ Lint failed: ${dir} - ${errorMsg}`);
          return { dir, status: 'failed', error: errorMsg } as const;
        }
      };
      lintTasks.push(limiter.run(task));
    } else {
      lintSkipped++;
      console.log(`⏭️ Lint skipped (no script): ${dir}`);
    }
  }
  
  console.log(`\n🔄 Starting parallel lint (max ${concurrencyLimit} concurrent)...`);
  
  // Execute all tasks in parallel
  const results = await Promise.all(lintTasks);
  
  // Count results
  for (const result of results) {
    if (result.status === 'passed') {
      lintPassed++;
    } else {
      lintFailed++;
    }
  }
  
  console.log('');
  console.log('============================================================');
  console.log('📊 Lint Summary:');
  console.log(`   Total projects: ${total}`);
  console.log(`   ✅ Passed: ${lintPassed}`);
  console.log(`   ❌ Failed: ${lintFailed}`);
  console.log(`   ⏭️ Skipped: ${lintSkipped}`);
  console.log('============================================================');
  
  if (lintFailed > 0) {
    console.log('⚠️ Some lint checks failed. Review the output above for details.');
    process.exit(1);
  } else {
    console.log('🎉 All lint operations completed successfully!');
    process.exit(0);
  }
}

// Handle command line arguments
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log('Usage: node lint-all-projects.js');
  console.log('');
  console.log('Runs lint on all projects that have lint scripts configured');
  console.log('Skips projects without lint scripts');
  process.exit(0);
}

runLint();