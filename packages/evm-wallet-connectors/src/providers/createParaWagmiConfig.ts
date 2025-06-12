import { createConfig, CreateConfigParameters } from 'wagmi';
import { Chain, Transport } from 'viem';
import { connectorsForWallets } from '../wallets/connectorsForWallets.js';
import { computeWalletConnectMetaData } from '../utils/computeWalletConnectMetaData.js';
import { paraConnector } from '@getpara/wagmi-v2-connector';
import { setWagmiConfig } from '../stores/wagmiConfigStore.js';
import type { ParaEvmProviderConfig } from './ParaEvmContext.js';
import ParaWeb from '@getpara/web-sdk';
import { resolveWalletList } from '../utils/resolveWalletList.js';

/**
 * Creates a Wagmi configuration for the Para EVM provider.
 * @param para - The ParaWeb instance to use.
 * @param cfg - The configuration options for the Para EVM provider.
 * @returns The created Wagmi configuration.
 */
export function createParaWagmiConfig<
  const chains extends readonly [Chain, ...Chain[]],
  transports extends Record<chains[number]['id'], Transport>,
>(para: ParaWeb, cfg: ParaEvmProviderConfig<chains, transports>) {
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
    ...wagmiParams
  } = cfg;

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

  const paraConn = paraConnector({
    para,
    chains: [...chains],
    disableModal: true,
    appName,
    options: paraConnectorOptions ?? {},
  });

  const created = createConfig({
    ...wagmiParams,
    chains,
    transports,
    connectors: [...baseConnectors, paraConn],
  } as CreateConfigParameters<chains, transports>);

  setWagmiConfig(created);
  return created;
}
