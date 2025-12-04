#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fetchAllLatestAlphaVersions } from './fetch-latest-alpha-versions.js';

// Maximum depth to traverse (0 = root, 1 = one level deep, etc.)
const MAX_DEPTH = 3;

// Start traversing from the current directory
const rootDir = process.cwd();

// Count for summary
let filesChecked = 0;
let filesUpdated = 0;
let depsUpdated = 0;
let updatedFiles: Array<{ path: string; updates: Array<{ package: string; from: string; to: string; section: string }> }> = [];
let updateSummary: Record<string, { from: string; to: string; files: string[] }> = {};
let directoriesToUpdateLocks = new Set<string>();

/**
 * Compare version strings to determine if an update is needed
 * @param {string} currentVersion - Current version (e.g., "2.0.0-alpha.29")
 * @param {string} latestVersion - Latest version (e.g., "2.0.0-alpha.32")
 * @returns {boolean} True if update is needed
 */
function shouldUpdateVersion(currentVersion: string, latestVersion: string): boolean {
  // Remove any prefix characters like ^, ~, >=
  const cleanCurrent = currentVersion.replace(/^[\^~>=<]+/, "");
  const cleanLatest = latestVersion.replace(/^[\^~>=<]+/, "");
  
  // If versions are exactly the same, no update needed
  if (cleanCurrent === cleanLatest) {
    return false;
  }
  
  // Parse alpha versions
  const currentMatch = cleanCurrent.match(/(\d+\.\d+\.\d+)-alpha\.(\d+)/);
  const latestMatch = cleanLatest.match(/(\d+\.\d+\.\d+)-alpha\.(\d+)/);
  
  if (!currentMatch || !latestMatch) {
    // If one is not alpha format, update if they're different
    return cleanCurrent !== cleanLatest;
  }
  
  const [, currentBase, currentAlpha] = currentMatch;
  const [, latestBase, latestAlpha] = latestMatch;
  
  // Compare base versions first
  if (currentBase !== latestBase) {
    // Different base versions, compare semantically
    const currentParts = currentBase.split('.').map(Number);
    const latestParts = latestBase.split('.').map(Number);
    
    for (let i = 0; i < 3; i++) {
      if (latestParts[i] > currentParts[i]) return true;
      if (latestParts[i] < currentParts[i]) return false;
    }
  }
  
  // Same base version, compare alpha numbers
  return parseInt(latestAlpha) > parseInt(currentAlpha);
}

/**
 * Discover all unique @getpara packages used across the repository
 * @param dir - Directory to start traversing from
 * @param currentDepth - Current depth of traversal
 * @returns Set of unique @getpara package names
 */
function discoverGetParaPackages(dir: string, currentDepth = 0): Set<string> {
  const packages = new Set<string>();
  
  // Stop if we've reached the maximum depth
  if (currentDepth > MAX_DEPTH) {
    return packages;
  }

  try {
    // Read all items in the current directory
    const items = fs.readdirSync(dir);

    // Check if there's a package.json in this directory
    if (items.includes("package.json")) {
      const filePath = path.join(dir, "package.json");
      try {
        const packageData = JSON.parse(fs.readFileSync(filePath, "utf8"));
        const sectionsToCheck = ["dependencies", "devDependencies", "peerDependencies", "optionalDependencies", "resolutions"];
        
        sectionsToCheck.forEach((section) => {
          if (packageData[section]) {
            Object.keys(packageData[section]).forEach((dep) => {
              if (dep.startsWith("@getpara/")) {
                packages.add(dep);
              }
            });
          }
        });
      } catch (error) {
        console.error(`Error reading ${filePath}:`, error.message);
      }
    }

    // Continue traversing subdirectories
    for (const item of items) {
      const itemPath = path.join(dir, item);
      // Skip node_modules and hidden directories
      if (item === "node_modules" || item.startsWith(".")) {
        continue;
      }

      // Check if it's a directory
      if (fs.statSync(itemPath).isDirectory()) {
        const subPackages = discoverGetParaPackages(itemPath, currentDepth + 1);
        subPackages.forEach(pkg => packages.add(pkg));
      }
    }
  } catch (error) {
    console.error(`Error processing directory ${dir}:`, error.message);
  }
  
  return packages;
}

// Traverse directories recursively up to MAX_DEPTH
function traverseDirectories(dir: string, versionMap: Record<string, string>, currentDepth = 0, diffOnly = false): void {
  // Stop if we've reached the maximum depth
  if (currentDepth > MAX_DEPTH) {
    return;
  }

  try {
    // Read all items in the current directory
    const items = fs.readdirSync(dir);

    // Check if there's a package.json in this directory
    if (items.includes("package.json")) {
      updatePackageJson(path.join(dir, "package.json"), versionMap, diffOnly);
    }

    // Continue traversing subdirectories
    for (const item of items) {
      const itemPath = path.join(dir, item);
      // Skip node_modules and hidden directories
      if (item === "node_modules" || item.startsWith(".")) {
        continue;
      }

      // Check if it's a directory
      if (fs.statSync(itemPath).isDirectory()) {
        traverseDirectories(itemPath, versionMap, currentDepth + 1, diffOnly);
      }
    }
  } catch (error) {
    console.error(`Error processing directory ${dir}:`, error.message);
  }
}

/**
 * Check if package.json has any @getpara dependencies that need updates
 * @param {string} filePath - Path to the package.json file
 * @param {Object} versionMap - Map of package names to latest versions
 * @returns {boolean} True if file has dependencies that need updates
 */
function hasUpdatesNeeded(filePath: string, versionMap: Record<string, string>): boolean {
  try {
    const packageData = JSON.parse(fs.readFileSync(filePath, "utf8"));
    const sectionsToCheck = ["dependencies", "devDependencies", "peerDependencies", "optionalDependencies", "resolutions"];
    
    for (const section of sectionsToCheck) {
      if (packageData[section]) {
        for (const dep of Object.keys(packageData[section])) {
          if (dep.startsWith("@getpara/") && versionMap[dep]) {
            const currentVersion = packageData[section][dep];
            const latestVersion = versionMap[dep];
            
            if (shouldUpdateVersion(currentVersion, latestVersion)) {
              return true;
            }
          }
        }
      }
    }
    
    return false;
  } catch (error) {
    // If we can't read the file, include it in processing
    return true;
  }
}

// Update package.json file to change @getpara/* dependency versions
function updatePackageJson(filePath: string, versionMap: Record<string, string>, diffOnly = false): void {
  try {
    filesChecked++;

    // Skip files that don't need updates if in diff-only mode
    if (diffOnly && !hasUpdatesNeeded(filePath, versionMap)) {
      return;
    }

    // Read and parse package.json
    const packageData = JSON.parse(fs.readFileSync(filePath, "utf8"));
    let fileUpdated = false;
    const fileUpdates: Array<{ package: string; from: string; to: string; section: string }> = [];

    // Define sections to check for dependencies
    const sectionsToCheck = ["dependencies", "devDependencies", "peerDependencies", "optionalDependencies", "resolutions"];

    // Check and update each dependency section
    sectionsToCheck.forEach((section) => {
      if (packageData[section]) {
        Object.keys(packageData[section]).forEach((dep) => {
          if (dep.startsWith("@getpara/") && versionMap[dep]) {
            const currentVersion = packageData[section][dep];
            const latestVersion = versionMap[dep];
            
            // Check if update is needed
            if (shouldUpdateVersion(currentVersion, latestVersion)) {
              packageData[section][dep] = latestVersion;
              depsUpdated++;
              fileUpdated = true;
              
              const updateInfo = {
                package: dep,
                from: currentVersion,
                to: latestVersion,
                section: section
              };
              
              fileUpdates.push(updateInfo);
              console.log(`  Updated ${dep}: ${currentVersion} → ${latestVersion} (${section})`);
              
              // Track in global summary
              if (!updateSummary[dep]) {
                updateSummary[dep] = { from: currentVersion, to: latestVersion, files: [] };
              }
              updateSummary[dep].files.push(filePath.replace(rootDir, "."));
            }
          }
        });
      }
    });

    // Write updated package.json if changes were made
    if (fileUpdated) {
      fs.writeFileSync(filePath, JSON.stringify(packageData, null, 2) + "\n");
      filesUpdated++;
      const relativeFilePath = filePath.replace(rootDir, ".");
      updatedFiles.push({
        path: relativeFilePath,
        updates: fileUpdates
      });
      
      // Track directory for yarn.lock update
      const packageDir = path.dirname(filePath);
      directoriesToUpdateLocks.add(packageDir);
      
      console.log(`✅ Updated ${relativeFilePath}`);
    }
  } catch (error) {
    console.error(`Error updating ${filePath}:`, error.message);
  }
}

/**
 * Print detailed summary of all updates
 */
function printUpdateSummary() {
  console.log("\n" + "=".repeat(80));
  console.log("📊 UPDATE SUMMARY");
  console.log("=".repeat(80));
  
  if (Object.keys(updateSummary).length === 0) {
    console.log("🎉 All @getpara/* packages are already up to date!");
    return;
  }
  
  console.log("\n📦 Package Updates:");
  Object.entries(updateSummary).forEach(([pkg, info]) => {
    console.log(`\n  ${pkg}:`);
    console.log(`    ${info.from} → ${info.to}`);
    console.log(`    Updated in ${info.files.length} files:`);
    info.files.forEach((file: string) => console.log(`      - ${file}`));
  });
  
  console.log("\n📁 Files Updated:");
  updatedFiles.forEach((file: { path: string; updates: Array<{ package: string; from: string; to: string; section: string }> }) => {
    console.log(`\n  ${file.path}:`);
    file.updates.forEach((update: { package: string; from: string; to: string; section: string }) => {
      console.log(`    - ${update.package}: ${update.from} → ${update.to} (${update.section})`);
    });
  });
  
  console.log("\n" + "=".repeat(80));
  console.log(`📊 STATISTICS:`);
  console.log(`  - Package.json files checked: ${filesChecked}`);
  console.log(`  - Files updated: ${filesUpdated}`);
  console.log(`  - Dependencies updated: ${depsUpdated}`);
  console.log(`  - Unique packages updated: ${Object.keys(updateSummary).length}`);
  console.log("=".repeat(80));
}

// Update yarn.lock files in directories that had package.json changes
function updateYarnLockFiles(directories: Set<string>, dryRun = false): void {
  
  if (directories.size === 0) {
    console.log("🔒 No yarn.lock files need updating");
    return;
  }
  
  console.log(`\n🔒 Updating yarn.lock files in ${directories.size} directories...`);
  console.log("---------------------------------------------------");
  
  let successCount = 0;
  let failureCount = 0;
  
  directories.forEach((dir: string) => {
    const relativeDir = dir.replace(rootDir, ".") || ".";
    
    // Check if yarn.lock exists in this directory
    const yarnLockPath = path.join(dir, "yarn.lock");
    const hasYarnLock = fs.existsSync(yarnLockPath);
    
    if (!hasYarnLock && relativeDir !== ".") {
      console.log(`  ⏭️ Skipping ${relativeDir} (no yarn.lock found)`);
      return;
    }
    
    try {
      if (!dryRun) {
        console.log(`  🔄 Updating ${relativeDir}...`);
        
        // Update yarn.lock without downloading dependencies (Yarn 4.x feature)
        execSync("yarn install --mode=update-lockfile", { 
          cwd: dir,
          stdio: "pipe", // Suppress yarn output for cleaner logs
          timeout: 30000 // Reduced timeout since no downloads
        });
        
        console.log(`  ✅ Updated yarn.lock in ${relativeDir}`);
        successCount++;
      } else {
        console.log(`  🔍 Would update yarn.lock in ${relativeDir}`);
        successCount++;
      }
    } catch (error) {
      console.error(`  ❌ Failed to update yarn.lock in ${relativeDir}: ${error.message}`);
      failureCount++;
    }
  });
  
  console.log("---------------------------------------------------");
  console.log(`🔒 Yarn.lock update summary: ${successCount} success, ${failureCount} failures`);
  
  if (failureCount > 0) {
    console.warn("⚠️  Some yarn.lock files failed to update. Please check manually.");
  }
}

/**
 * Generate a commit message based on the updates
 */
function generateCommitMessage() {
  if (Object.keys(updateSummary).length === 0) {
    return null;
  }
  
  const packageNames = Object.keys(updateSummary);
  const totalFiles = filesUpdated;
  
  let message = `update @getpara/* dependencies to latest alpha versions\n\n`;
  
  if (packageNames.length === 1) {
    const pkg = packageNames[0];
    const info = updateSummary[pkg];
    message += `Updated ${pkg} from ${info.from} to ${info.to}\n`;
  } else {
    message += `Updated ${packageNames.length} @getpara packages:\n`;
    packageNames.forEach(pkg => {
      const info = updateSummary[pkg];
      message += `- ${pkg}: ${info.from} → ${info.to}\n`;
    });
  }
  
  message += `\nAffected ${totalFiles} package.json files across the monorepo.`;
  message += `\nAutomatically updated yarn.lock files in affected directories.`;
  
  return message;
}

// Main execution
async function main() {
  const args = process.argv.slice(2);

  // Parse --version flag
  const versionIndex = args.indexOf('--version');
  const explicitVersion = versionIndex !== -1 && args[versionIndex + 1] && !args[versionIndex + 1].startsWith('--')
    ? args[versionIndex + 1]
    : null;

  // Parse --skip-lockfile flag
  const skipLockfile = args.includes('--skip-lockfile');

  // Parse mode (--check-only, --diff-only, --help)
  const mode = args.find(arg =>
    ['--check-only', '--diff-only', '--help', '-h'].includes(arg)
  );

  if (mode === "--help" || mode === "-h") {
    console.log(`
Usage: node update-para-dependencies.js [options]

Options:
  --version <ver>  - Use explicit version for all @getpara/* packages (instead of fetching from npm)
  --skip-lockfile  - Skip yarn.lock updates (useful when npm packages aren't published yet)
  --check-only     - Check for available updates without making changes
  --diff-only      - Only process files where versions don't match target (faster incremental updates)
  --help, -h       - Show this help message

Examples:
  node update-para-dependencies.js                                    # Fetch latest from npm
  node update-para-dependencies.js --version 2.0.0-alpha.73           # Use explicit version
  node update-para-dependencies.js --version 2.0.0-alpha.73 --skip-lockfile  # Skip lockfile updates
  node update-para-dependencies.js --check-only                       # Check without modifying
  node update-para-dependencies.js --diff-only                        # Only update changed files
`);
    process.exit(0);
  }

  try {
    console.log("🔍 Discovering @getpara/* packages in the repository...");
    const discoveredPackages = discoverGetParaPackages(rootDir);

    if (discoveredPackages.size === 0) {
      console.log("ℹ️  No @getpara/* packages found in the repository.");
      process.exit(0);
    }

    console.log(`\n📦 Discovered ${discoveredPackages.size} unique @getpara/* packages:`);
    const packageList = Array.from(discoveredPackages).sort();
    packageList.forEach(pkg => console.log(`  - ${pkg}`));

    // Build version map - either from explicit version or npm
    let versionMap: Record<string, string>;

    if (explicitVersion) {
      console.log(`\n📌 Using explicit version: ${explicitVersion}`);
      versionMap = {};
      discoveredPackages.forEach(pkg => {
        versionMap[pkg] = explicitVersion;
      });
      console.log(`📦 Will update ${discoveredPackages.size} packages to ${explicitVersion}`);
    } else {
      console.log("\n🔍 Fetching latest alpha versions for discovered packages...");
      versionMap = await fetchAllLatestAlphaVersions(packageList);

      if (Object.keys(versionMap).length === 0) {
        console.error("❌ No alpha versions found for any of the discovered packages.");
        console.log("ℹ️  This might mean the packages don't have alpha versions yet.");
        process.exit(0);
      }

      console.log(`\n📦 Found alpha versions for ${Object.keys(versionMap).length} packages`);
    }

    if (mode === "--diff-only") {
      console.log("🚀 INCREMENTAL MODE - Only processing files with version differences");
    } else if (mode === "--check-only") {
      console.log("🔍 CHECK ONLY MODE - No files will be modified");
    } else {
      console.log("🔄 Scanning for package.json files to update...");
    }

    if (skipLockfile) {
      console.log("⏭️  Lockfile updates will be skipped (--skip-lockfile)");
    }
    console.log("---------------------------------------------------");

    // Create a mock update for check-only mode
    const originalWriteFileSync = fs.writeFileSync;
    if (mode === "--check-only") {
      fs.writeFileSync = () => {}; // No-op for check mode
    }

    const isDiffOnly = mode === "--diff-only";
    traverseDirectories(rootDir, versionMap, 0, isDiffOnly);

    // Restore original function
    fs.writeFileSync = originalWriteFileSync;

    printUpdateSummary();

    // Update yarn.lock files if there were changes (unless --skip-lockfile)
    if (filesUpdated > 0 && !skipLockfile) {
      updateYarnLockFiles(directoriesToUpdateLocks, mode === "--check-only");
    } else if (filesUpdated > 0 && skipLockfile) {
      console.log("\n⏭️  Skipping yarn.lock updates (--skip-lockfile flag set)");
    }

    // Generate commit message
    const commitMessage = generateCommitMessage();
    if (commitMessage && mode !== "--check-only") {
      console.log("\n💬 Suggested commit message:");
      console.log("---------------------------------------------------");
      console.log(commitMessage);
      console.log("---------------------------------------------------");
    }

    if (mode === "--check-only") {
      console.log("\n🔍 Check complete. Run without --check-only to apply updates.");
      // Exit with error code if updates are needed
      if (filesUpdated > 0) {
        process.exit(1);
      }
    } else if (filesUpdated > 0) {
      const lockfileMsg = skipLockfile ? " Package.json files" : " Package.json and yarn.lock files";
      console.log(`\n✅ Update complete!${lockfileMsg} have been updated.`);
    }

  } catch (error) {
    console.error("❌ Error during update process:", error.message);
    process.exit(1);
  }
}

// Export functions for use by other scripts
export {
  shouldUpdateVersion,
  traverseDirectories,
  updatePackageJson,
  generateCommitMessage,
  discoverGetParaPackages
};

// Run main if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}