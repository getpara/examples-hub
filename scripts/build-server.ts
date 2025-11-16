#!/usr/bin/env node

import path from 'path';
import { 
  ConcurrencyLimiter, 
  findProjectDirectories,
  executeCommand,
  formatDuration,
  hasScript,
  detectPackageManager
} from './shared/utils';
import { TaskResult } from './shared/types';
import { CONCURRENCY_LIMITS, TIMEOUTS, BUILD_ARTIFACTS } from './shared/constants';

async function buildProject(dir: string): Promise<TaskResult> {
  try {
    const packageManager = detectPackageManager(dir);
    let buildCommand: string;
    
    switch (packageManager) {
      case 'bun':
        buildCommand = 'bun run build';
        break;
      case 'deno':
        buildCommand = 'deno task build';
        break;
      default:
        buildCommand = 'yarn build';
    }
    
    executeCommand(buildCommand, {
      cwd: dir,
      timeout: TIMEOUTS.build,
      throwOnError: true
    });
    
    cleanBuildArtifacts(dir);
    
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

function cleanBuildArtifacts(dir: string): void {
  try {
    const cleanCommand = BUILD_ARTIFACTS
      .map(artifact => `-name "${artifact}"`)
      .join(' -o ');
    
    executeCommand(
      `find . -path "*/node_modules" -prune -o \\( ${cleanCommand} \\) -type d -exec rm -rf {} + 2>/dev/null || true`,
      { cwd: dir, throwOnError: false }
    );
  } catch (error) {
    console.log(`  ⚠️  Cleanup warning for ${dir}`);
  }
}

async function buildServerProjects(): Promise<void> {
  const startTime = Date.now();
  console.log('🔨 Building server projects');
  console.log('============================================================');
  
  const serverDir = path.join(process.cwd(), 'server');
  const projectDirs = findProjectDirectories(serverDir);
  
  if (projectDirs.length === 0) {
    console.log('No server projects found with package.json');
    return;
  }
  
  const limiter = new ConcurrencyLimiter(CONCURRENCY_LIMITS.build);
  const results: TaskResult[] = [];
  let skippedCount = 0;
  
  console.log(`Found ${projectDirs.length} server projects\n`);
  
  const buildTasks: Promise<TaskResult>[] = [];
  
  for (const dir of projectDirs) {
    if (hasScript(dir, 'build')) {
      buildTasks.push(
        limiter.run(async () => {
          console.log(`🔨 Building: ${dir}`);
          const result = await buildProject(dir);
          
          if (result.status === 'success') {
            console.log(`✅ Built: ${dir}`);
          } else {
            console.log(`❌ Failed: ${dir}`);
          }
          
          return result;
        })
      );
    } else {
      skippedCount++;
      console.log(`⏭️  Skipped (no build script): ${dir}`);
    }
  }
  
  const taskResults = await Promise.all(buildTasks);
  results.push(...taskResults);
  
  const passed = results.filter(r => r.status === 'success').length;
  const failed = results.filter(r => r.status === 'failed').length;
  const duration = formatDuration(Date.now() - startTime);
  
  console.log('\n============================================================');
  console.log('📊 Build Summary (Server):');
  console.log(`   Total projects: ${projectDirs.length}`);
  console.log(`   ✅ Built: ${passed}`);
  console.log(`   ❌ Failed: ${failed}`);
  console.log(`   ⏭️  Skipped: ${skippedCount}`);
  console.log(`   ⏱️  Duration: ${duration}`);
  console.log('============================================================');
  
  if (failed > 0) {
    console.log('\n❌ Failed builds:');
    results.filter(r => r.status === 'failed').forEach(r => {
      console.log(`   • ${r.dir}: ${r.error}`);
    });
    process.exit(1);
  } else {
    console.log('🎉 All server builds completed successfully!');
  }
}

if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log('Usage: tsx build-server.ts');
  console.log('');
  console.log('Builds all server projects that have build scripts');
  console.log('Automatically cleans build artifacts after successful builds');
  process.exit(0);
}

buildServerProjects().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});