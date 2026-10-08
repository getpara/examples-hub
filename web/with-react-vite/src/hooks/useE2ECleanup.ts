import { useEffect } from "react";
import type Para from "@getpara/react-sdk";

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

    window.para = para;

    window.__deleteTestUser = async () => {
      if (para?.userId) {
        try {
          await para.ctx.client.deleteSelf(para.userId);
        } catch (error) {
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
