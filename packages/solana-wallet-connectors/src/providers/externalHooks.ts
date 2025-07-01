import { useWallet } from '@solana/wallet-adapter-react';

export type TExternalHooks = {
  useWallet: typeof useWallet;
};

export const externalHooks = { useWallet };
