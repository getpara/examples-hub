#!/usr/bin/env ts-node

import { execSync } from "child_process";
import * as dotenv from "dotenv";
import { getTestConfig, validateEnvironment } from "./testConfig";

// Load environment variables
dotenv.config();

// Parse command line arguments
const [framework, testType] = process.argv.slice(2);

if (!framework) {
  console.error("Usage: yarn test:run <framework> [test-type]");
  console.error("Frameworks: react-vite, react-nextjs, vue, svelte, node");
  console.error("Test types: email-password, email-passkey, phone-password, phone-passkey");
  process.exit(1);
}

try {
  // Validate environment
  validateEnvironment();

  // Get test configuration
  const config = getTestConfig(framework);

  // Set environment variables
  Object.entries(config.envVars).forEach(([key, value]) => {
    process.env[key] = value;
  });

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

  // Always run sequentially by default
  if (process.env.E2E_WORKERS !== "auto") {
    playwrightArgs.push("--workers=1");
  }

  // Check for headed mode
  if (process.env.E2E_HEADED === "true") {
    playwrightArgs.push("--headed");
  }

  const command = `yarn playwright test ${playwrightArgs.join(" ")}`;

  console.log(`Running tests for ${framework}${testType ? ` (${testType})` : ""}`);
  console.log(`Command: ${command}\n`);

  // Run the test
  execSync(command, { stdio: "inherit", env: process.env });
} catch (error) {
  console.error("❌ Test failed:", (error as Error).message);
  process.exit(1);
}