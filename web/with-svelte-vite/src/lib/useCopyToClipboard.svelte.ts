export type CopyStatus = "idle" | "copied" | "failed";

export function useCopyToClipboard(resetAfterMs = 1500) {
  let status = $state<CopyStatus>("idle");
  let resetTimer: ReturnType<typeof setTimeout> | null = null;

  $effect(() => () => {
    if (resetTimer) {
      clearTimeout(resetTimer);
    }
  });

  async function copy(text: string) {
    let nextStatus: CopyStatus = "copied";

    try {
      await navigator.clipboard.writeText(text);
    } catch {
      nextStatus = "failed";
    }

    status = nextStatus;

    if (resetTimer) {
      clearTimeout(resetTimer);
    }

    resetTimer = setTimeout(() => (status = "idle"), resetAfterMs);
  }

  return {
    copy,
    get status() {
      return status;
    },
  };
}
