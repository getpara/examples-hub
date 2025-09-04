import { defineConfig, devices, PlaywrightTestConfig } from '@playwright/test';

/**
 * Base configuration for all Playwright tests.
 * This config contains shared settings used by both SDK and example tests.
 */
export const baseConfig: PlaywrightTestConfig = {
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: [['html']],
  use: {
    trace: { mode: 'retain-on-failure' },
    video: { mode: 'retain-on-failure' },
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
};

export default defineConfig(baseConfig);
