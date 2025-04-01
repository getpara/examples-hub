import { PropsWithChildren } from 'react';
import { EvmExternalWalletProvider } from '../providers/EvmExternalWalletProvider.js';
import { Chain, Transport } from 'viem';
import { ParaEvmProviderConfigNoWallets } from '../types/externalWalletProviders.js';
import { ParaWagmiProviderProps } from '@getpara/evm-wallet-connectors';
import { useInternalClient } from '../hooks/utils/useInternalClient.js';
import { useStore } from '../stores/useStore.js';
import { EvmWallet } from '@getpara/react-common';
import { useWallet } from '../hooks/index.js';

export const EvmWalletWrapper = <
  chains extends readonly [Chain, ...Chain[]],
  transports extends Record<chains[number]['id'], Transport>,
>({
  children,
  evmProviderConfig,
  wagmiProviderProps,
  onSwitchWallet,
}: {
  evmProviderConfig: ParaEvmProviderConfigNoWallets<chains, transports>;
  wagmiProviderProps: ParaWagmiProviderProps;
  onSwitchWallet: ({ address, error }: { address?: string; error?: string }) => void;
} & PropsWithChildren) => {
  const para = useInternalClient();
  const { data: wallet } = useWallet();
  const externalWalletsWithFullAuth = useStore(state => state.externalWalletsWithFullAuth);
  const wallets = useStore(state => state.externalWallets);

  const isUsing = wallets.some(w => w in EvmWallet);

  return (
    <EvmExternalWalletProvider
      config={evmProviderConfig}
      internalConfig={{ onSwitchWallet, para, walletsWithFullAuth: externalWalletsWithFullAuth, connectedWallet: wallet }}
      wagmiProviderProps={wagmiProviderProps}
      isUsing={isUsing}
      wallets={wallets}
    >
      {children}
    </EvmExternalWalletProvider>
  );
};
