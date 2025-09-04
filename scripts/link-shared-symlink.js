#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const SHARED_PATH = '../../user-management/packages/shared';
const ABSOLUTE_SHARED_PATH = path.resolve(__dirname, SHARED_PATH);
const SYMLINK_PATH = path.resolve(__dirname, '../node_modules/@getpara/shared');

// Skip symlink setup in CI environments or production builds
const isCI = process.env.CI === 'true' || process.env.GITHUB_ACTIONS === 'true';
const isProduction = process.env.NODE_ENV === 'production' || process.env.PROD === 'true';

if (isCI || isProduction) {
  console.log('🚀 Production/CI mode: Using published @getpara/shared package');
  process.exit(0);
}

console.log('🔗 Setting up shared package linking for @getpara/shared using symlink (dev mode)...');

// Check if the shared package exists
if (!fs.existsSync(ABSOLUTE_SHARED_PATH)) {
  console.error('❌ Shared package not found at:', ABSOLUTE_SHARED_PATH);
  console.error('💡 Make sure the user-management repo is cloned at the same level as web-sdk');
  console.error('💡 Or run this script from a directory where the user-management repo is accessible');
  console.error('💡 If you want to use the published package instead, run: yarn unlink-shared-symlink');
  process.exit(1);
}

try {
  // Build the shared package first
  console.log('📦 Building shared package...');
  execSync('corepack yarn build', {
    cwd: ABSOLUTE_SHARED_PATH,
    stdio: 'inherit',
  });
  console.log('✅ Shared package built successfully');

  // Create the @getpara directory if it doesn't exist
  const getparaDir = path.dirname(SYMLINK_PATH);
  if (!fs.existsSync(getparaDir)) {
    fs.mkdirSync(getparaDir, { recursive: true });
    console.log('📁 Created @getpara directory');
  }

  // Remove existing symlink or directory if it exists
  if (fs.existsSync(SYMLINK_PATH)) {
    try {
      const stats = fs.lstatSync(SYMLINK_PATH);
      if (stats.isSymbolicLink()) {
        fs.unlinkSync(SYMLINK_PATH);
        console.log('🗑️  Removed existing symlink');
      } else {
        // It's a directory, remove it recursively
        const { execSync } = require('child_process');
        execSync(`rm -rf "${SYMLINK_PATH}"`, { stdio: 'inherit' });
        console.log('🗑️  Removed existing directory');
      }
    } catch (error) {
      if (error.code === 'EPERM') {
        console.log('⚠️  Could not remove existing path (permission denied), continuing...');
      } else {
        throw error;
      }
    }
  }

  // Create the symlink
  fs.symlinkSync(ABSOLUTE_SHARED_PATH, SYMLINK_PATH);
  console.log('🔗 Created symlink from', SYMLINK_PATH, 'to', ABSOLUTE_SHARED_PATH);

  console.log('✅ Successfully linked @getpara/shared using symlink!');
  console.log('📝 The symlink is now pointing to the local shared package.');
  console.log('🔄 Any changes to the shared package will be reflected immediately.');

  console.log('💡 To unlink later, run: yarn unlink-shared-symlink');
} catch (error) {
  console.error('❌ Failed to set up symlink:', error.message);
  process.exit(1);
}
