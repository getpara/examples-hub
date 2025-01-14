import { render } from '@testing-library/react';
import { TelegramOAuthStep } from '../../../src/modal/components/OAuth/TelegramOAuthStep.js';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@usecapsule/react-common', () => ({
  HeroSpinner: ({ icon, text }) => (
    <div>
      <div>{icon}</div>
      <div>{text}</div>
    </div>
  ),
}));

vi.mock('../../../src/modal/stores/index.js', () => ({
  useCapsuleStore: _ => ({
    getOAuthURL: vi.fn().mockResolvedValue('https://example.com'),
  }),
  useModalStore: getter =>
    getter({
      setFlow: vi.fn(),
      setStep: vi.fn(),
      setBiometricLocationHints: vi.fn(),
      setSupportedAuthMethods: vi.fn(),
      setPasswordURLForCreate: vi.fn(),
      setWebAuthURLForCreate: vi.fn(),
    }),
  useUserInfoStore: getter =>
    getter({
      setAuthInfo: vi.fn(),
    }),
}));

describe('TelegramOAuthStep', () => {
  it('should render', () => {
    render(<TelegramOAuthStep />);

    expect(true).toBe(true);
  });
});
