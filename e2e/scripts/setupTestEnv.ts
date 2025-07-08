#!/usr/bin/env ts-node

import * as dotenv from "dotenv";
import { getTestConfig, validateEnvironment } from "./testConfig";

// Load environment variables from .env file
dotenv.config();

// Get the app name from command line arguments
const appName = process.argv[2];

if (!appName) {
  console.error("Usage: yarn test:setup <app-name>");
  console.error("Available apps: react-vite, react-nextjs, vue, svelte, node");
  process.exit(1);
}

try {
  // Validate environment
  validateEnvironment();

  // Get test configuration
  const config = getTestConfig(appName);

  // Export environment variables for the test run
  Object.entries(config.envVars).forEach(([key, value]) => {
    process.env[key] = value;
    console.log(`Setting ${key}=${key.includes("KEY") ? "***" : value}`);
  });

  console.log(`\n✓ Environment configured for ${appName}`);
  console.log(`  Path: ${config.path}`);
  console.log(`  Port: ${config.port}`);
  console.log(`  Framework: ${config.framework}`);
} catch (error) {
  console.error("❌ Setup failed:", (error as Error).message);
  process.exit(1);
}