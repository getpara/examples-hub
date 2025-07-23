import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  timeout: 60000,
  testDir: `../e2e/tests/${process.env.E2E_APP_DIR}`,
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: [["html"]],
  use: {
    baseURL: `http://localhost:${process.env.APP_PORT}`,
    headless: true,
    trace: "retain-on-failure",
    video: "retain-on-failure",
    storageState: { cookies: [], origins: [] },
    launchOptions: {
      args: [
        "--disable-background-timer-throttling",
        "--disable-backgrounding-occluded-windows",
        "--disable-renderer-backgrounding",
        "--disable-features=TranslateUI",
        "--disable-ipc-flooding-protection",
        "--disable-web-security",
        "--disable-features=VizDisplayCompositor",
        "--no-first-run",
        "--disable-default-apps",
        "--disable-sync",
      ],
    },
  },

  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],

  webServer: process.env.APP_START_COMMAND
    ? [
        {
          command: process.env.APP_START_COMMAND,
          url: `http://localhost:${process.env.APP_PORT}`,
          reuseExistingServer: !process.env.CI,
          timeout: 240 * 1000,
          stdout: "pipe",
          stderr: "pipe",
          cwd: process.env.E2E_APP_FULL_PATH,
        },
      ]
    : undefined,
});
