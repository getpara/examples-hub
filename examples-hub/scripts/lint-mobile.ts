#!/usr/bin/env node

import path from 'path';
import { 
  ConcurrencyLimiter, 
  findProjectDirectories,
  executeCommand,
  formatDuration,
  hasScript
} from './shared/utils';
import { TaskResult } from './shared/types';
import { CONCURRENCY_LIMITS, TIMEOUTS } from './shared/constants';

async function lintProject(dir: string): Promise<TaskResult> {
  try {
    executeCommand('yarn lint', {
      cwd: dir,
      timeout: TIMEOUTS.lint,
      throwOnError: true
    });
    
    return {
      dir,
      status: 'success'
    };
  } catch (error) {
    return {
      dir,
      status: 'failed',
      error: error instanceof Error ? error.message.split('\n')[0] : String(error)
    };
  }
}

async function lintMobileProjects(): Promise<void> {
  const startTime = Date.now();
  console.log('🔍 Running lint in mobile projects');
  console.log('============================================================');
  
  const mobileDir = path.join(process.cwd(), 'mobile');
  const projectDirs = findProjectDirectories(mobileDir);
  
  if (projectDirs.length === 0) {
    console.log('No mobile projects found with package.json');
    return;
  }
  
  const limiter = new ConcurrencyLimiter(CONCURRENCY_LIMITS.lint);
  const results: TaskResult[] = [];
  let skippedCount = 0;
  
  console.log(`Found ${projectDirs.length} mobile projects\n`);
  
  const lintTasks: Promise<TaskResult>[] = [];
  
  for (const dir of projectDirs) {
    if (hasScript(dir, 'lint')) {
      lintTasks.push(
        limiter.run(async () => {
          console.log(`🔍 Linting: ${dir}`);
          const result = await lintProject(dir);
          
          if (result.status === 'success') {
            console.log(`✅ Passed: ${dir}`);
          } else {
            console.log(`❌ Failed: ${dir}`);
          }
          
          return result;
        })
      );
    } else {
      skippedCount++;
      console.log(`⏭️  Skipped (no lint script): ${dir}`);
    }
  }
  
  const taskResults = await Promise.all(lintTasks);
  results.push(...taskResults);
  
  const passed = results.filter(r => r.status === 'success').length;
  const failed = results.filter(r => r.status === 'failed').length;
  const duration = formatDuration(Date.now() - startTime);
  
  console.log('\n============================================================');
  console.log('📊 Lint Summary (Mobile):');
  console.log(`   Total projects: ${projectDirs.length}`);
  console.log(`   ✅ Passed: ${passed}`);
  console.log(`   ❌ Failed: ${failed}`);
  console.log(`   ⏭️  Skipped: ${skippedCount}`);
  console.log(`   ⏱️  Duration: ${duration}`);
  console.log('============================================================');
  
  if (failed > 0) {
    console.log('\n❌ Failed lint checks:');
    results.filter(r => r.status === 'failed').forEach(r => {
      console.log(`   • ${r.dir}: ${r.error}`);
    });
    process.exit(1);
  } else {
    console.log('🎉 All mobile lint checks passed!');
  }
}

if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log('Usage: tsx lint-mobile.ts');
  console.log('');
  console.log('Runs lint on all mobile projects that have lint scripts');
  process.exit(0);
}

lintMobileProjects().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});