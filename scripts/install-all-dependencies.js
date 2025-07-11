#!/usr/bin/env node

/**
 * install-all-dependencies.js
 * Runs yarn install across all projects in the examples-hub monorepo
 * Uses Yarn 4.9.2 as configured in .yarnrc.yml
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function findProjectDirectories() {
  const projectDirs = new Set();
  
  function traverse(dir, depth = 0) {
    // Limit traversal depth to avoid infinite loops
    if (depth > 4) return;
    
    // Skip certain directories
    const skipDirs = ['node_modules', '.next', '.output', 'dist', '.yarn', 'build', '.cache', '.git'];
    const dirName = path.basename(dir);
    if (skipDirs.includes(dirName)) return;
    
    try {
      const items = fs.readdirSync(dir);
      
      // Check if this directory has a package.json
      if (items.includes('package.json')) {
        projectDirs.add(dir);
      }
      
      // Recursively check subdirectories
      for (const item of items) {
        const fullPath = path.join(dir, item);
        try {
          const stat = fs.statSync(fullPath);
          if (stat.isDirectory()) {
            traverse(fullPath, depth + 1);
          }
        } catch (err) {
          // Skip inaccessible directories
        }
      }
    } catch (err) {
      // Skip inaccessible directories
    }
  }
  
  traverse('.');
  return Array.from(projectDirs).sort();
}

function installDependencies() {
  console.log('🚀 Installing dependencies across all projects with Yarn 4.9.2');
  console.log('============================================================');
  
  const projectDirs = findProjectDirectories();
  let total = 0;
  let success = 0;
  let failed = 0;
  
  for (const dir of projectDirs) {
    total++;
    
    console.log('');
    console.log(`📦 Processing: ${dir}`);
    
    try {
      // Check if package.json exists (should exist due to our search)
      const packageJsonPath = path.join(dir, 'package.json');
      if (!fs.existsSync(packageJsonPath)) {
        console.log('⏭️  Skipping (no package.json)');
        continue;
      }
      
      // Determine which package manager to use based on project type
      let installCommand = 'yarn install --network-timeout 60000';
      let packageManager = 'yarn';
      
      if (dir.includes('server/with-bun')) {
        installCommand = 'bun install';
        packageManager = 'bun';
      } else if (dir.includes('server/with-deno')) {
        // Deno projects typically don't need install, but check if they have deps
        const packageJson = JSON.parse(fs.readFileSync(path.join(dir, 'package.json'), 'utf8'));
        if (packageJson.scripts && packageJson.scripts.install) {
          installCommand = 'deno task install';
          packageManager = 'deno';
        } else {
          console.log('⏭️ Skipping (Deno project with no install script)');
          continue;
        }
      }
      
      console.log(`🔄 Running ${packageManager} install...`);
      
      // Run install command in the project directory
      execSync(installCommand, {
        cwd: dir,
        stdio: 'pipe',
        timeout: 120000 // 2 minute timeout per project
      });
      
      console.log('✅ Success');
      success++;
      
    } catch (error) {
      console.log('❌ Failed');
      console.log(`   Error: ${error.message.split('\n')[0]}`);
      failed++;
    }
  }
  
  console.log('');
  console.log('============================================================');
  console.log('📊 Installation Summary:');
  console.log(`   Total projects: ${total}`);
  console.log(`   ✅ Successful: ${success}`);
  console.log(`   ❌ Failed: ${failed}`);
  console.log('============================================================');
  
  if (failed > 0) {
    console.log('⚠️  Some installations failed. Check the output above for details.');
    process.exit(1);
  } else {
    console.log('🎉 All installations completed successfully!');
    process.exit(0);
  }
}

// Handle command line arguments
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log('Usage: node install-all-dependencies.js');
  console.log('');
  console.log('Installs dependencies in all projects containing package.json files');
  console.log('Uses Yarn 4.9.2 as configured in .yarnrc.yml');
  process.exit(0);
}

// Run the installation
installDependencies();