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

async function typecheckProject(dir: string): Promise<TaskResult> {
  try {
    executeCommand('yarn typecheck', {
      cwd: dir,
      timeout: TIMEOUTS.typecheck,
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

async function typecheckSpecializedProjects(): Promise<void> {
  const startTime = Date.now();
  console.log('📝 Running typecheck in specialized projects');
  console.log('============================================================');
  
  const specializedDir = path.join(process.cwd(), 'specialized');
  const projectDirs = findProjectDirectories(specializedDir);
  
  if (projectDirs.length === 0) {
    console.log('No specialized projects found with package.json');
    return;
  }
  
  const limiter = new ConcurrencyLimiter(CONCURRENCY_LIMITS.typecheck);
  const results: TaskResult[] = [];
  let skippedCount = 0;
  
  console.log(`Found ${projectDirs.length} specialized projects\n`);
  
  const typecheckTasks: Promise<TaskResult>[] = [];
  
  for (const dir of projectDirs) {
    if (hasScript(dir, 'typecheck')) {
      typecheckTasks.push(
        limiter.run(async () => {
          console.log(`📝 Typechecking: ${dir}`);
          const result = await typecheckProject(dir);
          
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
      console.log(`⏭️  Skipped (no typecheck script): ${dir}`);
    }
  }
  
  const taskResults = await Promise.all(typecheckTasks);
  results.push(...taskResults);
  
  const passed = results.filter(r => r.status === 'success').length;
  const failed = results.filter(r => r.status === 'failed').length;
  const duration = formatDuration(Date.now() - startTime);
  
  console.log('\n============================================================');
  console.log('📊 Typecheck Summary (Specialized):');
  console.log(`   Total projects: ${projectDirs.length}`);
  console.log(`   ✅ Passed: ${passed}`);
  console.log(`   ❌ Failed: ${failed}`);
  console.log(`   ⏭️  Skipped: ${skippedCount}`);
  console.log(`   ⏱️  Duration: ${duration}`);
  console.log('============================================================');
  
  if (failed > 0) {
    console.log('\n❌ Failed typecheck:');
    results.filter(r => r.status === 'failed').forEach(r => {
      console.log(`   • ${r.dir}: ${r.error}`);
    });
    process.exit(1);
  } else {
    console.log('🎉 All specialized typecheck passed!');
  }
}

if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log('Usage: tsx typecheck-specialized.ts');
  console.log('');
  console.log('Runs typecheck on all specialized projects that have typecheck scripts');
  process.exit(0);
}

typecheckSpecializedProjects().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});