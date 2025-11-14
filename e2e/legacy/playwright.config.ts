import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright configuration for legacy example E2E tests.
 *
 * This test suite verifies the SDK integration using the legacy-example app.
 * Tests core SDK functionality including authentication, signing, and wagmi integration.
 *
 * Environment Variables:
 * - CI: Set to 'true' for CI environments
 *
 * Test Servers:
 * - Server 1 (Legacy Example):
 *   - Type: Vite (production server: yarn build && yarn preview)
 *   - Location: examples/legacy-example
 *   - Port: 3002
 *   - Binding: Uses --host flag to bind to 0.0.0.0 (required for 127.0.0.1 access)
 * - Server 2 (Para Portal):
 *   - Type: Vite (production server: yarn build && yarn preview)
 *   - Location: sites/portal
 *   - Port: 3003
 *   - Binding: Uses --host flag to bind to 0.0.0.0 (required for 127.0.0.1 access)
 * - Both auto-started via webServer configuration
 *
 * Requirements:
 * - Packages must be built: yarn build
 *
 * Default Behavior:
 * - Parallel execution (multiple workers)
 * - 2 retries in CI, 0 locally
 * - Headless mode
 * - HTML + list reporter
 * - Reuses existing servers if already running (locally)
 */
export default defineConfig({
  testDir: './specs',
  testMatch: '**/*.spec.ts',
  timeout: 120000,
  fullyParallel: true,
  workers: undefined,
  retries: process.env.CI ? 2 : 0,
  forbidOnly: !!process.env.CI,
  reporter: [['html', { open: 'never' }], ['list']],
  use: {
    baseURL: 'http://127.0.0.1:3002',
    trace: 'retain-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  webServer: [
    {
      command: 'yarn build && yarn preview --port 3002 --host',
      url: 'http://127.0.0.1:3002',
      reuseExistingServer: !process.env.CI,
      timeout: 240 * 1000,
      cwd: '../../examples/legacy-example',
      stdout: 'pipe',
      stderr: 'pipe',
      env: {
        VITE_APP_IS_E2E: 'true',
      },
    },
    {
      command: 'yarn build && yarn preview --port 3003 --host',
      url: 'http://127.0.0.1:3003',
      reuseExistingServer: !process.env.CI,
      timeout: 240 * 1000,
      cwd: '../../sites/portal',
      stdout: 'pipe',
      stderr: 'pipe',
      env: {
        DISABLE_ESLINT_PLUGIN: 'true',
        VITE_IS_E2E: 'true',
        VITE_ENVIRONMENT: 'sandbox',
        VITE_CAPSULE_API_KEY: '7a455d14ff0128658ef9d224140a9ff2',
      },
    },
  ],
});
