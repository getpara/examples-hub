#!/usr/bin/env ts-node

import { execSync } from "child_process";
import path from "path";
import * as dotenv from "dotenv";
import { APP_CONFIGS, getTestConfig, validateEnvironment } from "./testConfig";

// Load environment variables
dotenv.config();

// Validate environment before running tests
validateEnvironment();

const EXAMPLES_REPO_PATH = process.env.GITHUB_WORKSPACE || process.cwd();

let testFailed = false;

// Parse command line arguments
const args = process.argv.slice(2);
const filterFramework = args.find(arg => !arg.startsWith("--"));
const isSequential = args.includes("--sequential") || process.env.E2E_SEQUENTIAL === "true";
const isHeaded = args.includes("--headed") || process.env.E2E_HEADED === "true";

// Utility function to execute shell commands
const runCommand = (cmd: string, cwd?: string, env?: Record<string, string>) => {
  console.log(`Running: ${cmd} ${cwd ? `in ${cwd}` : ""}`);
  try {
    execSync(cmd, { 
      stdio: "inherit", 
      cwd, 
      env: { ...process.env, ...env } 
    });
  } catch (error) {
    console.error(`Error executing: ${cmd}`, (error as Error).message);
    testFailed = true;
    throw new Error(`Command failed: ${cmd}`);
  }
};

// Filter apps based on command line argument
const appsToTest = Object.keys(APP_CONFIGS).filter(appName => {
  if (!filterFramework) return true;
  return appName.includes(filterFramework);
});

if (appsToTest.length === 0) {
  console.error(`No apps found matching filter: ${filterFramework}`);
  console.error(`Available apps: ${Object.keys(APP_CONFIGS).join(", ")}`);
  process.exit(1);
}

console.log("🧪 Running E2E tests for:");
appsToTest.forEach(app => console.log(`  - ${app}`));
console.log(`\nMode: ${isSequential ? "Sequential" : "Parallel"}`);
console.log(`Display: ${isHeaded ? "Headed" : "Headless"}\n`);

// Run tests for each example app
for (const appName of appsToTest) {
  try {
    const config = getTestConfig(appName);
    const appFullPath = path.resolve(EXAMPLES_REPO_PATH, config.path);
    
    console.log(`\n${"=".repeat(60)}`);
    console.log(`Running tests for ${appName}`);
    console.log(`${"=".repeat(60)}`);

    // Install dependencies if needed
    if (config.installCommand) {
      runCommand(config.installCommand, appFullPath);
    } else {
      runCommand("yarn install", appFullPath);
    }

    // Prepare Playwright command
    const playwrightArgs = [
      `e2e/tests/${config.path}`,
      "--config=e2e/example-hub-playwright.config.ts",
      "--reporter=list",
    ];

    if (isSequential) {
      playwrightArgs.push("--workers=1");
    }

    if (isHeaded) {
      playwrightArgs.push("--headed");
    }

    const testCommand = `yarn playwright test ${playwrightArgs.join(" ")}`;

    // Run Playwright tests with framework-specific environment variables
    runCommand(testCommand, EXAMPLES_REPO_PATH, config.envVars);

    console.log(`✅ Tests passed for ${appName}`);
  } catch (error) {
    console.error(`❌ Tests failed for ${appName}`);
    // Continue with other tests even if one fails
  }
}

if (testFailed) {
  console.error("\n❌ Some tests failed");
  process.exit(1);
}

console.log("\n✅ All tests completed successfully");