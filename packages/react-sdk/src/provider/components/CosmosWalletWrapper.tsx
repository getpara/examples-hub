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
  projectId,
  onSwitchWallet,
}: {
  cosmosConnectorConfig?: ParaCosmosProviderConfigNoWallets;
  grazProviderProps: ParaGrazProviderProps;
  projectId?: string;
  onSwitchWallet: ({ address, error }: { address?: string; error?: string }) => void;
} & PropsWithChildren) => {
  const para = useInternalClient();
  const wallets = useStore(state => state.externalWallets);
  const isUsing = wallets.some(w => w in CosmosWallet);

  if (!cosmosConnectorConfig) {
    if (isUsing) {
      throw new Error('A valid cosmosConnector config is required to use an external Cosmos wallet.');
    }

    return children;
  }

  return (
    <CosmosExternalWalletProvider
      config={cosmosConnectorConfig}
      internalConfig={{ onSwitchWallet, para }}
      grazProviderProps={{
        ...grazProviderProps,
        walletConnect: {
          ...grazProviderProps?.walletConnect,
          options: {
            ...grazProviderProps?.walletConnect?.options,
            projectId: projectId ?? '',
          },
        },
      }}
      isUsing={isUsing}
      wallets={wallets}
    >
      {children}
    </CosmosExternalWalletProvider>
  );
};
