import { Ctx, getPortalBaseURL } from '@getpara/web-sdk';

export const validatePortalOrigin = (event: MessageEvent, paraCtx: Ctx) => {
  const portalBase = getPortalBaseURL(paraCtx);
  const portalLocalBase = getPortalBaseURL(paraCtx, true);

  if (event.origin !== portalBase && event.origin !== portalLocalBase) {
    return false; // Ignore messages from untrusted origins
  }
  return true;
};
