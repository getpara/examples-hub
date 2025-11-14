import { defineConfig, devices } from '@playwright/test';

const PORT = process.env.EXTERNAL_WALLET_PORT || '3003';

/**
 * Playwright configuration for external wallet E2E tests.
 *
 * This test suite verifies Para's integration with external wallets like MetaMask.
 * Uses Synpress for MetaMask automation and browser extension testing.
 *
 * Environment Variables:
 * - EXTERNAL_WALLET_PORT: Port for the test app (default: 3003)
 * - CI: Set to 'true' for CI environments
 *
 * Test Server:
 * - Type: Next.js (production server: yarn build && yarn start)
 * - Location: examples/para-modal-stress-testing
 * - Port: 3003 (configurable via EXTERNAL_WALLET_PORT)
 * - Binding: Next.js binds to 0.0.0.0 by default (accessible via 127.0.0.1)
 * - Auto-started via webServer configuration
 *
 * Requirements:
 * - Packages must be built: yarn build
 * - MetaMask extension cache must be generated first: yarn e2e:cache-wallets
 * - Headed mode required (MetaMask extension doesn't work in headless)
 *
 * Default Behavior:
 * - Sequential execution (workers: 1, required for Synpress)
 * - 2 retries in CI, 0 locally
 * - Headed mode (always, MetaMask requirement)
 * - HTML + list reporter
 * - Reuses existing server locally, restarts in CI
 */
export default defineConfig({
  testDir: './specs',
  testMatch: '**/*.spec.ts',
  timeout: 300000,
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 2 : 0,
  forbidOnly: !!process.env.CI,
  reporter: [['html', { open: 'never' }], ['list']],
  use: {
    baseURL: `http://127.0.0.1:${PORT}`,
    headless: false, // MetaMask requires headed mode
    viewport: { width: 1280, height: 720 },
    permissions: ['clipboard-write', 'clipboard-read'],
    trace: { mode: 'retain-on-failure' },
    video: { mode: 'retain-on-failure' },
    screenshot: 'only-on-failure',
    actionTimeout: 30000,
  },
  projects: [
    {
      name: 'chromium-metamask',
      use: {
        ...devices['Desktop Chrome'],
      },
    },
  ],
  webServer: {
    command: 'yarn build && yarn start',
    url: `http://127.0.0.1:${PORT}`,
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
    cwd: '../../examples/para-modal-stress-testing',
    stdout: 'pipe',
    stderr: 'pipe',
    env: {
      PORT: PORT,
    },
  },
  expect: {
    timeout: 15000,
  },
});
