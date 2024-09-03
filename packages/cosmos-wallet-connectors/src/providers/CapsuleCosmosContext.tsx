import { ReactNode, createContext, useContext, useMemo } from 'react';
import { Network, ShuttleProvider, WalletExtensionProvider, WalletMobileProvider } from '@delphi-labs/shuttle-react';
import { WalletList, WalletWithProviders } from '../types/Wallet';

export const CapsuleCosmosContext = createContext<{
  selectedChainId?: string;
  wallets: WalletWithProviders[];
  chains: Network[];
  onSwitchChain: (chainId: string) => void;
}>({ wallets: [], chains: [], onSwitchChain: () => {} });

interface CapsuleCosmosProviderProps {
  children: ReactNode;
  selectedChainId?: string;
  wallets: WalletList;
  chains: Network[];
  walletConnectProjectId: string;
  onSwitchChain: (chainId: string) => void;
}

export function CapsuleCosmosProvider({
  children,
  wallets,
  chains,
  selectedChainId,
  walletConnectProjectId,
  onSwitchChain,
}: CapsuleCosmosProviderProps) {
  const extensionProviders: WalletExtensionProvider[] = [];
  const mobileExtensionProviders: WalletMobileProvider[] = [];
  const walletsWithProviders: WalletWithProviders[] = [];

  wallets.forEach(w => {
    const wallet = w({ networks: chains });
    walletsWithProviders.push(wallet);
    if (wallet.extensionProvider) extensionProviders.push(wallet.extensionProvider);
    if (wallet.mobileProvider) mobileExtensionProviders.push(wallet.mobileProvider);
  });

  return (
    <ShuttleProvider
      extensionProviders={extensionProviders}
      mobileProviders={mobileExtensionProviders}
      persistent
      persistentKey="capsuleCosmosExternal"
      walletConnectProjectId={walletConnectProjectId}
    >
      <CapsuleCosmosContext.Provider
        value={useMemo(
          () => ({ selectedChainId, wallets: walletsWithProviders, chains, onSwitchChain }),
          [selectedChainId, walletsWithProviders, chains, onSwitchChain],
        )}
      >
        {children}
      </CapsuleCosmosContext.Provider>
    </ShuttleProvider>
  );
}

export const useCapsuleCosmos = () => useContext(CapsuleCosmosContext);
