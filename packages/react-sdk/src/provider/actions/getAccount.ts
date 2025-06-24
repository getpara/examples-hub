import ParaWeb, { CoreAuthInfo } from '@getpara/web-sdk';

type AccountValue = CoreAuthInfo & {
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

export const getAccount = async (para?: ParaWeb, isConnected?: boolean): Promise<Account> => {
  if (!para) {
    return { isConnected: false };
  }

  if (para.isGuestMode) {
    return {
      isConnected: true,
      isGuestMode: true,
      wallets: para.availableWallets,
    };
  }

  const _isConnected = isConnected ?? (await para?.isFullyLoggedIn());

  if (_isConnected) {
    const authInfo = para.authInfo;

    const value: Account = {
      ...(authInfo || {}),
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
  }

  return { isConnected: false };
};
