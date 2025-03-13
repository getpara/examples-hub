import { PropsWithChildren } from 'react';
import { EvmExternalWalletProvider } from '../providers/EvmExternalWalletProvider.js';
import { Chain, Transport } from 'viem';
import { EvmWallet } from '../../modal/index.js';
import { ParaEvmProviderConfigNoWallets } from '../types/externalWalletProviders.js';
import { ParaWagmiProviderProps } from '@getpara/evm-wallet-connectors';
import { useInternalClient } from '../hooks/utils/useInternalClient.js';
import { useStore } from '../stores/useStore.js';

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
  const wallets = useStore(state => state.externalWallets);

  const isUsing = wallets.some(w => w in EvmWallet);

  return (
    <EvmExternalWalletProvider
      config={evmProviderConfig}
      internalConfig={{ onSwitchWallet, para }}
      wagmiProviderProps={wagmiProviderProps}
      isUsing={isUsing}
      wallets={wallets}
    >
      {children}
    </EvmExternalWalletProvider>
  );
};
