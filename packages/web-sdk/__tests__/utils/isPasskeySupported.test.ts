import { afterEach, describe, it, expect, vi } from 'vitest';
import { isPasskeySupported } from '../../src/utils/isPasskeySupported.js';

describe('isPasskeySupported', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns true for macOS', async () => {
    const ua =
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) ' +
      'AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36';
    expect(await isPasskeySupported(ua)).toBe(true);
  });

  it('returns true for Windows', async () => {
    const ua =
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) ' + 'AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36';
    expect(await isPasskeySupported(ua)).toBe(true);
  });

  it('returns true for iOS', async () => {
    const ua =
      'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) ' +
      'AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1';
    expect(await isPasskeySupported(ua)).toBe(true);
  });

  it('returns false for Linux', async () => {
    const ua = 'Mozilla/5.0 (X11; Linux x86_64; rv:134.0) ' + 'Gecko/20100101 Firefox/134.0';
    expect(await isPasskeySupported(ua)).toBe(false);
  });

  it('returns false for Chrome OS', async () => {
    const ua =
      'Mozilla/5.0 (X11; CrOS x86_64 14541.0.0) ' +
      'AppleWebKit/537.36 (KHTML, like Gecko) Chrome/103.0.5060.53 Safari/537.36';
    expect(await isPasskeySupported(ua)).toBe(false);
  });

  it('returns false if OS is missing (e.g. weird UA)', async () => {
    const ua = 'FakeUA/1.0 (Unknown OS;) MysteryBrowser/42';
    expect(await isPasskeySupported(ua)).toBe(false);
  });

  it('returns false if OS is missing (e.g. weird UA)', async () => {
    const ua = 'FakeUA/1.0 (Unknown OS;) MysteryBrowser/42';
    expect(await isPasskeySupported(ua)).toBe(false);
  });

  it('returns true if isUserVerifyingPlatformAuthenticatorAvailable returns true', async () => {
    vi.spyOn(window.PublicKeyCredential, 'isUserVerifyingPlatformAuthenticatorAvailable').mockResolvedValue(true);
    const ua = 'FakeUA/1.0 (Unknown OS;) MysteryBrowser/42';
    expect(await isPasskeySupported(ua)).toBe(true);
  });

  it('returns false if isUserVerifyingPlatformAuthenticatorAvailable returns false', async () => {
    vi.spyOn(window.PublicKeyCredential, 'isUserVerifyingPlatformAuthenticatorAvailable').mockResolvedValue(false);
    const ua =
      'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) ' +
      'AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1';
    expect(await isPasskeySupported(ua)).toBe(false);
  });
});
