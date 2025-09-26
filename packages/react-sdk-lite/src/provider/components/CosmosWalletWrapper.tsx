import { PropsWithChildren } from 'react';
import { ParaCosmosProviderConfigNoWallets } from '../types/externalWalletProviders.js';
import { CosmosExternalWalletProvider } from '../providers/CosmosExternalWalletProvider.js';
import { ParaGrazProviderProps } from '@getpara/cosmos-wallet-connectors';
import { useInternalClient } from '../hooks/utils/useInternalClient.js';
import { useStore } from '../stores/useStore.js';
import { COSMOS_WALLETS } from '@getpara/web-sdk';
import { useWalletState } from '../hooks/index.js';

export const CosmosWalletWrapper = ({
  children,
  cosmosConnectorConfig,
  grazProviderProps,
  onSwitchWallet,
}: {
  cosmosConnectorConfig: ParaCosmosProviderConfigNoWallets | undefined;
  grazProviderProps: ParaGrazProviderProps;
  onSwitchWallet: ({ address, error }: { address?: string; error?: string }) => void;
} & PropsWithChildren) => {
  const para = useInternalClient();
  const { selectedWallet } = useWalletState();
  const externalWalletsWithFullAuth = useStore(state => state.externalWalletsWithFullAuth);
  const wallets = useStore(state => state.externalWallets);
  const isUsing = wallets.some(w => w in COSMOS_WALLETS);
  const connectionOnly = useStore(state => state.connectionOnly);
  const includeWalletVerification = useStore(state => state.includeWalletVerification);

  return (
    <CosmosExternalWalletProvider
      config={cosmosConnectorConfig}
      internalConfig={{
        onSwitchWallet,
        para,
        walletsWithFullAuth: externalWalletsWithFullAuth,
        connectedWallet: selectedWallet?.id ? { id: selectedWallet.id, type: selectedWallet.type } : null,
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
