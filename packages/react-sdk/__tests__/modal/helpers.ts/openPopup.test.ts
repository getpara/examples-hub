import { describe, expect, it, vi, afterEach, beforeEach } from 'vitest';
import { openPopup } from '../../../src/modal/utils/openPopup';

const WINDOW_INNER_HEIGHT = 1000;
const WINDOW_INNER_WIDTH = 1000;

const mockWindowOpen = vi.fn(url => ({
  location: {
    href: url,
  },
}));
const documentElementMockValue = {
  clientWidth: WINDOW_INNER_HEIGHT,
  clientHeight: WINDOW_INNER_WIDTH,
};
const windowMockValue = {
  crypto: crypto,
  location: {
    href: 'http://localhost',
  },
  open: mockWindowOpen,
  innerWidth: WINDOW_INNER_HEIGHT,
  innerHeight: WINDOW_INNER_WIDTH,
  screenX: 0,
  screenY: 0,
  PublicKeyCredential: {
    isUserVerifyingPlatformAuthenticatorAvailable: vi.fn(),
  },
};

Object.defineProperty(globalThis, 'window', {
  value: windowMockValue,
  configurable: true,
});
Object.defineProperty(globalThis, 'document', {
  value: { documentElement: documentElementMockValue },
  configurable: true,
});
Object.defineProperty(globalThis, 'screen', {
  value: {
    width: WINDOW_INNER_HEIGHT,
    height: WINDOW_INNER_WIDTH,
  },
  configurable: true,
});

const URL = 'https://test.com';
const TARGET = '_blank';
let popUpHeight = 0;
let popUpWidth = 560;

describe('openPopup', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('no window', () => {
    Object.defineProperty(globalThis, 'window', {
      value: undefined,
      configurable: true,
    });
    expect(openPopup({ url: URL, target: TARGET, type: 'LOGIN_PASSKEY' })).toBeNull();
    Object.defineProperty(globalThis, 'window', {
      value: windowMockValue,
      configurable: true,
    });
  });
  describe('LOGIN_PASSKEY', () => {
    it('no delay', () => {
      Object.defineProperty(globalThis, 'window', {
        value: windowMockValue,
        configurable: true,
      });

      const resp = openPopup({ url: URL, target: TARGET, type: 'LOGIN_PASSKEY' });
      popUpHeight = 798;

      expect(resp.location.href).toBe(URL);
      expect(mockWindowOpen).toBeCalledTimes(1);
      expect(mockWindowOpen).toBeCalledWith(
        URL,
        TARGET,
        // The string needs to stay in this format
        `toolbar=no, menubar=no, width=${popUpWidth}, 
    height=${popUpHeight}, top=${(WINDOW_INNER_HEIGHT - popUpHeight) / 2}, left=${(WINDOW_INNER_WIDTH - popUpWidth) / 2}`,
      );
    });
    it('delay', () => {
      mockWindowOpen.mockReturnValueOnce(undefined as any);

      const resp = openPopup({ url: URL, target: TARGET, type: 'LOGIN_PASSKEY' });

      vi.advanceTimersByTime(1000);

      expect(resp).toBeNull();
      expect(mockWindowOpen).toBeCalledTimes(2);
      expect(mockWindowOpen).toBeCalledWith(
        URL,
        TARGET,
        // The string needs to stay in this format
        `toolbar=no, menubar=no, width=${popUpWidth}, 
    height=${popUpHeight}, top=${(WINDOW_INNER_HEIGHT - popUpHeight) / 2}, left=${(WINDOW_INNER_WIDTH - popUpWidth) / 2}`,
      );
      expect(mockWindowOpen).toBeCalledWith(URL, '_blank');
    });
    it('dual monitor', () => {
      Object.defineProperty(globalThis, 'window', {
        value: {
          ...windowMockValue,
          screenLeft: 100,
          screenTop: 100,
        },
        configurable: true,
      });

      const resp = openPopup({ url: URL, target: TARGET, type: 'LOGIN_PASSKEY' });
      popUpHeight = 798;

      expect(resp.location.href).toBe(URL);
      expect(mockWindowOpen).toBeCalledTimes(1);
      expect(mockWindowOpen).toBeCalledWith(
        URL,
        TARGET,
        `toolbar=no, menubar=no, width=${popUpWidth}, 
    height=${popUpHeight}, top=${(WINDOW_INNER_HEIGHT - popUpHeight) / 2 + 100}, left=${(WINDOW_INNER_WIDTH - popUpWidth) / 2 + 100}`,
      );

      Object.defineProperty(globalThis, 'window', {
        value: windowMockValue,
        configurable: true,
      });
    });
    it('use document', () => {
      Object.defineProperty(globalThis, 'window', {
        value: {
          ...windowMockValue,
          innerWidth: undefined,
          innerHeight: undefined,
        },
        configurable: true,
      });

      const resp = openPopup({ url: URL, target: TARGET, type: 'LOGIN_PASSKEY' });
      popUpHeight = 798;

      expect(resp.location.href).toBe(URL);
      expect(mockWindowOpen).toBeCalledTimes(1);
      expect(mockWindowOpen).toBeCalledWith(
        URL,
        TARGET,
        `toolbar=no, menubar=no, width=${popUpWidth}, 
    height=${popUpHeight}, top=${(WINDOW_INNER_HEIGHT - popUpHeight) / 2}, left=${(WINDOW_INNER_WIDTH - popUpWidth) / 2}`,
      );

      Object.defineProperty(globalThis, 'window', {
        value: windowMockValue,
        configurable: true,
      });
    });
    it('use screen', () => {
      Object.defineProperty(globalThis, 'window', {
        value: {
          ...windowMockValue,
          innerWidth: undefined,
          innerHeight: undefined,
        },
        configurable: true,
      });
      Object.defineProperty(globalThis, 'document', {
        value: {
          documentElement: {
            clientWidth: undefined,
            clientHeight: undefined,
          },
        },
        configurable: true,
      });

      const resp = openPopup({ url: URL, target: TARGET, type: 'LOGIN_PASSKEY' });
      popUpHeight = 798;

      expect(resp.location.href).toBe(URL);
      expect(mockWindowOpen).toBeCalledTimes(1);
      expect(mockWindowOpen).toBeCalledWith(
        URL,
        TARGET,
        `toolbar=no, menubar=no, width=${popUpWidth}, 
    height=${popUpHeight}, top=${(WINDOW_INNER_HEIGHT - popUpHeight) / 2}, left=${(WINDOW_INNER_WIDTH - popUpWidth) / 2}`,
      );

      Object.defineProperty(globalThis, 'window', {
        value: windowMockValue,
        configurable: true,
      });
      Object.defineProperty(globalThis, 'document', {
        value: { documentElement: documentElementMockValue },
        configurable: true,
      });
    });
  });
  it('LOGIN_PASSWORD', () => {
    const resp = openPopup({ url: URL, target: TARGET, type: 'LOGIN_PASSWORD' });
    popUpHeight = 460;

    expect(resp.location.href).toBe(URL);
    expect(mockWindowOpen).toBeCalledTimes(1);
    expect(mockWindowOpen).toBeCalledWith(
      URL,
      TARGET,
      `toolbar=no, menubar=no, width=${popUpWidth}, 
    height=${popUpHeight}, top=${(WINDOW_INNER_HEIGHT - popUpHeight) / 2}, left=${(WINDOW_INNER_WIDTH - popUpWidth) / 2}`,
    );
  });
  it('CREATE_PASSWORD', () => {
    const resp = openPopup({ url: URL, target: TARGET, type: 'CREATE_PASSWORD' });
    popUpHeight = 400;

    expect(resp.location.href).toBe(URL);
    expect(mockWindowOpen).toBeCalledTimes(1);
    expect(mockWindowOpen).toBeCalledWith(
      URL,
      TARGET,
      `toolbar=no, menubar=no, width=${popUpWidth}, 
    height=${popUpHeight}, top=${(WINDOW_INNER_HEIGHT - popUpHeight) / 2}, left=${(WINDOW_INNER_WIDTH - popUpWidth) / 2}`,
    );
  });
  it('CREATE_PASSKEY', () => {
    const resp = openPopup({ url: URL, target: TARGET, type: 'CREATE_PASSKEY' });
    popUpHeight = 464;

    expect(resp.location.href).toBe(URL);
    expect(mockWindowOpen).toBeCalledTimes(1);
    expect(mockWindowOpen).toBeCalledWith(
      URL,
      TARGET,
      `toolbar=no, menubar=no, width=${popUpWidth}, 
    height=${popUpHeight}, top=${(WINDOW_INNER_HEIGHT - popUpHeight) / 2}, left=${(WINDOW_INNER_WIDTH - popUpWidth) / 2}`,
    );
  });
  it('TRANSACTION_REVIEW', () => {
    const resp = openPopup({ url: URL, target: TARGET, type: 'TRANSACTION_REVIEW' });
    popUpHeight = 480;

    expect(resp.location.href).toBe(URL);
    expect(mockWindowOpen).toBeCalledTimes(1);
    expect(mockWindowOpen).toBeCalledWith(
      URL,
      TARGET,
      `toolbar=no, menubar=no, width=${popUpWidth}, 
    height=${popUpHeight}, top=${(WINDOW_INNER_HEIGHT - popUpHeight) / 2}, left=${(WINDOW_INNER_WIDTH - popUpWidth) / 2}`,
    );
  });
  it('OAUTH', () => {
    const resp = openPopup({ url: URL, target: TARGET, type: 'OAUTH' });
    popUpHeight = 768;

    expect(resp.location.href).toBe(URL);
    expect(mockWindowOpen).toBeCalledTimes(1);
    expect(mockWindowOpen).toBeCalledWith(
      URL,
      TARGET,
      `toolbar=no, menubar=no, width=${popUpWidth}, 
    height=${popUpHeight}, top=${(WINDOW_INNER_HEIGHT - popUpHeight) / 2}, left=${(WINDOW_INNER_WIDTH - popUpWidth) / 2}`,
    );
  });
});
