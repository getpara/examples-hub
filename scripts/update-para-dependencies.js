#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { fetchAllLatestAlphaVersions } = require("./fetch-latest-alpha-versions.js");

// Maximum depth to traverse (0 = root, 1 = one level deep, etc.)
const MAX_DEPTH = 3;

// Start traversing from the current directory
const rootDir = process.cwd();

// Count for summary
let filesChecked = 0;
let filesUpdated = 0;
let depsUpdated = 0;
let updatedFiles = [];
let updateSummary = {};
let directoriesToUpdateLocks = new Set();

/**
 * Compare version strings to determine if an update is needed
 * @param {string} currentVersion - Current version (e.g., "2.0.0-alpha.29")
 * @param {string} latestVersion - Latest version (e.g., "2.0.0-alpha.32")
 * @returns {boolean} True if update is needed
 */
function shouldUpdateVersion(currentVersion, latestVersion) {
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
 * Traverse directories recursively up to MAX_DEPTH
 * @param {string} dir - The current directory to process
 * @param {Object} versionMap - Map of package names to latest versions
 * @param {number} currentDepth - The current depth of traversal
 * @param {boolean} diffOnly - Only process files that need updates
 */
function traverseDirectories(dir, versionMap, currentDepth = 0, diffOnly = false) {
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
function hasUpdatesNeeded(filePath, versionMap) {
  try {
    const packageData = JSON.parse(fs.readFileSync(filePath, "utf8"));
    const sectionsToCheck = ["dependencies", "devDependencies", "peerDependencies", "optionalDependencies"];
    
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

/**
 * Update package.json file to change @getpara/* dependency versions
 * @param {string} filePath - Path to the package.json file
 * @param {Object} versionMap - Map of package names to latest versions
 * @param {boolean} diffOnly - Only process files that need updates
 */
function updatePackageJson(filePath, versionMap, diffOnly = false) {
  try {
    filesChecked++;

    // Skip files that don't need updates if in diff-only mode
    if (diffOnly && !hasUpdatesNeeded(filePath, versionMap)) {
      return;
    }

    // Read and parse package.json
    const packageData = JSON.parse(fs.readFileSync(filePath, "utf8"));
    let fileUpdated = false;
    const fileUpdates = [];

    // Define sections to check for dependencies
    const sectionsToCheck = ["dependencies", "devDependencies", "peerDependencies", "optionalDependencies"];

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
    info.files.forEach(file => console.log(`      - ${file}`));
  });
  
  console.log("\n📁 Files Updated:");
  updatedFiles.forEach(file => {
    console.log(`\n  ${file.path}:`);
    file.updates.forEach(update => {
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

/**
 * Update yarn.lock files in directories that had package.json changes
 * @param {Set} directories - Set of directory paths to update
 * @param {boolean} dryRun - Whether this is a dry run
 */
function updateYarnLockFiles(directories, dryRun = false) {
  const { execSync } = require("child_process");
  
  if (directories.size === 0) {
    console.log("🔒 No yarn.lock files need updating");
    return;
  }
  
  console.log(`\n🔒 Updating yarn.lock files in ${directories.size} directories...`);
  console.log("---------------------------------------------------");
  
  let successCount = 0;
  let failureCount = 0;
  
  directories.forEach(dir => {
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
  const mode = process.argv[2];
  
  if (mode === "--help" || mode === "-h") {
    console.log(`
Usage: node update-para-dependencies.js [mode]

Modes:
  (no args)    - Fetch latest alpha versions and update all @getpara/* dependencies
  --check-only - Check for available updates without making changes
  --diff-only  - Only process files where versions don't match target (faster incremental updates)
  --help, -h   - Show this help message

Examples:
  node update-para-dependencies.js
  node update-para-dependencies.js --check-only
  node update-para-dependencies.js --diff-only
`);
    process.exit(0);
  }

  try {
    console.log("🔍 Fetching latest alpha versions for @getpara/* packages...");
    const versionMap = await fetchAllLatestAlphaVersions();
    
    if (Object.keys(versionMap).length === 0) {
      console.error("❌ No alpha versions found. Cannot proceed with updates.");
      process.exit(1);
    }
    
    console.log(`\n📦 Found ${Object.keys(versionMap).length} packages with alpha versions`);
    
    if (mode === "--diff-only") {
      console.log("🚀 INCREMENTAL MODE - Only processing files with version differences");
    } else if (mode === "--check-only") {
      console.log("🔍 CHECK ONLY MODE - No files will be modified");
    } else {
      console.log("🔄 Scanning for package.json files to update...");
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
    
    // Update yarn.lock files if there were changes
    if (filesUpdated > 0) {
      updateYarnLockFiles(directoriesToUpdateLocks, mode === "--check-only");
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
    } else if (filesUpdated > 0) {
      console.log("\n✅ Update complete! Package.json and yarn.lock files have been updated.");
    }

  } catch (error) {
    console.error("❌ Error during update process:", error.message);
    process.exit(1);
  }
}

// Export functions for use by other scripts
module.exports = {
  shouldUpdateVersion,
  traverseDirectories,
  updatePackageJson,
  generateCommitMessage
};

// Run main if this script is executed directly
if (require.main === module) {
  main();
}