import { defineConfig, devices } from '@playwright/test';
import * as path from 'path';

const SUITE = process.env.STRESS_TEST_SUITE || 'all';
const PORT = process.env.STRESS_TEST_PORT || '3003';
const ITERATION = process.env.ITERATION_ID || '1';
const TIMESTAMP = process.env.TEST_TIMESTAMP || new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);

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

const getBlobFileName = (): string => {
  const paddedIteration = ITERATION.padStart(2, '0');
  return `report-${SUITE}-${TIMESTAMP}-iter-${paddedIteration}.zip`;
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
  forbidOnly: !!process.env.CI,

  reporter: [['blob', { outputFile: path.join(process.cwd(), 'blob-report', getBlobFileName()) }], ['list']],

  use: {
    baseURL: `http://localhost:${PORT}`,
    actionTimeout: 15000,
    navigationTimeout: 30000,
    headless: process.env.HEADLESS === 'true' || process.env.CI === 'true',
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
