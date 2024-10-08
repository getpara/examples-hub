import Capsule from '@usecapsule/web-sdk';
import axios from 'axios';

export async function fetchChainData(chainId: number) {
  const res = await axios.get(
    `https://raw.githubusercontent.com/ethereum-lists/chains/refs/heads/master/_data/chains/eip155-${chainId}.json`,
  );

  return res.data;
}

export async function fetchConversionRate(capsule: Capsule, chainId: string, symbol: string) {
  const res = await capsule.ctx.capsuleClient.getConversionRate(chainId, symbol, 'USD');
  return res.conversionRate;
}
