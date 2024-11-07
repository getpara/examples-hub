import { ReactNode, useEffect } from 'react';
import { createConfig, CreateConfigParameters, WagmiProvider, WagmiProviderProps } from 'wagmi';
import { WalletList } from '../types/Wallet.js';
import { connectorsForWallets } from '../wallets/connectorsForWallets.js';
import { Chain, http, Transport } from 'viem';
import { computeWalletConnectMetaData } from '../utils/computeWalletConnectMetaData.js';
import { EvmExternalWalletContext, EvmExternalWalletProvider } from './EvmExternalWalletContext.js';
import { useExternalWalletProviderStore } from '@usecapsule/react-sdk';

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

  const { projectId, appName, appDescription, appIcon, appUrl, wallets, chains, transports, ...wagmiConfigParams } = _config;

  const wcMetadata = computeWalletConnectMetaData({ appName, appDescription, appUrl, appIcon });

  const connectors = connectorsForWallets(wallets, {
    projectId,
    appName,
    appDescription,
    appUrl,
    appIcon,
    walletConnectParameters: { metadata: wcMetadata },
  });

  const config = createConfig({
    ...wagmiConfigParams,
    chains,
    transports: transports || createDefaultTransports(chains),
    connectors,
  } as CreateConfigParameters<chains, transports>);

  useEffect(() => {
    if (!evmContext || !EvmProvider) {
      updateExternalWalletProviderState({ EvmProvider: EvmExternalWalletProvider, evmContext: EvmExternalWalletContext });
    }
  }, []);

  if (!evmContext || !EvmProvider) {
    return null;
  }

  return (
    <WagmiProvider config={config} {...wagmiProviderProps}>
      {children}
    </WagmiProvider>
  );
}
