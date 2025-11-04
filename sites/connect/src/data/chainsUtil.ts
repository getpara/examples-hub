import { EIP155_CHAINS } from './EIP155Data';
import { COSMOS_MAINNET_CHAINS } from './COSMOSData';

export const ALL_CHAINS = {
  ...EIP155_CHAINS,
  ...COSMOS_MAINNET_CHAINS,
};

export function getChainData(chainId?: string) {
  if (!chainId) return;
  const [namespace, reference] = chainId.toString().split(':');
  return Object.values(ALL_CHAINS).find(chain => chain.chainId.toString() === reference && chain.namespace === namespace);
}
