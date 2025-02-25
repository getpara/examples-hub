import { WalletType } from '@getpara/web-sdk';
import { useStore } from '../../stores/useStore.js';
import { useClient } from './useClient.js';

/**
 * Hook for controlling selected wallet
 */
export const useWalletState = () => {
  const client = useClient();
  const selectedWalletId = useStore(state => state.selectedWalletId);
  const selectedWalletType = useStore(state => state.selectedWalletType);
  const setStoredSelectedWallet = useStore(state => state.setSelectedWallet);
  const clearSelectedWallet = useStore(state => state.clearSelectedWallet);

  const setSelectedWallet = ({ id, type }: { id?: string; type?: WalletType }) => {
    try {
      const validId = client?.findWalletId(id, type ? { type: [type] } : undefined);

      if (validId !== id) {
        clearSelectedWallet();
      } else {
        setStoredSelectedWallet(id, type);
      }
    } catch (e) {
      clearSelectedWallet();
    }
  };

  return {
    selectedWallet: {
      id: selectedWalletId,
      type: selectedWalletType,
    },
    setSelectedWallet,
  };
};
