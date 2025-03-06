import { UAParser } from 'ua-parser-js';

export const isPasskeySupported = (userAgent?: string): boolean => {
  const osName = new UAParser(userAgent).getOS().name?.toLowerCase();
  return !!osName && !['linux', 'chrome os'].includes(osName);
};
