import { ReactNode, createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useCapsuleStore } from '../stores/index.js';
import { WalletEntity } from '@usecapsule/user-management-client';
import { CURRENT_WALLET_IDS_CHANGE_EVENT, EXTERNAL_WALLET_CHANGE_EVENT } from '@usecapsule/web-sdk';

export const defaultWallet = {
  wallet: undefined,
  switchEmbeddedWallet: () => {},
};

export const WalletContext = createContext<{
  wallet: Pick<WalletEntity, 'id' | 'address' | 'name'> | undefined;
  switchEmbeddedWallet: (id: string) => void;
}>(defaultWallet);

interface WalletProviderProps {
  children: ReactNode;
}

/**
 * Provider used to track the current selected external or embedded wallet and watch for any changed in the Capsule SDK
 */
export function WalletProvider({ children }: WalletProviderProps) {
  const capsule = useCapsuleStore(state => state.capsule);
  const [selectedExternalAddress, setSelectedExternalAddress] = useState(capsule.currentExternalWalletAddresses?.[0] ?? '');
  const [selectedEmbeddedWalletId, setSelectedEmbeddedWalletId] = useState(capsule.currentWalletIds?.[0] ?? '');

  useEffect(() => {
    window.addEventListener(EXTERNAL_WALLET_CHANGE_EVENT, updateExternalAddress);
    window.addEventListener(CURRENT_WALLET_IDS_CHANGE_EVENT, updateSelectedEmbeddedWalletId);

    return () => {
      window.removeEventListener(EXTERNAL_WALLET_CHANGE_EVENT, updateExternalAddress);
      window.removeEventListener(CURRENT_WALLET_IDS_CHANGE_EVENT, updateSelectedEmbeddedWalletId);
    };
  }, []);

  const updateExternalAddress = () => {
    setSelectedExternalAddress(capsule.currentExternalWalletAddresses?.[0] ?? '');
  };

  const updateSelectedEmbeddedWalletId = () => {
    setSelectedEmbeddedWalletId(capsule.currentWalletIds?.[0] ?? '');
  };

  const switchEmbeddedWallet = (id: string) => {
    const currentIds = capsule.currentWalletIds?.filter(wid => wid !== id) ?? [];
    capsule.setCurrentWalletIds([id, ...currentIds]);
  };

  const selectedWallet: Pick<WalletEntity, 'id' | 'address' | 'name'> | undefined = useMemo(() => {
    const selectedCapsuleWalletId = selectedEmbeddedWalletId;
    const selectedCapsuleWallet = capsule.wallets[selectedCapsuleWalletId];
    return capsule.isUsingExternalWallet()
      ? { id: selectedExternalAddress, address: selectedExternalAddress, name: '' }
      : selectedCapsuleWallet
        ? {
            id: selectedCapsuleWallet.id,
            address: selectedCapsuleWallet.address,
            name: selectedCapsuleWallet.name,
          }
        : undefined;
  }, [selectedEmbeddedWalletId, selectedExternalAddress]);

  return (
    <WalletContext.Provider
      value={useMemo(
        () => ({
          wallet: selectedWallet,
          switchEmbeddedWallet,
        }),
        [selectedWallet, switchEmbeddedWallet],
      )}
    >
      {children}
    </WalletContext.Provider>
  );
}

export const useWallet = () => useContext(WalletContext);
