import crypto from "crypto";
import { execSync } from "child_process";
import { logger } from "../helpers/logger";
import * as dotenv from "dotenv";

dotenv.config();

type AuthType = "BASIC_LOGIN" | "PASSKEY";

export interface TestAppConfig {
  path: string;
  envVars: Record<string, string>;
  port: number;
  startCommand: string;
  installCommand?: string;
  framework:
    | "react-vite"
    | "react-nextjs"
    | "vue"
    | "svelte"
    | "node"
    | "deno"
    | "bun";
}

export interface CLIArgs {
  framework?: string;
  testType?: string;
  isSequential: boolean;
  isHeaded: boolean;
  isDiffOnly: boolean;
  isWebOnly: boolean;
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

function getEnvVar(key: string, fallback?: string): string {
  const value = process.env[key];
  if (!value && fallback === undefined) {
    throw new Error(
      `Missing required environment variable: ${key}. Please check your .env file.`
    );
  }
  return value || fallback || "";
}

export function getTestEnvironment(authType?: AuthType): TestEnvironment {
  const environment = getEnvVar("PARA_ENVIRONMENT", "BETA") as
    | "BETA"
    | "SANDBOX";

  const apiKeyPrefix = "PARA_API_KEY_";
  const apiKeyModifier = authType === "BASIC_LOGIN" ? "BASIC_LOGIN_" : "";
  const apiKeyEnv = environment === "BETA" ? "BETA" : "SANDBOX";

  const apiKeyVar = `${apiKeyPrefix}${apiKeyModifier}${apiKeyEnv}`;

  return {
    apiKey: getEnvVar(apiKeyVar),
    environment,
  };
}

export function getFrameworkEnvVars(
  framework: string,
  testEnv: TestEnvironment,
  authType?: AuthType
): Record<string, string> {
  const baseEnvVars: Record<string, string> = {
    PARA_ENVIRONMENT: testEnv.environment,
  };

  // Check for framework-specific API key overrides
  const frameworkApiKeyOverride = getEnvVar(
    `PARA_API_KEY_${framework.toUpperCase()}_OVERRIDE`,
    ""
  );
  const apiKey = frameworkApiKeyOverride || testEnv.apiKey;

  const apiKeySuffix = authType === "BASIC_LOGIN" ? "_BASIC_LOGIN" : "";

  switch (framework) {
    case "react-vite":
    case "vue":
    case "svelte":
      return {
        ...baseEnvVars,
        VITE_PARA_API_KEY: getEnvVar(
          `VITE_PARA_API_KEY${apiKeySuffix}`,
          apiKey
        ),
        VITE_PARA_ENVIRONMENT: testEnv.environment,
      };

    case "react-nextjs":
      return {
        ...baseEnvVars,
        NEXT_PUBLIC_PARA_API_KEY: getEnvVar(
          `NEXT_PUBLIC_PARA_API_KEY${apiKeySuffix}`,
          apiKey
        ),
        NEXT_PUBLIC_PARA_ENVIRONMENT: testEnv.environment,
        PORT: getEnvVar("NEXTJS_PORT", "3000"),
      };

    case "node":
    case "deno":
    case "bun":
      return {
        ...baseEnvVars,
        PARA_API_KEY: apiKey,
        PARA_API_KEY_BETA: apiKey,
        VITE_PARA_API_KEY: apiKey,
        ENCRYPTION_KEY: getEnvVar(
          "ENCRYPTION_KEY",
          crypto.randomBytes(24).toString("base64url").slice(0, 32)
        ),
        // These are required for server frameworks and will be validated in getTestConfig
        ALCHEMY_API_KEY: getEnvVar("ALCHEMY_API_KEY"),
        ALCHEMY_GAS_POLICY_ID: getEnvVar("ALCHEMY_GAS_POLICY_ID"),
        ALCHEMY_RPC_URL: getEnvVar("ALCHEMY_RPC_URL"),
        ZERODEV_PROJECT_ID: getEnvVar("ZERODEV_PROJECT_ID"),
        ZERODEV_BUNDLER_RPC: getEnvVar("ZERODEV_BUNDLER_RPC"),
        ZERODEV_PAYMASTER_RPC: getEnvVar("ZERODEV_PAYMASTER_RPC"),
        ZERODEV_SECRET_KEY: getEnvVar("ZERODEV_SECRET_KEY"),
      };

    default:
      return baseEnvVars;
  }
}

export const APP_CONFIGS: Record<string, TestAppConfig> = {
  "react-vite": {
    path: "web/with-react-vite",
    framework: "react-vite",
    port: parseInt(getEnvVar("VITE_PORT", "5173")),
    startCommand: "rm -rf node_modules/.vite && yarn dev --force",
    envVars: {},
  },
  "react-vite-basic-login": {
    path: "web/with-react-vite/basic-login",
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
  "react-nextjs-basic-login": {
    path: "web/with-react-nextjs/para-modal/basic-login",
    framework: "react-nextjs",
    port: parseInt(getEnvVar("NEXTJS_PORT", "3000")),
    startCommand: "yarn dev",
    envVars: {},
  },
  vue: {
    path: "web/with-vue-vite",
    framework: "vue",
    port: parseInt(getEnvVar("VITE_PORT", "5173")),
    startCommand: "rm -rf node_modules/.vite && yarn dev --force",
    envVars: {},
  },
  svelte: {
    path: "web/with-svelte-vite",
    framework: "svelte",
    port: parseInt(getEnvVar("VITE_PORT", "5173")),
    startCommand: "rm -rf node_modules/.vite && yarn dev --force",
    envVars: {},
  },
  node: {
    path: "server/with-node",
    framework: "node",
    port: parseInt(getEnvVar("NODE_PORT", "8080")),
    startCommand: "yarn dev",
    installCommand: "yarn install",
    envVars: {
      PORT: getEnvVar("NODE_PORT", "8080"),
    },
  },
};

export const TEST_PATTERNS = {
  "email-basic-login": "happyPath.email-basic-login.spec.ts",
  "phone-basic-login": "happyPath.phone-basic-login.spec.ts",
  "email-password": "happyPath.email-password.spec.ts",
  "email-passkey": "happyPath.email-passkey.spec.ts",
  "phone-password": "happyPath.phone-password.spec.ts",
  "phone-passkey": "happyPath.phone-passkey.spec.ts",
  all: "*.spec.ts",
};

export function getTestConfig(appName: string): TestAppConfig {
  const config = APP_CONFIGS[appName];
  if (!config) {
    throw new Error(`Unknown app configuration: ${appName}`);
  }

  const authType = appName.includes("basic-login") ? "BASIC_LOGIN" : "PASSKEY";

  // Validate all required environment variables early
  const missingVars: string[] = [];
  const testEnv = getTestEnvironment(authType);

  // Check framework-specific required variables
  switch (config.framework) {
    case "node":
    case "deno":
    case "bun":
      // These frameworks require additional environment variables
      const requiredServerVars = [
        "ALCHEMY_API_KEY",
        "ALCHEMY_GAS_POLICY_ID",
        "ALCHEMY_RPC_URL",
        "ZERODEV_PROJECT_ID",
        "ZERODEV_BUNDLER_RPC",
        "ZERODEV_PAYMASTER_RPC",
        "ZERODEV_SECRET_KEY",
      ];

      for (const varName of requiredServerVars) {
        if (!process.env[varName]) {
          missingVars.push(varName);
        }
      }
      break;
  }

  // Log missing variables informatively before failing
  if (missingVars.length > 0) {
    logger.logError(
      `\n❌ Missing required environment variables for ${config.framework} framework:`
    );
    missingVars.forEach((varName) => {
      logger.logError(`   - ${varName}`);
    });
    logger.logError(
      `\nPlease check your .env file and ensure all required variables are set.`
    );
    logger.logError(`Framework-specific requirements:`);
    logger.logError(
      `- Server frameworks (node/deno/bun): Require Alchemy and ZeroDev configuration`
    );
    logger.logError(`- Web frameworks: Only require Para API keys\n`);
    throw new Error(
      `Missing required environment variables: ${missingVars.join(", ")}`
    );
  }

  const frameworkEnvVars = getFrameworkEnvVars(
    config.framework,
    testEnv,
    authType
  );

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

let testFailed = false;

export function setTestFailed(failed: boolean): void {
  testFailed = failed;
}

export function getTestFailed(): boolean {
  return testFailed;
}

export function runCommand(
  cmd: string,
  cwd?: string,
  env?: Record<string, string>,
  silent?: boolean
): void {
  if (silent) {
    process.stdout.write(`⏳ Running: ${cmd.split(" ")[0]}...`);
  } else {
    logger.logInfo(`Running: ${cmd} ${cwd ? `in ${cwd}` : ""}`);
  }

  try {
    execSync(cmd, {
      stdio: silent ? "pipe" : "inherit",
      cwd,
      env: { ...process.env, ...env },
    });

    if (silent) {
      process.stdout.write(
        `\r✅ ${cmd.split(" ")[0]} completed                    \n`
      );
    }
  } catch (error) {
    if (silent) {
      process.stdout.write(
        `\r❌ ${cmd.split(" ")[0]} failed                    \n`
      );
    }
    logger.logError(`Error executing: ${cmd}`, (error as Error).message);
    setTestFailed(true);
    throw new Error(`Command failed: ${cmd}`);
  }
}

export async function runCommandAsync(
  cmd: string,
  cwd?: string,
  env?: Record<string, string>,
  silent?: boolean
): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      runCommand(cmd, cwd, env, silent);
      resolve();
    } catch (error) {
      reject(error);
    }
  });
}

export function parseCliArgs(args: string[]): CLIArgs {
  const framework = args.find((arg) => !arg.startsWith("--"));
  const testType = args.find((arg, index) => {
    const prevArg = args[index - 1];
    return prevArg && !prevArg.startsWith("--") && !arg.startsWith("--");
  });

  return {
    framework,
    testType,
    isSequential: true,
    isHeaded: args.includes("--headed") || process.env.E2E_HEADED === "true",
    isDiffOnly: args.includes("--diff-only"),
    isWebOnly: args.includes("--web"),
    remainingArgs: args.filter(
      (arg) =>
        !["--sequential", "--headed", "--diff-only", "--web"].includes(arg)
    ),
  };
}

export const FRAMEWORK_PATHS: Record<string, string[]> = {
  "react-vite": [
    "web/with-react-vite/",
    "web/",
    "e2e/tests/web/with-react-vite/",
  ],
  "react-nextjs": [
    "web/with-react-nextjs/",
    "web/",
    "e2e/tests/web/with-react-nextjs/",
  ],
  vue: ["web/with-vue-vite/", "web/", "e2e/tests/web/with-vue-vite/"],
  svelte: ["web/with-svelte-vite/", "web/", "e2e/tests/web/with-svelte-vite/"],
  node: ["server/with-node/", "server/", "e2e/tests/server/with-node/"],
};

export function detectChangedFrameworks(isDiffOnly: boolean): string[] {
  if (!isDiffOnly) {
    return Object.keys(APP_CONFIGS);
  }

  try {
    const gitDiff = execSync("git diff --name-only HEAD~1 HEAD", {
      encoding: "utf8",
      stdio: "pipe",
    }).trim();

    if (!gitDiff) {
      logger.logDebug("🔍 No changes detected, running all frameworks");
      return Object.keys(APP_CONFIGS);
    }

    const changedFiles = gitDiff.split("\n");
    const changedFrameworks = new Set<string>();

    for (const [framework, paths] of Object.entries(FRAMEWORK_PATHS)) {
      const hasChanges = changedFiles.some((file) =>
        paths.some((frameworkPath) => file.startsWith(frameworkPath))
      );

      if (hasChanges) {
        changedFrameworks.add(framework);
      }
    }

    const availableFrameworks = Object.keys(APP_CONFIGS);
    const matchingFrameworks = Array.from(changedFrameworks).filter(
      (framework) =>
        availableFrameworks.some((available) => available.includes(framework))
    );

    if (matchingFrameworks.length === 0) {
      logger.logDebug("🔍 No framework changes detected, skipping E2E tests");
      return [];
    }

    logger.logDebug(
      `🔍 Detected changes in frameworks: ${matchingFrameworks.join(", ")}`
    );
    return matchingFrameworks;
  } catch (error) {
    logger.logWarning(
      `⚠️ Failed to detect changes, running all frameworks: ${
        (error as Error).message
      }`
    );
    return Object.keys(APP_CONFIGS);
  }
}

export function validateEnvironment(): void {
  try {
    const hasBetaKey = !!process.env.PARA_API_KEY_BETA;
    const hasSandboxKey = !!process.env.PARA_API_KEY_SANDBOX;

    if (!hasBetaKey && !hasSandboxKey) {
      throw new Error(
        "No API keys found. Please set PARA_API_KEY_BETA or PARA_API_KEY_SANDBOX in your .env file."
      );
    }

    // Check for both passkey/password & basic login keys
    const testEnv = getTestEnvironment();
    getTestEnvironment("BASIC_LOGIN");

    logger.logStep(
      `✓ Test environment validated: ${testEnv.environment}`,
      true
    );
  } catch (error) {
    logger.logError("❌ Environment validation failed:");
    logger.logError((error as Error).message);
    logger.logError(
      "\nPlease create a .env file based on .env.example and add your API keys."
    );
    process.exit(1);
  }
}
