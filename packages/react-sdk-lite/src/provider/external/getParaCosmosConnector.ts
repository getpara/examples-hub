import { Context } from 'react';
import { CosmosExternalWalletContext } from './stubs/CosmosExternalWalletContextStub.js';
import { CosmosExternalWalletContextType, ParaCosmosProvider, WalletList } from '@getpara/cosmos-wallet-connectors';
import { getParaCosmosLib } from './getParaCosmosLib.js';

export const getParaCosmosConnector = async () => {
  let Provider: typeof ParaCosmosProvider | undefined = undefined,
    context: Context<CosmosExternalWalletContextType> | undefined = CosmosExternalWalletContext,
    wallets: WalletList = [];

  const { lib } = await getParaCosmosLib();

  if (lib) {
    Provider = lib.ParaCosmosProvider;
    context = lib.CosmosExternalWalletContext;
    wallets = lib.allWallets;
  }

  return { Provider, context, wallets };
};
