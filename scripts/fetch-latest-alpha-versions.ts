#!/usr/bin/env node

import https from 'https';

/**
 * Fetch the latest alpha version for a given @getpara package from npm registry
 */
async function fetchLatestAlphaVersion(packageName: string): Promise<string | null> {
  return new Promise((resolve) => {
    const registryUrl = `https://registry.npmjs.org/${packageName}`;
    
    https.get(registryUrl, (res) => {
      let data = "";
      
      res.on("data", (chunk) => {
        data += chunk;
      });
      
      res.on("end", () => {
        try {
          const packageInfo = JSON.parse(data);
          
          if (packageInfo.error) {
            console.error(`Package ${packageName} not found:`, packageInfo.error);
            resolve(null);
            return;
          }
          
          // Get all versions and filter for alpha versions
          const versions = Object.keys(packageInfo.versions || {});
          const alphaVersions = versions.filter(version => version.includes("-alpha."));
          
          if (alphaVersions.length === 0) {
            console.log(`No alpha versions found for ${packageName}`);
            resolve(null);
            return;
          }
          
          // Sort alpha versions to get the latest
          // Format: 2.0.0-alpha.32
          const sortedAlphaVersions = alphaVersions.sort((a, b) => {
            const aMatch = a.match(/(\d+\.\d+\.\d+)-alpha\.(\d+)/);
            const bMatch = b.match(/(\d+\.\d+\.\d+)-alpha\.(\d+)/);
            
            if (!aMatch || !bMatch) return 0;
            
            // Compare base version first (2.0.0)
            const aBase = aMatch[1];
            const bBase = bMatch[1];
            if (aBase !== bBase) {
              return aBase.localeCompare(bBase, undefined, { numeric: true });
            }
            
            // Compare alpha number
            const aAlpha = parseInt(aMatch[2]);
            const bAlpha = parseInt(bMatch[2]);
            return bAlpha - aAlpha; // Descending order
          });
          
          const latestVersion = sortedAlphaVersions[0];
          console.log(`Latest alpha version for ${packageName}: ${latestVersion}`);
          resolve(latestVersion);
          
        } catch (error) {
          console.error(`Error parsing registry response for ${packageName}:`, error.message);
          resolve(null);
        }
      });
    }).on("error", (error) => {
      console.error(`HTTP request failed for ${packageName}:`, error.message);
      resolve(null);
    });
  });
}

/**
 * Fetch latest alpha versions for specified @getpara packages
 * @param packages - Array of package names to fetch versions for
 */
async function fetchAllLatestAlphaVersions(packages?: string[]): Promise<Record<string, string>> {
  // If no packages provided, return empty map (will be filled by dynamic discovery)
  if (!packages || packages.length === 0) {
    console.log("No packages specified for version fetching.");
    return {};
  }
  
  // Filter to only @getpara packages
  const getparaPackages = packages.filter(pkg => pkg.startsWith('@getpara/'));
  
  if (getparaPackages.length === 0) {
    console.log("No @getpara packages found in the provided list.");
    return {};
  }
  
  console.log(`Fetching latest alpha versions for ${getparaPackages.length} @getpara packages...`);
  console.log("=".repeat(60));
  
  const versionMap = {};
  const promises = getparaPackages.map(async (packageName) => {
    const version = await fetchLatestAlphaVersion(packageName);
    if (version) {
      versionMap[packageName] = version;
    }
  });
  
  await Promise.all(promises);
  
  console.log("=".repeat(60));
  console.log("Summary:");
  Object.entries(versionMap).forEach(([pkg, version]) => {
    console.log(`  ${pkg}: ${version}`);
  });
  
  return versionMap;
}

// Main execution
async function main() {
  try {
    // When run standalone, inform that package discovery is needed
    console.warn("⚠️  This script now requires packages to be discovered dynamically.");
    console.warn("   Run 'yarn deps:update' to automatically discover and update all @getpara packages.");
    console.warn("   This standalone mode is deprecated.");
    
    // For backward compatibility, we could accept packages via command line
    const packages = process.argv.slice(2).filter(arg => !arg.startsWith('--'));
    
    if (packages.length > 0) {
      const versionMap = await fetchAllLatestAlphaVersions(packages);
      
      // Output as JSON for consumption by other scripts
      if (process.argv.includes("--json")) {
        console.log(JSON.stringify(versionMap, null, 2));
      }
      
      console.log(`\nFound alpha versions for ${Object.keys(versionMap).length} packages`);
    }
    
  } catch (error) {
    console.error("Error fetching alpha versions:", error.message);
    process.exit(1);
  }
}

// Export functions for use by other scripts
export {
  fetchLatestAlphaVersion,
  fetchAllLatestAlphaVersions
};

// Run main if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}