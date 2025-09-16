import { useAccount } from '@getpara/graz';
import { MultiChainHookArgs } from '../types/ExternalHooks.js';

export type TExternalHooks = {
  useAccount: typeof useAccount<MultiChainHookArgs>;
};

export const externalHooks = { useAccount: useAccount as typeof useAccount };
