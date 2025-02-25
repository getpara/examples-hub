import { Context } from 'react';
import { ParaSolanaProvider, SolanaExternalWalletContextType, WalletList } from '@getpara/solana-wallet-connectors';
import { SolanaExternalWalletContext } from './stubs/SolanaExternalWalletContextStub.js';

export const getParaSolanaConnector = async () => {
  let Provider: typeof ParaSolanaProvider | undefined,
    context: Context<SolanaExternalWalletContextType> | undefined,
    wallets: WalletList;

  try {
    // @ts-ignore
    const lib = await import('@getpara/solana-wallet-connectors');
    Provider = lib.ParaSolanaProvider;
    context = lib.SolanaExternalWalletContext;
    wallets = lib.allWallets;
  } catch (e) {
    Provider = undefined;
    context = SolanaExternalWalletContext;
    wallets = [];
  }

  return { Provider, context, wallets };
};
