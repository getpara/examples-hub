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
import { getEVMExternalWalletConfigDefault } from '../utils/externalWalletDefaults.js';

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

  useEffect(() => {
    if (!!wallets.length && !walletConnect?.projectId) {
      console.warn(
        'It is recommended to provide a WalletConnect project id to ensure wallet connection works as expected. Sign up for your free key at https://cloud.walletconnect.com/sign-in',
      );
    }
  }, [wallets, walletConnect]);

  const evmProviderConfig: ParaEvmProviderConfigNoWallets<
    readonly [Chain, ...Chain[]],
    Record<[Chain, ...Chain[]][number]['id'], Transport>
  > = useMemo(
    () =>
      !evmConnector
        ? getEVMExternalWalletConfigDefault({ appName, projectId: walletConnect?.projectId })
        : { appName, appDescription, appIcon, appUrl, projectId: walletConnect?.projectId ?? '', ...evmConnector?.config },
    [appName, appDescription, appIcon, appUrl, walletConnect?.projectId, evmConnector],
  );

  const solanaProviderConfig: ParaSolanaProviderConfigNoWallets = useMemo(() => {
    const appIdentity = {
      name: solanaConnector?.config.appIdentity?.name ?? appName,
      uri: solanaConnector?.config.appIdentity?.uri ?? appUrl,
      icon: solanaConnector?.config.appIdentity?.icon ?? appIcon,
    };

    return !solanaConnector
      ? { appIdentity, chain: 'devnet', endpoint: 'https://api.devnet.solana.com' }
      : { appIdentity, ...solanaConnector?.config };
  }, [solanaConnector]);

  const cosmosProviderConfig: ParaCosmosProviderConfigNoWallets = useMemo(
    () =>
      !cosmosConnector
        ? {
            chains: [
              {
                chainId: 'theta-testnet-001',
                currencies: [{ coinDenom: 'atom', coinMinimalDenom: 'uatom', coinDecimals: 6 }],
                rest: 'https://cosmoshubt.lava.build',
                rpc: 'https://cosmoshubt.tendermintrpc.lava.build:443',
                bech32Config: {
                  bech32PrefixAccAddr: 'cosmos',
                  bech32PrefixAccPub: 'cosmospub',
                  bech32PrefixValAddr: 'cosmosvaloper',
                  bech32PrefixValPub: 'cosmosvaloperpub',
                  bech32PrefixConsAddr: 'cosmosvalcons',
                  bech32PrefixConsPub: 'cosmosvalconspub',
                },
                chainName: 'cosmoshubtestnet',
                feeCurrencies: [
                  {
                    coinDenom: 'atom',
                    coinMinimalDenom: 'uatom',
                    coinDecimals: 6,
                    coinGeckoId: '',
                    gasPriceStep: { low: 0.01, average: 0.025, high: 0.03 },
                  },
                ],
                stakeCurrency: { coinDenom: 'atom', coinMinimalDenom: 'uatom', coinDecimals: 6 },
                bip44: { coinType: 118 },
              },
            ],
            onSwitchChain: () => {},
            selectedChainId: 'theta-testnet-001',
          }
        : cosmosConnector.config,
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
