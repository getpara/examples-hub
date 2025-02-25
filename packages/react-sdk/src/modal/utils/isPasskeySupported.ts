import { detect } from 'detect-browser';

export const isPasskeySupported = (): boolean => {
  const browser = detect();

  switch (browser?.os) {
    case 'linux':
    case 'Chrome OS':
      return false;
  }

  return true;
};
