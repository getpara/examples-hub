import { toValue, watch, type MaybeRefOrGetter } from "vue";
import { getPortalBaseURL } from "@getpara/web-sdk";
import { para } from "@/lib/para";

interface PortalMessage {
  type?: string;
  success?: boolean;
}

export function usePortalCancel(isVerifying: MaybeRefOrGetter<boolean>, onCancel: () => void) {
  const portalOrigin = new URL(getPortalBaseURL(para.ctx)).origin;

  function handleMessage(event: MessageEvent<PortalMessage | null>) {
    if (event.origin === portalOrigin && event.data?.type === "CLOSE_WINDOW" && !event.data.success) {
      onCancel();
    }
  }

  watch(
    () => toValue(isVerifying),
    (verifying, _previous, onCleanup) => {
      if (!verifying) {
        return;
      }

      window.addEventListener("message", handleMessage);
      onCleanup(() => window.removeEventListener("message", handleMessage));
    },
    { immediate: true }
  );
}
