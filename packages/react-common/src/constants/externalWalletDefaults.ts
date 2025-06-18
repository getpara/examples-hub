import { ExternalWalletInfo } from '@getpara/web-sdk';

export const defaultCosmosExternalWallet = {
  wallets: [],
  chains: [],
  chainId: undefined,
  disconnect: () => Promise.resolve(),
  switchChain: () => Promise.resolve(),
  connectParaEmbedded: () => Promise.resolve({}),
  signMessage: () => Promise.resolve({}),
  signVerificationMessage: () => Promise.resolve({}),
  requestInfo: () => Promise.resolve({} as any),
  disconnectBase: () => Promise.resolve(),
};

export const defaultEvmExternalWallet = {
  wallets: [],
  chains: [],
  chainId: undefined,
  username: undefined,
  avatar: undefined,
  balance: undefined,
  disconnect: () => Promise.resolve(),
  switchChain: () => Promise.resolve(),
  connectParaEmbedded: () => Promise.resolve({}),
  signMessage: () => Promise.resolve({}),
  signVerificationMessage: () => Promise.resolve({}),
  getWalletBalance: () => Promise.resolve(undefined),
  requestInfo: () => Promise.resolve({} as ExternalWalletInfo),
  disconnectBase: () => Promise.resolve(),
};

export const defaultSolanaExternalWallet = {
  wallets: [],
  disconnect: () => Promise.resolve(),
  signMessage: () => Promise.resolve({}),
  signVerificationMessage: () => Promise.resolve({}),
  requestInfo: () => Promise.resolve({} as ExternalWalletInfo),
  disconnectBase: () => Promise.resolve(),
};
