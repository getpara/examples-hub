#!/usr/bin/env tsx

import path from "path";
import * as dotenv from "dotenv";
import { 
  APP_CONFIGS, 
  getTestConfig, 
  validateEnvironment, 
  parseCliArgs,
  detectChangedFrameworks,
  runCommandAsync,
  setTestFailed,
  getTestFailed,
  TestResult,
  CLIArgs
} from "./testConfig";

// Simple concurrency limiter for parallel execution
class ConcurrencyLimiter {
  constructor(private limit: number) {}
  private running = 0;
  private queue: Array<{ task: () => Promise<any>; resolve: (value: any) => void; reject: (error: any) => void }> = [];

  async run<T>(task: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push({ task, resolve, reject });
      this.process();
    });
  }

  private async process() {
    if (this.running >= this.limit || this.queue.length === 0) {
      return;
    }

    this.running++;
    const { task, resolve, reject } = this.queue.shift()!;

    try {
      const result = await task();
      resolve(result);
    } catch (error) {
      reject(error);
    } finally {
      this.running--;
      this.process();
    }
  }
}

// Load environment variables
dotenv.config();

// Validate environment before running tests
validateEnvironment();

const EXAMPLES_REPO_PATH = process.env.GITHUB_WORKSPACE || process.cwd();

// Parse command line arguments
const args = process.argv.slice(2);
const cliArgs: CLIArgs = parseCliArgs(args);

// Determine execution mode
const isSingleTestMode = !!(cliArgs.framework && cliArgs.testType);
const isAllTestsMode = !cliArgs.framework || (!cliArgs.testType && cliArgs.framework);

// Single test execution function (replaces runTest.ts functionality)
async function runSingleTest(framework: string, testType?: string): Promise<void> {
  if (!framework) {
    console.error("Usage: tsx runAllTests.ts <framework> [test-type]");
    console.error("Frameworks: react-vite, react-nextjs, vue, svelte, node");
    console.error("Test types: email-password, email-passkey, phone-password, phone-passkey");
    process.exit(1);
  }

  try {
    // Get test configuration
    const config = getTestConfig(framework);

    // Build test path
    let testPath = `e2e/tests/${config.path}`;
    if (testType) {
      testPath += `/happyPath.${testType}.spec.ts`;
    }

    // Build Playwright command
    const playwrightArgs = [
      testPath,
      "--config=e2e/example-hub-playwright.config.ts",
      "--reporter=list",
    ];

    // Always run sequentially by default for single tests
    if (process.env.E2E_WORKERS !== "auto") {
      playwrightArgs.push("--workers=1");
    }

    // Check for headed mode
    if (cliArgs.isHeaded) {
      playwrightArgs.push("--headed");
    }

    const command = `yarn playwright test ${playwrightArgs.join(" ")}`;

    console.log(`Running tests for ${framework}${testType ? ` (${testType})` : ""}`);
    console.log(`Command: ${command}\n`);

    // Set environment variables and run the test
    await runCommandAsync(command, EXAMPLES_REPO_PATH, config.envVars);
    
    console.log(`✅ Single test completed successfully for ${framework}`);
  } catch (error) {
    console.error("❌ Single test failed:", (error as Error).message);
    process.exit(1);
  }
}

// Function to run tests for a single app
const runTestsForApp = async (appName: string): Promise<TestResult> => {
  try {
    const config = getTestConfig(appName);
    const appFullPath = path.resolve(EXAMPLES_REPO_PATH, config.path);
    
    console.log(`\n${"=".repeat(60)}`);
    console.log(`Running tests for ${appName}`);
    console.log(`${"=".repeat(60)}`);

    // Install dependencies if needed
    if (config.installCommand) {
      await runCommandAsync(config.installCommand, appFullPath);
    } else {
      await runCommandAsync("yarn install", appFullPath);
    }

    // Prepare Playwright command
    const playwrightArgs = [
      `e2e/tests/${config.path}`,
      "--config=e2e/example-hub-playwright.config.ts",
      "--reporter=list",
    ];

    if (cliArgs.isSequential) {
      playwrightArgs.push("--workers=1");
    }

    if (cliArgs.isHeaded) {
      playwrightArgs.push("--headed");
    }

    const testCommand = `yarn playwright test ${playwrightArgs.join(" ")}`;

    // Run Playwright tests with framework-specific environment variables
    await runCommandAsync(testCommand, EXAMPLES_REPO_PATH, config.envVars);

    console.log(`✅ Tests passed for ${appName}`);
    return { appName, success: true };
  } catch (error) {
    console.error(`❌ Tests failed for ${appName}`);
    return { appName, success: false, error: (error as Error).message };
  }
};

// Get frameworks to test (either based on git diff or all)
let candidateFrameworks = detectChangedFrameworks(cliArgs.isDiffOnly);

// Apply additional filtering if framework filter is provided
const appsToTest = candidateFrameworks.filter(appName => {
  if (!cliArgs.framework) return true;
  return appName.includes(cliArgs.framework);
});

// Main execution logic
async function main(): Promise<void> {
  // Handle single test mode (replaces runTest.ts functionality)
  if (isSingleTestMode) {
    await runSingleTest(cliArgs.framework!, cliArgs.testType);
    return;
  }

  // Handle all tests mode
  if (appsToTest.length === 0) {
    if (cliArgs.isDiffOnly && candidateFrameworks.length === 0) {
      console.log("✅ No frameworks need testing based on changes");
      process.exit(0);
    } else {
      console.error(`No apps found matching filter: ${cliArgs.framework}`);
      console.error(`Available apps: ${Object.keys(APP_CONFIGS).join(", ")}`);
      process.exit(1);
    }
  }

  console.log("🧪 Running E2E tests for:");
  appsToTest.forEach(app => console.log(`  - ${app}`));
  console.log(`\nMode: ${cliArgs.isSequential ? "Sequential" : "Parallel (max 4 concurrent)"}`);
  console.log(`Display: ${cliArgs.isHeaded ? "Headed" : "Headless"}`);
  if (cliArgs.isDiffOnly) {
    console.log(`Filter: Only changed frameworks (--diff-only)`);
  }
  console.log("");

  await runAllTests();
}

// Run tests - either sequentially or in parallel
async function runAllTests() {
  if (cliArgs.isSequential) {
    // Sequential execution (original behavior)
    for (const appName of appsToTest) {
      const result = await runTestsForApp(appName);
      if (!result.success) {
        setTestFailed(true);
      }
    }
  } else {
    // Parallel execution with concurrency limit
    const concurrencyLimit = 4;
    const limiter = new ConcurrencyLimiter(concurrencyLimit);
    
    console.log(`🚀 Starting parallel test execution (max ${concurrencyLimit} concurrent)...\n`);
    
    const testTasks = appsToTest.map(appName => 
      limiter.run(() => runTestsForApp(appName))
    );
    
    const results = await Promise.all(testTasks);
    
    // Process results
    const successful = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);
    
    console.log(`\n${"=".repeat(80)}`);
    console.log("📊 E2E Test Summary:");
    console.log(`${"=".repeat(80)}`);
    console.log(`✅ Successful: ${successful.length}`);
    successful.forEach(r => console.log(`   - ${r.appName}`));
    
    if (failed.length > 0) {
      console.log(`❌ Failed: ${failed.length}`);
      failed.forEach(r => console.log(`   - ${r.appName}: ${r.error}`));
      setTestFailed(true);
    }
    console.log(`${"=".repeat(80)}`);
  }
}

// Execute the main function
await main();

if (getTestFailed()) {
  console.error("\n❌ Some tests failed");
  process.exit(1);
}

console.log("\n✅ All tests completed successfully");