import { defineConfig, devices } from '@playwright/test';

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  timeout: 120000,
  testDir: `../e2e/tests/${process.env.E2E_APP_DIR}`,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: undefined,
  reporter: [['html']],
  use: {
    baseURL: `http://localhost:${process.env.APP_PORT}`,

    trace: 'retain-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },

    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },

    /* Test against mobile viewports. */
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
    // {
    //   name: 'Mobile Safari',
    //   use: { ...devices['iPhone 12'] },
    // },

    /* Test against branded browsers. */
    // {
    //   name: 'Microsoft Edge',
    //   use: { ...devices['Desktop Edge'], channel: 'msedge' },
    // },
    // {
    //   name: 'Google Chrome',
    //   use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    // },
  ],

  webServer: [
    // {
    //   command: `yarn start-e2e-portal`,
    //   url: 'http://localhost:3003',
    //   reuseExistingServer: !process.env.CI,
    //   timeout: 240 * 1000,
    // },
    {
      command: `cd ../${process.env.E2E_APP_DIR} && ${process.env.APP_START_COMMAND}`,
      url: `http://localhost:${process.env.APP_PORT}`,
      reuseExistingServer: !process.env.CI,
      timeout: 240 * 1000,
    },
  ],
});
