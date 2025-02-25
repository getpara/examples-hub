import { Context } from 'react';
import { EvmExternalWalletContext } from './stubs/EvmExternalWalletContextStub.js';
import { EvmExternalWalletContextType, ParaEvmProvider, WalletList } from '@getpara/evm-wallet-connectors';

export const getParaEvmConnector = async () => {
  let Provider: typeof ParaEvmProvider | undefined,
    context: Context<EvmExternalWalletContextType> | undefined,
    wallets: WalletList;

  try {
    // @ts-ignore
    const lib = await import('@getpara/evm-wallet-connectors');
    Provider = lib.ParaEvmProvider;
    context = lib.EvmExternalWalletContext;
    wallets = lib.allWallets;
  } catch (e) {
    Provider = undefined;
    context = EvmExternalWalletContext;
    wallets = [];
  }

  return { Provider, context, wallets };
};
