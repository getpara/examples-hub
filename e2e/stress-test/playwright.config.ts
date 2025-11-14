import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright configuration for stress testing Para Modal.
 *
 * This test suite runs repeated iterations of authentication flows to verify
 * stability under various network conditions and configurations.
 *
 * Environment Variables:
 * - STRESS_TEST_ITERATIONS: Number of times to repeat each test (default: 10)
 * - STRESS_TEST_NETWORK: Network throttling profile - 'slow-3g', 'fast-3g', 'slow-4g', 'cable', 'none' (default: slow-3g)
 * - STRESS_TEST_JITTER: Enable useEffect race condition testing - 'true' or 'false' (default: false)
 * - STRESS_TEST_SUITE: Test suite to run - 'all', 'email-passkey', 'email-password' (default: all)
 * - STRESS_TEST_PORT: Port for test server (default: 3003)
 * - HEADLESS: Run in headless mode (default: true, set to 'false' for headed mode)
 * - CI: Set to 'true' for CI environments
 *
 * Test Server:
 * - Type: Next.js (dev server: yarn dev, production: yarn build && yarn start)
 * - Location: examples/para-modal-stress-testing
 * - Port: 3003 (configurable via STRESS_TEST_PORT)
 * - Binding: Next.js binds to 0.0.0.0 by default (accessible via 127.0.0.1)
 * - Auto-built and started via webServer configuration
 *
 * Requirements:
 * - Packages must be built: yarn build
 *
 * Reporting:
 * - Uses blob reporter to accumulate results from all iterations
 * - After tests complete, run `playwright merge-reports --reporter html ./blob-report` to generate HTML report
 * - The e2e:stress-test command does this automatically
 * - Clean blob reports with: yarn e2e:stress-test:clean
 *
 * Default Behavior:
 * - 10 iterations per test (via repeatEach)
 * - slow-3g network throttling (applied via CDP in tests)
 * - All test suites
 * - Headless mode (default: true)
 * - Blob + list reporter (merged to HTML after completion)
 */

const ITERATIONS = parseInt(process.env.STRESS_TEST_ITERATIONS || '1', 10);
const JITTER = process.env.STRESS_TEST_JITTER === 'true';
const SUITE = process.env.STRESS_TEST_SUITE || 'all';
const PORT = process.env.STRESS_TEST_PORT || '3003';
const HEADLESS = process.env.HEADLESS !== 'false'; // Default to true (headless), only false if explicitly set to 'false'

const getTestMatch = (): string => {
  switch (SUITE) {
    case 'email-passkey':
      return '**/specs/email-passkey.spec.ts';
    case 'email-password':
      return '**/specs/email-password.spec.ts';
    default:
      return '**/specs/*.spec.ts';
  }
};

export default defineConfig({
  testDir: __dirname,
  testMatch: getTestMatch(),
  timeout: 180000,
  expect: {
    timeout: 45000,
  },
  fullyParallel: false,
  workers: 1,
  retries: 0,
  repeatEach: ITERATIONS,
  forbidOnly: !!process.env.CI,
  reporter: [['blob', { outputDir: 'blob-report' }], ['list']],
  webServer: {
    command: 'yarn build && yarn start',
    url: `http://127.0.0.1:${PORT}`,
    timeout: 120000,
    reuseExistingServer: !process.env.CI,
    cwd: '../../examples/para-modal-stress-testing',
    stdout: 'pipe',
    stderr: 'pipe',
    env: {
      STRESS_TEST_JITTER: JITTER.toString(),
      PORT: PORT,
    },
  },
  use: {
    baseURL: `http://127.0.0.1:${PORT}`,
    actionTimeout: 15000,
    navigationTimeout: 30000,
    headless: HEADLESS,
    storageState: { cookies: [], origins: [] },
    bypassCSP: true,
    ignoreHTTPSErrors: true,
    permissions: ['clipboard-read', 'clipboard-write'],
    video: 'retain-on-failure',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 720 },
        userAgent:
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
        launchOptions: {
          args: [
            '--disable-background-timer-throttling',
            '--no-sandbox',
            '--disable-web-security',
            '--enable-features=WebAuthenticationAPI',
          ],
        },
      },
    },
  ],
});
