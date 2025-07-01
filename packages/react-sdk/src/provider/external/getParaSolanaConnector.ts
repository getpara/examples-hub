import { Context } from 'react';
import { ParaSolanaProvider, SolanaExternalWalletContextType, WalletList } from '@getpara/solana-wallet-connectors';
import { SolanaExternalWalletContext } from './stubs/SolanaExternalWalletContextStub.js';
import { getParaSolanaLib } from './getParaSolanaLib.js';

export const getParaSolanaConnector = async () => {
  let Provider: typeof ParaSolanaProvider | undefined = undefined,
    context: Context<SolanaExternalWalletContextType> | undefined = SolanaExternalWalletContext,
    wallets: WalletList = [];

  const { lib } = await getParaSolanaLib();

  if (lib) {
    Provider = lib.ParaSolanaProvider;
    context = lib.SolanaExternalWalletContext;
    wallets = lib.allWallets;
  }

  return { Provider, context, wallets };
};
