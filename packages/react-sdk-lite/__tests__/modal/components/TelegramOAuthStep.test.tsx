import { render } from '@testing-library/react';
import { TelegramOAuthStep } from '../../../src/modal/components/OAuth/TelegramOAuthStep.js';
import { describe, expect, it, vi } from 'vitest';
import { MockPara } from '../../mocks/mockCorePara.js';
import { API_KEY } from '../../constants.js';
import { Environment } from '@getpara/web-sdk';

vi.mock('../../../src/modal/components/OAuth/TelegramOAuthStep.js', async importOriginal => {
  const actual = await importOriginal();
  return {
    ...(actual as any),
    TelegramIFrame: () => <></>,
  };
});

vi.mock('../../../src/modal/hooks/useTelegramLogin.js', () => ({
  useTelegramLogin: vi.fn(() => ({
    url: 'https://example.com',
    status: 'idle',
    isLoaded: true,
    setIsLoaded: vi.fn(),
  })),
}));

vi.mock('@getpara/react-common', async importOriginal => {
  const actual = await importOriginal();
  return {
    ...(actual as any),
    HeroSpinner: ({ icon, text }) => (
      <div>
        <div>{icon}</div>
        <div>{text}</div>
      </div>
    ),
    HeaderButton: () => <div></div>,
  };
});

vi.mock('../../../src/modal/stores/index.js', () => ({
  useModalStore: getter =>
    getter({
      setFlow: vi.fn(),
      setStep: vi.fn(),
      setBiometricLocationHints: vi.fn(),
      setSupportedAuthMethods: vi.fn(),
      setPasswordURLForCreate: vi.fn(),
      setWebAuthURLForCreate: vi.fn(),
      refs: {
        telegramIFrame: { current: null },
      },
    }),
  useUserInfoStore: getter =>
    getter({
      setAuthInfo: vi.fn(),
    }),
  useThemeStore: getter => getter({}),
}));

vi.mock('../../../src/provider/stores/useStore.js', () => ({
  useStore: getter =>
    getter({
      client: new MockPara(Environment.DEV, API_KEY),
    }),
}));

describe('TelegramOAuthStep', () => {
  it('should render', () => {
    render(<TelegramOAuthStep />);

    expect(true).toBe(true);
  });
});
