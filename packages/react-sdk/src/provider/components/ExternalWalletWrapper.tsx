import { PropsWithChildren, useCallback, useMemo } from 'react';
import { useModalStore, useUserInfoStore } from '../../modal/stores/index.js';
import { ExternalWalletProvider } from '../providers/ExternalWalletProvider.js';
import { ExternalWalletConfig } from '../types/provider.js';
import { Chain, Transport } from 'viem';
import { ParaEvmProviderConfigNoWallets, ParaSolanaProviderConfigNoWallets } from '../types/externalWalletProviders.js';
import { EvmWalletWrapper } from './EvmWalletWrapper.js';
import { CosmosWalletWrapper } from './CosmosWalletWrapper.js';
import { SolanaWalletWrapper } from './SolanaWalletWrapper.js';
import { useStore } from '../stores/useStore.js';

interface ExternalWalletWrapperProps<
  chains extends readonly [Chain, ...Chain[]],
  transports extends Record<chains[number]['id'], Transport>,
> extends PropsWithChildren {
  config?: Omit<ExternalWalletConfig<chains, transports>, 'wallets'>;
}

export const ExternalWalletWrapper = <
  chains extends readonly [Chain, ...Chain[]],
  transports extends Record<chains[number]['id'], Transport>,
>({
  children,
  config,
}: ExternalWalletWrapperProps<chains, transports>) => {
  const { appDescription, appIcon, appUrl, walletConnect, evmConnector, cosmosConnector, solanaConnector } = config ?? {};

  const appName = useStore(state => state.appName);
  const resetModalState = useModalStore(state => state.resetState);
  const resetUserInfoState = useUserInfoStore(state => state.resetState);

  const evmProviderConfig: ParaEvmProviderConfigNoWallets<chains, transports> | undefined = useMemo(
    () =>
      !evmConnector
        ? undefined
        : { appName, appDescription, appIcon, appUrl, projectId: walletConnect?.projectId ?? '', ...evmConnector?.config },
    [appName, appDescription, appIcon, appUrl, walletConnect?.projectId, evmConnector],
  );

  const solanaProviderConfig: ParaSolanaProviderConfigNoWallets | undefined = useMemo(
    () =>
      !solanaConnector
        ? undefined
        : {
            appIdentity: {
              name: solanaConnector?.config.appIdentity?.name ?? appName,
              uri: solanaConnector?.config.appIdentity?.uri ?? appUrl,
              icon: solanaConnector?.config.appIdentity?.icon ?? appIcon,
            },
            ...solanaConnector?.config,
          },
    [solanaConnector],
  );

  const handleSwitchWallet = useCallback(({ address, error }: { address?: string; error?: string }) => {
    // If we error on switch wallets we logged out the Para instance so we need to reset the modal state
    // Or if we don't return an address on switch wallets we logged out the Para instance so we need to reset the modal state
    if (error || !address) {
      resetModalState();
      resetUserInfoState();
    }
  }, []);

  return (
    <EvmWalletWrapper
      evmProviderConfig={evmProviderConfig}
      wagmiProviderProps={evmConnector?.wagmiProviderProps ?? {}}
      onSwitchWallet={handleSwitchWallet}
    >
      <CosmosWalletWrapper
        cosmosConnectorConfig={cosmosConnector?.config}
        grazProviderProps={cosmosConnector?.grazProviderProps ?? {}}
        projectId={walletConnect?.projectId}
        onSwitchWallet={handleSwitchWallet}
      >
        <SolanaWalletWrapper onSwitchWallet={handleSwitchWallet} solanaProviderConfig={solanaProviderConfig}>
          <ExternalWalletProvider>{children}</ExternalWalletProvider>
        </SolanaWalletWrapper>
      </CosmosWalletWrapper>
    </EvmWalletWrapper>
  );
};
