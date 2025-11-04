import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useUserStore, DEFAULT_USER_STATE } from '@/store/useUserStore';

describe('useUserStore', () => {
  beforeEach(() => {
    // Reset store to default state before each test
    act(() => {
      useUserStore.setState(DEFAULT_USER_STATE);
    });
  });

  afterEach(() => {
    // Clean up after each test
    act(() => {
      useUserStore.setState(DEFAULT_USER_STATE);
    });
  });

  describe('Default State', () => {
    it('should have correct default values', () => {
      const { result } = renderHook(() => useUserStore());

      expect(result.current.currentWalletId).toBeUndefined();
    });

    it('should match DEFAULT_USER_STATE', () => {
      const { result } = renderHook(() => useUserStore());

      expect(result.current.currentWalletId).toBe(DEFAULT_USER_STATE.currentWalletId);
    });
  });

  describe('updateState Action', () => {
    it('should update currentWalletId', () => {
      const { result } = renderHook(() => useUserStore());

      act(() => {
        result.current.updateState({ currentWalletId: 'wallet-123' });
      });

      expect(result.current.currentWalletId).toBe('wallet-123');
    });

    it('should update multiple properties at once', () => {
      const { result } = renderHook(() => useUserStore());

      act(() => {
        result.current.updateState({
          currentWalletId: 'wallet-456',
        });
      });

      expect(result.current.currentWalletId).toBe('wallet-456');
    });

    it('should handle partial updates correctly', () => {
      const { result } = renderHook(() => useUserStore());
      expect(result.current.currentWalletId).toBeUndefined();

      // Second update - should not overwrite existing values
      act(() => {
        result.current.updateState({ currentWalletId: 'wallet-789' });
      });

      expect(result.current.currentWalletId).toBe('wallet-789');
    });

    it('should handle empty update object', () => {
      const { result } = renderHook(() => useUserStore());

      // Set some initial state
      act(() => {
        result.current.updateState({ currentWalletId: 'wallet-test' });
      });

      const beforeState = {
        currentWalletId: result.current.currentWalletId,
      };

      // Update with empty object
      act(() => {
        result.current.updateState({});
      });

      // State should remain unchanged
      expect(result.current.currentWalletId).toBe(beforeState.currentWalletId);
    });

    it('should handle undefined values', () => {
      const { result } = renderHook(() => useUserStore());

      // Set some initial state
      act(() => {
        result.current.updateState({ currentWalletId: 'wallet-test' });
      });

      // Reset currentWalletId to undefined
      act(() => {
        result.current.updateState({ currentWalletId: undefined });
      });

      expect(result.current.currentWalletId).toBeUndefined();
    });
  });

  describe('State Persistence Across Hook Instances', () => {
    it('should share state between multiple hook instances', () => {
      const { result: result1 } = renderHook(() => useUserStore());
      const { result: result2 } = renderHook(() => useUserStore());

      // Update state in first hook
      act(() => {
        result1.current.updateState({ currentWalletId: 'shared-wallet' });
      });

      // Both hooks should see the same state
      expect(result1.current.currentWalletId).toBe('shared-wallet');
      expect(result2.current.currentWalletId).toBe('shared-wallet');
    });

    it('should update all hook instances when state changes', () => {
      const { result: result1 } = renderHook(() => useUserStore());
      const { result: result2 } = renderHook(() => useUserStore());

      // Update from first hook
      act(() => {
        result1.current.updateState({ currentWalletId: 'wallet-from-hook1' });
      });

      expect(result1.current.currentWalletId).toBe('wallet-from-hook1');
      expect(result2.current.currentWalletId).toBe('wallet-from-hook1');

      // Update from second hook
      act(() => {
        result2.current.updateState({ currentWalletId: 'wallet-from-hook2' });
      });

      expect(result1.current.currentWalletId).toBe('wallet-from-hook2');
      expect(result2.current.currentWalletId).toBe('wallet-from-hook2');
    });
  });

  describe('State Selectors', () => {
    it('should allow selecting specific state properties', () => {
      // Set some initial state
      act(() => {
        useUserStore.setState({ currentWalletId: 'wallet-selector-test' });
      });

      const { result: walletIdResult } = renderHook(() => useUserStore(state => state.currentWalletId));

      expect(walletIdResult.current).toBe('wallet-selector-test');
    });
  });

  describe('Direct Store Access', () => {
    it('should allow direct access to store state', () => {
      act(() => {
        useUserStore.setState({ currentWalletId: 'direct-access-wallet' });
      });

      const state = useUserStore.getState();

      expect(state.currentWalletId).toBe('direct-access-wallet');
    });

    it('should allow direct updates through setState', () => {
      act(() => {
        useUserStore.setState({ currentWalletId: 'test' });
      });

      const { result } = renderHook(() => useUserStore());

      expect(result.current.currentWalletId).toBe('test');
    });

    it('should allow partial updates through setState', () => {
      act(() => {
        useUserStore.setState({ currentWalletId: 'initial-wallet' });
      });

      // Partial update
      act(() => {
        useUserStore.setState({ currentWalletId: 'updated-wallet' });
      });

      const state = useUserStore.getState();

      expect(state.currentWalletId).toBe('updated-wallet');
    });
  });

  describe('Edge Cases', () => {
    it('should handle rapid successive updates', () => {
      const { result } = renderHook(() => useUserStore());

      act(() => {
        result.current.updateState({ currentWalletId: 'wallet-1' });
        result.current.updateState({ currentWalletId: 'wallet-2' });
      });

      expect(result.current.currentWalletId).toBe('wallet-2');
    });

    it('should handle wallet ID format variations', () => {
      const { result } = renderHook(() => useUserStore());

      const testWalletIds = [
        'wallet-123',
        'WALLET_456',
        'wallet.test.789',
        '0x1234567890123456789012345678901234567890',
        'cosmos1abcdefghijklmnopqrstuvwxyz',
        '',
      ];

      testWalletIds.forEach(walletId => {
        act(() => {
          result.current.updateState({ currentWalletId: walletId });
        });

        expect(result.current.currentWalletId).toBe(walletId);
      });
    });

    it('should handle very long wallet IDs', () => {
      const { result } = renderHook(() => useUserStore());
      const longWalletId = 'wallet-' + 'a'.repeat(1000);

      act(() => {
        result.current.updateState({ currentWalletId: longWalletId });
      });

      expect(result.current.currentWalletId).toBe(longWalletId);
    });
  });

  describe('Type Safety', () => {
    it('should enforce correct types for updateState', () => {
      const { result } = renderHook(() => useUserStore());

      // Valid updates
      act(() => {
        result.current.updateState({ currentWalletId: 'wallet-123' });
        result.current.updateState({ currentWalletId: undefined });
      });

      expect(result.current.currentWalletId).toBeUndefined();
    });

    it('should maintain store interface consistency', () => {
      const { result } = renderHook(() => useUserStore());

      // Verify all expected properties and methods exist
      expect(typeof result.current.updateState).toBe('function');
      expect(result.current.currentWalletId === undefined || typeof result.current.currentWalletId === 'string').toBe(true);
    });
  });
});
