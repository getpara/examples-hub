import { useCallback } from "react";
import { useClient } from "@getpara/react-sdk-lite";

export function useSessionExport() {
  const para = useClient();

  const exportSession = useCallback(async () => {
    if (!para) {
      throw new Error("Para is not ready. Please reconnect your wallet.");
    }

    return para.waitAndExportSession();
  }, [para]);

  return {
    exportSession,
    isReady: Boolean(para),
  };
}
