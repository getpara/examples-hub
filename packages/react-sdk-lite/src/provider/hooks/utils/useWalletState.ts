import { TWalletType } from '@getpara/web-sdk';
import { useStore } from '../../stores/useStore.js';
import { useClient } from './useClient.js';
import { useCallback } from 'react';

/**
 * Hook for controlling selected wallet
 */
export const useWalletState = () => {
  const client = useClient();
  const selectedWalletId = useStore(state => state.selectedWalletId);
  const selectedWalletType = useStore(state => state.selectedWalletType);
  const setStoredSelectedWallet = useStore(state => state.setSelectedWallet);
  const clearSelectedWallet = useStore(state => state.clearSelectedWallet);

  const setSelectedWallet = useCallback(
    ({ id, type }: { id?: string; type?: TWalletType }) => {
      try {
        const validId = client?.findWalletId(id, type ? { type: [type] } : undefined);

        if (validId !== id) {
          clearSelectedWallet();
        } else {
          setStoredSelectedWallet(id, type);
        }
      } catch {
        clearSelectedWallet();
      }
    },
    [client, clearSelectedWallet, setStoredSelectedWallet],
  );

  const updateSelectedWallet = useCallback(() => {
    if (!client) {
      clearSelectedWallet();
      return;
    }

    if (!selectedWalletId || !client.findWallet(selectedWalletId)) {
      const defaultWallet = client.findWallet(undefined, undefined, { forbidPregen: true });

      setSelectedWallet({ id: defaultWallet?.id, type: defaultWallet?.type });
    }
  }, [clearSelectedWallet, setSelectedWallet, client, selectedWalletId]);

  return {
    selectedWallet: {
      id: selectedWalletId,
      type: selectedWalletType,
      address: selectedWalletId
        ? client?.getDisplayAddress(selectedWalletId, { addressType: selectedWalletType })
        : undefined,
    },
    setSelectedWallet,
    updateSelectedWallet,
  };
};
