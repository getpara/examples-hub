import { useAccount } from 'graz';

export type TExternalHooks = {
  useAccount: typeof useAccount;
};

export const externalHooks = { useAccount };
