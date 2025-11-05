#!/usr/bin/env node
/**
 * Examples Hub Test Runner
 *
 * This script runs examples-hub's e2e tests with linked web-sdk packages.
 * Note: This does NOT use Playwright directly - it delegates to examples-hub's
 * own test infrastructure which handles all test execution.
 *
 */
import { execSync, spawn } from 'child_process';
import path from 'path';
import fs from 'fs-extra';
import os from 'os';
import { TEST_ENV } from './test-env';

const isCI = process.env.CI === 'true';
const startTime = Date.now();

interface StepInfo {
  name: string;
  emoji: string;
  startTime: number;
}

interface CommandOptions {
  cwd?: string;
  env?: NodeJS.ProcessEnv;
  silent?: boolean;
  onProgress?: (data: string) => void;
}

interface CLIArgs {
  framework?: string;
  branch: string;
  localPath?: string;
  keepTemp: boolean;
  verbose: boolean;
  quiet: boolean;
  dryRun: boolean;
  apiKeyOverrides: Map<string, string>;
}

class TestRunner {
  private tempDir: string;
  private args: CLIArgs;
  private currentStep: StepInfo | null = null;
  private cleanupHandlers: (() => Promise<void>)[] = [];
  private activeProcesses: Set<any> = new Set();

  constructor(args: CLIArgs) {
    this.tempDir = path.join(os.tmpdir(), `web-sdk-examples-${Date.now()}`);
    this.args = args;

    // Setup signal handlers for cleanup
    process.on('SIGINT', this.handleExit.bind(this));
    process.on('SIGTERM', this.handleExit.bind(this));
  }

  private async handleExit() {
    console.log('\n\n🛑 Interrupted! Cleaning up...');

    // Kill all active child processes first
    if (this.activeProcesses.size > 0) {
      console.log('  Stopping running processes...');
      for (const child of this.activeProcesses) {
        try {
          // Try to kill the process tree (process and all its children)
          if (process.platform === 'win32') {
            execSync(`taskkill /pid ${child.pid} /T /F`, { stdio: 'ignore' });
          } else {
            // Kill the entire process group
            process.kill(-child.pid, 'SIGTERM');
            // Give it a moment to terminate gracefully
            await new Promise(resolve => setTimeout(resolve, 100));
            // Force kill if still running
            try {
              process.kill(-child.pid, 'SIGKILL');
            } catch {
              // Process already terminated
            }
          }
        } catch {
          // Process might have already exited
        }
      }
      this.activeProcesses.clear();
      // Wait a bit for processes to fully terminate
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    await this.cleanup();
    process.exit(1);
  }

  private log(message: string, options?: { newline?: boolean; error?: boolean; verbose?: boolean }) {
    const { newline = true, error = false, verbose = false } = options || {};

    // Skip verbose messages unless in verbose mode
    if (verbose && !this.args.verbose) return;

    // Skip all non-error messages in quiet mode
    if (this.args.quiet && !error) return;

    const output = error ? process.stderr : process.stdout;

    if (isCI || newline) {
      output.write(message + '\n');
    } else {
      // Clear current line and write message
      output.write('\r\x1b[K' + message);
    }
  }

  private startStep(name: string, emoji: string) {
    this.currentStep = { name, emoji, startTime: Date.now() };
    this.log(`${emoji} ${name}...`);
  }

  private endStep(success: boolean = true) {
    if (!this.currentStep) return;

    const duration = ((Date.now() - this.currentStep.startTime) / 1000).toFixed(1);
    const status = success ? '✓' : '✗';
    const message = `${this.currentStep.emoji} ${this.currentStep.name}... ${status} (${duration}s)`;

    if (!isCI) {
      // Clear the line and rewrite with status
      this.log(message);
    } else {
      // In CI, just append the status
      this.log(`  ${status} Completed in ${duration}s`);
    }

    this.currentStep = null;
  }

  private async runCommand(command: string, options: CommandOptions = {}): Promise<string> {
    const { cwd = process.cwd(), env = process.env, silent = false, onProgress } = options;

    if (this.args.dryRun) {
      this.log(`[DRY RUN] Would execute: ${command}`, { verbose: true });
      return '';
    }

    return new Promise((resolve, reject) => {
      let output = '';
      let errorOutput = '';

      const child = spawn(command, {
        shell: true,
        cwd,
        env,
        // Create a new process group so we can kill the entire tree
        detached: process.platform !== 'win32',
      });

      // Track this process for cleanup
      this.activeProcesses.add(child);

      child.stdout.on('data', data => {
        const str = data.toString();
        output += str;

        if (!silent && !onProgress) {
          process.stdout.write(str);
        } else if (onProgress) {
          onProgress(str);
        }
      });

      child.stderr.on('data', data => {
        const str = data.toString();
        errorOutput += str;

        if (!silent && this.args.verbose) {
          process.stderr.write(str);
        }
      });

      child.on('close', code => {
        // Remove from active processes when done
        this.activeProcesses.delete(child);

        if (code !== 0) {
          reject(new Error(`Command failed with code ${code}: ${command}\n${errorOutput}`));
        } else {
          resolve(output);
        }
      });

      child.on('error', err => {
        // Remove from active processes on error
        this.activeProcesses.delete(child);
        reject(err);
      });
    });
  }

  private async validateEnvironment() {
    this.startStep('Validating environment', '🔍');

    try {
      // Check if we're in the web-sdk directory
      const packageJson = path.join(process.cwd(), 'package.json');
      if (!(await fs.pathExists(packageJson))) {
        throw new Error('Not in web-sdk root directory');
      }

      const pkg = await fs.readJson(packageJson);
      if (pkg.name !== 'root') {
        throw new Error('Not in web-sdk root directory');
      }

      // Check if packages directory exists
      const packagesDir = path.join(process.cwd(), 'packages');
      if (!(await fs.pathExists(packagesDir))) {
        throw new Error('packages directory not found');
      }

      // Check yarn version
      const yarnVersion = execSync('yarn --version', { encoding: 'utf8' }).trim();
      this.log(`  Using Yarn ${yarnVersion}`, { newline: true, verbose: true });

      // Check node version
      const nodeVersion = process.version;
      this.log(`  Using Node.js ${nodeVersion}`, { newline: true, verbose: true });

      this.endStep(true);
    } catch (error) {
      this.endStep(false);
      throw error;
    }
  }

  private async cloneRepository() {
    this.startStep(`Cloning examples-hub repository (branch: ${this.args.branch})`, '📥');

    try {
      await this.runCommand(
        `git clone --branch ${this.args.branch} --depth 1 https://github.com/getpara/examples-hub.git ${this.tempDir}`,
        { silent: !isCI && !this.args.verbose },
      );

      const stats = await fs.stat(this.tempDir);
      if (!stats.isDirectory()) {
        throw new Error('Failed to clone repository');
      }

      this.log(`  Cloned to ${this.tempDir}`, { newline: true, verbose: true });

      this.endStep(true);
    } catch (error) {
      this.endStep(false);
      throw new Error(`Failed to clone repository: ${error.message}`);
    }
  }

  private async copyLocalRepository() {
    this.startStep(`Copying local examples-hub from ${this.args.localPath}`, '📂');

    try {
      // First, create the temp directory
      await fs.ensureDir(this.tempDir);

      // Try to detect if rsync is available
      let useRsync = false;
      try {
        await this.runCommand('which rsync', { silent: true });
        useRsync = true;
      } catch {
        // rsync not available, will use fs.copy
      }

      if (useRsync) {
        // Use rsync for efficient copying with exclusions
        const excludes = [
          '--exclude=node_modules',
          '--exclude=.next',
          '--exclude=dist',
          '--exclude=build',
          '--exclude=.yarn/cache',
          '--exclude=.yarn/install-state.gz',
          '--exclude=coverage',
          '--exclude=playwright-report',
          '--exclude=test-results',
          '--exclude=.turbo',
          '--exclude=.cache',
        ].join(' ');

        await this.runCommand(`rsync -av ${excludes} "${this.args.localPath}/" "${this.tempDir}/"`, {
          silent: !isCI && !this.args.verbose,
        });

        this.log(`  Copied using rsync with exclusions`, { newline: true, verbose: true });
      } else {
        // Fallback to fs.copy with filter
        const excludedDirs = new Set([
          'node_modules',
          '.next',
          'dist',
          'build',
          'coverage',
          'playwright-report',
          'test-results',
          '.turbo',
          '.cache',
        ]);

        await fs.copy(this.args.localPath!, this.tempDir, {
          filter: (src: string) => {
            const relativePath = path.relative(this.args.localPath!, src);
            const parts = relativePath.split(path.sep);

            // Special handling for .yarn directory - exclude cache but keep releases
            if (relativePath.startsWith('.yarn')) {
              if (relativePath.includes('cache') || relativePath.includes('install-state.gz')) {
                return false;
              }
              return true;
            }

            // Check if any part of the path is in the excluded directories
            for (const part of parts) {
              if (excludedDirs.has(part)) {
                return false;
              }
            }
            return true;
          },
        });

        this.log(`  Copied using fs.copy with exclusions`, { newline: true, verbose: true });
      }

      // Verify the copy worked
      const stats = await fs.stat(this.tempDir);
      if (!stats.isDirectory()) {
        throw new Error('Failed to copy local repository');
      }

      const packageJsonPath = path.join(this.tempDir, 'package.json');
      if (!(await fs.pathExists(packageJsonPath))) {
        throw new Error('package.json not found in copied directory');
      }

      this.log(`  Copied to ${this.tempDir}`, { newline: true, verbose: true });

      this.endStep(true);
    } catch (error) {
      this.endStep(false);
      throw new Error(`Failed to copy local repository: ${error.message}`);
    }
  }

  private async disableImmutableInstalls() {
    this.startStep('Disabling immutable installs for CI', '⚙️');
    try {
      const yarnrcPath = path.join(this.tempDir, '.yarnrc.yml');
      let content = '';
      if (await fs.pathExists(yarnrcPath)) {
        content = await fs.readFile(yarnrcPath, 'utf8');
      }
      // Append or set enableImmutableInstalls: false
      if (!content.includes('enableImmutableInstalls')) {
        content += '\nenableImmutableInstalls: false\n';
      } else {
        content = content.replace(/enableImmutableInstalls:\s*true/, 'enableImmutableInstalls: false');
      }
      await fs.writeFile(yarnrcPath, content);
      this.endStep(true);
    } catch (error) {
      this.endStep(false);
      throw new Error(`Failed to disable immutable installs: ${error.message}`);
    }
  }

  private async createEnvFile() {
    this.startStep('Creating .env configuration', '📝');

    try {
      const envContent = Object.entries(TEST_ENV)
        .map(([key, value]) => `${key}=${value}`)
        .join('\n');

      // Create root .env file
      await fs.writeFile(path.join(this.tempDir, '.env'), envContent);
      this.log(`  Created .env with ${Object.keys(TEST_ENV).length} variables`, { newline: true, verbose: true });

      if (this.args.framework) {
        this.log(`  Configured for ${this.args.framework} framework`, { newline: true });
      }

      this.endStep(true);
    } catch (error) {
      this.endStep(false);
      throw new Error(`Failed to create .env file: ${error.message}`);
    }
  }

  private async buildWebSdkPackages() {
    this.startStep('Building web-sdk packages', '🔨');

    try {
      // Log what we're about to build
      this.log(`  Building from: ${process.cwd()}`, { newline: true, verbose: true });

      // Check if package.json exists and has build:dev script
      const rootPackageJson = path.join(process.cwd(), 'package.json');
      if (await fs.pathExists(rootPackageJson)) {
        const pkg = await fs.readJson(rootPackageJson);
        if (pkg.scripts && pkg.scripts['build:dev']) {
          this.log(`  Found build:dev script: ${pkg.scripts['build:dev']}`, { newline: true, verbose: true });
        }
      }

      await this.runCommand('yarn build:dev', {
        silent: !isCI && !this.args.verbose,
      });

      // Verify some packages were actually built
      const packagesBuilt: string[] = [];
      const packagesDir = path.join(process.cwd(), 'packages');
      if (await fs.pathExists(packagesDir)) {
        for (const pkgName of await fs.readdir(packagesDir)) {
          const distPath = path.join(packagesDir, pkgName, 'dist');
          if (await fs.pathExists(distPath)) {
            packagesBuilt.push(pkgName);
          }
        }
      }

      if (packagesBuilt.length > 0) {
        this.log(
          `  Built ${packagesBuilt.length} packages: ${packagesBuilt.slice(0, 5).join(', ')}${packagesBuilt.length > 5 ? '...' : ''}`,
          { newline: true, verbose: true },
        );
      } else {
        this.log(`  ⚠️ WARNING: No dist directories found after build`, { newline: true, verbose: true });
      }

      this.endStep(true);
    } catch (error) {
      this.endStep(false);
      throw new Error(`Failed to build packages: ${error.message}`);
    }
  }

  private async linkPackages() {
    this.startStep('Linking web-sdk packages', '🔗');

    try {
      const packages = await this.discoverPackages();
      const updated = await this.updateAllPackageJsonFiles(this.tempDir, packages);

      this.log(`  Linked ${packages.size} packages in ${updated} files`, { newline: true });

      // List the linked packages in verbose mode
      if (this.args.verbose) {
        this.log(`  Linked packages:`, { newline: true, verbose: true });
        for (const [name, pkgPath] of packages) {
          this.log(`    - ${name} -> ${pkgPath}`, { newline: true, verbose: true });
          // Verify the package directory exists
          if (!(await fs.pathExists(pkgPath))) {
            this.log(`      ⚠️ WARNING: Package path does not exist: ${pkgPath}`, { newline: true, verbose: true });
          }
        }

        // Show a sample of what was written to package.json files
        const sampleFiles = ['web/with-react-vite/package.json', 'server/with-node/package.json'];

        for (const sampleFile of sampleFiles) {
          const samplePath = path.join(this.tempDir, sampleFile);
          if (await fs.pathExists(samplePath)) {
            const pkg = await fs.readJson(samplePath);
            this.log(`\n  Sample from ${sampleFile}:`, { newline: true, verbose: true });

            // Show Para dependencies
            const paraDeps = Object.entries({
              ...(pkg.dependencies || {}),
              ...(pkg.devDependencies || {}),
            }).filter(([name]) => name.startsWith('@getpara/'));

            if (paraDeps.length > 0) {
              this.log(`    Para dependencies:`, { newline: true, verbose: true });
              for (const [dep, version] of paraDeps) {
                this.log(`      ${dep}: ${version}`, { newline: true, verbose: true });
                // Verify the linked path exists
                if (typeof version === 'string' && version.startsWith('file:')) {
                  const linkedPath = version.replace('file:', '');
                  const resolvedPath = path.resolve(path.dirname(samplePath), linkedPath);
                  const exists = await fs.pathExists(resolvedPath);
                  if (!exists) {
                    this.log(`        ⚠️ Linked path does not exist: ${resolvedPath}`, { newline: true, verbose: true });
                  }
                }
              }
            }

            // Show resolutions if any
            if (pkg.resolutions && Object.keys(pkg.resolutions).length > 0) {
              const paraResolutions = Object.entries(pkg.resolutions).filter(([name]) => name.startsWith('@getpara/'));
              if (paraResolutions.length > 0) {
                this.log(`    Resolutions:`, { newline: true, verbose: true });
                for (const [res, version] of paraResolutions) {
                  this.log(`      ${res}: ${version}`, { newline: true, verbose: true });
                }
              }
            }
          }
        }
      }

      this.endStep(true);
    } catch (error) {
      this.endStep(false);
      throw new Error(`Failed to link packages: ${error.message}`);
    }
  }

  private async installDependencies() {
    this.startStep('Installing examples-hub dependencies', '📦');

    try {
      // Use examples-hub's local Yarn 4.10.3 binary directly to avoid version conflicts
      // This bypasses the global yarn command which might be Yarn 1.x or a Corepack shim
      const yarnBinaryPath = path.join(this.tempDir, '.yarn/releases/yarn-4.10.3-git.20250923.hash-8ff18d7.cjs');

      // Verify the Yarn binary exists
      if (!(await fs.pathExists(yarnBinaryPath))) {
        throw new Error(
          `Yarn binary not found at ${yarnBinaryPath}. The examples-hub repository may be missing its Yarn release.`,
        );
      }

      this.log(`  Using examples-hub's local Yarn 4.10.3 binary`, { verbose: true });

      let currentStep = '';
      let packagesInstalled = 0;
      let totalPackages = 0;
      let lastUpdateTime = Date.now();

      // Use JSON output for structured progress tracking
      // Execute the local Yarn binary directly with Node
      await this.runCommand(`node "${yarnBinaryPath}" install --json`, {
        cwd: this.tempDir,
        silent: true,
        onProgress: data => {
          // Parse NDJSON stream (newline-delimited JSON)
          const lines = data.split('\n').filter(line => line.trim());

          for (const line of lines) {
            try {
              const event = JSON.parse(line);

              // Handle different event types from yarn
              if (event.type === 'progressStart') {
                totalPackages = event.data?.total || 0;
                currentStep = event.data?.message || 'Installing...';
              } else if (event.type === 'progressTick') {
                packagesInstalled = event.data?.current || packagesInstalled;
              } else if (event.type === 'progressFinish') {
                currentStep = 'Finalizing...';
              } else if (event.type === 'step') {
                // Handle step events (resolving, fetching, linking, etc.)
                const message = event.data?.message;
                if (message) {
                  if (message.includes('Resolving')) {
                    currentStep = 'Resolving packages...';
                  } else if (message.includes('Fetching')) {
                    currentStep = 'Fetching packages...';
                  } else if (message.includes('Linking')) {
                    currentStep = 'Linking dependencies...';
                  } else if (message.includes('Building')) {
                    currentStep = 'Building fresh packages...';
                  }
                }
              }

              // Update progress display only if changed and not too frequent
              const now = Date.now();
              if (now - lastUpdateTime > 100 && !isCI && !this.args.quiet) {
                const progressText =
                  totalPackages > 0 ? `${currentStep} [${packagesInstalled}/${totalPackages}]` : currentStep;
                this.log(`📦 Installing examples-hub dependencies... ${progressText}`, { newline: false });
                lastUpdateTime = now;
              }
            } catch {
              // Ignore non-JSON lines (yarn sometimes outputs plain text)
              if (this.args.verbose && !line.includes('"type"')) {
                this.log(`  ${line}`, { newline: true, verbose: true });
              }
            }
          }
        },
      });

      this.endStep(true);
    } catch (error) {
      this.endStep(false);
      throw new Error(`Failed to install dependencies: ${error.message}`);
    }
  }

  private async installPlaywright() {
    this.startStep('Installing Playwright browsers', '🎭');

    try {
      await this.runCommand('npx playwright install chromium', {
        cwd: this.tempDir,
        silent: !isCI && !this.args.verbose,
      });

      this.endStep(true);
    } catch (error) {
      this.endStep(false);
      throw new Error(`Failed to install Playwright: ${error.message}`);
    }
  }

  private async runTests() {
    const framework = this.args.framework;
    const testDescription = framework ? `${framework} tests` : 'all tests';
    this.startStep(`Running examples-hub ${testDescription}`, '🧪');

    try {
      // Use examples-hub's local Yarn binary for consistency
      const yarnBinaryPath = path.join(this.tempDir, '.yarn/releases/yarn-4.10.3-git.20250923.hash-8ff18d7.cjs');
      const yarnCommand = `node "${yarnBinaryPath}"`;
      // Debug: List the directory structure to help diagnose path issues
      this.log(`\n📂 Directory structure in ${this.tempDir}:`, { verbose: true });
      try {
        const webDir = path.join(this.tempDir, 'web');
        const serverDir = path.join(this.tempDir, 'server');

        if (await fs.pathExists(webDir)) {
          const webContents = await fs.readdir(webDir);
          this.log(`  web/: ${webContents.join(', ')}`, { verbose: true });
        }

        if (await fs.pathExists(serverDir)) {
          const serverContents = await fs.readdir(serverDir);
          this.log(`  server/: ${serverContents.join(', ')}`, { verbose: true });
        }

        // Also check e2e/scripts/testConfig.ts to see what paths it expects
        const testConfigPath = path.join(this.tempDir, 'e2e/scripts/testConfig.ts');
        if (await fs.pathExists(testConfigPath)) {
          const testConfig = await fs.readFile(testConfigPath, 'utf8');
          // Use [\s\S] instead of . with /s flag for older ES targets
          const appConfigsMatch = testConfig.match(/APP_CONFIGS[^{]*{([\s\S]+?)}/);
          if (appConfigsMatch) {
            this.log(`\n📋 APP_CONFIGS paths in testConfig.ts:`, { verbose: true });
            // Use exec in a loop instead of matchAll for compatibility
            const pathRegex = /path:\s*["']([^"']+)["']/g;
            let pathMatch;
            while ((pathMatch = pathRegex.exec(appConfigsMatch[1])) !== null) {
              this.log(`    ${pathMatch[1]}`, { verbose: true });
            }
          }
        }
      } catch (debugError) {
        this.log(`  Debug listing failed: ${debugError.message}`, { verbose: true });
      }

      // Build test command based on framework using local Yarn binary
      let testCommand = `${yarnCommand} test:all`;

      if (framework) {
        // Use framework-specific test command if available
        testCommand = `${yarnCommand} test:all ${framework}`;
      }

      // Build arguments to pass to examples-hub test command
      const testArgs: string[] = [];

      // Framework is passed as first positional argument (already handled above)
      // Don't pass it again

      // Process ALL arguments from the start (after node and script)
      const argsToProcess = process.argv.slice(2);

      for (let i = 0; i < argsToProcess.length; i++) {
        const arg = argsToProcess[i];

        // Skip web-sdk-only flags and their values
        if (arg === '--framework') {
          // Already handled as positional arg
          i++; // Skip the value
          continue;
        }

        if (arg === '--branch' || arg === '--local-path') {
          // These are web-sdk runner flags, not passed to examples-hub
          i++; // Skip the value
          continue;
        }

        if (arg.startsWith('--api-key-override')) {
          // Can be --api-key-override=value or --api-key-override value
          if (!arg.includes('=')) {
            i++; // Skip the value if separate
          }
          continue;
        }

        // Skip web-sdk-only boolean flags
        if (arg === '--keep-temp' || arg === '--verbose' || arg === '--quiet' || arg === '--dry-run') {
          continue;
        }

        // Pass through examples-hub supported flags
        if (arg === '--headed' || arg === '--diff-only' || arg === '--web' || arg === '--sequential') {
          testArgs.push(arg);
          continue;
        }

        // Pass through any test type as second positional argument
        if (!arg.startsWith('--')) {
          // This could be a test type like 'email-password'
          testArgs.push(arg);
        }
      }

      const additionalArgsStr = testArgs.join(' ');

      if (additionalArgsStr) {
        testCommand += ` ${additionalArgsStr}`;
      }

      this.log(`  Running: ${testCommand}`, { newline: true, verbose: true });
      this.log(`  Working directory: ${this.tempDir}`, { newline: true, verbose: true });
      this.log(`  Setting GITHUB_WORKSPACE=${this.tempDir}`, { newline: true, verbose: true });

      // Debug: Check if the test script exists and what it contains
      const testScriptPath = path.join(this.tempDir, 'e2e/scripts/runAllTests.ts');
      if (await fs.pathExists(testScriptPath)) {
        this.log(`  Test script exists: ${testScriptPath}`, { newline: true, verbose: true });

        // Check if node_modules exists in the temp dir
        const nodeModulesPath = path.join(this.tempDir, 'node_modules');
        if (await fs.pathExists(nodeModulesPath)) {
          this.log(`  node_modules exists in temp dir`, { newline: true, verbose: true });
        } else {
          this.log(`  ⚠️ node_modules NOT found in temp dir`, { newline: true, verbose: true });
        }
      }

      // Also log important environment variables
      this.log(`  Environment variables:`, { newline: true, verbose: true });
      this.log(`    CI=${process.env.CI || 'false'}`, { newline: true, verbose: true });
      this.log(`    NODE_ENV=${process.env.NODE_ENV || 'not set'}`, { newline: true, verbose: true });

      // Quick test: Try to install in one of the app directories to see the actual error
      if (this.args.verbose) {
        this.log(`\n  Testing yarn install in first app directory...`, { newline: true, verbose: true });
        const testAppPath = path.join(this.tempDir, 'web/with-react-vite');

        if (await fs.pathExists(testAppPath)) {
          try {
            this.log(`  Running yarn install in ${testAppPath}...`, { newline: true, verbose: true });
            await this.runCommand(`${yarnCommand} install`, {
              cwd: testAppPath,
              silent: false,
            });
            this.log(`  ✅ Yarn install succeeded in test directory`, { newline: true, verbose: true });
          } catch (error) {
            this.log(`  ❌ Yarn install failed with error:`, { newline: true, verbose: true });
            this.log(`    ${error.message}`, { newline: true, verbose: true });
            // Continue anyway - let the actual tests run
          }
        }
      }

      // Don't use silent mode for tests - we want to see the output
      await this.runCommand(testCommand, {
        cwd: this.tempDir,
        env: {
          ...process.env,
          CI: process.env.CI || 'false',
          // CRITICAL: Set GITHUB_WORKSPACE so examples-hub knows where it's running from
          GITHUB_WORKSPACE: this.tempDir,
        },
      });

      this.endStep(true);
    } catch (error) {
      this.endStep(false);
      throw error; // Re-throw to maintain exit code
    }
  }

  private async cleanup() {
    // First, kill any remaining active processes
    if (this.activeProcesses.size > 0) {
      this.log('  Stopping any remaining processes...', { verbose: true });
      for (const child of this.activeProcesses) {
        try {
          if (process.platform === 'win32') {
            execSync(`taskkill /pid ${child.pid} /T /F`, { stdio: 'ignore' });
          } else {
            process.kill(-child.pid, 'SIGKILL');
          }
        } catch {
          // Process might have already exited
        }
      }
      this.activeProcesses.clear();
      // Wait for processes to terminate
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    if (!this.args.keepTemp && !this.args.dryRun) {
      this.startStep('Cleaning up temporary files', '🧹');

      try {
        // Try multiple times with delays in case files are still locked
        let attempts = 0;
        const maxAttempts = 3;
        let lastError;

        while (attempts < maxAttempts) {
          try {
            await fs.remove(this.tempDir);
            this.endStep(true);
            break;
          } catch (error) {
            lastError = error;
            attempts++;
            if (attempts < maxAttempts) {
              // Wait a bit and try again
              await new Promise(resolve => setTimeout(resolve, 1000));
            }
          }
        }

        if (attempts >= maxAttempts) {
          this.endStep(false);
          this.log(`⚠️  Warning: Failed to clean up ${this.tempDir} after ${maxAttempts} attempts`, { error: true });
          if (lastError && this.args.verbose) {
            this.log(`  Error: ${lastError.message}`, { error: true, verbose: true });
          }
        }
      } catch {
        this.endStep(false);
        this.log(`⚠️  Warning: Failed to clean up ${this.tempDir}`, { error: true });
      }
    } else if (this.args.keepTemp) {
      this.log(`\n📁 Temp directory preserved: ${this.tempDir}`);
    }

    // Run any additional cleanup handlers
    for (const handler of this.cleanupHandlers) {
      try {
        await handler();
      } catch (error) {
        this.log(`⚠️  Warning: Cleanup handler failed: ${error.message}`, { error: true });
      }
    }
  }

  async run() {
    const title = this.args.framework
      ? `🚀 Examples Hub Test Runner - ${this.args.framework} framework\n`
      : '🚀 Examples Hub Test Runner\n';

    this.log(title);

    if (this.args.dryRun) {
      this.log('🏃 Running in DRY RUN mode - no changes will be made\n');
    }

    try {
      await this.validateEnvironment();

      // Either copy local repository or clone from GitHub
      if (this.args.localPath) {
        await this.copyLocalRepository();
      } else {
        await this.cloneRepository();
      }

      // Disable immutable installs to allow lockfile updates when linking packages
      await this.disableImmutableInstalls();

      await this.createEnvFile();
      await this.buildWebSdkPackages();
      await this.linkPackages();
      await this.installDependencies();
      await this.installPlaywright();
      await this.runTests();

      const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);
      this.log(`\n✅ All tests completed successfully! (Total time: ${totalTime}s)\n`);
    } catch (error) {
      const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);
      this.log(`\n❌ Tests failed after ${totalTime}s\n`, { error: true });

      if (error.message) {
        this.log(`Error: ${error.message}\n`, { error: true });
      }

      // Always try to clean up on error
      await this.cleanup();

      process.exit(1);
    }

    await this.cleanup();
  }

  private async discoverPackages(): Promise<Map<string, string>> {
    const packages = new Map();
    const packagesDir = path.join(process.cwd(), 'packages');

    for (const dir of await fs.readdir(packagesDir)) {
      const pkgPath = path.join(packagesDir, dir, 'package.json');
      if (await fs.pathExists(pkgPath)) {
        const pkg = await fs.readJson(pkgPath);
        if (pkg.name?.startsWith('@getpara/')) {
          packages.set(pkg.name, path.join(packagesDir, dir));
        }
      }
    }

    return packages;
  }

  private async updateAllPackageJsonFiles(dir: string, packages: Map<string, string>): Promise<number> {
    let count = 0;
    const files = await this.findPackageJsonFiles(dir);

    for (const file of files) {
      const pkg = await fs.readJson(file);
      let modified = false;

      for (const [name, localPath] of packages) {
        if (pkg.dependencies?.[name]) {
          // Use absolute paths since the packages are in a completely different location
          // Yarn can handle absolute file: paths just fine
          pkg.dependencies[name] = `file:${localPath}`;
          modified = true;
        }
        if (pkg.devDependencies?.[name]) {
          pkg.devDependencies[name] = `file:${localPath}`;
          modified = true;
        }
      }

      if (modified) {
        pkg.resolutions = pkg.resolutions || {};
        for (const [name, localPath] of packages) {
          // Also use absolute paths for resolutions
          pkg.resolutions[name] = `file:${localPath}`;
        }
        await fs.writeJson(file, pkg, { spaces: 2 });
        count++;
      }
    }

    return count;
  }

  private async findPackageJsonFiles(dir: string, depth: number = 0, maxDepth: number = 5): Promise<string[]> {
    // Limit recursion depth to prevent deep scans in misconfigured repos
    if (depth >= maxDepth) {
      if (this.args.verbose) {
        this.log(`  Max search depth (${maxDepth}) reached at ${dir}`, { newline: true, verbose: true });
      }
      return [];
    }

    const results: string[] = [];
    const items = await fs.readdir(dir, { withFileTypes: true });

    for (const item of items) {
      const fullPath = path.join(dir, item.name);
      if (item.isDirectory() && !['node_modules', '.git', 'dist', 'build', '.next', '.yarn'].includes(item.name)) {
        // Increment depth for recursive calls
        results.push(...(await this.findPackageJsonFiles(fullPath, depth + 1, maxDepth)));
      } else if (item.name === 'package.json') {
        results.push(fullPath);
      }
    }

    return results;
  }
}

// Parse command line arguments
function parseArgs(): CLIArgs {
  const args: CLIArgs = {
    framework: undefined,
    branch: '2.0.0-alpha', // Default branch
    keepTemp: false,
    verbose: false,
    quiet: false,
    dryRun: false,
    apiKeyOverrides: new Map(),
  };

  for (let i = 2; i < process.argv.length; i++) {
    const arg = process.argv[i];

    if (arg === '--keep-temp' || arg === '--no-cleanup') {
      args.keepTemp = true;
    } else if (arg === '--verbose' || arg === '-v') {
      args.verbose = true;
    } else if (arg === '--quiet' || arg === '-q') {
      args.quiet = true;
    } else if (arg === '--dry-run') {
      args.dryRun = true;
    } else if (arg === '--framework' && i + 1 < process.argv.length) {
      args.framework = process.argv[++i];
    } else if (arg === '--branch' && i + 1 < process.argv.length) {
      args.branch = process.argv[++i];
    } else if (arg === '--local-path' && i + 1 < process.argv.length) {
      args.localPath = process.argv[++i];
    } else if (arg.startsWith('--api-key-override=')) {
      const override = arg.substring('--api-key-override='.length);
      const [framework, key] = override.split('=');
      if (framework && key) {
        args.apiKeyOverrides.set(framework, key);
      }
    } else if (arg === '--help' || arg === '-h') {
      console.log(`
Examples Hub Test Runner

Usage: yarn test:examples-hub [options]

Options:
  --framework <name>      Run tests for a specific framework (react-vite, react-nextjs, vue, svelte, node)
  --branch <name>        Clone from specific branch (default: 2.0.0-alpha)
  --local-path <path>    Use local examples-hub repository instead of cloning from GitHub
  --keep-temp            Keep temporary directory after tests
  --verbose, -v          Show detailed output
  --quiet, -q            Show minimal output
  --dry-run             Show what would be executed without running
  --api-key-override=<framework>=<key>  Override API key for a specific framework
  --help, -h            Show this help message

Examples:
  yarn test:examples-hub                          # Run all tests
  yarn test:examples-hub --framework node         # Run only node tests
  yarn test:examples-hub --framework react-vite   # Run only react-vite tests
  yarn test:examples-hub --branch main           # Test against main branch
  yarn test:examples-hub --local-path ../examples-hub  # Use local examples-hub repo
  yarn test:examples-hub --local-path ~/work/examples-hub --framework react-vite  # Test specific framework with local repo
  yarn test:examples-hub --verbose               # Run with detailed output
  yarn test:examples-hub --api-key-override=node=beta_custom_key  # Use custom API key for node

Note: When using --local-path, node_modules and build artifacts are automatically excluded from copying.
`);
      process.exit(0);
    }
  }

  // Validate arguments
  if (args.quiet && args.verbose) {
    console.error('Error: Cannot use --quiet and --verbose together');
    process.exit(1);
  }

  if (args.framework && !['react-vite', 'react-nextjs', 'vue', 'svelte', 'node', 'deno', 'bun'].includes(args.framework)) {
    console.error(`Error: Unknown framework '${args.framework}'`);
    console.error('Valid frameworks: react-vite, react-nextjs, vue, svelte, node, deno, bun');
    process.exit(1);
  }

  // Validate local path if provided
  if (args.localPath) {
    const resolvedPath = path.resolve(args.localPath);
    if (!fs.existsSync(resolvedPath)) {
      console.error(`Error: Local path does not exist: ${args.localPath}`);
      process.exit(1);
    }
    if (!fs.statSync(resolvedPath).isDirectory()) {
      console.error(`Error: Local path is not a directory: ${args.localPath}`);
      process.exit(1);
    }
    // Check if it looks like an examples-hub repo
    const packageJsonPath = path.join(resolvedPath, 'package.json');
    if (!fs.existsSync(packageJsonPath)) {
      console.error(`Error: No package.json found in local path: ${args.localPath}`);
      console.error('Make sure you are pointing to the root of the examples-hub repository');
      process.exit(1);
    }
    args.localPath = resolvedPath; // Store the resolved absolute path
  }

  return args;
}

// Run the test runner
const cliArgs = parseArgs();
const runner = new TestRunner(cliArgs);
runner.run().catch(console.error);
