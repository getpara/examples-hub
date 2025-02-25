import { Context } from 'react';
import { CosmosExternalWalletContext } from './stubs/CosmosExternalWalletContextStub.js';
import { CosmosExternalWalletContextType, ParaCosmosProvider, WalletList } from '@getpara/cosmos-wallet-connectors';

export const getParaCosmosConnector = async () => {
  let Provider: typeof ParaCosmosProvider | undefined,
    context: Context<CosmosExternalWalletContextType> | undefined,
    wallets: WalletList;

  try {
    // @ts-ignore
    const lib = await import('@getpara/cosmos-wallet-connectors');
    Provider = lib.ParaCosmosProvider;
    context = lib.CosmosExternalWalletContext;
    wallets = lib.allWallets;
  } catch (e) {
    Provider = undefined;
    context = CosmosExternalWalletContext;
    wallets = [];
  }

  return { Provider, context, wallets };
};
