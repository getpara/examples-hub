#!/usr/bin/env node

import { cleanProjects } from './shared/utils';
import { CleanOptions } from './shared/types';
import { BUILD_ARTIFACTS, CACHE_DIRS } from './shared/constants';

async function cleanServer(): Promise<void> {
  const patterns = [
    'node_modules',
    ...BUILD_ARTIFACTS,
    ...CACHE_DIRS,
    '*.log',
    'bun.lockb',
    '.bun',
    'keyShares.db',
    '*.db'
  ];
  
  const options: CleanOptions = {
    baseDir: 'server',
    patterns,
    dryRun: process.argv.includes('--dry-run')
  };
  
  await cleanProjects(options);
}

if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log('Usage: tsx clean-server.ts [--dry-run]');
  console.log('');
  console.log('Cleans build artifacts and dependencies from server projects');
  console.log('');
  console.log('Options:');
  console.log('  --dry-run    Show what would be deleted without actually deleting');
  process.exit(0);
}

cleanServer().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});