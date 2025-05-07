/**
 * Validates a callback URL to ensure it's safe to redirect to.
 *
 * @param url The URL to validate
 * @returns boolean indicating if the URL is safe
 */
export function validateCallbackUrl(url: string | null): boolean {
  if (!url) return false;

  return /^(https?:\/\/|app:\/\/|capsule:\/\/|para:\/\/|[a-zA-Z0-9.-]+:\/\/)/.test(url);
}
