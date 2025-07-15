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
  useAccount: () => undefined,
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
  useAccount: () => undefined,
  farcasterStatus: { isPresent: false as const },
};

export const defaultSolanaExternalWallet = {
  wallets: [],
  disconnect: () => Promise.resolve(),
  signMessage: () => Promise.resolve({}),
  signVerificationMessage: () => Promise.resolve({}),
  requestInfo: () => Promise.resolve({} as ExternalWalletInfo),
  disconnectBase: () => Promise.resolve(),
  useWallet: () => undefined,
  farcasterStatus: { isPresent: false as const },
};
