import { createContext } from 'react';
import { EvmExternalWalletContextType } from '@getpara/evm-wallet-connectors';

export const defaultEvmExternalWallet: EvmExternalWalletContextType = {
  wallets: [],
  chains: [],
  chainId: undefined,
  username: undefined,
  avatar: undefined,
  disconnect: () => Promise.resolve(),
  switchChain: () => Promise.resolve({}),
  connectParaEmbedded: () => Promise.resolve({}),
  signMessage: () => Promise.resolve({}),
  signVerificationMessage: () => Promise.resolve({}),
  getWalletBalance: () => Promise.resolve(undefined),
};

export const EvmExternalWalletContext = createContext<EvmExternalWalletContextType>(defaultEvmExternalWallet);
