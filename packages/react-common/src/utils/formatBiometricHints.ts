import { BiometricLocationHint } from '@usecapsule/user-management-client';
import UAParser from 'ua-parser-js';
import { aaguidMetadata } from '../constants/aaguiMetadata.js';

type FormattedBiometricHint = {
  passwordManager?: string;
  isMobile: boolean;
  isKnownDevice: boolean;
  key: string;
} & (UAParser.IResult | undefined);

export type BiometricHints = {
  hasMobileDevice: boolean;
  isOnKnownDevice: boolean;
  formattedHints: FormattedBiometricHint[];
};

const formatStringToUUID = (str): string => {
  // Check if the string has a valid length
  if (str.length !== 32) {
    return undefined;
  }

  // Insert hyphens
  return `${str.slice(0, 8)}-${str.slice(8, 12)}-${str.slice(12, 16)}-${str.slice(16, 20)}-${str.slice(20)}`;
};

export const formatBiometricHints = (hints: BiometricLocationHint[]): BiometricHints => {
  let hasMobileDevice = false,
    isOnKnownDevice = false;

  const deviceParsedUA = new UAParser().getResult();

  const formattedHintsByKey: Record<string, FormattedBiometricHint> = {};

  hints?.forEach(hint => {
    let isMobile = false,
      isKnownDevice = false,
      passwordManager: string | undefined,
      parsedUA: UAParser.IResult | undefined,
      key = '';

    if (hint.useragent) {
      parsedUA = new UAParser(hint.useragent).getResult();

      if (parsedUA.device.type === 'mobile' || parsedUA.device.type === 'tablet') {
        isMobile = true;
        hasMobileDevice = true;
      }

      if (deviceParsedUA) {
        if (
          deviceParsedUA.browser.name === parsedUA.browser.name &&
          deviceParsedUA.device.type === parsedUA.device.type &&
          deviceParsedUA.device.vendor === parsedUA.device.vendor &&
          deviceParsedUA.device.model === parsedUA.device.model
        ) {
          isOnKnownDevice = true;
          isKnownDevice = true;
        }
      }

      key = `${parsedUA?.browser.name}-${parsedUA?.device.type}-${parsedUA?.device.vendor}-${parsedUA?.device.model}`;
    }

    if (hint.aaguid) {
      const formattedAaguid = formatStringToUUID(hint.aaguid);
      if (formattedAaguid) {
        passwordManager = aaguidMetadata[formattedAaguid]?.name;
      }

      key = `${key}${key ? '-' : ''}${passwordManager}`;
    }

    formattedHintsByKey[key] = { passwordManager, isMobile, isKnownDevice, key, ...parsedUA };
  });

  return {
    hasMobileDevice,
    isOnKnownDevice,
    formattedHints: Object.values(formattedHintsByKey),
  };
};
