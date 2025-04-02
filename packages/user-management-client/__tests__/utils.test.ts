import { describe, expect, it } from 'vitest';
import {
  extractAuthInfo,
  extractWalletRef,
  isExternalWalletAddress,
  isPregenAuth,
  isPrimary,
  isVerifiedAuth,
  isWalletId,
  toPregenIds,
  toPregenTypeAndId,
} from '../src';

const email = 'test@email.com';
const phoneNational = '9495551234';
const countryCode = '+1';
const phone = `${countryCode}${phoneNational}`;
const farcasterUsername = 'farcasterUsername';
const telegramUserId = 'telegramUserId';
const xUsername = 'xUsername';
const discordUsername = 'discordUsername';
const customId = 'customId';
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

    it('extracts X auth', () => {
      expect(extractAuthInfo({ xUsername })).toEqual(undefined);

      expect(extractAuthInfo({ xUsername }, { allowPregen: true })).toEqual({
        auth: { xUsername },
        authType: 'x',
        identifier: xUsername,
      });
    });

    it('extracts discord auth', () => {
      expect(extractAuthInfo({ discordUsername })).toEqual(undefined);

      expect(extractAuthInfo({ discordUsername }, { allowPregen: true })).toEqual({
        auth: { discordUsername },
        authType: 'discord',
        identifier: discordUsername,
      });
    });

    it('extracts customId auth', () => {
      expect(extractAuthInfo({ customId })).toEqual(undefined);

      expect(extractAuthInfo({ customId }, { allowPregen: true })).toEqual({
        auth: { customId },
        authType: 'customId',
        identifier: customId,
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
    expect(isPrimary({ xUsername })).toBe(false);
    expect(isPrimary({ discordUsername })).toBe(false);
    expect(isPrimary({ customId })).toBe(false);
    expect(isPrimary({ foo: 'bar' })).toBe(false);
  });

  it('isVerifiedAuth', () => {
    expect(isVerifiedAuth({})).toBe(false);

    expect(isVerifiedAuth({ email })).toBe(true);
    expect(isVerifiedAuth({ phone })).toBe(true);
    expect(isVerifiedAuth({ farcasterUsername })).toBe(false);
    expect(isVerifiedAuth({ telegramUserId })).toBe(false);
    expect(isVerifiedAuth({ xUsername })).toBe(false);
    expect(isVerifiedAuth({ discordUsername })).toBe(false);
    expect(isVerifiedAuth({ customId })).toBe(false);
    expect(isVerifiedAuth({ foo: 'bar' })).toBe(false);
  });

  it('isPregenAuth', () => {
    expect(isPregenAuth({})).toBe(false);

    expect(isPregenAuth({ email })).toBe(true);
    expect(isPregenAuth({ phone })).toBe(true);
    expect(isPregenAuth({ farcasterUsername })).toBe(true);
    expect(isPregenAuth({ telegramUserId })).toBe(true);
    expect(isPregenAuth({ xUsername })).toBe(true);
    expect(isPregenAuth({ discordUsername })).toBe(true);
    expect(isPregenAuth({ customId })).toBe(true);
    expect(isPregenAuth({ foo: 'bar' })).toBe(false);
  });

  it('toPregenTypeAndId', () => {
    expect(toPregenTypeAndId({ email })).toEqual(['EMAIL', email]);
    expect(toPregenTypeAndId({ phone })).toEqual(['PHONE', phone]);
    expect(toPregenTypeAndId({ farcasterUsername })).toEqual(['FARCASTER', farcasterUsername]);
    expect(toPregenTypeAndId({ telegramUserId })).toEqual(['TELEGRAM', telegramUserId]);
    expect(toPregenTypeAndId({ xUsername })).toEqual(['TWITTER', xUsername]);
    expect(toPregenTypeAndId({ discordUsername })).toEqual(['DISCORD', discordUsername]);
    expect(toPregenTypeAndId({ customId })).toEqual(['CUSTOM_ID', customId]);
  });

  it('toPregenIds', () => {
    expect(toPregenIds({ email })).toEqual({ EMAIL: [email] });
    expect(toPregenIds({ phone })).toEqual({ PHONE: [phone] });
    expect(toPregenIds({ farcasterUsername })).toEqual({ FARCASTER: [farcasterUsername] });
    expect(toPregenIds({ telegramUserId })).toEqual({ TELEGRAM: [telegramUserId] });
    expect(toPregenIds({ xUsername })).toEqual({ TWITTER: [xUsername] });
    expect(toPregenIds({ discordUsername })).toEqual({ DISCORD: [discordUsername] });
    expect(toPregenIds({ customId })).toEqual({ CUSTOM_ID: [customId] });
  });
});
