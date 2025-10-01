import { PropsWithChildren, useCallback, useEffect, useMemo } from 'react';
import { useModalStore } from '../../modal/stores/index.js';
import { ExternalWalletProvider } from '../providers/ExternalWalletProvider.js';
import { ExternalWalletConfig } from '../types/provider.js';
import { Chain, Transport } from 'viem';
import {
  ParaCosmosProviderConfigNoWallets,
  ParaEvmProviderConfigNoWallets,
  ParaSolanaProviderConfigNoWallets,
} from '../types/externalWalletProviders.js';
import { EvmWalletWrapper } from './EvmWalletWrapper.js';
import { CosmosWalletWrapper } from './CosmosWalletWrapper.js';
import { SolanaWalletWrapper } from './SolanaWalletWrapper.js';
import { useStore } from '../stores/useStore.js';
import { ParaGrazProviderProps } from '@getpara/cosmos-wallet-connectors';
import { useInternalClient } from '../hooks/utils/useInternalClient.js';
import { EVM_WALLETS } from '@getpara/web-sdk';

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
  const wallets = useStore(state => state.externalWallets);
  const para = useInternalClient();

  useEffect(() => {
    if (
      !!wallets.length &&
      !walletConnect?.projectId &&
      wallets.some(wallet => EVM_WALLETS.includes(wallet as (typeof EVM_WALLETS)[number]))
    ) {
      para.displayModalError(
        'It is recommended to provide a WalletConnect project id to ensure wallet connection works as expected. Refer to our docs at [https://docs.getpara.com/v2/react/guides/external-wallets/evm#configure-the-providers](https://docs.getpara.com/v2/react/guides/external-wallets/evm#configure-the-providers) for configuration details and sign up for your free key at [https://cloud.walletconnect.com/sign-in](https://cloud.walletconnect.com/sign-in)',
      );
      console.warn(
        'It is recommended to provide a WalletConnect project id to ensure wallet connection works as expected. Sign up for your free key at https://cloud.walletconnect.com/sign-in',
      );
    }
  }, [wallets, walletConnect]);

  const evmProviderConfig:
    | ParaEvmProviderConfigNoWallets<readonly [Chain, ...Chain[]], Record<[Chain, ...Chain[]][number]['id'], Transport>>
    | undefined = useMemo(
    () =>
      evmConnector
        ? { appName, appDescription, appIcon, appUrl, projectId: walletConnect?.projectId ?? '', ...evmConnector?.config }
        : undefined,
    [appName, appDescription, appIcon, appUrl, walletConnect?.projectId, evmConnector],
  );

  const solanaProviderConfig: ParaSolanaProviderConfigNoWallets | undefined = useMemo(() => {
    const appIdentity = {
      name: solanaConnector?.config.appIdentity?.name ?? appName,
      uri: solanaConnector?.config.appIdentity?.uri ?? appUrl,
      icon: solanaConnector?.config.appIdentity?.icon ?? appIcon,
    };

    return solanaConnector ? { appIdentity, ...solanaConnector?.config } : undefined;
  }, [solanaConnector]);

  const cosmosProviderConfig: ParaCosmosProviderConfigNoWallets | undefined = useMemo(
    () => (cosmosConnector ? cosmosConnector.config : undefined),
    [cosmosConnector],
  );

  const grazProviderProps: ParaGrazProviderProps = useMemo(() => {
    const connectorsGrazProviderProps = cosmosConnector?.grazProviderProps;
    return {
      ...connectorsGrazProviderProps,
      walletConnect: {
        ...connectorsGrazProviderProps?.walletConnect,
        options: { ...connectorsGrazProviderProps?.walletConnect?.options, projectId: walletConnect?.projectId ?? '' },
      },
    };
  }, [cosmosConnector, walletConnect?.projectId]);

  const handleSwitchWallet = useCallback(({ address, error }: { address?: string; error?: string }) => {
    // If we error on switch wallets we logged out the Para instance so we need to reset the modal state
    // Or if we don't return an address on switch wallets we logged out the Para instance so we need to reset the modal state
    if (error || !address) {
      resetModalState();
    }
  }, []);

  return (
    <EvmWalletWrapper
      evmProviderConfig={evmProviderConfig}
      wagmiProviderProps={evmConnector?.wagmiProviderProps ?? {}}
      onSwitchWallet={handleSwitchWallet}
    >
      <CosmosWalletWrapper
        cosmosConnectorConfig={cosmosProviderConfig}
        grazProviderProps={grazProviderProps}
        onSwitchWallet={handleSwitchWallet}
      >
        <SolanaWalletWrapper onSwitchWallet={handleSwitchWallet} solanaProviderConfig={solanaProviderConfig}>
          <ExternalWalletProvider>{children}</ExternalWalletProvider>
        </SolanaWalletWrapper>
      </CosmosWalletWrapper>
    </EvmWalletWrapper>
  );
};
