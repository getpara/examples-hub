import { execSync } from "child_process";
import path from "path";
import crypto from "crypto";
import * as dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Get API key from environment
const BETA_API_KEY_EVM = process.env.PARA_API_KEY_BETA || process.env.PARA_API_KEY;
if (!BETA_API_KEY_EVM) {
  console.error("❌ Missing PARA_API_KEY_BETA environment variable");
  console.error("Please set it in your .env file or as an environment variable");
  process.exit(1);
}

const APP_PATHS: Record<
  string,
  {
    envVars: Record<string, string>;
    installCommand?: string;
  }
> = {
  "server/with-node": {
    envVars: {
      VITE_PARA_API_KEY: BETA_API_KEY_EVM,
      PARA_API_KEY: BETA_API_KEY_EVM,
      VITE_PARA_ENVIRONMENT: "BETA",
      PARA_ENVIRONMENT: "BETA",
      E2E_APP_DIR: "server/with-node",
      APP_PORT: "3000",
      APP_START_COMMAND: "yarn dev",
      ENCRYPTION_KEY: crypto.randomBytes(24).toString("base64url").slice(0, 32),
    },
    installCommand: "yarn install:all",
  },
  "web/with-vue-vite": {
    envVars: {
      VITE_PARA_API_KEY: BETA_API_KEY_EVM,
      VITE_PARA_ENVIRONMENT: "BETA",
      E2E_APP_DIR: "web/with-vue-vite",
      APP_PORT: "5173",
      APP_START_COMMAND: "rm -rf node_modules/.vite && yarn dev --force",
    },
  },
  "web/with-react-nextjs/para-modal": {
    envVars: {
      NEXT_PUBLIC_PARA_API_KEY: BETA_API_KEY_EVM,
      NEXT_PUBLIC_PARA_ENVIRONMENT: "BETA",
      E2E_APP_DIR: "web/with-react-nextjs/para-modal",
      APP_PORT: "3000",
      APP_START_COMMAND: "yarn dev",
    },
  },
  "web/with-react-vite": {
    envVars: {
      VITE_PARA_API_KEY: BETA_API_KEY_EVM,
      VITE_PARA_ENVIRONMENT: "BETA",
      E2E_APP_DIR: "web/with-react-vite",
      APP_PORT: "5173",
      APP_START_COMMAND: "rm -rf node_modules/.vite && yarn dev --force",
    },
  },
  "web/with-svelte-vite": {
    envVars: {
      VITE_PARA_API_KEY: BETA_API_KEY_EVM,
      VITE_PARA_ENVIRONMENT: "BETA",
      E2E_APP_DIR: "web/with-svelte-vite",
      APP_PORT: "5173",
      APP_START_COMMAND: "rm -rf node_modules/.vite && yarn dev --force",
    },
  },
};

const EXAMPLES_REPO_PATH = process.env.GITHUB_WORKSPACE || process.cwd();

let testFailed = false;

// utility function to execute shell commands
const runCommand = (cmd: string, cwd?: string) => {
  console.log(`running: ${cmd} ${cwd ? `in ${cwd}` : ""}`);
  try {
    execSync(cmd, { stdio: "inherit", cwd, env: { ...process.env } });
  } catch (error) {
    console.error(`error executing: ${cmd}`, (error as Error).message);
    testFailed = true;
    throw new Error(`command failed: ${cmd}`);
  }
};

// run tests for each example app
for (const [appPath, opts] of Object.entries(APP_PATHS)) {
  const { envVars, installCommand } = opts;
  const appFullPath = path.resolve(EXAMPLES_REPO_PATH, appPath);
  console.log(`\nrunning tests for ${appFullPath}...`);

  // install example app dependencies
  runCommand(installCommand || "yarn install", appFullPath);

  // set environment variables for the app
  for (const [key, value] of Object.entries(envVars)) {
    process.env[key] = value;
    console.log(`setting environment variable: ${key}="${value}"`);
  }

  // run playwright tests
  runCommand("yarn single-example-hub-e2e");
}

if (testFailed) {
  console.error("some tests failed, exiting with status code 1");
  process.exit(1);
}

console.log("all tests completed");
