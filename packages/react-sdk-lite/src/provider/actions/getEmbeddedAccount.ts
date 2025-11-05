import { ParaInternal } from '@getpara/react-common';
import ParaWeb, { AuthMethod, PrimaryAuthInfo } from '@getpara/web-sdk';

type AccountValue = PrimaryAuthInfo & {
  email?: string;
  phone?: `+${number}`;
  farcasterUsername?: string;
  telegramUserId?: string;
  externalWalletAddress?: string;
  wallets: (typeof ParaWeb.prototype)['availableWallets'];
  userId?: string;
  authMethods?: Set<AuthMethod>;
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

export const getEmbeddedAccount = async (
  para: ParaWeb | undefined,
  isFullyLoggedIn: boolean | undefined,
): Promise<Account> => {
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

  let authMethods: Set<AuthMethod>;
  try {
    authMethods = await (para as ParaInternal).supportedUserAuthMethods();
  } catch {
    authMethods = new Set<AuthMethod>();
  }

  const value: Account = {
    auth: authInfo?.auth,
    authType: authInfo?.authType,
    identifier: authInfo?.identifier,
    userId: para.userId,
    wallets: para.availableWallets,
    isConnected: true,
    isGuestMode: false,
    authMethods: authMethods,
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
