import { PropsWithChildren } from 'react';
import { CosmosWallet } from '../../modal/index.js';
import { ParaCosmosProviderConfigNoWallets } from '../types/externalWalletProviders.js';
import { CosmosExternalWalletProvider } from '../providers/CosmosExternalWalletProvider.js';
import { ParaGrazProviderProps } from '@getpara/cosmos-wallet-connectors';
import { useInternalClient } from '../hooks/utils/useInternalClient.js';
import { useStore } from '../stores/useStore.js';

export const CosmosWalletWrapper = ({
  children,
  cosmosConnectorConfig,
  grazProviderProps,
  onSwitchWallet,
}: {
  cosmosConnectorConfig: ParaCosmosProviderConfigNoWallets;
  grazProviderProps: ParaGrazProviderProps;
  onSwitchWallet: ({ address, error }: { address?: string; error?: string }) => void;
} & PropsWithChildren) => {
  const para = useInternalClient();
  const wallets = useStore(state => state.externalWallets);
  const isUsing = wallets.some(w => w in CosmosWallet);

  return (
    <CosmosExternalWalletProvider
      config={cosmosConnectorConfig}
      internalConfig={{ onSwitchWallet, para }}
      grazProviderProps={grazProviderProps}
      isUsing={isUsing}
      wallets={wallets}
    >
      {children}
    </CosmosExternalWalletProvider>
  );
};
