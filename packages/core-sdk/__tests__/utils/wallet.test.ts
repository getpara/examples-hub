import { describe, expect, it } from 'vitest';
import { WALLET, SOLANA_WALLET, USER_EMAIL } from '../constants';
import { isPregenIdentifierMatch, migrateWallet } from '../../src/utils';

describe('isPregenIdentifierMatch', () => {
  it('returns false if either value is falsy', () => {
    expect(isPregenIdentifierMatch(USER_EMAIL, null, 'EMAIL')).toBe(false);
    expect(isPregenIdentifierMatch(null, USER_EMAIL, 'EMAIL')).toBe(false);
  });

  it('matches emails', () => {
    expect(isPregenIdentifierMatch(USER_EMAIL, USER_EMAIL.toUpperCase(), 'EMAIL')).toBe(true);
  });

  it('matches phone numbers', () => {
    expect(isPregenIdentifierMatch('+15555555555', '+1 (555) 555-5555', 'PHONE')).toBe(true);
  });

  it('matches custom IDs', () => {
    expect(isPregenIdentifierMatch('custom-id', 'custom-id', 'CUSTOM_ID')).toBe(true);

    expect(isPregenIdentifierMatch('custom-id', 'CUSTOM_ID', 'CUSTOM_ID')).toBe(false);
  });

  it('matches other types', () => {
    expect(isPregenIdentifierMatch('@farcaster_username', '@FARCASTER_USERNAME', 'FARCASTER' as unknown as any)).toBe(true);

    expect(isPregenIdentifierMatch('@discord_username', '@DISCORD_USERNAME', 'DISCORD' as unknown as any)).toBe(true);
  });
});

describe('migrateWallet', () => {
  it('does nothing to a valid wallet', () => {
    expect(migrateWallet(WALLET)).toEqual(WALLET);
  });

  it('migrates legacy wallet.type', () => {
    expect(migrateWallet({ ...WALLET, type: 'USER', scheme: 'DKLS' })).toEqual(WALLET);

    expect(migrateWallet({ ...WALLET, type: 'PREGEN', scheme: 'DKLS' })).toEqual({ ...WALLET, isPregen: true, type: 'EVM' });

    expect(migrateWallet({ ...SOLANA_WALLET, type: 'USER', scheme: 'ED25519' })).toEqual({
      ...SOLANA_WALLET,
      type: 'SOLANA',
    });

    expect(migrateWallet({ ...SOLANA_WALLET, type: 'PREGEN', scheme: 'ED25519' })).toEqual({
      ...SOLANA_WALLET,
      isPregen: true,
      type: 'SOLANA',
    });
  });
});
