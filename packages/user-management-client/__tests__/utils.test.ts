import { describe, expect, it } from 'vitest';
import { extractAuth, extractAuthInfo, extractWalletRef, isExternalWalletAddress, isWalletId } from '../src';

const email = 'test@email.com';
const phone = '5555555555';
const countryCode = '+1';
const farcasterUsername = 'farcasterUsername';
const telegramUserId = 'telegramUserId';
const userId = 'userId';

const emailAuth = { email, foo: 'bar', phone: 'undefined' };
const phoneAuth = { phone, countryCode, foo: 'bar', email: 'undefined' };
const farcasterAuth = { farcasterUsername, foo: 'bar', email: 'null' };
const telegramAuth = { telegramUserId, foo: 'bar', email: 'null' };
const userIdAuth = { userId: 'userId', foo: 'bar', email: 'null' };

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
    it('extracts email auth', () => {
      expect(extractAuthInfo(emailAuth)).toEqual({
        auth: { email },
        authType: 'email',
        identifier: email,
        publicKeyIdentifier: email,
      });

      expect(extractAuth(emailAuth)).toEqual({ email });
    });

    it('extracts phone auth', () => {
      expect(extractAuthInfo(phoneAuth)).toEqual({
        auth: { phone, countryCode },
        authType: 'phone',
        identifier: `${countryCode}${phone}`,
        publicKeyIdentifier: `${countryCode}${phone}`,
      });

      expect(extractAuth(phoneAuth)).toEqual({
        phone,
        countryCode,
      });

      expect(() => extractAuthInfo({ phone, foo: 'bar', email: 'null' })).toThrow('invalid auth object');
    });

    it('extracts farcaster auth', () => {
      expect(extractAuthInfo(farcasterAuth)).toEqual({
        auth: { farcasterUsername },
        authType: 'farcasterUsername',
        identifier: farcasterUsername,
        publicKeyIdentifier: `${farcasterUsername}-farcaster`,
      });

      expect(extractAuth(farcasterAuth)).toEqual({
        farcasterUsername,
      });
    });

    it('extracts telegram auth', () => {
      expect(extractAuthInfo(telegramAuth)).toEqual({
        auth: { telegramUserId },
        authType: 'telegramUserId',
        identifier: telegramUserId,
        publicKeyIdentifier: `${telegramUserId}-telegram`,
      });

      expect(extractAuth(telegramAuth)).toEqual({
        telegramUserId,
      });
    });

    it('extracts userId auth', () => {
      expect(() => extractAuthInfo(userIdAuth)).toThrowError();

      expect(() => extractAuth(userIdAuth)).toThrowError();

      expect(extractAuthInfo(userIdAuth, { allowUserId: true })).toEqual({
        auth: { userId },
        authType: 'userId',
        identifier: userId,
        publicKeyIdentifier: userId,
      });

      expect(extractAuth(userIdAuth, { allowUserId: true })).toEqual({ userId });
    });

    it('rejects multiple fields', () => {
      expect(() => extractAuthInfo({ email, phone, foo: 'bar' })).toThrow('invalid auth object');
    });

    it('can optionally return undefined', () => {
      expect(extractAuth({ email, phone, foo: 'bar' }, { optional: true })).toBeUndefined();

      expect(extractAuth({ email, foo: 'bar' }, { optional: true })).toEqual({ email });

      expect(extractAuth({}, { optional: true })).toBeUndefined();
    });
  });
});
