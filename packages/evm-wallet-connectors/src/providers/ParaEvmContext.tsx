import { ReactNode, useCallback, useEffect, useMemo } from 'react';
import { createConfig, CreateConfigParameters, CreateConnectorFn, WagmiProvider, WagmiProviderProps } from 'wagmi';
import { WalletList } from '../types/Wallet.js';
import { connectorsForWallets } from '../wallets/connectorsForWallets.js';
import { Chain, http, Transport } from 'viem';
import { computeWalletConnectMetaData } from '../utils/computeWalletConnectMetaData.js';
import { EvmExternalWalletContext, EvmExternalWalletProvider } from './EvmExternalWalletContext.js';
import { useClient, useExternalWalletProviderStore } from '@getpara/react-sdk';
import ParaWeb from '@getpara/react-sdk';
import { connect } from 'wagmi/actions';
import { InjectedParameters } from 'wagmi/connectors';
import { paraConnector } from '@getpara/wagmi-v2-integration';

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
  para?: ParaWeb;
  paraDisableModal?: boolean;
  paraOptions?: InjectedParameters;
}

interface ParaEvmProviderProps<
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

export function ParaEvmProvider<
  const chains extends readonly [Chain, ...Chain[]],
  transports extends Record<chains[number]['id'], Transport>,
>({ children, config: _config, ...wagmiProviderProps }: ParaEvmProviderProps<chains, transports>) {
  const updateExternalWalletProviderState = useExternalWalletProviderStore(state => state.updateState);
  const EvmProvider = useExternalWalletProviderStore(state => state.EvmProvider);
  const evmContext = useExternalWalletProviderStore(state => state.evmContext);
  const para = _config.para ?? useClient();

  const {
    projectId,
    appName,
    appDescription,
    appIcon,
    appUrl,
    wallets,
    chains,
    transports,
    paraDisableModal,
    paraOptions,
    ...wagmiConfigParams
  } = _config;

  const wcMetadata = computeWalletConnectMetaData({ appName, appDescription, appUrl, appIcon });

  const paraConnectorInstance = useMemo<CreateConnectorFn | undefined>(() => {
    if (!para) return undefined;
    const instance = paraConnector({
      para,
      chains: [...chains],
      disableModal: paraDisableModal ?? true,
      appName,
      options: paraOptions ?? {},
    });
    return instance;
  }, [para, chains, paraDisableModal, appName, paraOptions]);

  const allConnectors = useMemo<ReturnType<typeof connectorsForWallets>>(() => {
    const baseConnectors = connectorsForWallets(wallets, {
      projectId,
      appName,
      appDescription,
      appUrl,
      appIcon,
      walletConnectParameters: { metadata: wcMetadata },
    });
    return paraConnectorInstance ? [...baseConnectors, paraConnectorInstance] : baseConnectors;
  }, [wallets, projectId, appName, appDescription, appUrl, appIcon, wcMetadata, paraConnectorInstance]);

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

  const connectParaEvmWallet = useCallback(async (): Promise<{ result?: unknown; error?: string }> => {
    if (!paraConnectorInstance) {
      return { error: 'No para connector instance' };
    }
    try {
      const result = await connect(config, { connector: paraConnectorInstance });
      return { result };
    } catch (err: unknown) {
      const error = err instanceof Error ? err.message : 'Unknown error';
      return { error };
    }
  }, [paraConnectorInstance, config, connect]);

  useEffect(() => {
    updateExternalWalletProviderState({
      EvmProvider: evmContext && EvmProvider ? EvmProvider : EvmExternalWalletProvider,
      evmContext: evmContext || EvmExternalWalletContext,
      connectParaEvmWallet: paraConnectorInstance ? connectParaEvmWallet : undefined,
    });
  }, [evmContext, EvmProvider, paraConnectorInstance, connectParaEvmWallet, updateExternalWalletProviderState]);

  if (!evmContext || !EvmProvider) {
    return null;
  }

  return (
    <WagmiProvider config={config} {...wagmiProviderProps}>
      {children}
    </WagmiProvider>
  );
}
