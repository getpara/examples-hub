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
 * Fetch latest alpha versions for all known @getpara packages
 */
async function fetchAllLatestAlphaVersions(): Promise<Record<string, string>> {
  // Known @getpara packages (discovered from package.json analysis)
  const getparaPackages = [
    "@getpara/core-sdk",
    "@getpara/react-sdk", 
    "@getpara/web-sdk",
    "@getpara/server-sdk",
    "@getpara/user-management-client",
    "@getpara/cosmos-wallet-connectors",
    "@getpara/evm-wallet-connectors", 
    "@getpara/solana-wallet-connectors",
    "@getpara/graz",
    "@getpara/cosmjs-v0-integration",
    "@getpara/ethers-v5-integration",
    "@getpara/ethers-v6-integration",
    "@getpara/solana-web3.js-v1-integration",
    "@getpara/viem-v1-integration",
    "@getpara/viem-v2-integration"
  ];
  
  console.log("Fetching latest alpha versions for @getpara packages...");
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
    const versionMap = await fetchAllLatestAlphaVersions();
    
    // Output as JSON for consumption by other scripts
    if (process.argv.includes("--json")) {
      console.log(JSON.stringify(versionMap, null, 2));
    }
    
    // Exit with error if no versions found
    if (Object.keys(versionMap).length === 0) {
      console.error("No alpha versions found for any @getpara packages");
      process.exit(1);
    }
    
    console.log(`\nFound alpha versions for ${Object.keys(versionMap).length} packages`);
    
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