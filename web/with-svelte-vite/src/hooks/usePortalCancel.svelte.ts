import { getPortalBaseURL } from "@getpara/web-sdk";
import { para } from "@/lib/para";

interface PortalMessage {
  type?: string;
  success?: boolean;
}

export function usePortalCancel(isVerifying: () => boolean, onCancel: () => void) {
  const portalOrigin = new URL(getPortalBaseURL(para.ctx)).origin;

  $effect(() => {
    if (!isVerifying()) {
      return;
    }

    const handleMessage = (event: MessageEvent<PortalMessage | null>) => {
      if (event.origin === portalOrigin && event.data?.type === "CLOSE_WINDOW" && !event.data.success) {
        onCancel();
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  });
}
