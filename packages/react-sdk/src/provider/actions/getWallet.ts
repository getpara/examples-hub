import ParaWeb, { TWalletType } from '@getpara/web-sdk';

export const getWallet = async (
  para?: ParaWeb,
  selectedWallet?: { id?: string; type?: TWalletType },
  isConnected?: boolean,
) => {
  if (!para) {
    return null;
  }

  const isLoggedIn = isConnected ?? (await para?.isFullyLoggedIn());

  if (!isLoggedIn) {
    return null;
  }

  return para.findWallet(selectedWallet?.id, selectedWallet?.type);
};
