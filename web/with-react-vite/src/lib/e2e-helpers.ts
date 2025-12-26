/**
 * Internal - E2E testing utilities only.
 * This file exposes helpers for automated testing and can be safely deleted
 * in production deployments.
 */

import { useEffect } from "react";
import type Para from "@getpara/web-sdk";

declare global {
  interface Window {
    para?: Para;
    __deleteTestUser?: () => Promise<void>;
  }
}

export function useE2ECleanup(para: Para | null | undefined) {
  useEffect(() => {
    if (import.meta.env.MODE !== "development" || !para) {
      return;
    }

    // Expose para client for test verification
    window.para = para;

    // Expose cleanup function for E2E tests
    window.__deleteTestUser = async () => {
      if (para?.userId) {
        try {
          await para.ctx.client.deleteSelf(para.userId);
        } catch (error: unknown) {
          const message = error instanceof Error ? error.message : "Unknown error";
          console.error("[E2E Cleanup] Failed to delete test user:", message);
          throw error;
        }
      }
    };

    return () => {
      delete window.__deleteTestUser;
      delete window.para;
    };
  }, [para]);
}
