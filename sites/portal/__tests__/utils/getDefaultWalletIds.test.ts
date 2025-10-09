import { describe, expect, it } from 'vitest';
import { getDefaultWalletIds } from '../../src/utils/getDefaultWalletIds';
import { WalletEntity, SupportedWalletTypes } from '@getpara/react-sdk';
import { GroupedWallets } from '../../src/types';

describe('getDefaultWalletIds', () => {
  const mockPartnerId = 'test-partner-id';
  // All types are optional by default in most tests
  const mockSupportedWalletTypes: SupportedWalletTypes = [
    { type: 'EVM', optional: true },
    { type: 'SOLANA', optional: true },
    { type: 'COSMOS', optional: true },
  ];

  const createMockWallet = (overrides: Partial<WalletEntity> = {}): WalletEntity =>
    ({
      id: 'wallet-id',
      partnerId: mockPartnerId,
      lastUsedPartnerId: null,
      scheme: 'DKLS',
      type: 'EVM',
      address: '0x1234567890abcdef1234567890abcdef12345678',
      ...overrides,
    }) as WalletEntity;

  const createGroupedWallets = (wallets: WalletEntity[]): GroupedWallets => {
    return wallets.reduce((acc, wallet) => {
      if (!acc[wallet.type]) {
        acc[wallet.type] = [];
      }
      acc[wallet.type]!.push(wallet);
      return acc;
    }, {} as GroupedWallets);
  };

  describe('when no wallets are provided', () => {
    it('should return empty wallet IDs when all types are optional', () => {
      const result = getDefaultWalletIds({}, { partnerId: mockPartnerId, supportedWalletTypes: mockSupportedWalletTypes });
      // All types are optional, so even with no wallets, requirements are met
      expect(result).toEqual({
        EVM: [],
        SOLANA: [],
        COSMOS: [],
      });
    });
  });

  describe('when wallets exist but none match the partner', () => {
    it('should return empty wallet IDs when no wallets match partnerId and all types are optional', () => {
      const wallets = [
        createMockWallet({ partnerId: 'other-partner-id' }),
        createMockWallet({ partnerId: 'another-partner-id' }),
      ];

      const result = getDefaultWalletIds(createGroupedWallets(wallets), {
        partnerId: mockPartnerId,
        supportedWalletTypes: mockSupportedWalletTypes,
      });
      // All types are optional, so empty wallets is acceptable
      expect(result).toEqual({
        EVM: [],
        SOLANA: [],
        COSMOS: [],
      });
    });

    it('should return empty wallet IDs when no wallets match lastUsedPartnerId and all types are optional', () => {
      const wallets = [
        createMockWallet({ partnerId: 'other-partner-id', lastUsedPartnerId: 'another-partner-id' }),
        createMockWallet({ partnerId: 'another-partner-id', lastUsedPartnerId: 'other-partner-id' }),
      ];

      const result = getDefaultWalletIds(createGroupedWallets(wallets), {
        partnerId: mockPartnerId,
        supportedWalletTypes: mockSupportedWalletTypes,
      });
      // All types are optional, so empty wallets is acceptable
      expect(result).toEqual({
        EVM: [],
        SOLANA: [],
        COSMOS: [],
      });
    });
  });

  describe('when partner-owned wallets exist', () => {
    it('should return wallet IDs for EVM wallets', () => {
      const wallets = [
        createMockWallet({ id: 'evm-wallet-1', scheme: 'DKLS', type: 'EVM' }),
        createMockWallet({ id: 'evm-wallet-2', scheme: 'DKLS', type: 'EVM' }),
      ];

      const result = getDefaultWalletIds(createGroupedWallets(wallets), {
        partnerId: mockPartnerId,
        supportedWalletTypes: mockSupportedWalletTypes,
      });

      expect(result).toEqual({
        EVM: ['evm-wallet-1', 'evm-wallet-2'],
        SOLANA: [],
        COSMOS: ['evm-wallet-1', 'evm-wallet-2'], // DKLS scheme maps to both EVM and COSMOS
      });
    });

    it('should return wallet IDs for SOLANA wallets', () => {
      const wallets = [
        createMockWallet({ id: 'solana-wallet-1', scheme: 'ED25519', type: 'SOLANA' }),
        createMockWallet({ id: 'solana-wallet-2', scheme: 'ED25519', type: 'SOLANA' }),
      ];

      const result = getDefaultWalletIds(createGroupedWallets(wallets), {
        partnerId: mockPartnerId,
        supportedWalletTypes: mockSupportedWalletTypes,
      });

      expect(result).toEqual({
        EVM: [],
        SOLANA: ['solana-wallet-1', 'solana-wallet-2'],
        COSMOS: [],
      });
    });

    it('should return wallet IDs for COSMOS wallets', () => {
      const wallets = [
        createMockWallet({ id: 'cosmos-wallet-1', scheme: 'DKLS', type: 'COSMOS' }),
        createMockWallet({ id: 'cosmos-wallet-2', scheme: 'DKLS', type: 'COSMOS' }),
      ];

      const result = getDefaultWalletIds(createGroupedWallets(wallets), {
        partnerId: mockPartnerId,
        supportedWalletTypes: mockSupportedWalletTypes,
      });

      expect(result).toEqual({
        EVM: ['cosmos-wallet-1', 'cosmos-wallet-2'], // DKLS scheme maps to both EVM and COSMOS
        SOLANA: [],
        COSMOS: ['cosmos-wallet-1', 'cosmos-wallet-2'],
      });
    });

    it('should return wallet IDs for mixed wallet types', () => {
      const wallets = [
        createMockWallet({ id: 'evm-wallet', scheme: 'DKLS', type: 'EVM' }),
        createMockWallet({ id: 'solana-wallet', scheme: 'ED25519', type: 'SOLANA' }),
        createMockWallet({ id: 'cosmos-wallet', scheme: 'DKLS', type: 'COSMOS' }),
      ];

      const result = getDefaultWalletIds(createGroupedWallets(wallets), {
        partnerId: mockPartnerId,
        supportedWalletTypes: mockSupportedWalletTypes,
      });

      expect(result).toEqual({
        EVM: ['evm-wallet', 'cosmos-wallet'], // Both DKLS wallets appear in EVM
        SOLANA: ['solana-wallet'],
        COSMOS: ['evm-wallet', 'cosmos-wallet'], // Both DKLS wallets appear in COSMOS
      });
    });
  });

  describe('when partner-connected wallets exist', () => {
    it('should return wallet IDs for wallets with matching lastUsedPartnerId', () => {
      const wallets = [
        createMockWallet({
          id: 'connected-evm-wallet',
          partnerId: 'other-partner-id',
          lastUsedPartnerId: mockPartnerId,
          scheme: 'DKLS',
          type: 'EVM',
        }),
        createMockWallet({
          id: 'connected-solana-wallet',
          partnerId: 'another-partner-id',
          lastUsedPartnerId: mockPartnerId,
          scheme: 'ED25519',
          type: 'SOLANA',
        }),
      ];

      const result = getDefaultWalletIds(createGroupedWallets(wallets), {
        partnerId: mockPartnerId,
        supportedWalletTypes: mockSupportedWalletTypes,
      });

      expect(result).toEqual({
        EVM: ['connected-evm-wallet'],
        SOLANA: ['connected-solana-wallet'],
        COSMOS: ['connected-evm-wallet'], // DKLS scheme maps to both EVM and COSMOS
      });
    });
  });

  describe('when both partner-owned and partner-connected wallets exist', () => {
    it('should combine both types of wallets', () => {
      const wallets = [
        createMockWallet({ id: 'owned-evm-wallet', scheme: 'DKLS', type: 'EVM' }),
        createMockWallet({
          id: 'connected-evm-wallet',
          partnerId: 'other-partner-id',
          lastUsedPartnerId: mockPartnerId,
          scheme: 'DKLS',
          type: 'EVM',
        }),
        createMockWallet({
          id: 'connected-solana-wallet',
          partnerId: 'another-partner-id',
          lastUsedPartnerId: mockPartnerId,
          scheme: 'ED25519',
          type: 'SOLANA',
        }),
      ];

      const result = getDefaultWalletIds(createGroupedWallets(wallets), {
        partnerId: mockPartnerId,
        supportedWalletTypes: mockSupportedWalletTypes,
      });

      expect(result).toEqual({
        EVM: ['owned-evm-wallet', 'connected-evm-wallet'],
        SOLANA: ['connected-solana-wallet'],
        COSMOS: ['owned-evm-wallet', 'connected-evm-wallet'], // Both DKLS wallets appear in COSMOS
      });
    });
  });

  describe('duplicate wallet handling', () => {
    it('should remove duplicate wallet IDs using Set', () => {
      const wallets = [
        createMockWallet({ id: 'duplicate-wallet', scheme: 'DKLS', type: 'EVM' }),
        createMockWallet({
          id: 'duplicate-wallet',
          partnerId: 'other-partner-id',
          lastUsedPartnerId: mockPartnerId,
          scheme: 'DKLS',
          type: 'EVM',
        }),
      ];

      const result = getDefaultWalletIds(createGroupedWallets(wallets), {
        partnerId: mockPartnerId,
        supportedWalletTypes: mockSupportedWalletTypes,
      });

      expect(result).toEqual({
        EVM: ['duplicate-wallet'],
        SOLANA: [],
        COSMOS: ['duplicate-wallet'], // DKLS scheme maps to both EVM and COSMOS
      });
    });
  });

  describe('scheme to type mapping', () => {
    it('should map ED25519 scheme to SOLANA type only', () => {
      const wallets = [createMockWallet({ id: 'ed25519-wallet', scheme: 'ED25519', type: 'SOLANA' })];

      const result = getDefaultWalletIds(createGroupedWallets(wallets), {
        partnerId: mockPartnerId,
        supportedWalletTypes: mockSupportedWalletTypes,
      });

      expect(result).toEqual({
        EVM: [],
        SOLANA: ['ed25519-wallet'],
        COSMOS: [],
      });
    });

    it('should map DKLS scheme to EVM and COSMOS types', () => {
      const wallets = [
        createMockWallet({ id: 'DKLS-evm-wallet', scheme: 'DKLS', type: 'EVM' }),
        createMockWallet({ id: 'DKLS-cosmos-wallet', scheme: 'DKLS', type: 'COSMOS' }),
      ];

      const result = getDefaultWalletIds(createGroupedWallets(wallets), {
        partnerId: mockPartnerId,
        supportedWalletTypes: mockSupportedWalletTypes,
      });

      expect(result).toEqual({
        EVM: ['DKLS-evm-wallet', 'DKLS-cosmos-wallet'], // Both DKLS wallets appear in EVM
        SOLANA: [],
        COSMOS: ['DKLS-evm-wallet', 'DKLS-cosmos-wallet'], // Both DKLS wallets appear in COSMOS
      });
    });
  });

  describe('with different supported wallet types', () => {
    it('should only return types that are supported', () => {
      const wallets = [
        createMockWallet({ id: 'evm-wallet', scheme: 'DKLS', type: 'EVM' }),
        createMockWallet({ id: 'solana-wallet', scheme: 'ED25519', type: 'SOLANA' }),
        createMockWallet({ id: 'cosmos-wallet', scheme: 'DKLS', type: 'COSMOS' }),
      ];

      const supportedTypes: SupportedWalletTypes = [{ type: 'EVM' }];
      const result = getDefaultWalletIds(createGroupedWallets(wallets), {
        partnerId: mockPartnerId,
        supportedWalletTypes: supportedTypes,
      });

      expect(result).toEqual({
        EVM: ['evm-wallet', 'cosmos-wallet'], // Both DKLS wallets appear in EVM
      });
    });

    it('should handle empty supported wallet types', () => {
      const wallets = [createMockWallet({ id: 'evm-wallet', scheme: 'DKLS', type: 'EVM' })];

      const supportedTypes: SupportedWalletTypes = [];
      const result = getDefaultWalletIds(createGroupedWallets(wallets), {
        partnerId: mockPartnerId,
        supportedWalletTypes: supportedTypes,
      });

      // Empty supportedWalletTypes means no wallet types requested
      // .every() returns true (vacuous truth), so it returns the empty walletIds object
      expect(result).toEqual({});
    });
  });

  describe('optional/required wallet types', () => {
    it('should return undefined when required wallet type has no compatible wallets', () => {
      const wallets = [
        createMockWallet({ id: 'evm-wallet', scheme: 'DKLS', type: 'EVM' }),
        // No SOLANA wallets
      ];

      const supportedTypes: SupportedWalletTypes = [
        { type: 'EVM', optional: false },
        { type: 'SOLANA', optional: false }, // Required but no compatible wallets
        { type: 'COSMOS', optional: true },
      ];

      const result = getDefaultWalletIds(createGroupedWallets(wallets), {
        partnerId: mockPartnerId,
        supportedWalletTypes: supportedTypes,
      });

      expect(result).toBeUndefined();
    });

    it('should return wallet IDs when all required wallet types have compatible wallets', () => {
      const wallets = [
        createMockWallet({ id: 'evm-wallet', scheme: 'DKLS', type: 'EVM' }),
        createMockWallet({ id: 'solana-wallet', scheme: 'ED25519', type: 'SOLANA' }),
      ];

      const supportedTypes: SupportedWalletTypes = [
        { type: 'EVM', optional: false },
        { type: 'SOLANA', optional: false },
        { type: 'COSMOS', optional: true },
      ];

      const result = getDefaultWalletIds(createGroupedWallets(wallets), {
        partnerId: mockPartnerId,
        supportedWalletTypes: supportedTypes,
      });

      expect(result).toEqual({
        EVM: ['evm-wallet'],
        SOLANA: ['solana-wallet'],
        COSMOS: ['evm-wallet'], // DKLS scheme maps to both EVM and COSMOS
      });
    });

    it('should return wallet IDs when optional wallet types have no compatible wallets', () => {
      const wallets = [
        createMockWallet({ id: 'evm-wallet', scheme: 'DKLS', type: 'EVM' }),
        // No SOLANA wallets, but SOLANA is optional
      ];

      const supportedTypes: SupportedWalletTypes = [
        { type: 'EVM', optional: false },
        { type: 'SOLANA', optional: true }, // Optional, so no compatible wallets is OK
        { type: 'COSMOS', optional: true },
      ];

      const result = getDefaultWalletIds(createGroupedWallets(wallets), {
        partnerId: mockPartnerId,
        supportedWalletTypes: supportedTypes,
      });

      expect(result).toEqual({
        EVM: ['evm-wallet'],
        SOLANA: [],
        COSMOS: ['evm-wallet'], // DKLS scheme maps to both EVM and COSMOS
      });
    });

    it('should return undefined when multiple required wallet types have no compatible wallets', () => {
      const wallets = [
        createMockWallet({ id: 'evm-wallet', scheme: 'DKLS', type: 'EVM' }),
        // No SOLANA or COSMOS wallets
      ];

      const supportedTypes: SupportedWalletTypes = [
        { type: 'EVM', optional: false },
        { type: 'SOLANA', optional: false }, // Required but no compatible wallets
        { type: 'COSMOS', optional: false }, // Required but no compatible wallets
      ];

      const result = getDefaultWalletIds(createGroupedWallets(wallets), {
        partnerId: mockPartnerId,
        supportedWalletTypes: supportedTypes,
      });

      expect(result).toBeUndefined();
    });

    it('should handle wallet types without optional property (defaults to required)', () => {
      const wallets = [
        createMockWallet({ id: 'evm-wallet', scheme: 'DKLS', type: 'EVM' }),
        // No SOLANA wallets, but SOLANA has no optional property (defaults to required)
      ];

      const supportedTypes: SupportedWalletTypes = [
        { type: 'EVM', optional: false },
        { type: 'SOLANA' }, // No optional property, defaults to required
        { type: 'COSMOS', optional: true },
      ];

      const result = getDefaultWalletIds(createGroupedWallets(wallets), {
        partnerId: mockPartnerId,
        supportedWalletTypes: supportedTypes,
      });

      // Should return undefined because SOLANA is required (no optional property) but has no wallets
      expect(result).toBeUndefined();
    });
  });

  describe('edge cases', () => {
    it('should handle wallets with null lastUsedPartnerId', () => {
      const wallets = [createMockWallet({ id: 'wallet-with-null-last-used', lastUsedPartnerId: null })];

      const result = getDefaultWalletIds(createGroupedWallets(wallets), {
        partnerId: mockPartnerId,
        supportedWalletTypes: mockSupportedWalletTypes,
      });

      expect(result).toEqual({
        EVM: ['wallet-with-null-last-used'],
        SOLANA: [],
        COSMOS: ['wallet-with-null-last-used'], // DKLS scheme maps to both EVM and COSMOS
      });
    });

    it('should handle wallets with undefined lastUsedPartnerId', () => {
      const wallets = [createMockWallet({ id: 'wallet-with-undefined-last-used', lastUsedPartnerId: undefined })];

      const result = getDefaultWalletIds(createGroupedWallets(wallets), {
        partnerId: mockPartnerId,
        supportedWalletTypes: mockSupportedWalletTypes,
      });

      expect(result).toEqual({
        EVM: ['wallet-with-undefined-last-used'],
        SOLANA: [],
        COSMOS: ['wallet-with-undefined-last-used'], // DKLS scheme maps to both EVM and COSMOS
      });
    });
  });
});
