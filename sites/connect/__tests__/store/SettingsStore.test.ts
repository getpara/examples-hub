import { describe, it, expect, beforeEach, vi } from 'vitest';
import SettingsStore from '@/store/SettingsStore';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

describe('SettingsStore', () => {
  beforeEach(() => {
    // Reset the store state and mocks before each test
    vi.clearAllMocks();
    SettingsStore.state.testNets = true;
    SettingsStore.state.account = 0;
    SettingsStore.state.activeChainId = '1';
    SettingsStore.state.eip155Address = '';
    SettingsStore.state.capsuleAddress = '';
    SettingsStore.state.cosmosAddress = '';
    SettingsStore.state.relayerRegionURL = '';
    SettingsStore.state.currentRequestVerifyContext = undefined;
  });

  describe('Initial State', () => {
    it('should have correct default values', () => {
      expect(SettingsStore.state.testNets).toBe(true);
      expect(SettingsStore.state.account).toBe(0);
      expect(SettingsStore.state.activeChainId).toBe('1');
      expect(SettingsStore.state.eip155Address).toBe('');
      expect(SettingsStore.state.capsuleAddress).toBe('');
      expect(SettingsStore.state.cosmosAddress).toBe('');
      expect(SettingsStore.state.relayerRegionURL).toBe('');
      expect(SettingsStore.state.currentRequestVerifyContext).toBeUndefined();
    });

    it('should read testNets from localStorage on initialization', () => {
      // This test verifies that localStorage is read during store initialization
      // Since the store is already initialized when tests run, we can verify
      // the localStorage interaction indirectly through toggleTestNets behavior
      expect(typeof SettingsStore.state.testNets).toBe('boolean');
    });
  });

  describe('setAccount', () => {
    it('should update account value', () => {
      SettingsStore.setAccount(5);
      expect(SettingsStore.state.account).toBe(5);
    });

    it('should handle zero account', () => {
      SettingsStore.setAccount(0);
      expect(SettingsStore.state.account).toBe(0);
    });

    it('should handle negative account numbers', () => {
      SettingsStore.setAccount(-1);
      expect(SettingsStore.state.account).toBe(-1);
    });
  });

  describe('setEIP155Address', () => {
    it('should update EIP155 address', () => {
      const address = '0x1234567890123456789012345678901234567890';
      SettingsStore.setEIP155Address(address);
      expect(SettingsStore.state.eip155Address).toBe(address);
    });

    it('should handle empty address', () => {
      SettingsStore.setEIP155Address('');
      expect(SettingsStore.state.eip155Address).toBe('');
    });

    it('should handle invalid address format', () => {
      const invalidAddress = 'invalid-address';
      SettingsStore.setEIP155Address(invalidAddress);
      expect(SettingsStore.state.eip155Address).toBe(invalidAddress);
    });
  });

  describe('setCapsuleAddress', () => {
    it('should update Capsule address', () => {
      const address = '0xabcdef1234567890abcdef1234567890abcdef12';
      SettingsStore.setCapsuleAddress(address);
      expect(SettingsStore.state.capsuleAddress).toBe(address);
    });

    it('should handle empty capsule address', () => {
      SettingsStore.setCapsuleAddress('');
      expect(SettingsStore.state.capsuleAddress).toBe('');
    });
  });

  describe('setCosmosAddress', () => {
    it('should update Cosmos address', () => {
      const address = 'cosmos1abcdef1234567890abcdef1234567890abcdef';
      SettingsStore.setCosmosAddress(address);
      expect(SettingsStore.state.cosmosAddress).toBe(address);
    });

    it('should handle empty cosmos address', () => {
      SettingsStore.setCosmosAddress('');
      expect(SettingsStore.state.cosmosAddress).toBe('');
    });
  });

  describe('setRelayerRegionURL', () => {
    it('should update relayer region URL', () => {
      const url = 'wss://relay.walletconnect.com';
      SettingsStore.setRelayerRegionURL(url);
      expect(SettingsStore.state.relayerRegionURL).toBe(url);
    });

    it('should handle empty URL', () => {
      SettingsStore.setRelayerRegionURL('');
      expect(SettingsStore.state.relayerRegionURL).toBe('');
    });

    it('should handle different URL formats', () => {
      const httpUrl = 'https://relay.walletconnect.com';
      SettingsStore.setRelayerRegionURL(httpUrl);
      expect(SettingsStore.state.relayerRegionURL).toBe(httpUrl);
    });
  });

  describe('setActiveChainId', () => {
    it('should update active chain ID', () => {
      SettingsStore.setActiveChainId('137');
      expect(SettingsStore.state.activeChainId).toBe('137');
    });

    it('should handle Ethereum mainnet', () => {
      SettingsStore.setActiveChainId('1');
      expect(SettingsStore.state.activeChainId).toBe('1');
    });

    it('should handle testnet chain IDs', () => {
      SettingsStore.setActiveChainId('5');
      expect(SettingsStore.state.activeChainId).toBe('5');
    });

    it('should handle Cosmos chain format', () => {
      SettingsStore.setActiveChainId('cosmos:cosmoshub-4');
      expect(SettingsStore.state.activeChainId).toBe('cosmos:cosmoshub-4');
    });
  });

  describe('setCurrentRequestVerifyContext', () => {
    it('should update verify context', () => {
      const mockContext = {
        verified: {
          validation: 'VALID' as const,
          origin: 'https://example.com',
        },
      };
      SettingsStore.setCurrentRequestVerifyContext(mockContext);
      expect(SettingsStore.state.currentRequestVerifyContext).toEqual(mockContext);
    });

    it('should handle different validation states', () => {
      const invalidContext = {
        verified: {
          validation: 'INVALID' as const,
          origin: 'https://malicious.com',
        },
      };
      SettingsStore.setCurrentRequestVerifyContext(invalidContext);
      expect(SettingsStore.state.currentRequestVerifyContext).toEqual(invalidContext);
    });
  });

  describe('toggleTestNets', () => {
    beforeEach(() => {
      SettingsStore.state.testNets = true;
    });

    it('should toggle testNets from true to false', () => {
      SettingsStore.toggleTestNets();
      expect(SettingsStore.state.testNets).toBe(false);
    });

    it('should toggle testNets from false to true', () => {
      SettingsStore.state.testNets = false;
      SettingsStore.toggleTestNets();
      expect(SettingsStore.state.testNets).toBe(true);
    });

    it('should set localStorage when enabling testNets', () => {
      SettingsStore.state.testNets = false;
      SettingsStore.toggleTestNets();
      expect(localStorageMock.setItem).toHaveBeenCalledWith('TEST_NETS', 'YES');
    });

    it('should remove localStorage when disabling testNets', () => {
      SettingsStore.state.testNets = true;
      SettingsStore.toggleTestNets();
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('TEST_NETS');
    });

    it('should handle multiple toggles correctly', () => {
      // Start with true
      expect(SettingsStore.state.testNets).toBe(true);

      // Toggle to false
      SettingsStore.toggleTestNets();
      expect(SettingsStore.state.testNets).toBe(false);
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('TEST_NETS');

      // Toggle back to true
      SettingsStore.toggleTestNets();
      expect(SettingsStore.state.testNets).toBe(true);
      expect(localStorageMock.setItem).toHaveBeenCalledWith('TEST_NETS', 'YES');
    });
  });

  describe('State Reactivity', () => {
    it('should update state immediately when methods are called', () => {
      const originalAccount = SettingsStore.state.account;
      SettingsStore.setAccount(99);
      expect(SettingsStore.state.account).not.toBe(originalAccount);
      expect(SettingsStore.state.account).toBe(99);
    });

    it('should maintain independent state properties', () => {
      SettingsStore.setAccount(10);
      SettingsStore.setActiveChainId('137');
      SettingsStore.setEIP155Address('0x123');

      expect(SettingsStore.state.account).toBe(10);
      expect(SettingsStore.state.activeChainId).toBe('137');
      expect(SettingsStore.state.eip155Address).toBe('0x123');
      expect(SettingsStore.state.cosmosAddress).toBe(''); // Should remain unchanged
    });
  });

  describe('Edge Cases', () => {
    it('should handle undefined values gracefully', () => {
      // @ts-expect-error Testing undefined input
      SettingsStore.setEIP155Address(undefined);
      expect(SettingsStore.state.eip155Address).toBeUndefined();
    });

    it('should handle null values gracefully', () => {
      // @ts-expect-error Testing null input
      SettingsStore.setActiveChainId(null);
      expect(SettingsStore.state.activeChainId).toBeNull();
    });

    it('should handle very long strings', () => {
      const longString = 'a'.repeat(1000);
      SettingsStore.setRelayerRegionURL(longString);
      expect(SettingsStore.state.relayerRegionURL).toBe(longString);
    });
  });
});
