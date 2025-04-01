import ParaWeb, { Wallet } from '@getpara/web-sdk';

type AccountType = {
  isConnected: boolean;
  email?: string;
  phone?: string;
  wallets?: Pick<Wallet, 'id' | 'type' | 'name' | 'address' | 'isExternal'>[];
  userId?: string;
};

export const getAccount = async (para?: ParaWeb) => {
  const isLoggedIn = await para?.isFullyLoggedIn();

  const resp: AccountType = {
    isConnected: !!isLoggedIn,
    email: undefined,
    phone: undefined,
    wallets: undefined,
    userId: undefined,
  };

  if (para && resp.isConnected) {
    resp.email = para.getEmail();
    resp.phone = para.getPhoneNumber();
    resp.wallets = para.availableWallets;
    resp.userId = para.getUserId();
  }

  return resp;
};
