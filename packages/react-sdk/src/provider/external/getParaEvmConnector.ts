import { Context } from 'react';
import { EvmExternalWalletContext } from './stubs/EvmExternalWalletContextStub.js';
import { EvmExternalWalletContextType, ParaEvmProvider, WalletList } from '@getpara/evm-wallet-connectors';
import { getParaEvmLib } from './getParaEvmLib.js';

export const getParaEvmConnector = async () => {
  let Provider: typeof ParaEvmProvider | undefined = undefined,
    context: Context<EvmExternalWalletContextType> | undefined = EvmExternalWalletContext,
    wallets: WalletList = [];

  const { lib } = await getParaEvmLib();

  if (lib) {
    Provider = lib.ParaEvmProvider;
    context = lib.EvmExternalWalletContext;
    wallets = lib.allWallets;
  }

  return { Provider, context, wallets };
};
