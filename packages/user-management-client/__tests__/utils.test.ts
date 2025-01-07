import { describe, expect, it } from 'vitest';
import { extractAuth, extractAuthInfo, extractWalletRef, isExternalWalletAddress, isWalletId } from '../src';

const email = 'test@email.com';
const phone = '5555555555';
const countryCode = '+1';
const farcasterUsername = 'farcasterUsername';

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
      expect(extractAuthInfo({ email, foo: 'bar' })).toMatchObject({
        auth: { email },
        authType: 'email',
        identifier: email,
      });

      expect(extractAuth({ email, foo: 'bar' })).toEqual({ email });
    });

    it('extracts phone auth', () => {
      expect(extractAuthInfo({ phone, countryCode, foo: 'bar' })).toEqual({
        auth: { phone, countryCode },
        authType: 'phone',
        identifier: `${countryCode}${phone}`,
      });

      expect(extractAuth({ phone, countryCode, foo: 'bar' })).toEqual({
        phone,
        countryCode,
      });

      expect(() => extractAuthInfo({ phone, foo: 'bar' })).toThrow('invalid auth object');
    });

    it('extracts farcaster auth', () => {
      expect(extractAuthInfo({ farcasterUsername, foo: 'bar' })).toMatchObject({
        auth: { farcasterUsername },
        authType: 'farcasterUsername',
        identifier: farcasterUsername,
      });

      expect(extractAuth({ farcasterUsername, foo: 'bar' })).toMatchObject({
        farcasterUsername,
      });
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
