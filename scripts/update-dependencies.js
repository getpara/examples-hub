#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

// Get the target version from command line arguments
const targetVersion = process.argv[2];

if (!targetVersion) {
  console.error('Please provide a target version. Example: node update-para-deps.js "^1.2.3"');
  process.exit(1);
}

// Maximum depth to traverse (0 = root, 1 = one level deep, etc.)
const MAX_DEPTH = 3;

// Start traversing from the current directory
const rootDir = process.cwd();

// Count for summary
let filesChecked = 0;
let filesUpdated = 0;
let depsUpdated = 0;

/**
 * Traverse directories recursively up to MAX_DEPTH
 * @param {string} dir - The current directory to process
 * @param {number} currentDepth - The current depth of traversal
 */
function traverseDirectories(dir, currentDepth = 0) {
  // Stop if we've reached the maximum depth
  if (currentDepth > MAX_DEPTH) {
    return;
  }

  try {
    // Read all items in the current directory
    const items = fs.readdirSync(dir);

    // Check if there's a package.json in this directory
    if (items.includes("package.json")) {
      updatePackageJson(path.join(dir, "package.json"));
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
        traverseDirectories(itemPath, currentDepth + 1);
      }
    }
  } catch (error) {
    console.error(`Error processing directory ${dir}:`, error.message);
  }
}

/**
 * Update package.json file to change @getpara/* dependency versions
 * @param {string} filePath - Path to the package.json file
 */
function updatePackageJson(filePath) {
  try {
    filesChecked++;

    // Read and parse package.json
    const packageData = JSON.parse(fs.readFileSync(filePath, "utf8"));
    let fileUpdated = false;

    // Define sections to check for dependencies
    const sectionsToCheck = ["dependencies", "devDependencies", "peerDependencies", "optionalDependencies"];

    // Check and update each dependency section
    sectionsToCheck.forEach((section) => {
      if (packageData[section]) {
        Object.keys(packageData[section]).forEach((dep) => {
          if (dep.startsWith("@getpara/")) {
            // Only update if the version is different
            if (packageData[section][dep] !== targetVersion) {
              packageData[section][dep] = targetVersion;
              depsUpdated++;
              fileUpdated = true;
              console.log(`  Updated ${dep} to ${targetVersion}`);
            }
          }
        });
      }
    });

    // Write updated package.json if changes were made
    if (fileUpdated) {
      fs.writeFileSync(filePath, JSON.stringify(packageData, null, 2) + "\n");
      filesUpdated++;
      console.log(`✅ Updated ${filePath.replace(rootDir, ".")}`);
    }
  } catch (error) {
    console.error(`Error updating ${filePath}:`, error.message);
  }
}

// Start the traversal
console.log(`Searching for package.json files up to ${MAX_DEPTH} levels deep from ${rootDir}`);
console.log(`Will update all @getpara/* dependencies to version: ${targetVersion}`);
console.log("---------------------------------------------------");

traverseDirectories(rootDir);

console.log("---------------------------------------------------");
console.log(`Summary: ${filesChecked} package.json files checked`);
console.log(`         ${filesUpdated} files updated`);
console.log(`         ${depsUpdated} @getpara/* dependencies updated to ${targetVersion}`);
