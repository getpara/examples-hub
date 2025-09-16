import { UseAccountArgs } from 'graz';

type ChainId$1 = string | string[];
export interface MultiChainHookArgs {
  chainId?: ChainId$1;
  multiChain?: boolean;
}

export type UseAccountParameters = UseAccountArgs & MultiChainHookArgs;
