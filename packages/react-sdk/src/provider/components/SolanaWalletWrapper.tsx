import { PropsWithChildren } from 'react';
import { ParaSolanaProviderConfigNoWallets } from '../types/externalWalletProviders.js';
import { SolanaExternalWalletProvider } from '../providers/SolanaExternalWalletProvider.js';
import { useInternalClient } from '../hooks/utils/useInternalClient.js';
import { useStore } from '../stores/useStore.js';
import { SolanaWallet } from '@getpara/react-common';

export const SolanaWalletWrapper = ({
  children,
  solanaProviderConfig,
  onSwitchWallet,
}: {
  solanaProviderConfig: ParaSolanaProviderConfigNoWallets;
  onSwitchWallet: ({ address, error }: { address?: string; error?: string }) => void;
} & PropsWithChildren) => {
  const externalWalletsWithFullAuth = useStore(state => state.externalWalletsWithFullAuth);
  const para = useInternalClient();
  const wallets = useStore(state => state.externalWallets);

  const isUsing = wallets.some(w => w in SolanaWallet);
  if (!solanaProviderConfig) {
    if (isUsing) {
      throw new Error('A valid solanaConnector config is required to use an external Solana wallet.');
    }

    return children;
  }

  return (
    <SolanaExternalWalletProvider
      config={solanaProviderConfig}
      internalConfig={{ onSwitchWallet, para, walletsWithFullAuth: externalWalletsWithFullAuth }}
      isUsing={isUsing}
      wallets={wallets}
    >
      {children}
    </SolanaExternalWalletProvider>
  );
};
