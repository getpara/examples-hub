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
import { logger } from "../helpers/logger";
import { ensurePlaywrightBrowsers } from "./ensure-playwright-browsers";

dotenv.config();

validateEnvironment();

const EXAMPLES_REPO_PATH = process.env.GITHUB_WORKSPACE || process.cwd();

const args = process.argv.slice(2);
const cliArgs: CLIArgs = parseCliArgs(args);

const isSingleTestMode = !!(cliArgs.framework && cliArgs.testType);
const isAllTestsMode =
  !cliArgs.framework || (!cliArgs.testType && cliArgs.framework);

async function runSingleTest(
  framework: string,
  testType?: string
): Promise<void> {
  if (!framework) {
    logger.logError("Usage: tsx runAllTests.ts <framework> [test-type]");
    logger.logError("Frameworks: react-vite, react-nextjs, vue, svelte, node");
    logger.logError(
      "Test types: email-password, email-passkey, phone-password, phone-passkey"
    );
    process.exit(1);
  }

  try {
    const config = getTestConfig(framework);

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

    // Remove "basic-login" suffix for directory path so tests run properly after env vars are setup
    if (config.path.includes("/basic-login")) {
      config.path = config.path.replace("/basic-login", "");
    }

    const appFullPath = path.resolve(EXAMPLES_REPO_PATH, config.path);

    const command = `yarn playwright test ${playwrightArgs.join(" ")}`;

    logger.logInfo(
      `Running tests for ${framework}${testType ? ` (${testType})` : ""}`
    );
    logger.logInfo(`Command: ${command}\n`);

    const testEnv = {
      ...config.envVars,
      E2E_APP_DIR: config.path,
      E2E_APP_FULL_PATH: appFullPath,
      APP_PORT: config.port.toString(),
      APP_START_COMMAND: config.startCommand,
      BASE_URL: `http://localhost:${config.port}`,
    };

    await runCommandAsync(command, EXAMPLES_REPO_PATH, testEnv);

    logger.logStep(`Single test completed successfully for ${framework}`, true);
  } catch (error) {
    logger.logError(`Single test failed: ${(error as Error).message}`);
    process.exit(1);
  }
}

const runTestsForApp = async (appName: string): Promise<TestResult> => {
  try {
    const config = getTestConfig(appName);

    let appPath = config.path;

    // Remove "basic-login" suffix for directory path so tests run properly after env vars are setup
    if (appPath.includes("/basic-login")) {
      appPath = appPath.replace("/basic-login", "");
    }

    const appFullPath = path.resolve(EXAMPLES_REPO_PATH, appPath);

    logger.log("", "=".repeat(60));
    logger.logInfo(`Running tests for ${appName}`);
    logger.log("", "=".repeat(60));

    logger.logInfo(`📦 Installing dependencies...`);
    if (config.installCommand) {
      await runCommandAsync(config.installCommand, appFullPath, {}, true);
    } else {
      // Don't use --immutable to allow yarn.lock updates for file: protocol dependencies
      await runCommandAsync("yarn install", appFullPath, {}, true);
    }

    const playwrightArgs = [
      // Only running tests in the exact directory to avoid running other tests that need different env vars
      `e2e/tests/${config.path}/*.spec.ts`,
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

    logger.logInfo(`🧪 Running Playwright tests...`);

    await runCommandAsync(testCommand, EXAMPLES_REPO_PATH, testEnv);

    logger.logStep(`Tests passed for ${appName}`, true);
    return { appName, success: true };
  } catch (error) {
    logger.logError(`Tests failed for ${appName}`);
    return { appName, success: false, error: (error as Error).message };
  }
};

let candidateFrameworks = detectChangedFrameworks(cliArgs.isDiffOnly);

const appsToTest = candidateFrameworks.filter((appName) => {
  if (cliArgs.isWebOnly) {
    return ["react-vite", "react-nextjs", "vue", "svelte"].some((webFw) =>
      appName.includes(webFw)
    );
  }
  if (cliArgs.framework) {
    return appName.includes(cliArgs.framework);
  }
  return true;
});

async function main(): Promise<void> {
  // Ensure Playwright browsers are installed before running any tests
  ensurePlaywrightBrowsers();

  if (isSingleTestMode) {
    await runSingleTest(cliArgs.framework!, cliArgs.testType);
    return;
  }

  if (appsToTest.length === 0) {
    if (cliArgs.isDiffOnly && candidateFrameworks.length === 0) {
      logger.logStep("No frameworks need testing based on changes", true);
      process.exit(0);
    } else {
      logger.logError(`No apps found matching filter: ${cliArgs.framework}`);
      logger.logError(`Available apps: ${Object.keys(APP_CONFIGS).join(", ")}`);
      process.exit(1);
    }
  }

  logger.logInfo("🧪 Running E2E tests for:");
  appsToTest.forEach((app) => logger.logInfo(`  - ${app}`));
  logger.logInfo(`\nMode: Sequential (one test at a time)`);
  logger.logInfo(`Display: ${cliArgs.isHeaded ? "Headed" : "Headless"}`);
  if (cliArgs.isDiffOnly) {
    logger.logInfo(`Filter: Only changed frameworks (--diff-only)`);
  }
  logger.logInfo("");

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
    logger.logError("Some tests failed");
    process.exit(1);
  }

  logger.logStep("All tests completed successfully", true);
})();
