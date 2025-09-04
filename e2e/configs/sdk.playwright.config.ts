import { defineConfig } from '@playwright/test';
import { baseConfig } from './playwright.base.config';

/**
 * Playwright configuration for SDK integration tests.
 * Tests the core SDK functionality in a sandbox environment.
 */
export default defineConfig({
  ...baseConfig,
  timeout: 120000,
  testDir: '../tests',
  workers: undefined,
  use: {
    ...baseConfig.use,
    baseURL: 'http://127.0.0.1:3002',
  },

  projects: baseConfig.projects,

  webServer: {
    command: 'yarn start-e2e',
    url: 'http://127.0.0.1:3002',
    reuseExistingServer: true,
    timeout: 240 * 1000,
  },
});
