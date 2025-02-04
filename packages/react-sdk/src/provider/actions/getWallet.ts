import ParaWeb, { WalletType } from '@getpara/web-sdk';

export const getWallet = async (para?: ParaWeb, selectedWallet?: { id?: string; type?: WalletType }) => {
  const isLoggedIn = await para?.isFullyLoggedIn();

  if (!para || !isLoggedIn) {
    return null;
  }

  return para.findWallet(selectedWallet?.id, selectedWallet?.type);
};
