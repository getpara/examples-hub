import { vi } from 'vitest';

export function mockModalStore(store = {}) {
  vi.mock('../src/modal/stores/modal/useModalStore.js', () => ({
    useModalStore: vi.fn(getter => {
      return getter({
        popupWindow: null,
        supportedAuthMethods: new Set(),
        passwordUrlForLogin: '',
        webAuthURLForLogin: '',
        authInfo: {
          auth: null,
          displayName: null,
          pfpUrl: null,
        },
        setAuthInfo: vi.fn(),
        setFlow: vi.fn(),
        setStep: vi.fn(),
        setPopupWindow: vi.fn(),
        biometricLocationHints: [],
        setWebAuthURLForLogin: vi.fn(),
        setPasswordUrlForLogin: vi.fn(),
        setSupportedAuthMethods: vi.fn(),
        setBiometricLocationHints: vi.fn(),
        ...store,
      });
    }),
  }));
}
