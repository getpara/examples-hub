import { PropsWithChildren, useMemo } from 'react';
import { createConfig, CreateConfigParameters, WagmiProvider, WagmiProviderProps } from 'wagmi';
import { WalletList } from '../types/Wallet.js';
import { connectorsForWallets } from '../wallets/connectorsForWallets.js';
import { Chain, http, Transport } from 'viem';
import { computeWalletConnectMetaData } from '../utils/computeWalletConnectMetaData.js';
import { EvmExternalWalletProvider, EvmExternalWalletProviderConfig } from './EvmExternalWalletContext.js';
import { InjectedParameters } from 'wagmi/connectors';
import { paraConnector } from '@getpara/wagmi-v2-connector';
import { setWagmiConfig, getWagmiConfig } from '../stores/wagmiConfigStore.js';
import { TExternalWallet } from '@getpara/react-common';
import { resolveWalletList } from '../utils/resolveWalletList.js';

export interface ParaEvmProviderConfig<
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
  // Either a list of wallet‑factory fns **OR** the Para wallet IDs
  wallets?: WalletList | TExternalWallet[];
  projectId: string;
  paraConnectorOptions?: InjectedParameters;
}

export type ParaWagmiProviderProps = Omit<WagmiProviderProps, 'config'>;

export interface ParaEvmProviderProps<
  chains extends readonly [Chain, ...Chain[]],
  transports extends Record<chains[number]['id'], Transport>,
> {
  config: ParaEvmProviderConfig<chains, transports>;
  internalConfig: EvmExternalWalletProviderConfig;
  wagmiProviderProps?: ParaWagmiProviderProps;
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
>({
  children,
  internalConfig,
  config: _config,
  wagmiProviderProps,
}: ParaEvmProviderProps<chains, transports> & PropsWithChildren) {
  const para = internalConfig.para;

  const {
    projectId,
    appName,
    appDescription,
    appIcon,
    appUrl,
    wallets,
    chains,
    transports,
    paraConnectorOptions,
    ...wagmiConfigParams
  } = _config;

  const paraConnectorInstance = useMemo(() => {
    return paraConnector({
      para,
      chains: [...chains],
      disableModal: true,
      appName,
      options: paraConnectorOptions ?? {},
    });
  }, [para]);

  // Memoizing the config with no deps here so it stays constant after the first render
  const config = useMemo(() => {
    // If a config already exists, return it to avoid re-creating
    // This is for apps that use the createParaWagmiConfig factory function so they have access to the config outside of the provider lifecycle
    const existing = getWagmiConfig();
    if (existing) return existing;

    // If no config exists, create a new one
    const wcMetadata = computeWalletConnectMetaData({ appName, appDescription, appUrl, appIcon });
    const walletFactories = resolveWalletList(wallets);
    const baseConnectors = connectorsForWallets(walletFactories, {
      projectId,
      appName,
      appDescription,
      appUrl,
      appIcon,
      walletConnectParameters: { metadata: wcMetadata },
    });
    const allConnectors = [...baseConnectors, paraConnectorInstance];
    const createdConfig = createConfig({
      ...wagmiConfigParams,
      chains,
      transports: transports || createDefaultTransports(chains),
      connectors: allConnectors,
    } as CreateConfigParameters<chains, transports>);

    // Set the config so it can be accessed outside of the hook lifecycle but still within the lifecycle of the provider
    setWagmiConfig(createdConfig);

    return createdConfig;
  }, [wallets, paraConnectorInstance]);

  return (
    <WagmiProvider config={config} {...wagmiProviderProps}>
      <EvmExternalWalletProvider {...internalConfig}>{children}</EvmExternalWalletProvider>
    </WagmiProvider>
  );
}
