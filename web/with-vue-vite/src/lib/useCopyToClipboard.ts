import { onScopeDispose, ref } from "vue";

export type CopyStatus = "idle" | "copied" | "failed";

export function useCopyToClipboard(resetAfterMs = 1500) {
  const status = ref<CopyStatus>("idle");
  let resetTimer: ReturnType<typeof setTimeout> | null = null;

  onScopeDispose(() => {
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

    status.value = nextStatus;

    if (resetTimer) {
      clearTimeout(resetTimer);
    }

    resetTimer = setTimeout(() => {
      status.value = "idle";
    }, resetAfterMs);
  }

  return { copy, status };
}
