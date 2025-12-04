#!/usr/bin/env node

/**
 * Updates examples-hub package.json files to match the current SDK version.
 * Called by `yarn alpha-version` after lerna bumps package versions.
 *
 * This script:
 * 1. Reads the current version from packages/react-sdk-lite/package.json
 * 2. Calls update-para-dependencies.ts with --version and --skip-lockfile flags
 *
 * Lockfiles are skipped because the packages haven't been published to npm yet.
 * They will be updated by update-examples-hub-lockfiles.mjs after alpha-publish.
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
  console.log(`\n📦 Updating examples-hub package.json files to ${version}...`);

  try {
    // Run from examples-hub directory so script only traverses that folder
    execSync(
      `npx tsx scripts/update-para-dependencies.ts --version ${version} --skip-lockfile`,
      { cwd: examplesHubDir, stdio: 'inherit' }
    );
    console.log('✅ examples-hub package.json files updated successfully');
  } catch (error) {
    console.error('⚠️  Failed to update examples-hub package.json files:', error.message);
    console.log('ℹ️  This is non-blocking - continuing with release workflow...');
    // Non-blocking - don't fail the version bump
    // Exit code 0 to allow the workflow to continue
  }
}

main();
