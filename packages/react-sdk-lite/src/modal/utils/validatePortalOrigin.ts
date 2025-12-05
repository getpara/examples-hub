import { Ctx, getPortalBaseURL } from '@getpara/web-sdk';

export const validatePortalOrigin = (event: MessageEvent, paraCtx: Ctx) => {
  const portalBase = getPortalBaseURL(paraCtx);
  const portalLocalBase = getPortalBaseURL(paraCtx, true);

  // normalize the event origin to getpara
  const normalizedOrigin = event.origin.replace('usecapsule', 'getpara');

  if (normalizedOrigin !== portalBase && normalizedOrigin !== portalLocalBase) {
    return false; // Ignore messages from untrusted origins
  }
  return true;
};
