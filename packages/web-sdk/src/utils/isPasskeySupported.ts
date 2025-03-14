import { UAParser } from 'ua-parser-js';

export const isPasskeySupported = async (userAgent?: string): Promise<boolean> => {
  const directPasskeyCheck = await window?.PublicKeyCredential?.isUserVerifyingPlatformAuthenticatorAvailable?.();
  if (directPasskeyCheck === true || directPasskeyCheck === false) {
    return directPasskeyCheck;
  }

  // fallback to OS check if direct check returns undefined
  const osName = new UAParser(userAgent).getOS().name?.toLowerCase();
  return !!osName && !['linux', 'chrome os'].includes(osName);
};
