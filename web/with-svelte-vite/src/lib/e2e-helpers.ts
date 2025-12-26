import { para } from "./para";

declare global {
  interface Window {
    para?: typeof para;
    __deleteTestUser?: () => Promise<void>;
  }
}

/**
 * Initialize E2E testing helpers in development mode.
 * Exposes para client and test utilities on window object.
 */
export function initE2EHelpers(): void {
  if (import.meta.env.MODE !== "development") {
    return;
  }

  // Expose para client for E2E tests
  window.para = para;

  // Expose test user cleanup function
  window.__deleteTestUser = async () => {
    try {
      const isLoggedIn = await para.isFullyLoggedIn();
      if (isLoggedIn) {
        await para.logout();
      }
    } catch (error) {
      console.error("Failed to delete test user:", error);
    }
  };
}
