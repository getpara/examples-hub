import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';

const SANDBOX_API_KEY = 'dfb222ff8b602eb492974a6ed68c35b2';
const APP_PATHS = {
  'web/with-vue-vite/para-modal': {
    envVars: {
      VITE_PARA_API_KEY: SANDBOX_API_KEY,
      VITE_PARA_ENVIRONMENT: 'E2E',
      E2E_APP_DIR: 'web/with-vue-vite/para-modal',
      APP_PORT: '5173',
      APP_START_COMMAND: 'rm -rf node_modules/.vite && yarn dev --force',
    },
  },
  'web/with-react-nextjs/para-modal': {
    envVars: {
      NEXT_PUBLIC_PARA_API_KEY: SANDBOX_API_KEY,
      NEXT_PUBLIC_PARA_ENVIRONMENT: 'E2E',
      E2E_APP_DIR: 'web/with-react-nextjs/para-modal',
      APP_PORT: '3000',
      APP_START_COMMAND: 'yarn dev',
    },
  },
  'web/with-react-vite/para-modal': {
    envVars: {
      VITE_PARA_API_KEY: SANDBOX_API_KEY,
      VITE_PARA_ENVIRONMENT: 'E2E',
      E2E_APP_DIR: 'web/with-react-vite/para-modal',
      APP_PORT: '5173',
      APP_START_COMMAND: 'rm -rf node_modules/.vite && yarn dev --force',
    },
  },
};

const MONOREPO_PATH = process.env.GITHUB_WORKSPACE || process.cwd();
const ROOT_DIR = path.dirname(MONOREPO_PATH);
const EXAMPLES_REPO_PATH = path.resolve(ROOT_DIR, 'examples-hub');

let testFailed = false;
let cleanupCalled = false;

// utility function to execute shell commands
const runCommand = (cmd: string, cwd?: string) => {
  console.log(`running: ${cmd} ${cwd ? `in ${cwd}` : ''}`);
  try {
    execSync(cmd, { stdio: 'inherit', cwd, env: { ...process.env } });
  } catch (error) {
    console.error(`error executing: ${cmd}`, (error as Error).message);
    testFailed = true;
    throw new Error(`command failed: ${cmd}`);
  }
};

// cleanup function to unlink all @getpara packages
const cleanup = () => {
  if (cleanupCalled) return;
  cleanupCalled = true;
  runCommand('yarn rm-getpara-yarn-links');
};

// ensure cleanup runs on process exit
process.on('SIGINT', () => {
  console.warn('script interrupted, running cleanup before exit...');
  cleanup();
  process.exit(1);
});

process.on('SIGTERM', () => {
  console.warn('pocess termination detected, running cleanup before exit...');
  cleanup();
  process.exit(1);
});

// step 1: link all monorepo packages globally
const packagesPath = path.join(MONOREPO_PATH, 'packages');
const packages = fs.readdirSync(packagesPath);

packages.forEach(pkg => {
  const pkgPath = path.join(packagesPath, pkg);
  const packageJsonPath = path.join(pkgPath, 'package.json');

  if (!fs.existsSync(packageJsonPath)) return;
  runCommand(`yarn link`, pkgPath);
});

// step 2: run tests for each example app
try {
  for (const [appPath, opts] of Object.entries(APP_PATHS)) {
    const { envVars } = opts;
    const appFullPath = path.resolve(EXAMPLES_REPO_PATH, appPath);
    console.log(`\nrunning tests for ${appFullPath}...`);

    // install example app dependencies
    runCommand('yarn install', appFullPath);

    // make the example app link to the local sdk packages
    packages.forEach(pkg => {
      const packageJsonPath = path.join(packagesPath, pkg, 'package.json');
      if (fs.existsSync(packageJsonPath)) {
        const pkgJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
        const packageName = pkgJson.name;

        runCommand(`yarn link "${packageName}"`, appFullPath);
      }
    });

    // set environment variables for the app
    for (const [key, value] of Object.entries(envVars)) {
      process.env[key] = value;
      console.log(`setting environment variable: ${key}="${value}"`);
    }

    // run playwright tests
    runCommand('yarn single-example-hub-e2e');
  }
} finally {
  // step 3: cleanup @getpara yarn links
  cleanup();
}

if (testFailed) {
  console.error('some tests failed, exiting with status code 1');
  process.exit(1);
}

console.log('all tests completed');
