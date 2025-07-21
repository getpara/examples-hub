import ParaWeb from '@getpara/react-sdk-lite';
import { createParaViemClient } from '@getpara/viem-v2-integration';
import { WalletClientConfig } from 'viem';
import { getViemAccount } from './getViemAccount.js';

export const getViemClient = async ({
  para,
  address,
  walletClientConfig,
}: {
  para: ParaWeb;
  address?: `0x${string}`;
  walletClientConfig: Omit<WalletClientConfig, 'account'>;
}) => {
  const viemAccount = await getViemAccount({
    para,
    address,
  });

  if (!viemAccount || !para) {
    return null;
  }

  return await createParaViemClient(para, { ...walletClientConfig, account: viemAccount });
};
