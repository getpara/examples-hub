#!/usr/bin/env node

import { cleanProjects } from './shared/utils';
import { CleanOptions } from './shared/types';
import { BUILD_ARTIFACTS, CACHE_DIRS } from './shared/constants';

async function cleanSpecialized(): Promise<void> {
  const patterns = [
    'node_modules',
    ...BUILD_ARTIFACTS,
    ...CACHE_DIRS,
    '*.log'
  ];
  
  const options: CleanOptions = {
    baseDir: 'specialized',
    patterns,
    dryRun: process.argv.includes('--dry-run')
  };
  
  await cleanProjects(options);
}

if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log('Usage: tsx clean-specialized.ts [--dry-run]');
  console.log('');
  console.log('Cleans build artifacts and dependencies from specialized projects');
  console.log('');
  console.log('Options:');
  console.log('  --dry-run    Show what would be deleted without actually deleting');
  process.exit(0);
}

cleanSpecialized().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});