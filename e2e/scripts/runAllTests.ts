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
  CLIArgs,
  TEST_PATTERNS,
} from "./testConfig";

dotenv.config();

validateEnvironment();

const EXAMPLES_REPO_PATH = process.env.GITHUB_WORKSPACE || process.cwd();

const args = process.argv.slice(2);
const cliArgs: CLIArgs = parseCliArgs(args);

const isSingleTestMode = !!(cliArgs.framework && cliArgs.testType);
const isAllTestsMode = !cliArgs.framework || (!cliArgs.testType && cliArgs.framework);

async function runSingleTest(framework: string, testType?: string): Promise<void> {
  if (!framework) {
    console.error("Usage: tsx runAllTests.ts <framework> [test-type]");
    console.error("Frameworks: react-vite, react-nextjs, vue, svelte, node");
    console.error("Test types: email-password, email-passkey, phone-password, phone-passkey");
    process.exit(1);
  }

  try {
    const config = getTestConfig(framework);
    const appFullPath = path.resolve(EXAMPLES_REPO_PATH, config.path);

    let testPath = `e2e/tests/${config.path}`;
    if (testType) {
      const pattern = TEST_PATTERNS[testType as keyof typeof TEST_PATTERNS];
      if (pattern && pattern !== "*.spec.ts") {
        testPath += `/${pattern}`;
      } else {
        testPath += `/happyPath.${testType}.spec.ts`;
      }
    }

    const playwrightArgs = [
      testPath,
      "--config=e2e/example-hub-playwright.config.ts",
      "--reporter=line",
      "--workers=1",
    ];

    if (cliArgs.isHeaded) {
      playwrightArgs.push("--headed");
    }

    const command = `yarn playwright test ${playwrightArgs.join(" ")}`;

    console.log(`Running tests for ${framework}${testType ? ` (${testType})` : ""}`);
    console.log(`Command: ${command}\n`);

    const testEnv = {
      ...config.envVars,
      E2E_APP_DIR: config.path,
      E2E_APP_FULL_PATH: appFullPath,
      APP_PORT: config.port.toString(),
      APP_START_COMMAND: config.startCommand,
      BASE_URL: `http://localhost:${config.port}`,
    };

    await runCommandAsync(command, EXAMPLES_REPO_PATH, testEnv);

    console.log(`✅ Single test completed successfully for ${framework}`);
  } catch (error) {
    console.error("❌ Single test failed:", (error as Error).message);
    process.exit(1);
  }
}

const runTestsForApp = async (appName: string): Promise<TestResult> => {
  try {
    const config = getTestConfig(appName);
    const appFullPath = path.resolve(EXAMPLES_REPO_PATH, config.path);

    console.log(`\n${"=".repeat(60)}`);
    console.log(`Running tests for ${appName}`);
    console.log(`${"=".repeat(60)}`);

    if (config.installCommand) {
      await runCommandAsync(config.installCommand, appFullPath);
    } else {
      await runCommandAsync("yarn install", appFullPath);
    }

    const playwrightArgs = [
      `e2e/tests/${config.path}`,
      "--config=e2e/example-hub-playwright.config.ts",
      "--reporter=line",
      "--workers=1",
    ];

    if (cliArgs.isHeaded) {
      playwrightArgs.push("--headed");
    }

    const testCommand = `yarn playwright test ${playwrightArgs.join(" ")}`;

    const testEnv = {
      ...config.envVars,
      E2E_APP_DIR: config.path,
      E2E_APP_FULL_PATH: appFullPath,
      APP_PORT: config.port.toString(),
      APP_START_COMMAND: config.startCommand,
      BASE_URL: `http://localhost:${config.port}`,
    };

    await runCommandAsync(testCommand, EXAMPLES_REPO_PATH, testEnv);

    console.log(`✅ Tests passed for ${appName}`);
    return { appName, success: true };
  } catch (error) {
    console.error(`❌ Tests failed for ${appName}`);
    return { appName, success: false, error: (error as Error).message };
  }
};

let candidateFrameworks = detectChangedFrameworks(cliArgs.isDiffOnly);

const appsToTest = candidateFrameworks.filter((appName) => {
  if (cliArgs.isWebOnly) {
    return ["react-vite", "react-nextjs", "vue", "svelte"].some((webFw) => appName.includes(webFw));
  }
  if (cliArgs.framework) {
    return appName.includes(cliArgs.framework);
  }
  return true;
});

async function main(): Promise<void> {
  if (isSingleTestMode) {
    await runSingleTest(cliArgs.framework!, cliArgs.testType);
    return;
  }

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
  appsToTest.forEach((app) => console.log(`  - ${app}`));
  console.log(`\nMode: Sequential (one test at a time)`);
  console.log(`Display: ${cliArgs.isHeaded ? "Headed" : "Headless"}`);
  if (cliArgs.isDiffOnly) {
    console.log(`Filter: Only changed frameworks (--diff-only)`);
  }
  console.log("");

  await runAllTests();
}

async function runAllTests() {
  for (const appName of appsToTest) {
    const result = await runTestsForApp(appName);
    if (!result.success) {
      setTestFailed(true);
    }
  }
}

(async () => {
  await main();

  if (getTestFailed()) {
    console.error("\n❌ Some tests failed");
    process.exit(1);
  }

  console.log("\n✅ All tests completed successfully");
})();
