import { describe, it, expect, vi } from 'vitest';
import { isPasskeySupported } from '../../../src/modal/utils/isPasskeySupported';
import { detect, NodeInfo } from 'detect-browser';

vi.mock('detect-browser', () => ({
  detect: vi.fn(),
}));

describe('isPasskeySupported', () => {
  it('should return false for Linux', () => {
    vi.mocked(detect).mockReturnValue({ os: 'linux' } as NodeInfo);
    expect(isPasskeySupported()).toBe(false);
  });

  it('should return false for Chrome OS', () => {
    vi.mocked(detect).mockReturnValue({ os: 'Chrome OS' } as unknown as NodeInfo);
    expect(isPasskeySupported()).toBe(false);
  });

  it('should return true otherwise', () => {
    vi.mocked(detect).mockReturnValue({} as unknown as NodeInfo);
    expect(isPasskeySupported()).toBe(true);
  });
});
