/**
 * Strips protocol from url
 */
export const cleanUrl = (url: string) => url.replace(/^https?:\/\//, '');
