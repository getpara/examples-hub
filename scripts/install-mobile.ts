#!/usr/bin/env node

import path from 'path';
import { 
  ConcurrencyLimiter, 
  findProjectDirectories, 
  retryWithBackoff,
  executeCommand,
  formatDuration
} from './shared/utils';
import { InstallResult, RetryOptions } from './shared/types';
import { CONCURRENCY_LIMITS, TIMEOUTS } from './shared/constants';

async function installProject(
  dir: string, 
  retryOptions: RetryOptions
): Promise<InstallResult> {
  const result = await retryWithBackoff(
    () => executeCommand('yarn install --network-timeout 60000', {
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
    packageManager: 'yarn'
  };
}

async function installMobileDependencies(): Promise<void> {
  const startTime = Date.now();
  console.log('🚀 Installing dependencies in mobile projects');
  console.log('============================================================');
  
  const mobileDir = path.join(process.cwd(), 'mobile');
  const projectDirs = findProjectDirectories(mobileDir);
  
  if (projectDirs.length === 0) {
    console.log('No mobile projects found with package.json');
    return;
  }
  
  const limiter = new ConcurrencyLimiter(CONCURRENCY_LIMITS.install);
  const retryQueue: string[] = [];
  const results: InstallResult[] = [];
  
  console.log(`Found ${projectDirs.length} mobile projects\n`);
  
  const installTasks = projectDirs.map(dir => 
    limiter.run(async () => {
      console.log(`📦 Installing: ${dir}`);
      const result = await installProject(dir, { maxRetries: 2, baseDelay: 1000 });
      
      if (result.status === 'success') {
        console.log(`✅ Success: ${dir}`);
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
          console.log(`✅ Retry success: ${dir}`);
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
  const duration = formatDuration(Date.now() - startTime);
  
  console.log('\n============================================================');
  console.log('📊 Installation Summary (Mobile):');
  console.log(`   Total projects: ${projectDirs.length}`);
  console.log(`   ✅ Successful: ${successful}`);
  console.log(`   ❌ Failed: ${failed}`);
  console.log(`   ⏱️  Duration: ${duration}`);
  console.log('============================================================');
  
  if (failed > 0) {
    console.log('\n❌ Failed installations:');
    results.filter(r => r.status === 'failed').forEach(r => {
      console.log(`   • ${r.dir}: ${r.error}`);
    });
    process.exit(1);
  } else {
    console.log('🎉 All mobile installations completed successfully!');
  }
}

if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log('Usage: tsx install-mobile.ts');
  console.log('');
  console.log('Installs dependencies in all mobile projects');
  console.log('Note: Native dependencies may require additional setup');
  process.exit(0);
}

installMobileDependencies().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});