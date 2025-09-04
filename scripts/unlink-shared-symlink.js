#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const SYMLINK_PATH = path.resolve(__dirname, '../node_modules/@getpara/shared');

console.log('🔗 Unlinking @getpara/shared symlink (dev mode)...');

try {
  // Check if the symlink exists
  if (fs.existsSync(SYMLINK_PATH)) {
    // Check if it's actually a symlink
    const stats = fs.lstatSync(SYMLINK_PATH);
    if (stats.isSymbolicLink()) {
      fs.unlinkSync(SYMLINK_PATH);
      console.log('✅ Removed symlink:', SYMLINK_PATH);
    } else {
      console.log('⚠️  Path exists but is not a symlink:', SYMLINK_PATH);
    }
  } else {
    console.log('ℹ️  No symlink found at:', SYMLINK_PATH);
  }

  console.log('\n✅ Successfully unlinked @getpara/shared!');
  console.log('📦 Now using the published version from npm.');
} catch (error) {
  console.error('❌ Failed to unlink:', error.message);
  process.exit(1);
}
