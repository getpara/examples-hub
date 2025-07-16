import ParaWeb, { PrimaryAuthInfo } from '@getpara/web-sdk';

type AccountValue = PrimaryAuthInfo & {
  email?: string;
  phone?: `+${number}`;
  farcasterUsername?: string;
  telegramUserId?: string;
  externalWalletAddress?: string;
  wallets: (typeof ParaWeb.prototype)['availableWallets'];
  userId?: string;
};

export type Account =
  | ({
      isConnected: false;
      isGuestMode?: false;
    } & {
      [key in keyof AccountValue]?: undefined;
    })
  | ({
      isConnected: true;
      isGuestMode: true;
    } & Pick<AccountValue, 'wallets'> & {
        [key in keyof Omit<AccountValue, 'wallets'>]?: undefined;
      })
  | ({
      isConnected: true;
      isGuestMode: false;
    } & AccountValue);

export const getEmbeddedAccount = (para: ParaWeb | undefined, isFullyLoggedIn: boolean | undefined): Account => {
  switch (true) {
    case !para:
    case !para?.isReady:
    case isFullyLoggedIn === undefined:
      return { isConnected: false };
  }

  if (para.isGuestMode) {
    return {
      isConnected: true,
      isGuestMode: true,
      wallets: para.availableWallets,
    };
  }

  if (!isFullyLoggedIn) {
    return {
      isConnected: false,
    };
  }

  const authInfo = para.authInfo;

  const value: Account = {
    auth: authInfo?.auth,
    authType: authInfo?.authType,
    identifier: authInfo?.identifier,
    userId: para.userId,
    wallets: para.availableWallets,
    isConnected: true,
    isGuestMode: false,
  } as Account;

  if (authInfo) {
    switch (authInfo.authType) {
      case 'email':
        value.email = authInfo.identifier;
        break;
      case 'phone':
        value.phone = authInfo.identifier as `+${number}`;
        break;
      case 'farcaster':
        value.farcasterUsername = authInfo.identifier;
        break;
      case 'telegram':
        value.telegramUserId = authInfo.identifier;
        break;
      case 'externalWallet':
        value.externalWalletAddress = authInfo.identifier;
        break;
      default:
        break;
    }
  }

  return value;
};
