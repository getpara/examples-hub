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

export const getEmbeddedAccount = async (para?: ParaWeb, _isConnected?: boolean): Promise<Account> => {
  if (!!para && para.isGuestMode) {
    return {
      isConnected: true,
      isGuestMode: true,
      wallets: para.availableWallets,
    };
  }

  const isConnected = !!para && (_isConnected ?? (await para?.isFullyLoggedIn()));

  if (isConnected) {
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
  }

  return { isConnected: false };
};

// import ParaWeb, { PrimaryAuthInfo } from '@getpara/web-sdk';

// export const getAccount = async (para?: ParaWeb, isConnected?: boolean, wagmiConfig?: WagmiConfig): Promise<Account> => {
//   const value: Account & {
//     externalWallets: {
//       evm?: GetAccountReturnType;
//     };
//   };

//   const isConnected = !!para && (await para?.isFullyLoggedIn());

//   if (isConnected) {
//     const authInfo = para.authInfo;

//     const value: Account = {
//       auth: authInfo?.auth,
//       authType: authInfo?.authType,
//       identifier: authInfo?.identifier,
//       userId: para.userId,
//       wallets: para.availableWallets,
//       isConnected: true,
//       isGuestMode: false,
//     } as Account;

//     if (authInfo) {
//       switch (authInfo.authType) {
//         case 'email':
//           value.email = authInfo.identifier;
//           break;
//         case 'phone':
//           value.phone = authInfo.identifier as `+${number}`;
//           break;
//         case 'farcaster':
//           value.farcasterUsername = authInfo.identifier;
//           break;
//         case 'telegram':
//           value.telegramUserId = authInfo.identifier;
//           break;
//         case 'externalWallet':
//           value.externalWalletAddress = authInfo.identifier;
//           break;
//         default:
//           break;
//       }
//     }

//     return value;
//   }

//   return { isConnected: false };
// };
