import { memo, PropsWithChildren, useEffect, useMemo } from 'react';
import { useStore } from '../stores/useStore.js';
import { getParaCosmosConnector } from '../external/getParaCosmosConnector.js';
import { ExternalWalletProviderCommon, ParaCosmosProviderConfigNoWallets } from '../types/externalWalletProviders.js';
import { ParaCosmosProviderProps } from '@getpara/cosmos-wallet-connectors';
import { type TExternalWallet } from '@getpara/react-common';

export function CosmosExternalWalletProvider({
  children,
  isUsing,
  wallets: walletsFromProps,
  ...rest
}: Omit<ParaCosmosProviderProps, 'config'> & { config: ParaCosmosProviderConfigNoWallets } & PropsWithChildren &
  ExternalWalletProviderCommon) {
  const setCosmosContext = useStore(state => state.setCosmosContext);
  const setCosmosProvider = useStore(state => state.setCosmosProvider);
  const CosmosProvider = useStore(state => state.CosmosProvider);
  const setCosmosWallets = useStore(state => state.setCosmosWallets);
  const cosmosWallets = useStore(state => state.cosmosWallets);
  const isLoadingLib = useStore(state => state.isLoadingCosmosLib);
  const setIsLoadingLib = useStore(state => state.setIsLoadingCosmosLib);

  const filteredWallets = useMemo(
    () => cosmosWallets.filter(w => walletsFromProps.includes(w().id.toUpperCase() as TExternalWallet)),
    [cosmosWallets, walletsFromProps],
  );

  useEffect(() => {
    const loadLib = async () => {
      if (CosmosProvider) {
        return;
      }

      const { Provider, context, wallets } = await getParaCosmosConnector();

      if (Provider) {
        // @ts-ignore
        setCosmosProvider(Provider);
      }
      if (wallets) {
        setCosmosWallets(wallets);
      }
      if (context) {
        setCosmosContext(context);
      }

      setIsLoadingLib(false);
    };

    loadLib();
  }, []);

  if (isLoadingLib) {
    return null;
  }

  if (CosmosProvider) {
    // @ts-ignore
    return (
      <CosmosProvider {...rest} config={{ ...rest?.config, wallets: filteredWallets }}>
        {children}
      </CosmosProvider>
    );
  } else if (isUsing) {
    console.warn('@getpara/cosmos-wallet-connectors is required to use an external Cosmos wallet.');
  }

  return children;
}

export const MemoizedCosmosExternalWalletProvider = memo(CosmosExternalWalletProvider);
