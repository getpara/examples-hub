import ParaWeb from '@getpara/web-sdk';

export const getAccount = async (para?: ParaWeb) => {
  const isLoggedIn = await para?.isFullyLoggedIn();

  const resp = {
    isConnected: !!isLoggedIn,
    email: undefined,
    phone: undefined,
    wallets: undefined,
  };

  if (para && resp.isConnected) {
    resp.email = para.getEmail();
    resp.phone = para.getPhoneNumber();
    resp.wallets = para.getWallets();
  }

  return resp;
};
