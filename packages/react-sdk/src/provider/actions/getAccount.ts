import ParaWeb, { CoreAuthInfo } from '@getpara/web-sdk';

type AccountValue = CoreAuthInfo & {
  email?: string;
  phone?: `+${number}`;
  farcasterUsername?: string;
  telegramUserId?: string;
  externalWalletAddress?: string;
  wallets: (typeof ParaWeb.prototype)['availableWallets'];
  userId: string;
  isGuestMode: boolean;
};

export type Account =
  | ({
      isConnected: false;
    } & {
      [key in keyof AccountValue]?: undefined;
    })
  | ({
      isConnected: true;
    } & AccountValue);

export const getAccount = async (para?: ParaWeb): Promise<Account> => {
  const isLoggedIn = await para?.isFullyLoggedIn();

  const isConnected = !!para && !!isLoggedIn;

  if (isConnected) {
    const value: Account = {
      ...para.authInfo!,
      userId: para.userId!,
      wallets: para.availableWallets,
      isConnected: true,
      isGuestMode: para.isGuestMode,
    };

    if (para.authInfo) {
      switch (para.authInfo.authType) {
        case 'email':
          value.email = para.authInfo.identifier;
          break;
        case 'phone':
          value.phone = para.authInfo.identifier as `+${number}`;
          break;
        case 'farcaster':
          value.farcasterUsername = para.authInfo.identifier;
          break;
        case 'telegram':
          value.telegramUserId = para.authInfo.identifier;
          break;
        case 'externalWallet':
          value.externalWalletAddress = para.authInfo.identifier;
          break;
        default:
          break;
      }
    }

    return value;
  }

  return { isConnected: false };
};
