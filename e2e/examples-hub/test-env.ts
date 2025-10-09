// Hardcoded test environment for examples-hub e2e tests
// This file contains test credentials and should not be committed to public repos
export const TEST_ENV = {
  // Para API - Default for most tests
  PARA_API_KEY_BETA: 'beta_c61c45aec46dee3fe50d98125e9560cc',
  PARA_API_KEY_BASIC_LOGIN_BETA: 'beta_cc2d629fda0f065ea217ac6011a79d58',
  PARA_API_KEY_PIN_BETA: 'beta_4e394397b57fd5de9b047617cb2453b0',

  PARA_API_KEY_SANDBOX: 'your-actual-sandbox-api-key', // Add if you have a sandbox key
  PARA_API_KEY_BASIC_LOGIN_SANDBOX: 'your-actual-sandbox-api-key', // Add if you have a sandbox key
  PARA_API_KEY_PIN_SANDBOX: 'your-actual-sandbox-api-key', // Add if you have a sandbox key

  PARA_ENVIRONMENT: 'BETA',

  // Framework-specific API keys
  // Node test requires multi-wallet across chains functionality
  PARA_API_KEY_NODE_BETA: 'beta_d3ab80805be5249efce856ff416a6c28',
  PARA_API_KEY_NODE_OVERRIDE: 'beta_d3ab80805be5249efce856ff416a6c28',

  // Framework-specific (using default API keys)
  VITE_PARA_API_KEY: 'beta_c61c45aec46dee3fe50d98125e9560cc',
  VITE_PARA_API_KEY_BASIC_LOGIN: 'beta_cc2d629fda0f065ea217ac6011a79d58',
  VITE_PARA_API_KEY_PIN: 'beta_4e394397b57fd5de9b047617cb2453b0',
  VITE_PARA_ENVIRONMENT: 'BETA',
  NEXT_PUBLIC_PARA_API_KEY: 'beta_c61c45aec46dee3fe50d98125e9560cc',
  NEXT_PUBLIC_PARA_API_KEY_BASIC_LOGIN: 'beta_cc2d629fda0f065ea217ac6011a79d58',
  NEXT_PUBLIC_PARA_API_KEY_PIN: 'beta_4e394397b57fd5de9b047617cb2453b0',
  NEXT_PUBLIC_PARA_ENVIRONMENT: 'BETA',

  // Server examples (will be overridden for node framework)
  PARA_API_KEY: 'beta_c61c45aec46dee3fe50d98125e9560cc',
  ENCRYPTION_KEY: 'HWIiCkWhiWdV6B2gN4YiSVKuc78Dwiq8',

  // Third-party services
  VITE_WALLET_CONNECT_PROJECT_ID: '315ba0552a42b4c469647d044a88d63a',
  NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID: '315ba0552a42b4c469647d044a88d63a',

  // Smart wallet configs
  ALCHEMY_API_KEY: 'BTgNe-maEQK09iDUTOguZ',
  ALCHEMY_GAS_POLICY_ID: '4fc5beab-0966-4c38-8601-2944a1d8ff26',
  ALCHEMY_RPC_URL: 'https://arb-sepolia.g.alchemy.com/v2/BTgNe-maEQK09iDUTOguZ',
  ALCHEMY_ARBITRUM_SEPOLIA_RPC: 'https://arb-sepolia.g.alchemy.com/v2/BTgNe-maEQK09iDUTOguZ',
  ZERODEV_PROJECT_ID: 'd992b007-4c97-4b36-a388-f2311f42f921',
  ZERODEV_BUNDLER_RPC: 'https://rpc.zerodev.app/api/v3/d992b007-4c97-4b36-a388-f2311f42f921/chain/421614',
  ZERODEV_PAYMASTER_RPC: 'https://rpc.zerodev.app/api/v3/d992b007-4c97-4b36-a388-f2311f42f921/chain/421614',
  ZERODEV_SECRET_KEY: 'b575bbee-ce31-4bed-b88b-c5d249cf8763',
  ZERODEV_ARBITRUM_SEPOLIA_RPC: 'https://rpc.zerodev.app/api/v3/d992b007-4c97-4b36-a388-f2311f42f921/chain/421614',

  // Node options
  NODE_OPTIONS: '--max-old-space-size=4096',
};
