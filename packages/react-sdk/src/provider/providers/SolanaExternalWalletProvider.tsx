import { memo, PropsWithChildren, useEffect, useMemo } from 'react';
import { useStore } from '../stores/useStore.js';
import { getParaSolanaConnector } from '../external/getParaSolanaConnector.js';
import { ParaSolanaProviderProps } from '@getpara/solana-wallet-connectors';
import { ExternalWalletProviderCommon, ParaSolanaProviderConfigNoWallets } from '../types/externalWalletProviders.js';
import { TExternalWallet } from '../../modal/index.js';

export function SolanaExternalWalletProvider({
  children,
  isUsing,
  wallets: walletsFromProps,
  ...rest
}: Omit<ParaSolanaProviderProps, 'config'> & { config: ParaSolanaProviderConfigNoWallets } & PropsWithChildren &
  ExternalWalletProviderCommon) {
  const setSolanaContext = useStore(state => state.setSolanaContext);
  const setSolanaProvider = useStore(state => state.setSolanaProvider);
  const SolanaProvider = useStore(state => state.SolanaProvider);
  const setSolanaWallets = useStore(state => state.setSolanaWallets);
  const solanaWallets = useStore(state => state.solanaWallets);
  const isLoadingLib = useStore(state => state.isLoadingSolanaLib);
  const setIsLoadingLib = useStore(state => state.setIsLoadingSolanaLib);

  const filteredWallets = useMemo(
    () => solanaWallets.filter(w => walletsFromProps.includes(w().id.toUpperCase() as TExternalWallet)),
    [solanaWallets, walletsFromProps],
  );

  useEffect(() => {
    const loadLib = async () => {
      if (SolanaProvider) {
        return;
      }

      const { Provider, context, wallets } = await getParaSolanaConnector();

      if (Provider) {
        // @ts-ignore
        setSolanaProvider(Provider);
      }
      if (wallets) {
        setSolanaWallets(wallets);
      }
      if (context) {
        setSolanaContext(context);
      }

      setIsLoadingLib(false);
    };

    loadLib();
  }, []);

  if (isLoadingLib) {
    return null;
  }

  if (SolanaProvider) {
    // @ts-ignore
    return (
      <SolanaProvider {...rest} config={{ ...rest?.config, wallets: filteredWallets }}>
        {children}
      </SolanaProvider>
    );
  } else if (isUsing) {
    throw new Error('@getpara/solana-wallet-connectors is required to use an external Solana wallet.');
  }

  return children;
}

export const MemoizedSolanaExternalWalletProvider = memo(SolanaExternalWalletProvider);
