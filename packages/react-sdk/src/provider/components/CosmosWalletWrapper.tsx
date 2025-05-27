import { PropsWithChildren } from 'react';
import { ParaCosmosProviderConfigNoWallets } from '../types/externalWalletProviders.js';
import { CosmosExternalWalletProvider } from '../providers/CosmosExternalWalletProvider.js';
import { ParaGrazProviderProps } from '@getpara/cosmos-wallet-connectors';
import { useInternalClient } from '../hooks/utils/useInternalClient.js';
import { useStore } from '../stores/useStore.js';
import { CosmosWallet } from '@getpara/react-common';
import { useWallet } from '../hooks/index.js';

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
  const { data: wallet } = useWallet();
  const externalWalletsWithFullAuth = useStore(state => state.externalWalletsWithFullAuth);
  const wallets = useStore(state => state.externalWallets);
  const isUsing = wallets.some(w => w in CosmosWallet);
  const connectionOnly = useStore(state => state.connectionOnly);
  const includeWalletVerification = useStore(state => state.includeWalletVerification);

  return (
    <CosmosExternalWalletProvider
      config={cosmosConnectorConfig}
      internalConfig={{
        onSwitchWallet,
        para,
        walletsWithFullAuth: externalWalletsWithFullAuth,
        connectedWallet: wallet,
        connectionOnly,
        includeWalletVerification,
      }}
      grazProviderProps={grazProviderProps}
      isUsing={isUsing}
      wallets={wallets}
    >
      {children}
    </CosmosExternalWalletProvider>
  );
};
