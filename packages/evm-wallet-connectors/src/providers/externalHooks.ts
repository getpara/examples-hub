import { useAccount } from 'wagmi';

export type TExternalHooks = {
  useAccount: typeof useAccount;
};

export const externalHooks = { useAccount };
