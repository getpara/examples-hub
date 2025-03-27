import { describe, expect, it } from 'vitest';
import { extractAuthInfo, extractWalletRef, isExternalWalletAddress, isPrimary, isVerifiedAuth, isWalletId } from '../src';

const email = 'test@email.com';
const phoneNational = '9495551234';
const countryCode = '+1';
const phone = `${countryCode}${phoneNational}`;
const farcasterUsername = 'farcasterUsername';
const telegramUserId = 'telegramUserId';
const userId = 'userId';
const externalWalletAddress = 'externalWalletAddress';

const emailAuth = { email, foo: 'bar', phone: 'undefined' };
const phoneAuth = { phone, foo: 'bar' };
const phoneLegacyAuth = { phone: phoneNational, countryCode, foo: 'bar', email: 'undefined' };
const farcasterAuth = { farcasterUsername, foo: 'bar', email: 'null' };
const telegramAuth = { telegramUserId, foo: 'bar', email: 'null' };
const userIdAuth = { userId: 'userId', foo: 'bar', email: 'null' };
const externalWalletAuth = { externalWalletAddress };

describe('utils', () => {
  it('isWalletId', () => {
    expect(isWalletId({ walletId: 'walletId' })).toBe(true);
    expect(isWalletId({ externalWalletAddress: 'externalWalletAddress' })).toBe(false);
  });

  it('isExternalWalletAddress', () => {
    expect(isExternalWalletAddress({ walletId: 'walletId' })).toBe(false);
    expect(isExternalWalletAddress({ externalWalletAddress: 'externalWalletAddress' })).toBe(true);
  });

  it('extractWalletRef', () => {
    expect(extractWalletRef({ walletId: 'walletId' })).toEqual(['walletId', 'walletId']);
    expect(extractWalletRef({ externalWalletAddress: 'externalWalletAddress' })).toEqual([
      'externalWalletAddress',
      'externalWalletAddress',
    ]);
    expect(() => extractWalletRef({})).toThrowError('invalid wallet params');
  });

  describe('extractAuth', () => {
    it('extracts external wallet auth', () => {
      expect(extractAuthInfo(externalWalletAuth)).toEqual({
        auth: { externalWalletAddress },
        authType: 'externalWallet',
        identifier: externalWalletAddress,
      });
    });

    it('extracts email auth', () => {
      expect(extractAuthInfo(emailAuth)).toEqual({
        auth: { email },
        authType: 'email',
        identifier: email,
      });
    });

    it('extracts phone auth', () => {
      expect(extractAuthInfo(phoneLegacyAuth)).toEqual({
        auth: { phone: `${countryCode}${phoneNational}` },
        authType: 'phone',
        identifier: `${countryCode}${phoneNational}`,
      });

      expect(extractAuthInfo({ countryCode, foo: 'bar', email: 'null' })).toBeUndefined();

      expect(extractAuthInfo({ phone: phoneNational, foo: 'bar', email: 'null' })).toBeUndefined();

      expect(() => extractAuthInfo({ phone: phoneNational, foo: 'bar', email: 'null' }, { isRequired: true })).toThrow(
        'invalid auth object',
      );

      expect(extractAuthInfo(phoneAuth)).toEqual({
        auth: { phone: `${countryCode}${phoneNational}` },
        authType: 'phone',
        identifier: `${countryCode}${phoneNational}`,
      });
    });

    it('extracts farcaster auth', () => {
      expect(extractAuthInfo(farcasterAuth)).toEqual({
        auth: { farcasterUsername },
        authType: 'farcaster',
        identifier: farcasterUsername,
      });
    });

    it('extracts telegram auth', () => {
      expect(extractAuthInfo(telegramAuth)).toEqual({
        auth: { telegramUserId },
        authType: 'telegram',
        identifier: telegramUserId,
      });
    });

    it('extracts userId auth', () => {
      expect(extractAuthInfo(userIdAuth)).toBeUndefined();

      expect(() => extractAuthInfo(userIdAuth, { isRequired: true })).toThrow('invalid auth object');

      expect(extractAuthInfo(userIdAuth, { allowUserId: true })).toEqual({
        auth: { userId },
        authType: 'userId',
        identifier: userId,
      });
    });

    it('rejects multiple fields', () => {
      expect(extractAuthInfo({ email, phone, foo: 'bar' })).toBeUndefined();

      expect(() => extractAuthInfo({ email, phone, foo: 'bar' }, { isRequired: true })).toThrow('invalid auth object');
    });

    it('can optionally throw an error', () => {
      expect(extractAuthInfo({ email, phone, foo: 'bar' })).toBeUndefined();

      expect(() => extractAuthInfo({ email, phone, foo: 'bar' }, { isRequired: true })).toThrow('invalid auth object');
    });
  });

  it('isPrimary', () => {
    expect(isPrimary({})).toBe(false);

    expect(isPrimary({ email })).toBe(true);
    expect(isPrimary({ phone })).toBe(true);
    expect(isPrimary({ farcasterUsername })).toBe(true);
    expect(isPrimary({ telegramUserId })).toBe(true);
    expect(isPrimary({ foo: 'bar' })).toBe(false);
  });

  it('isVerifiedAuth', () => {
    expect(isVerifiedAuth({})).toBe(false);

    expect(isVerifiedAuth({ email })).toBe(true);
    expect(isVerifiedAuth({ phone })).toBe(true);
    expect(isVerifiedAuth({ farcasterUsername })).toBe(false);
    expect(isVerifiedAuth({ telegramUserId })).toBe(false);
    expect(isVerifiedAuth({ foo: 'bar' })).toBe(false);
  });
});
