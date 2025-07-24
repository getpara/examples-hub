#!/usr/bin/env node

import { cleanProjects } from './shared/utils';
import { CleanOptions } from './shared/types';
import { BUILD_ARTIFACTS, CACHE_DIRS, MOBILE_ARTIFACTS } from './shared/constants';

async function cleanMobile(): Promise<void> {
  const patterns = [
    'node_modules',
    ...BUILD_ARTIFACTS,
    ...CACHE_DIRS,
    ...MOBILE_ARTIFACTS.ios,
    ...MOBILE_ARTIFACTS.android,
    '*.log',
    'yarn.lock',
    'package-lock.json'
  ];
  
  const options: CleanOptions = {
    baseDir: 'mobile',
    patterns,
    dryRun: process.argv.includes('--dry-run')
  };
  
  await cleanProjects(options);
}

if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log('Usage: tsx clean-mobile.ts [--dry-run]');
  console.log('');
  console.log('Cleans build artifacts and dependencies from mobile projects');
  console.log('Includes iOS and Android native build artifacts');
  console.log('');
  console.log('Options:');
  console.log('  --dry-run    Show what would be deleted without actually deleting');
  process.exit(0);
}

cleanMobile().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});