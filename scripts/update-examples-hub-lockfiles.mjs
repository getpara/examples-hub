#!/usr/bin/env node

/**
 * Updates examples-hub yarn.lock files after packages are published to npm.
 * Called by `yarn alpha-publish` after lerna publishes packages.
 *
 * This script:
 * 1. Reads the current version from packages/react-sdk-lite/package.json
 * 2. Calls update-para-dependencies.ts with --version flag (includes lockfile updates)
 *
 * This runs AFTER packages are published to npm, so lockfile updates will succeed
 * because the packages now exist in the registry.
 */

import { execSync } from 'child_process';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

function getCurrentVersion() {
  try {
    const packageJson = JSON.parse(
      readFileSync(join(projectRoot, 'packages/react-sdk-lite/package.json'), 'utf8')
    );
    return packageJson.version;
  } catch (error) {
    console.error('Error reading current version:', error.message);
    process.exit(1);
  }
}

function main() {
  const version = getCurrentVersion();
  const examplesHubDir = join(projectRoot, 'examples-hub');
  console.log(`\n🔒 Updating examples-hub yarn.lock files for ${version}...`);

  try {
    // Run from examples-hub directory so script only traverses that folder
    execSync(
      `npx tsx scripts/update-para-dependencies.ts --version ${version}`,
      { cwd: examplesHubDir, stdio: 'inherit' }
    );
    console.log('✅ examples-hub yarn.lock files updated successfully');
  } catch (error) {
    console.error('⚠️  Failed to update examples-hub yarn.lock files:', error.message);
    console.log('ℹ️  This is non-blocking - lockfiles can be updated manually later.');
    // Non-blocking - don't fail the publish
    // Exit code 0 to allow the workflow to continue
  }
}

main();
