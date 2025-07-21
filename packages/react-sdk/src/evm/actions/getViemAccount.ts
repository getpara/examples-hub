import ParaWeb from '@getpara/react-sdk-lite';
import { createParaAccount } from '@getpara/viem-v2-integration';

export const getViemAccount = async ({ para, address }: { para: ParaWeb; address?: `0x${string}` }) => {
  // If there is no valid wallets on the account, return null
  if (para.getWalletsByType('EVM').length === 0) {
    return null;
  }

  if (address) {
    const wallet = para.findWallet(address);

    if (wallet?.isExternal) {
      return null;
    }
  }

  return await createParaAccount(para, address);
};
