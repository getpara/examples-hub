let originalNavigator: Navigator | undefined;

type MobileType = 'android' | 'ios' | 'ipad';

const USER_AGENTS: Record<MobileType, string> = {
  android:
    'Mozilla/5.0 (Linux; Android 11; Pixel 5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.91 Mobile Safari/537.36',
  ios: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0.3 Mobile/15E148 Safari/604.1',
  ipad: 'Mozilla/5.0 (iPad; CPU OS 14_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1',
};

const getPlatform = (mobileType: MobileType): string => (mobileType === 'ipad' ? 'MacIntel' : 'iPhone');

const getMaxTouchPoints = (mobileType: MobileType): number => (mobileType === 'ipad' ? 5 : 1);

export const mockMobileNavigator = (mobileType: MobileType): void => {
  originalNavigator = window.navigator;

  const mockNavigator: Navigator = {
    ...originalNavigator,
    userAgent: USER_AGENTS[mobileType],
    platform: getPlatform(mobileType),
    maxTouchPoints: getMaxTouchPoints(mobileType),
  };

  Object.defineProperty(window, 'navigator', {
    value: mockNavigator,
    configurable: true,
    writable: true,
  });
};

export const restoreNavigator = (): void => {
  if (originalNavigator) {
    Object.defineProperty(window, 'navigator', {
      value: originalNavigator,
      configurable: true,
      writable: true,
    });
    originalNavigator = undefined;
  }
};
