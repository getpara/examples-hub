import { expect, describe, it } from 'vitest';

import {
  isAndroid,
  isIOS,
  isIOSWebview,
  isLargeIOS,
  isMobile,
  isMobileSafari,
  isSafari,
  isSmallIOS,
  isTablet,
  isTelegram,
} from '../../src/utils/isMobile.js';

describe('isMobile', () => {
  describe('isAndroid', () => {
    it('success', () => {
      global.navigator = {
        userAgent: 'android',
      } as any;

      const resp = isAndroid();
      expect(resp).toBeTruthy();
    });
    it('fail - no navigator', () => {
      global.navigator = undefined as any;

      const resp = isAndroid();
      expect(resp).toBeFalsy();
    });
    it('fail - incorrect useragent', () => {
      global.navigator = {
        userAgent: 'ios',
      } as any;

      const resp = isAndroid();
      expect(resp).toBeFalsy();
    });
  });
  describe('isSmallIOS', () => {
    it('success - iPhone', () => {
      global.navigator = {
        userAgent: 'iPhone',
      } as any;

      const resp = isSmallIOS();
      expect(resp).toBeTruthy();
    });
    it('success - iPod', () => {
      global.navigator = {
        userAgent: 'iPod',
      } as any;

      const resp = isSmallIOS();
      expect(resp).toBeTruthy();
    });
    it('fail - no navigator', () => {
      global.navigator = undefined as any;

      const resp = isSmallIOS();
      expect(resp).toBeFalsy();
    });
    it('fail - incorrect useragent', () => {
      global.navigator = {
        userAgent: 'android',
      } as any;

      const resp = isSmallIOS();
      expect(resp).toBeFalsy();
    });
  });
  describe('isLargeIOS', () => {
    it('success - iPad', () => {
      global.navigator = {
        userAgent: 'iPad',
      } as any;

      const resp = isLargeIOS();
      expect(resp).toBeTruthy();
    });
    it('success - intel chip', () => {
      global.navigator = {
        platform: 'MacIntel',
        maxTouchPoints: 2,
      } as any;

      const resp = isLargeIOS();
      expect(resp).toBeTruthy();
    });
    it('fail - no navigator', () => {
      global.navigator = undefined as any;

      const resp = isLargeIOS();
      expect(resp).toBeFalsy();
    });
    it('fail - incorrect useragent', () => {
      global.navigator = {
        userAgent: 'iPod',
      } as any;

      const resp = isLargeIOS();
      expect(resp).toBeFalsy();
    });
  });
  describe('isTablet', () => {
    it('success - tablet', () => {
      global.navigator = {
        userAgent: 'tablet',
      } as any;

      const resp = isTablet();
      expect(resp).toBeTruthy();
    });
    it('success - ipad', () => {
      global.navigator = {
        userAgent: 'ipad',
      } as any;

      const resp = isTablet();
      expect(resp).toBeTruthy();
    });
    it('fail - no navigator', () => {
      global.navigator = undefined as any;

      const resp = isTablet();
      expect(resp).toBeFalsy();
    });
    it('fail - incorrect useragent', () => {
      global.navigator = {
        userAgent: 'iPod',
      } as any;

      const resp = isTablet();
      expect(resp).toBeFalsy();
    });
  });
  describe('isIOS', () => {
    it('success - iPad', () => {
      global.navigator = {
        userAgent: 'iPad',
      } as any;

      const resp = isIOS();
      expect(resp).toBeTruthy();
    });
    it('success - intel chip', () => {
      global.navigator = {
        platform: 'MacIntel',
        maxTouchPoints: 2,
      } as any;

      const resp = isIOS();
      expect(resp).toBeTruthy();
    });
    it('fail - incorrect useragent', () => {
      global.navigator = {
        userAgent: 'android',
      } as any;

      const resp = isIOS();
      expect(resp).toBeFalsy();
    });
  });
  describe('isMobile', () => {
    it('success - iPad', () => {
      global.navigator = {
        userAgent: 'iPad',
      } as any;

      const resp = isMobile();
      expect(resp).toBeTruthy();
    });
    it('success - android', () => {
      global.navigator = {
        userAgent: 'android',
      } as any;

      const resp = isMobile();
      expect(resp).toBeTruthy();
    });
    it('fail - incorrect useragent', () => {
      global.navigator = {
        userAgent: 'windows',
      } as any;

      const resp = isIOS();
      expect(resp).toBeFalsy();
    });
  });
  describe('isSafari', () => {
    it('success', () => {
      global.navigator = {
        userAgent: 'AppleWebKit',
      } as any;

      const resp = isSafari();
      expect(resp).toBeTruthy();
    });
    it('fail - no navigator', () => {
      global.navigator = undefined as any;

      const resp = isSafari();
      expect(resp).toBeFalsy();
    });
    it('fail - incorrect useragent', () => {
      global.navigator = {
        userAgent: 'AppleWebKit Chrome',
      } as any;

      const resp = isSafari();
      expect(resp).toBeFalsy();
    });
  });
  describe('isIOSWebview', () => {
    it('success', () => {
      global.navigator = {
        userAgent: 'iPod',
        standalone: true,
      } as any;

      const resp = isIOSWebview();
      expect(resp).toBeTruthy();
    });
    it('fail - no navigator', () => {
      global.navigator = undefined as any;

      const resp = isIOSWebview();
      expect(resp).toBeFalsy();
    });
    it('fail - incorrect useragent', () => {
      global.navigator = {
        userAgent: 'iPad safari',
      } as any;

      const resp = isIOSWebview();
      expect(resp).toBeFalsy();
    });
    it('fail - not standalone', () => {
      global.navigator = {
        userAgent: 'iPad',
        standalone: false,
      } as any;

      const resp = isIOSWebview();
      expect(resp).toBeFalsy();
    });
  });
  describe('isMobileSafari', () => {
    it('success', () => {
      global.navigator = {
        userAgent: 'iPod AppleWebKit',
        standalone: true,
      } as any;

      const resp = isMobileSafari();
      expect(resp).toBeTruthy();
    });
    it('fail - incorrect useragent', () => {
      global.navigator = {
        userAgent: 'iPad AppleWebKit Chrome',
      } as any;

      const resp = isIOSWebview();
      expect(resp).toBeFalsy();
    });
  });
  describe('isTelegram', () => {
    it('success - TelegramWebviewProxy', () => {
      (global.window as any).TelegramWebviewProxy = true;

      const resp = isTelegram();
      expect(resp).toBeTruthy();
    });
    it('success - Telegram', () => {
      (global.window as any).TelegramWebviewProxy = false;
      (global.window as any).Telegram = true;

      const resp = isTelegram();
      expect(resp).toBeTruthy();
    });
    it('success - TelegramWebviewProxyProto', () => {
      (global.window as any).Telegram = false;
      (global.window as any).TelegramWebviewProxyProto = true;

      const resp = isTelegram();
      expect(resp).toBeTruthy();
    });
    it('fail - all false', () => {
      (global.window as any).TelegramWebviewProxyProto = false;

      const resp = isTelegram();
      expect(resp).toBeFalsy();
    });
    it('fail - no window', () => {
      global = { window: undefined } as any;

      const resp = isTelegram();
      expect(resp).toBeFalsy();
    });
  });
});
