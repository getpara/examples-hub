import { ReactNode, useCallback, useEffect, useMemo } from 'react';
import { createConfig, CreateConfigParameters, CreateConnectorFn, WagmiProvider, WagmiProviderProps } from 'wagmi';
import { WalletList } from '../types/Wallet.js';
import { connectorsForWallets } from '../wallets/connectorsForWallets.js';
import { Chain, http, Transport } from 'viem';
import { computeWalletConnectMetaData } from '../utils/computeWalletConnectMetaData.js';
import { EvmExternalWalletContext, EvmExternalWalletProvider } from './EvmExternalWalletContext.js';
import { useExternalWalletProviderStore } from '@usecapsule/react-sdk';
import CapsuleWeb from '@usecapsule/react-sdk';
import { connect } from 'wagmi/actions';
import { InjectedParameters } from 'wagmi/connectors';
import { capsuleConnector } from '@usecapsule/wagmi-v2-integration';

interface GetDefaultConfigParameters<
  chains extends readonly [Chain, ...Chain[]],
  transports extends Record<chains[number]['id'], Transport>,
> extends Omit<
    CreateConfigParameters<chains, transports>,
    // We use our own 'connectors' instead of letting user specifying it
    'connectors'
  > {
  appName: string;
  appDescription?: string;
  appUrl?: string;
  appIcon?: string;
  wallets?: WalletList;
  projectId: string;
  capsule?: CapsuleWeb;
  capsuleDisableModal?: boolean;
  capsuleOptions?: InjectedParameters;
}

interface CapsuleEvmProviderProps<
  chains extends readonly [Chain, ...Chain[]],
  transports extends Record<chains[number]['id'], Transport>,
> extends Omit<WagmiProviderProps, 'config'> {
  children: ReactNode;
  config: GetDefaultConfigParameters<chains, transports>;
}

const createDefaultTransports = <
  chains extends readonly [Chain, ...Chain[]],
  transports extends Record<chains[number]['id'], Transport>,
>(
  chains: chains,
): transports => {
  const transportsObject = chains.reduce((acc: transports, chain) => {
    const key = chain.id as keyof transports;
    acc[key] = http() as transports[keyof transports]; // Type assertion here
    return acc;
  }, {} as transports);

  return transportsObject;
};

export function CapsuleEvmProvider<
  const chains extends readonly [Chain, ...Chain[]],
  transports extends Record<chains[number]['id'], Transport>,
>({ children, config: _config, ...wagmiProviderProps }: CapsuleEvmProviderProps<chains, transports>) {
  const updateExternalWalletProviderState = useExternalWalletProviderStore(state => state.updateState);
  const EvmProvider = useExternalWalletProviderStore(state => state.EvmProvider);
  const evmContext = useExternalWalletProviderStore(state => state.evmContext);

  const {
    projectId,
    appName,
    appDescription,
    appIcon,
    appUrl,
    wallets,
    chains,
    transports,
    capsule,
    capsuleDisableModal,
    capsuleOptions,
    ...wagmiConfigParams
  } = _config;

  const wcMetadata = computeWalletConnectMetaData({ appName, appDescription, appUrl, appIcon });

  const capsuleConnectorInstance = useMemo<CreateConnectorFn | undefined>(() => {
    if (!capsule) return undefined;
    const instance = capsuleConnector({
      capsule,
      chains: [...chains],
      disableModal: capsuleDisableModal ?? true,
      appName,
      options: capsuleOptions ?? {},
    });
    return instance;
  }, [capsule, chains, capsuleDisableModal, appName, capsuleOptions]);

  const allConnectors = useMemo<ReturnType<typeof connectorsForWallets>>(() => {
    const baseConnectors = connectorsForWallets(wallets, {
      projectId,
      appName,
      appDescription,
      appUrl,
      appIcon,
      walletConnectParameters: { metadata: wcMetadata },
    });
    return capsuleConnectorInstance ? [...baseConnectors, capsuleConnectorInstance] : baseConnectors;
  }, [wallets, projectId, appName, appDescription, appUrl, appIcon, wcMetadata, capsuleConnectorInstance]);

  const config = useMemo(
    () =>
      createConfig({
        ...wagmiConfigParams,
        chains,
        transports: transports || createDefaultTransports(chains),
        connectors: allConnectors,
      } as CreateConfigParameters<chains, transports>),
    [wagmiConfigParams, chains, transports, allConnectors],
  );

  const connectCapsuleEvmWallet = useCallback(async (): Promise<{ result?: unknown; error?: string }> => {
    if (!capsuleConnectorInstance) {
      return { error: 'No capsule connector instance' };
    }
    try {
      const result = await connect(config, { connector: capsuleConnectorInstance });
      return { result };
    } catch (err: unknown) {
      const error = err instanceof Error ? err.message : 'Unknown error';
      return { error };
    }
  }, [capsuleConnectorInstance, config, connect]);

  useEffect(() => {
    updateExternalWalletProviderState({
      EvmProvider: evmContext && EvmProvider ? EvmProvider : EvmExternalWalletProvider,
      evmContext: evmContext || EvmExternalWalletContext,
      connectCapsuleEvmWallet: capsuleConnectorInstance ? connectCapsuleEvmWallet : undefined,
    });
  }, [evmContext, EvmProvider, capsuleConnectorInstance, connectCapsuleEvmWallet, updateExternalWalletProviderState]);

  if (!evmContext || !EvmProvider) {
    return null;
  }

  return (
    <WagmiProvider config={config} {...wagmiProviderProps}>
      {children}
    </WagmiProvider>
  );
}
