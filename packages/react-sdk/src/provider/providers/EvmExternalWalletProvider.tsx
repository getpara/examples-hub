import { PropsWithChildren, useEffect, useMemo } from 'react';
import { getParaEvmConnector } from '../external/getParaEvmConnector.js';
import { ParaEvmProviderProps } from '@getpara/evm-wallet-connectors';
import { useStore } from '../stores/useStore.js';
import { Chain, Transport } from 'viem';
import { ExternalWalletProviderCommon, ParaEvmProviderConfigNoWallets } from '../types/externalWalletProviders.js';
import { TExternalWallet } from '../../modal/index.js';

export function EvmExternalWalletProvider<
  const chains extends readonly [Chain, ...Chain[]],
  transports extends Record<chains[number]['id'], Transport>,
>({
  children,
  isUsing,
  wallets: walletsFromProps,
  ...rest
}: Omit<ParaEvmProviderProps<chains, transports>, 'config'> & {
  config: ParaEvmProviderConfigNoWallets<chains, transports>;
} & PropsWithChildren &
  ExternalWalletProviderCommon) {
  const setEvmContext = useStore(state => state.setEvmContext);
  const setEvmProvider = useStore(state => state.setEvmProvider);
  const EvmProvider = useStore(state => state.EvmProvider);
  const setEvmWallets = useStore(state => state.setEvmWallets);
  const evmWallets = useStore(state => state.evmWallets);
  const isLoadingLib = useStore(state => state.isLoadingEvmLib);
  const setIsLoadingLib = useStore(state => state.setIsLoadingEvmLib);

  const filteredWallets = useMemo(
    () =>
      evmWallets.filter(w =>
        walletsFromProps.includes(
          w({
            appName: rest?.config?.appName ?? '',
            projectId: rest?.config?.projectId ?? '',
          }).id.toUpperCase() as TExternalWallet,
        ),
      ),
    [evmWallets, walletsFromProps],
  );

  useEffect(() => {
    const loadLib = async () => {
      if (EvmProvider) {
        return;
      }

      const { Provider, context, wallets } = await getParaEvmConnector();

      if (Provider) {
        // @ts-ignore
        setEvmProvider(Provider);
      }
      if (wallets) {
        setEvmWallets(wallets);
      }
      if (context) {
        setEvmContext(context);
      }

      setIsLoadingLib(false);
    };

    loadLib();
  }, []);

  if (isLoadingLib) {
    return null;
  }

  if (EvmProvider) {
    // @ts-ignore
    return (
      <EvmProvider {...rest} config={{ ...rest?.config, wallets: filteredWallets }}>
        {children}
      </EvmProvider>
    );
  } else if (isUsing) {
    throw new Error('@getpara/evm-wallet-connectors is required to use an external EVM wallet.');
  }

  return children;
}
