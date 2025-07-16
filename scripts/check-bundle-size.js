#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const zlib = require('zlib');

/**
 * Bundle size checker for Para SDK packages
 * Analyzes production bundle sizes with tree-shaking and compression
 */

const TEMP_DIR = '.bundle-size-temp';

// Safety checks for temp directory operations
function getSafeTempDir() {
  const tempDir = path.join(process.cwd(), TEMP_DIR);

  // Safety check: ensure temp dir is within current working directory
  if (!tempDir.startsWith(process.cwd())) {
    throw new Error(`Temp directory path is outside working directory: ${tempDir}`);
  }

  // Safety check: ensure temp dir name matches expected pattern
  if (path.basename(tempDir) !== TEMP_DIR) {
    throw new Error(`Temp directory name doesn't match expected pattern: ${tempDir}`);
  }

  return tempDir;
}

function ensureTempDir() {
  const tempDir = getSafeTempDir();
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }
  return tempDir;
}

// Bundle size configuration - thresholds set to 110% of current sizes
const BUNDLE_CONFIG = {
  packages: {
    '@getpara/core-sdk': {
      thresholds: {
        raw: '876KB',
        minified: '876KB',
        gzipped: '259KB',
      },
      entry: 'dist/esm/index.js',
    },
    '@getpara/web-sdk': {
      thresholds: {
        raw: '1.21MB',
        minified: '1.21MB',
        gzipped: '359KB',
      },
      entry: 'dist/index.js',
      external: ['@farcaster/miniapp-sdk'],
    },
    '@getpara/react-sdk': {
      thresholds: {
        raw: '2.97MB',
        minified: '2.97MB',
        gzipped: '926KB',
      },
      entry: 'dist/index.js',
      external: [
        '@tanstack/react-query',
        'react',
        'react-dom',
        '@farcaster/miniapp-sdk',
        '@farcaster/miniapp-wagmi-connector',
        '@farcaster/mini-app-solana',
        '@getpara/graz',
        '@solana-mobile/wallet-adapter-mobile',
        '@solana/wallet-adapter-base',
        '@solana/wallet-adapter-react',
        '@solana/wallet-adapter-walletconnect',
        'wagmi',
        'viem',
      ],
    },
    '@getpara/react-sdk-lite': {
      thresholds: {
        raw: '2.97MB',
        minified: '2.97MB',
        gzipped: '926KB',
      },
      entry: 'dist/index.js',
      external: ['@tanstack/react-query', 'react', 'react-dom', '@farcaster/miniapp-sdk'],
    },
    '@getpara/react-common': {
      thresholds: {
        raw: '1.27MB',
        minified: '1.27MB',
        gzipped: '378KB',
      },
      entry: 'dist/index.js',
      external: ['react', 'react-dom', '@farcaster/miniapp-sdk'],
    },
    '@getpara/evm-wallet-connectors': {
      thresholds: {
        raw: '222KB',
        minified: '222KB',
        gzipped: '80KB',
      },
      entry: 'dist/index.js',
      external: [
        '@tanstack/react-query',
        'react',
        'react-dom',
        'viem',
        'wagmi',
        '@farcaster/miniapp-wagmi-connector',
        '@farcaster/miniapp-sdk',
      ],
    },
    '@getpara/cosmos-wallet-connectors': {
      thresholds: {
        raw: '195KB',
        minified: '195KB',
        gzipped: '72KB',
      },
      entry: 'dist/index.js',
      external: ['@getpara/graz', 'react', 'react-dom', '@farcaster/miniapp-sdk'],
    },
    '@getpara/solana-wallet-connectors': {
      thresholds: {
        raw: '20KB',
        minified: '20KB',
        gzipped: '8KB',
      },
      entry: 'dist/index.js',
      external: [
        '@solana-mobile/wallet-adapter-mobile',
        '@solana/wallet-adapter-base',
        '@solana/wallet-adapter-react',
        '@solana/wallet-adapter-walletconnect',
        'react',
        'react-dom',
        '@farcaster/mini-app-solana',
        '@farcaster/miniapp-sdk',
      ],
    },
    '@getpara/ethers-v5-integration': {
      thresholds: {
        raw: '241KB',
        minified: '241KB',
        gzipped: '80KB',
      },
      entry: 'dist/esm/index.js',
      external: ['ethers'],
    },
    '@getpara/ethers-v6-integration': {
      thresholds: {
        raw: '160KB',
        minified: '160KB',
        gzipped: '57KB',
      },
      entry: 'dist/esm/index.js',
      external: ['ethers'],
    },
    '@getpara/viem-v1-integration': {
      thresholds: {
        raw: '159KB',
        minified: '159KB',
        gzipped: '57KB',
      },
      entry: 'dist/esm/index.js',
      external: ['viem'],
    },
    '@getpara/viem-v2-integration': {
      thresholds: {
        raw: '159KB',
        minified: '159KB',
        gzipped: '57KB',
      },
      entry: 'dist/esm/index.js',
      external: ['viem'],
    },
    '@getpara/wagmi-v2-connector': {
      thresholds: {
        raw: '169KB',
        minified: '169KB',
        gzipped: '60KB',
      },
      entry: 'dist/index.js',
      external: ['react', 'react-dom', 'viem', 'wagmi', '@farcaster/miniapp-sdk'],
    },
    '@getpara/wagmi-v2-integration': {
      thresholds: {
        raw: '2.97MB',
        minified: '2.97MB',
        gzipped: '937KB',
      },
      entry: 'dist/index.js',
      external: ['@tanstack/react-query', 'react', 'react-dom', 'viem', 'wagmi', '@farcaster/miniapp-sdk'],
    },
    '@getpara/cosmjs-v0-integration': {
      thresholds: {
        raw: '1.43MB',
        minified: '1.43MB',
        gzipped: '468KB',
      },
      entry: 'dist/esm/index.js',
      external: ['@cosmjs/amino', '@cosmjs/encoding', '@cosmjs/proto-signing', '@cosmjs/stargate'],
    },
    '@getpara/user-management-client': {
      thresholds: {
        raw: '176KB',
        minified: '176KB',
        gzipped: '50KB',
      },
      entry: 'dist/esm/index.js',
    },
  },
};

// ANSI color codes for better output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m',
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

function parseSize(sizeStr) {
  const match = sizeStr.match(/^(\d+(?:\.\d+)?)\s*(B|KB|MB|GB)$/i);
  if (!match) throw new Error(`Invalid size format: ${sizeStr}`);

  const [, value, unit] = match;
  const multipliers = { B: 1, KB: 1024, MB: 1024 ** 2, GB: 1024 ** 3 };

  return parseFloat(value) * multipliers[unit.toUpperCase()];
}

function getPackageInfo() {
  const packagesDir = path.join(process.cwd(), 'packages');
  const packages = [];

  if (!fs.existsSync(packagesDir)) {
    throw new Error('No packages directory found');
  }

  for (const dir of fs.readdirSync(packagesDir)) {
    const packagePath = path.join(packagesDir, dir);
    const packageJsonPath = path.join(packagePath, 'package.json');

    if (fs.existsSync(packageJsonPath)) {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      packages.push({
        name: packageJson.name,
        path: packagePath,
        packageJson,
      });
    }
  }

  return packages;
}

function getAllPeerDependencies(packageInfo, packages, visited = new Set()) {
  // Prevent infinite recursion
  if (visited.has(packageInfo.packageJson.name)) {
    return new Set();
  }
  visited.add(packageInfo.packageJson.name);

  const allPeerDeps = new Set();

  // Add direct peer dependencies
  const directPeerDeps = Object.keys(packageInfo.packageJson.peerDependencies || {});
  directPeerDeps.forEach(dep => allPeerDeps.add(dep));

  // Add peer dependencies from our own dependencies
  const deps = Object.keys(packageInfo.packageJson.dependencies || {});
  for (const dep of deps) {
    // Only check internal @getpara packages
    if (dep.startsWith('@getpara/')) {
      const depPackage = packages.find(p => p.packageJson.name === dep);
      if (depPackage) {
        const transitivePeerDeps = getAllPeerDependencies(depPackage, packages, visited);
        transitivePeerDeps.forEach(peerDep => allPeerDeps.add(peerDep));
      }
    }
  }

  return allPeerDeps;
}

function validateExternalDependencies(packages) {
  const errors = [];

  for (const packageInfo of packages) {
    const packageConfig = BUNDLE_CONFIG.packages[packageInfo.packageJson.name];

    if (!packageConfig) {
      continue; // Skip packages not in config
    }

    // Get all peer dependencies (direct + transitive from internal deps)
    const allPeerDeps = getAllPeerDependencies(packageInfo, packages);
    const configExternals = new Set(packageConfig.external || []);

    // Check that all peer dependencies are listed as external
    for (const peerDep of allPeerDeps) {
      if (!configExternals.has(peerDep)) {
        errors.push(
          `${packageInfo.packageJson.name}: peer dependency "${peerDep}" (direct or transitive) not listed as external`,
        );
      }
    }

    // Check that all external dependencies are peer dependencies
    for (const external of configExternals) {
      if (!allPeerDeps.has(external)) {
        errors.push(
          `${packageInfo.packageJson.name}: external dependency "${external}" not found as direct or transitive peer dependency`,
        );
      }
    }
  }

  return errors;
}

function createTestBundle(packagePath, entryFile) {
  const entryPath = path.join(packagePath, entryFile);

  if (!fs.existsSync(entryPath)) {
    throw new Error(`Entry file not found: ${entryPath}`);
  }

  // Use safe temp directory
  const tempDir = ensureTempDir();

  // Create a test import file with unique name
  const timestamp = Date.now();
  const random = Math.random().toString(36).substr(2, 9);
  const testFile = path.join(tempDir, `test-${timestamp}-${random}.js`);
  fs.writeFileSync(testFile, `export * from '${entryPath}';`);

  return testFile;
}

function bundleWithEsbuild(entryFile, external = []) {
  // Use safe temp directory and create unique output file name
  const tempDir = ensureTempDir();
  const timestamp = Date.now();
  const random = Math.random().toString(36).substr(2, 9);
  const outputFile = path.join(tempDir, `bundle-${timestamp}-${random}.js`);

  try {
    // Default externals for browser bundles
    const defaultExternals = [
      'react',
      'react-dom',
      '@tanstack/react-query',
      'crypto', // Node.js crypto module
      'node:crypto',
      'buffer',
      'stream',
      'util',
      'path',
      'fs',
      'os',
      // Since react-sdk-lite doesn't actually list these as peer deps, adding them here to ensure they aren't counted in bundle size
      '@getpara/cosmos-wallet-connectors',
      '@getpara/evm-wallet-connectors',
      '@getpara/solana-wallet-connectors',
    ];

    const allExternals = [...defaultExternals, ...external];
    const externalFlags = allExternals.map(ext => `--external:${ext}`).join(' ');

    // Bundle with esbuild - browser platform with crypto polyfills
    const cmd = `npx esbuild "${entryFile}" --bundle --minify --tree-shaking=true --format=esm --platform=browser --outfile="${outputFile}" ${externalFlags} --define:process.env.NODE_ENV='"production"' --define:global=globalThis --log-level=warning`;

    execSync(cmd, {
      stdio: 'pipe',
      cwd: process.cwd(),
    });

    return outputFile;
  } catch (error) {
    throw new Error(`Bundling failed: ${error.message}`);
  }
}

function analyzeBundleSize(bundlePath) {
  const bundleContent = fs.readFileSync(bundlePath);

  // Raw size
  const rawSize = bundleContent.length;

  // Gzipped size
  const gzippedSize = zlib.gzipSync(bundleContent).length;

  return {
    raw: rawSize,
    minified: rawSize, // esbuild already minified
    gzipped: gzippedSize,
  };
}

function checkThresholds(sizes, thresholds) {
  const results = {};
  const failures = [];

  for (const [type, size] of Object.entries(sizes)) {
    if (thresholds[type]) {
      const threshold = parseSize(thresholds[type]);
      const passed = size <= threshold;

      results[type] = {
        size,
        threshold,
        passed,
        percentage: ((size / threshold) * 100).toFixed(1),
      };

      if (!passed) {
        failures.push({ type, size, threshold });
      }
    }
  }

  return { results, failures };
}

function analyzePackage(packageInfo, config) {
  const packageConfig = config.packages[packageInfo.name];

  if (!packageConfig) {
    log(`⚠️  No configuration found for ${packageInfo.name}, skipping...`, colors.yellow);
    return null;
  }

  log(`\n📦 Analyzing ${packageInfo.name}...`, colors.blue);

  try {
    // Create test bundle
    const testFile = createTestBundle(packageInfo.path, packageConfig.entry);

    // Determine if this is a server package that needs Node.js externals
    const isServerPackage = packageInfo.name.includes('server');
    const additionalExternals = isServerPackage ? ['worker_threads', 'child_process'] : [];

    // Bundle with esbuild
    const bundlePath = bundleWithEsbuild(testFile, [...(packageConfig.external || []), ...additionalExternals]);

    // Analyze sizes
    const sizes = analyzeBundleSize(bundlePath);

    // Check against thresholds
    const { results, failures } = checkThresholds(sizes, packageConfig.thresholds);

    return {
      package: packageInfo.name,
      sizes,
      results,
      failures,
    };
  } catch (error) {
    log(`❌ Error analyzing ${packageInfo.name}: ${error.message}`, colors.red);
    return null;
  }
}

function displayResults(analyses) {
  let totalFailures = 0;

  log(`\n${colors.bold}📊 Bundle Size Analysis Results${colors.reset}`, colors.cyan);
  log('='.repeat(80), colors.cyan);

  for (const analysis of analyses) {
    if (!analysis) continue;

    const hasFailures = analysis.failures.length > 0;
    totalFailures += analysis.failures.length;

    log(`\n📦 ${analysis.package}`, hasFailures ? colors.red : colors.green);
    log('-'.repeat(50));

    for (const [type, result] of Object.entries(analysis.results)) {
      const icon = result.passed ? '✅' : '❌';
      const color = result.passed ? colors.green : colors.red;

      log(
        `${icon} ${type.padEnd(10)}: ${formatBytes(result.size).padEnd(12)} / ${formatBytes(result.threshold).padEnd(12)} (${result.percentage}%)`,
        color,
      );
    }

    if (hasFailures) {
      log('\n⚠️  Threshold violations:', colors.red);
      for (const failure of analysis.failures) {
        const excess = failure.size - failure.threshold;
        log(`   ${failure.type}: ${formatBytes(excess)} over limit`, colors.red);
      }
    }
  }

  // Summary
  log(`\n${colors.bold}📋 Summary${colors.reset}`, colors.cyan);
  log('-'.repeat(30));

  if (totalFailures === 0) {
    log('🎉 All packages within size thresholds!', colors.green);
    log('\n💡 This system helps monitor bundle size impact on customers', colors.blue);
    log('   Thresholds are set to 110% of current sizes to allow for reasonable growth', colors.blue);
  } else {
    log(`❌ ${totalFailures} threshold violation(s) found`, colors.red);
    log('\n🔧 To fix threshold violations:', colors.yellow);
    log('• Review and optimize large dependencies', colors.yellow);
    log('• Ensure proper tree-shaking is working', colors.yellow);
    log('• Consider code splitting for large features', colors.yellow);
    log('• If increases are justified, update thresholds in scripts/check-bundle-size.js', colors.yellow);
    log('\n📝 To update thresholds:', colors.cyan);
    log('   Edit the BUNDLE_CONFIG object in scripts/check-bundle-size.js', colors.cyan);
    log('   Current thresholds are set to 110% of baseline sizes', colors.cyan);
  }

  return totalFailures;
}

function cleanup() {
  try {
    const tempDir = getSafeTempDir();

    // Additional safety checks before deletion
    if (!fs.existsSync(tempDir)) {
      return; // Nothing to clean up
    }

    // Safety check: ensure we're only deleting files in our temp directory
    const files = fs.readdirSync(tempDir);
    const expectedPatterns = [/^test-\d+-[a-z0-9]+\.js$/, /^bundle-\d+-[a-z0-9]+\.js$/];

    for (const file of files) {
      const isExpectedFile = expectedPatterns.some(pattern => pattern.test(file));
      if (!isExpectedFile) {
        log(`Error: Unexpected file in temp directory: ${file}`, colors.red);
        log(`Aborting cleanup to prevent accidental deletion`, colors.red);
        return; // Early exit - don't delete anything
      }
    }

    // Only delete if directory is safe and contains expected files
    if (files.length > 0) {
      fs.rmSync(tempDir, { recursive: true, force: true });
      log(`Cleaned up temp directory: ${tempDir}`, colors.blue);
    }
  } catch (error) {
    log(`Warning: Could not clean up temp directory: ${error.message}`, colors.yellow);
  }
}

function main() {
  log(`${colors.bold}🔍 Para SDK Bundle Size Checker${colors.reset}`, colors.cyan);

  try {
    // Get package information
    const packages = getPackageInfo();

    if (packages.length === 0) {
      log('❌ No packages found to analyze', colors.red);
      process.exit(1);
    }

    log(`\nFound ${packages.length} package(s) to analyze`, colors.blue);

    // Validate external dependencies match peerDependencies
    log(`\n${colors.bold}🔍 Validating External Dependencies${colors.reset}`, colors.cyan);
    const validationErrors = validateExternalDependencies(packages);

    if (validationErrors.length > 0) {
      log(`❌ External dependency validation failed:`, colors.red);
      for (const error of validationErrors) {
        log(`   ${error}`, colors.red);
      }
      log(`\n💡 External dependencies should exactly match peerDependencies in package.json`, colors.yellow);
      process.exit(1);
    } else {
      log(`✅ All external dependencies match peerDependencies`, colors.green);
    }

    // Analyze each package
    const analyses = [];
    for (const packageInfo of packages) {
      const analysis = analyzePackage(packageInfo, BUNDLE_CONFIG);
      if (analysis) {
        analyses.push(analysis);
      }
    }

    // Display results
    const failures = displayResults(analyses);

    // Exit with appropriate code
    process.exit(failures > 0 ? 1 : 0);
  } catch (error) {
    log(`❌ Error: ${error.message}`, colors.red);
    process.exit(1);
  } finally {
    cleanup();
  }
}

// Handle cleanup on exit
process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
process.on('exit', cleanup);

if (require.main === module) {
  main();
}

module.exports = {
  BUNDLE_CONFIG,
  analyzePackage,
  formatBytes,
  parseSize,
};
