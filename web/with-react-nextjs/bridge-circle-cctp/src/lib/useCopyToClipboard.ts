import { useCallback, useEffect, useRef, useState } from "react";

export type CopyStatus = "idle" | "copied" | "failed";

export function useCopyToClipboard(resetAfterMs = 1500) {
  const [status, setStatus] = useState<CopyStatus>("idle");
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (resetTimer.current) {
        clearTimeout(resetTimer.current);
      }
    },
    []
  );

  const copy = useCallback(
    async (text: string) => {
      let nextStatus: CopyStatus = "copied";

      try {
        await navigator.clipboard.writeText(text);
      } catch {
        nextStatus = "failed";
      }

      setStatus(nextStatus);

      if (resetTimer.current) {
        clearTimeout(resetTimer.current);
      }

      resetTimer.current = setTimeout(() => setStatus("idle"), resetAfterMs);
    },
    [resetAfterMs]
  );

  return { copy, status };
}
