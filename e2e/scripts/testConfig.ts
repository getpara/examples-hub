import crypto from "crypto";
import { execSync } from "child_process";

export interface TestAppConfig {
  path: string;
  envVars: Record<string, string>;
  port: number;
  startCommand: string;
  installCommand?: string;
  framework: "react-vite" | "react-nextjs" | "vue" | "svelte" | "node" | "deno" | "bun";
}

export interface CLIArgs {
  framework?: string;
  testType?: string;
  isSequential: boolean;
  isHeaded: boolean;
  isDiffOnly: boolean;
  remainingArgs: string[];
}

export interface TestResult {
  appName: string;
  success: boolean;
  error?: string;
}

export interface TestEnvironment {
  apiKey: string;
  environment: "BETA" | "SANDBOX";
}

// Get environment variables with fallback
function getEnvVar(key: string, fallback?: string): string {
  const value = process.env[key];
  if (!value && !fallback) {
    throw new Error(`Missing required environment variable: ${key}. Please check your .env file.`);
  }
  return value || fallback || "";
}

// Get the test environment configuration
export function getTestEnvironment(): TestEnvironment {
  const environment = (getEnvVar("PARA_ENVIRONMENT", "BETA") as "BETA" | "SANDBOX");
  const apiKeyVar = environment === "BETA" ? "PARA_API_KEY_BETA" : "PARA_API_KEY_SANDBOX";
  
  return {
    apiKey: getEnvVar(apiKeyVar),
    environment,
  };
}

// Get framework-specific environment variables
export function getFrameworkEnvVars(framework: string, testEnv: TestEnvironment): Record<string, string> {
  const baseEnvVars: Record<string, string> = {
    PARA_ENVIRONMENT: testEnv.environment,
  };

  switch (framework) {
    case "react-vite":
    case "vue":
    case "svelte":
      return {
        ...baseEnvVars,
        VITE_PARA_API_KEY: getEnvVar("VITE_PARA_API_KEY", testEnv.apiKey),
        VITE_PARA_ENVIRONMENT: testEnv.environment,
      };
    
    case "react-nextjs":
      return {
        ...baseEnvVars,
        NEXT_PUBLIC_PARA_API_KEY: getEnvVar("NEXT_PUBLIC_PARA_API_KEY", testEnv.apiKey),
        NEXT_PUBLIC_PARA_ENVIRONMENT: testEnv.environment,
      };
    
    case "node":
    case "deno":
    case "bun":
      return {
        ...baseEnvVars,
        PARA_API_KEY: testEnv.apiKey,
        VITE_PARA_API_KEY: testEnv.apiKey,
        ENCRYPTION_KEY: getEnvVar("ENCRYPTION_KEY", crypto.randomBytes(24).toString("base64url").slice(0, 32)),
      };
    
    default:
      return baseEnvVars;
  }
}

// Application configurations
export const APP_CONFIGS: Record<string, TestAppConfig> = {
  "react-vite": {
    path: "web/with-react-vite",
    framework: "react-vite",
    port: parseInt(getEnvVar("VITE_PORT", "5173")),
    startCommand: "rm -rf node_modules/.vite && yarn dev --force",
    envVars: {},
  },
  "react-nextjs": {
    path: "web/with-react-nextjs/para-modal",
    framework: "react-nextjs",
    port: parseInt(getEnvVar("NEXTJS_PORT", "3000")),
    startCommand: "yarn dev",
    envVars: {},
  },
  "vue": {
    path: "web/with-vue-vite",
    framework: "vue",
    port: parseInt(getEnvVar("VITE_PORT", "5173")),
    startCommand: "rm -rf node_modules/.vite && yarn dev --force",
    envVars: {},
  },
  "svelte": {
    path: "web/with-svelte-vite",
    framework: "svelte",
    port: parseInt(getEnvVar("VITE_PORT", "5173")),
    startCommand: "rm -rf node_modules/.vite && yarn dev --force",
    envVars: {},
  },
  "node": {
    path: "server/with-node",
    framework: "node",
    port: parseInt(getEnvVar("NODE_PORT", "3000")),
    startCommand: "yarn dev",
    installCommand: "yarn install:all",
    envVars: {},
  },
};

// Test file patterns
export const TEST_PATTERNS = {
  "email-password": "happyPath.email.password.spec.ts",
  "email-passkey": "happyPath.email.passkey.spec.ts",
  "phone-password": "happyPath.phone.password.spec.ts",
  "phone-passkey": "happyPath.phone.passkey.spec.ts",
  "all": "*.spec.ts",
};

// Get test configuration
export function getTestConfig(appName: string): TestAppConfig {
  const config = APP_CONFIGS[appName];
  if (!config) {
    throw new Error(`Unknown app configuration: ${appName}`);
  }

  const testEnv = getTestEnvironment();
  const frameworkEnvVars = getFrameworkEnvVars(config.framework, testEnv);

  return {
    ...config,
    envVars: {
      ...frameworkEnvVars,
      E2E_APP_DIR: config.path,
      APP_PORT: config.port.toString(),
      APP_START_COMMAND: config.startCommand,
    },
  };
}

// Shared utilities for test execution
let testFailed = false;

export function setTestFailed(failed: boolean): void {
  testFailed = failed;
}

export function getTestFailed(): boolean {
  return testFailed;
}

// Utility function to execute shell commands
export function runCommand(cmd: string, cwd?: string, env?: Record<string, string>): void {
  console.log(`Running: ${cmd} ${cwd ? `in ${cwd}` : ""}`);
  try {
    execSync(cmd, { 
      stdio: "inherit", 
      cwd, 
      env: { ...process.env, ...env } 
    });
  } catch (error) {
    console.error(`Error executing: ${cmd}`, (error as Error).message);
    setTestFailed(true);
    throw new Error(`Command failed: ${cmd}`);
  }
}

// Async wrapper for runCommand to work with Promise.all
export async function runCommandAsync(cmd: string, cwd?: string, env?: Record<string, string>): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      runCommand(cmd, cwd, env);
      resolve();
    } catch (error) {
      reject(error);
    }
  });
}

// Parse command line arguments
export function parseCliArgs(args: string[]): CLIArgs {
  const framework = args.find(arg => !arg.startsWith("--"));
  const testType = args.find((arg, index) => {
    const prevArg = args[index - 1];
    return prevArg && !prevArg.startsWith("--") && !arg.startsWith("--");
  });
  
  return {
    framework,
    testType,
    isSequential: args.includes("--sequential") || process.env.E2E_SEQUENTIAL === "true",
    isHeaded: args.includes("--headed") || process.env.E2E_HEADED === "true",
    isDiffOnly: args.includes("--diff-only"),
    remainingArgs: args.filter(arg => !["--sequential", "--headed", "--diff-only"].includes(arg))
  };
}

// Framework path mapping for change detection
export const FRAMEWORK_PATHS: Record<string, string[]> = {
  "react-vite": ["web/with-react-vite/", "web/", "e2e/tests/web/with-react-vite/"],
  "react-nextjs": ["web/with-react-nextjs/", "web/", "e2e/tests/web/with-react-nextjs/"],
  "vue": ["web/with-vue-vite/", "web/", "e2e/tests/web/with-vue-vite/"],
  "svelte": ["web/with-svelte-vite/", "web/", "e2e/tests/web/with-svelte-vite/"],
  "node": ["server/with-node/", "server/", "e2e/tests/server/with-node/"]
};

// Function to detect changed frameworks using git diff
export function detectChangedFrameworks(isDiffOnly: boolean): string[] {
  if (!isDiffOnly) {
    return Object.keys(APP_CONFIGS); // Return all frameworks if not using diff mode
  }

  try {
    // Get changed files since last commit
    const gitDiff = execSync("git diff --name-only HEAD~1 HEAD", { 
      encoding: "utf8",
      stdio: "pipe"
    }).trim();
    
    if (!gitDiff) {
      console.log("🔍 No changes detected, running all frameworks");
      return Object.keys(APP_CONFIGS);
    }

    const changedFiles = gitDiff.split("\n");
    const changedFrameworks = new Set<string>();

    // Check which frameworks have changed files
    for (const [framework, paths] of Object.entries(FRAMEWORK_PATHS)) {
      const hasChanges = changedFiles.some(file => 
        paths.some(frameworkPath => file.startsWith(frameworkPath))
      );
      
      if (hasChanges) {
        changedFrameworks.add(framework);
      }
    }

    // Always include frameworks that match the filter
    const availableFrameworks = Object.keys(APP_CONFIGS);
    const matchingFrameworks = Array.from(changedFrameworks).filter(framework =>
      availableFrameworks.some(available => available.includes(framework))
    );

    if (matchingFrameworks.length === 0) {
      console.log("🔍 No framework changes detected, skipping E2E tests");
      return [];
    }

    console.log("🔍 Detected changes in frameworks:", matchingFrameworks.join(", "));
    return matchingFrameworks;
  } catch (error) {
    console.warn("⚠️ Failed to detect changes, running all frameworks:", (error as Error).message);
    return Object.keys(APP_CONFIGS);
  }
}

// Validate environment setup
export function validateEnvironment(): void {
  try {
    // Check for at least one API key
    const hasBetaKey = !!process.env.PARA_API_KEY_BETA;
    const hasSandboxKey = !!process.env.PARA_API_KEY_SANDBOX;
    
    if (!hasBetaKey && !hasSandboxKey) {
      throw new Error(
        "No API keys found. Please set PARA_API_KEY_BETA or PARA_API_KEY_SANDBOX in your .env file."
      );
    }

    // Validate current environment has corresponding key
    const testEnv = getTestEnvironment();
    console.log(`✓ Test environment validated: ${testEnv.environment}`);
  } catch (error) {
    console.error("❌ Environment validation failed:");
    console.error((error as Error).message);
    console.error("\nPlease create a .env file based on .env.example and add your API keys.");
    process.exit(1);
  }
}