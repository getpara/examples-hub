import { PropsWithChildren } from 'react';
import { SolanaWallet } from '../../modal/index.js';
import { ParaSolanaProviderConfigNoWallets } from '../types/externalWalletProviders.js';
import { SolanaExternalWalletProvider } from '../providers/SolanaExternalWalletProvider.js';
import { useInternalClient } from '../hooks/utils/useInternalClient.js';
import { useStore } from '../stores/useStore.js';

export const SolanaWalletWrapper = ({
  children,
  solanaProviderConfig,
  onSwitchWallet,
}: {
  solanaProviderConfig?: ParaSolanaProviderConfigNoWallets;
  onSwitchWallet: ({ address, error }: { address?: string; error?: string }) => void;
} & PropsWithChildren) => {
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
      internalConfig={{ onSwitchWallet, para }}
      isUsing={isUsing}
      wallets={wallets}
    >
      {children}
    </SolanaExternalWalletProvider>
  );
};
