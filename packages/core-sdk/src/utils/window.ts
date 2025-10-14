import { Ctx, Environment } from '../types/index.js';
import { getPortalBaseURL } from './url.js';

export function isPortal(ctx: Ctx, env?: Environment) {
  if (typeof window === 'undefined') return false;

  // Check if we're running on the portal domain
  const normalizedUrl = window.location?.host?.replace('getpara', 'usecapsule');
  const isOnPortalDomain = getPortalBaseURL(env ? { env } : ctx).includes(normalizedUrl);

  if (!isOnPortalDomain) return false;

  // If we're on the portal domain, check if we're in an iframe, popup, or direct access
  // In a popup: window.opener exists, window.parent === window
  // In an iframe: window.parent exists and !== window, window.opener is null
  // Direct access: both window.opener and window.parent are undefined (copied link)
  const isInIframe = window.parent !== window && !window.opener;
  const isInPopup = window.opener && window.parent === window;
  const isDirectAccess = window.parent === window && !window.opener;

  return isInIframe || isInPopup || isDirectAccess;
}
