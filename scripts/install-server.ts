#!/usr/bin/env node

import path from 'path';
import fs from 'fs';
import { 
  ConcurrencyLimiter, 
  findProjectDirectories, 
  retryWithBackoff,
  executeCommand,
  formatDuration,
  detectPackageManager
} from './shared/utils';
import { InstallResult, RetryOptions, PackageJson } from './shared/types';
import { CONCURRENCY_LIMITS, TIMEOUTS } from './shared/constants';

async function installProject(
  dir: string, 
  retryOptions: RetryOptions
): Promise<InstallResult> {
  const packageManager = detectPackageManager(dir);
  let installCommand: string;
  
  switch (packageManager) {
    case 'bun':
      installCommand = 'bun install';
      break;
    case 'deno':
      const packageJsonPath = path.join(dir, 'package.json');
      const packageJson: PackageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      if (packageJson.scripts?.install) {
        installCommand = 'deno task install';
      } else {
        return {
          dir,
          status: 'skipped',
          reason: 'Deno project with no install script',
          packageManager: 'deno'
        };
      }
      break;
    default:
      installCommand = 'yarn install --network-timeout 60000';
  }
  
  const result = await retryWithBackoff(
    () => executeCommand(installCommand, {
      cwd: dir,
      timeout: TIMEOUTS.install,
      throwOnError: true
    }),
    retryOptions
  );
  
  return {
    dir,
    status: result.success ? 'success' : 'failed',
    error: result.error,
    packageManager
  };
}

async function installServerDependencies(): Promise<void> {
  const startTime = Date.now();
  console.log('🚀 Installing dependencies in server projects');
  console.log('============================================================');
  
  const serverDir = path.join(process.cwd(), 'server');
  const projectDirs = findProjectDirectories(serverDir);
  
  if (projectDirs.length === 0) {
    console.log('No server projects found with package.json');
    return;
  }
  
  const limiter = new ConcurrencyLimiter(CONCURRENCY_LIMITS.install);
  const retryQueue: string[] = [];
  const results: InstallResult[] = [];
  
  console.log(`Found ${projectDirs.length} server projects\n`);
  
  const installTasks = projectDirs.map(dir => 
    limiter.run(async () => {
      console.log(`📦 Processing: ${dir}`);
      const result = await installProject(dir, { maxRetries: 2, baseDelay: 1000 });
      
      if (result.status === 'success') {
        console.log(`✅ Success: ${dir} (${result.packageManager})`);
      } else if (result.status === 'skipped') {
        console.log(`⏭️  Skipped: ${dir} - ${result.reason}`);
      } else {
        console.log(`⏳ Queuing for retry: ${dir}`);
        retryQueue.push(dir);
      }
      
      return result;
    })
  );
  
  const initialResults = await Promise.all(installTasks);
  results.push(...initialResults);
  
  if (retryQueue.length > 0) {
    console.log('\n🔁 Processing retry queue...');
    const retryLimiter = new ConcurrencyLimiter(CONCURRENCY_LIMITS.retry);
    
    const retryTasks = retryQueue.map((dir, index) => 
      retryLimiter.run(async () => {
        const delay = 5000 + (index * 2000);
        console.log(`⏳ Waiting ${delay/1000}s before retrying: ${dir}`);
        await new Promise(resolve => setTimeout(resolve, delay));
        
        console.log(`🔄 Retrying: ${dir}`);
        const result = await installProject(dir, { maxRetries: 4, baseDelay: 2000 });
        result.wasRetry = true;
        
        if (result.status === 'success') {
          console.log(`✅ Retry success: ${dir} (${result.packageManager})`);
        } else {
          console.log(`❌ Retry failed: ${dir}`);
        }
        
        return result;
      })
    );
    
    const retryResults = await Promise.all(retryTasks);
    
    results.forEach((result, index) => {
      const retryResult = retryResults.find(r => r.dir === result.dir);
      if (retryResult) {
        results[index] = retryResult;
      }
    });
  }
  
  const successful = results.filter(r => r.status === 'success').length;
  const failed = results.filter(r => r.status === 'failed').length;
  const skipped = results.filter(r => r.status === 'skipped').length;
  const duration = formatDuration(Date.now() - startTime);
  
  console.log('\n============================================================');
  console.log('📊 Installation Summary (Server):');
  console.log(`   Total projects: ${projectDirs.length}`);
  console.log(`   ✅ Successful: ${successful}`);
  console.log(`   ❌ Failed: ${failed}`);
  console.log(`   ⏭️  Skipped: ${skipped}`);
  console.log(`   ⏱️  Duration: ${duration}`);
  console.log('============================================================');
  
  if (failed > 0) {
    console.log('\n❌ Failed installations:');
    results.filter(r => r.status === 'failed').forEach(r => {
      console.log(`   • ${r.dir}: ${r.error}`);
    });
    process.exit(1);
  } else {
    console.log('🎉 All server installations completed successfully!');
  }
}

if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log('Usage: tsx install-server.ts');
  console.log('');
  console.log('Installs dependencies in all server projects');
  console.log('Supports yarn, bun, and deno package managers');
  process.exit(0);
}

installServerDependencies().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});