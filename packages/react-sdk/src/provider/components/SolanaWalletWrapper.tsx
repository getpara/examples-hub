import { PropsWithChildren } from 'react';
import { ParaSolanaProviderConfigNoWallets } from '../types/externalWalletProviders.js';
import { SolanaExternalWalletProvider } from '../providers/SolanaExternalWalletProvider.js';
import { useInternalClient } from '../hooks/utils/useInternalClient.js';
import { useStore } from '../stores/useStore.js';
import { SOLANA_WALLETS } from '@getpara/web-sdk';

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
  const connectionOnly = useStore(state => state.connectionOnly);
  const includeWalletVerification = useStore(state => state.includeWalletVerification);

  const isUsing = wallets.some(w => w in SOLANA_WALLETS);
  if (!solanaProviderConfig) {
    if (isUsing) {
      throw new Error('A valid solanaConnector config is required to use an external Solana wallet.');
    }

    return children;
  }

  return (
    <SolanaExternalWalletProvider
      config={solanaProviderConfig}
      internalConfig={{
        onSwitchWallet,
        para,
        walletsWithFullAuth: externalWalletsWithFullAuth,
        connectionOnly,
        includeWalletVerification,
      }}
      isUsing={isUsing}
      wallets={wallets}
    >
      {children}
    </SolanaExternalWalletProvider>
  );
};
