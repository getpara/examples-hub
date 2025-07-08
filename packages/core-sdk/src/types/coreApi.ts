import {
  BackupKitEmailProps,
  CurrentWalletIds,
  ExternalWalletInfo,
  OnRampPurchase,
  OnRampPurchaseCreateParams,
  PregenAuth,
  Setup2faResponse,
  VerifiedAuth,
  VerifyExternalWalletParams,
  WalletEntity,
  WalletParams,
  TWalletType,
  IssueJwtParams,
  IssueJwtResponse,
  TLinkedAccountType,
  LinkedAccounts,
} from '@getpara/user-management-client';
import {
  AuthStateLogin,
  AuthStateVerify,
  OAuthResponse,
  AuthStateBaseParams,
  WithCustomTheme,
  WithUseShortUrls,
  Verify2faResponse,
  AuthStateSignup,
  AuthStateVerifyOrLogin,
  OAuthUrlParams,
  StorageType,
  PollParams,
  CoreAuthInfo,
  GetWalletBalanceParams,
  GetWalletBalanceResponse,
  FarcasterParams,
  TelegramParams,
  OAuthParams,
} from './methods.js';
import { ParaCore } from '../ParaCore.js';
import { FullSignatureRes, Wallet } from './wallet.js';
import { AccountLinkInProgress } from './auth.js';

export const PARA_CORE_METHODS = [
  'getAuthInfo',
  'signUpOrLogIn',
  'verifyNewAccount',
  'waitForLogin',
  'waitForSignup',
  'waitForWalletCreation',
  'getOAuthUrl',
  'verifyOAuth',
  'getFarcasterConnectUri',
  'verifyFarcaster',
  'verifyTelegram',
  'resendVerificationCode',
  'loginExternalWallet',
  'verifyExternalWallet',
  'setup2fa',
  'enable2fa',
  'verify2fa',
  'logout',
  'clearStorage',
  'isSessionActive',
  'isFullyLoggedIn',
  'refreshSession',
  'keepSessionAlive',
  'exportSession',
  'importSession',
  'getVerificationToken',
  'getWallets',
  'getWalletsByType',
  'fetchWallets',
  'createWallet',
  'createWalletPerType',
  'getPregenWallets',
  'hasPregenWallet',
  'updatePregenWalletIdentifier',
  'createPregenWallet',
  'createPregenWalletPerType',
  'claimPregenWallets',
  'createGuestWallets',
  'distributeNewWalletShare',
  'getUserShare',
  'setUserShare',
  'refreshShare',
  'signMessage',
  'signTransaction',
  'initiateOnRampTransaction',
  'getWalletBalance',
  'issueJwt',
  'getLinkedAccounts',
  'accountLinkInProgress',
] as const;

export const PARA_INTERNAL_METHODS = [
  'linkAccount',
  'unlinkAccount',
  'verifyEmailOrPhoneLink',
  'verifyOAuthLink',
  'verifyFarcasterLink',
  'verifyTelegramLink',
  'verifyExternalWalletLink',
  'accountLinkInProgress',
] as const;

export type CoreMethodName = (typeof PARA_CORE_METHODS)[number];

export type CoreMethodParams<method extends CoreMethodName & keyof CoreMethods> = CoreMethods[method] extends {
  params: infer P;
}
  ? P
  : never;

export type CoreMethodIsGetter<method extends CoreMethodName & keyof CoreMethods> = CoreMethods[method] extends {
  isGetter: true;
}
  ? true
  : false;

export type CoreMethodResponse<method extends CoreMethodName & keyof CoreMethods> = CoreMethods[method] extends {
  response: infer R;
}
  ? CoreMethods[method] extends { sync: true }
    ? R
    : Promise<R>
  : void;

export type CoreMethod<method extends CoreMethodName & keyof CoreMethods> =
  CoreMethodIsGetter<method> extends true
    ? Awaited<CoreMethodResponse<method>>
    : CoreMethodParams<method> extends void | never
      ? () => CoreMethodResponse<method>
      : (_?: CoreMethodParams<method>) => CoreMethodResponse<method>;

export type CoreAction<method extends CoreMethodName & keyof CoreMethods> =
  CoreMethodParams<method> extends void | never
    ? (_?: ParaCore) => CoreMethodResponse<method>
    : (_?: ParaCore, __?: CoreMethodParams<method>) => CoreMethodResponse<method>;

export type InternalMethodName = (typeof PARA_INTERNAL_METHODS)[number];

export type InternalMethodParams<method extends InternalMethodName & keyof InternalMethods> =
  InternalMethods[method] extends {
    params: infer P;
  }
    ? P
    : never;

export type InternalMethodIsGetter<method extends InternalMethodName & keyof InternalMethods> =
  InternalMethods[method] extends {
    isGetter: true;
  }
    ? true
    : false;

export type InternalMethodResponse<method extends InternalMethodName & keyof InternalMethods> =
  InternalMethods[method] extends {
    response: infer R;
  }
    ? InternalMethods[method] extends { sync: true }
      ? R
      : Promise<R>
    : void;

export type InternalMethod<method extends InternalMethodName & keyof InternalMethods> =
  InternalMethodIsGetter<method> extends true
    ? Awaited<InternalMethodResponse<method>>
    : InternalMethodParams<method> extends void | never
      ? () => InternalMethodResponse<method>
      : (_?: InternalMethodParams<method>) => InternalMethodResponse<method>;

export type InternalAction<method extends InternalMethodName & keyof InternalMethods> =
  InternalMethodParams<method> extends void | never
    ? (_?: ParaCore) => InternalMethodResponse<method>
    : (_?: ParaCore, __?: InternalMethodParams<method>) => InternalMethodResponse<method>;

export type CoreMethods = Record<CoreMethodName, { params?: unknown; response?: unknown; sync?: true }> & {
  accountLinkInProgress: {
    params: never;
    response: AccountLinkInProgress;
    isGetter: true;
  };
  getAuthInfo: {
    params: void;
    response: CoreAuthInfo | undefined;
    sync: true;
  };
  signUpOrLogIn: {
    params: WithCustomTheme &
      WithUseShortUrls & {
        /**
         * The user's email address or phone number, in the form `{ email: '...' } | { phone: '+1...' }`}
         */
        auth: VerifiedAuth;
      };
    response: AuthStateVerify | AuthStateLogin;
  };
  verifyNewAccount: {
    params: WithCustomTheme &
      WithUseShortUrls & {
        /**
         * The verification code entered by the user.
         */
        verificationCode: string;
      };
    response: AuthStateSignup;
  };

  waitForLogin: {
    params: PollParams & {
      /**
       * Whether to skip the session refresh
       */
      skipSessionRefresh?: boolean;
      /**
       * A function returning a boolean, indicating whether the login process should be cancelled.
       */
      isCanceled?: () => boolean;
    };
    response: {
      /**
       * Whether the signed-in user still needs to create one or more wallets for this application.
       */
      needsWallet?: boolean;
      /**
       * The partner ID for the current application.
       */
      partnerId?: string;
    };
  };
  waitForSignup: {
    params: PollParams & {
      /**
       * A function returning a boolean, indicating whether the signup process should be cancelled.
       */
      isCanceled?: () => boolean;
    };
    response: true;
  };
  waitForWalletCreation: {
    params: PollParams & {
      /**
       * A function returning a boolean, indicating whether wallet creation should be cancelled.
       */
      isCanceled?: () => boolean;
    };
    response: {
      /**
       * The IDs of the newly created wallets.
       */
      walletIds: CurrentWalletIds;
      /**
       * The recovery secret for the new wallets, if available.
       */
      recoverySecret?: string;
    };
  };
  getOAuthUrl: {
    params: OAuthUrlParams & { sessionLookupId?: string };
    response: string;
  };
  verifyOAuth: {
    params: AuthStateBaseParams & OAuthParams;
    response: OAuthResponse;
  };

  getFarcasterConnectUri: {
    params: void;
    response: string;
  };
  verifyFarcaster: {
    params: AuthStateBaseParams & FarcasterParams;
    response: OAuthResponse;
  };
  verifyTelegram: {
    params: AuthStateBaseParams & TelegramParams;
    response: OAuthResponse;
  };
  loginExternalWallet: {
    params: AuthStateBaseParams & {
      /**
       * The external wallet information to use for login.
       */
      externalWallet: ExternalWalletInfo | ExternalWalletInfo[];
    };
    response: AuthStateVerifyOrLogin;
  };
  verifyExternalWallet: {
    params: AuthStateBaseParams & VerifyExternalWalletParams;
    response: AuthStateSignup;
  };
  resendVerificationCode: {
    params: { type?: 'SIGNUP' | 'LINK_ACCOUNT' } | undefined;
    response: void;
  };
  logout: {
    params: {
      /**
       * Whether to remove all pregen wallets from storage.
       */
      clearPregenWallets?: boolean;
    };
    response: void;
  };
  clearStorage: {
    params: StorageType | undefined;
    response: void;
  };
  isSessionActive: {
    params: void;
    response: boolean;
  };
  isFullyLoggedIn: {
    params: void;
    response: boolean;
  };
  refreshSession: {
    params: {
      shouldOpenPopup?: boolean;
    };
    response: string;
  };
  keepSessionAlive: {
    params: void;
    response: boolean;
  };
  exportSession: {
    params: {
      /**
       * Whether to exclude the wallet signers from the exported session.
       */
      excludeSigners?: boolean;
    };
    response: string;
    sync: true;
  };
  importSession: {
    params: string;
    response: void;
  };
  getVerificationToken: {
    params: void;
    response: string;
  };
  setup2fa: {
    params: void;
    response: Setup2faResponse;
  };
  enable2fa: {
    params: {
      /**
       * The two-factor authentication code entered by the user.
       */
      verificationCode: string;
    };
    response: void;
  };
  verify2fa: {
    params: {
      /**
       * The email or phone number for the user to verify, in the form `{ email: '...' } | { phone: '+1...' }`
       */
      auth: VerifiedAuth;
      /**
       * The two-factor authentication code entered by the user.
       */
      verificationCode: string;
    };
    response: Verify2faResponse;
  };
  getWallets: {
    params: void;
    response: Record<string, Wallet>;
    sync: true;
  };
  getWalletsByType: {
    params: TWalletType;
    response: Wallet[];
    sync: true;
  };
  fetchWallets: {
    params: void;
    response: WalletEntity[];
  };
  createWallet: {
    params: {
      type?: Uppercase<TWalletType>;
      skipDistribute?: boolean;
    };
    response: [Wallet, string | undefined];
  };
  createWalletPerType: {
    params: {
      /**
       * Array of the wallet types to create
       */
      types?: Uppercase<TWalletType>[];
      /**
       * If `true`, skip distributing the new wallets shares.
       */
      skipDistribute?: boolean;
    };
    response: {
      /**
       * Array of the created wallets
       */
      wallets: Wallet[];
      /**
       * The `CurrentWalletIds` value for the new wallets
       */
      walletIds: CurrentWalletIds;
      /**
       * The recovery secret for the new wallets, if available.
       */
      recoverySecret?: string;
    };
  };
  getPregenWallets: {
    params: {
      /**
       * The pregen ID for the wallets to fetch. If not provided, all available wallets will be retrieved.
       */
      pregenId?: PregenAuth;
    };
    response: WalletEntity[];
  };
  updatePregenWalletIdentifier: {
    params: {
      /**
       * The ID of the pregen wallet to update.
       */
      walletId: string;
      /**
       * The new identifer for the wallet.
       */
      newPregenId: PregenAuth;
    };
    response: void;
  };
  hasPregenWallet: {
    params: {
      /**
       * The pregen ID for the wallet to check.
       */
      pregenId: PregenAuth;
    };
    response: boolean;
  };
  createPregenWallet: {
    params: {
      /**
       * The type of wallet to create, 'EVM' | 'SOLANA' | 'COSMOS'
       */
      type: TWalletType;
      /**
       * The pregen identifier for the wallet, in the form: `{ email: string } | { phone: string } | { telegramUserId: string } | { farcasterUsername: string } | { xUsername: string } | { discordUsername: string } | { customId: string }`
       */
      pregenId: PregenAuth;
    };
    response: Wallet;
  };
  createPregenWalletPerType: {
    params: {
      /**
       * The wallet types to create. If not provided, defaults to your application's `supportedWalletTypes` setting.
       */
      types?: TWalletType[];
      /**
       * The pregen identifier for the wallets, in the form: `{ email: string } | { phone: string } | { telegramUserId: string } | { farcasterUsername: string } | { xUsername: string } | { discordUsername: string } | { customId: string }`
       */
      pregenId: PregenAuth;
    };
    response: Wallet[];
  };
  claimPregenWallets: {
    params: {
      /**
       * The pregen identifier for the wallet to claim. If not provided, will attempt to claim all wallets in storage.
       */
      pregenId?: PregenAuth;
    };
    response: string | undefined;
  };
  createGuestWallets: {
    params: void;
    response: Wallet[];
  };
  distributeNewWalletShare: {
    params: {
      /**
       * The ID of the wallet whose share to distribute.
       */
      walletId: string;
      /**
       * The user share string.
       */
      userShare?: string;
      /**
       * If `true`, skip biometric share creation.
       */
      skipBiometricShareCreation?: boolean;
      /**
       * If `true`, force a session refresh.
       */
      forceRefresh?: boolean;
    };
    response: string;
  };
  getUserShare: {
    params: void;
    response: string | null;
    sync: true;
  };
  setUserShare: {
    params: string | null;
    response: void;
  };
  refreshShare: {
    params: {
      walletId: string;
      share: string;
      oldPartnerId?: string;
      newPartnerId?: string;
      keyShareProtocolId?: string;
      redistributeBackupEncryptedShares?: boolean;
      emailProps?: BackupKitEmailProps;
    };
    response: {
      protocolId: string;
      recoverySecret?: string;
      signer: string;
    };
  };
  signMessage: {
    params: PollParams & {
      /**
       * The ID of the wallet to use for signing.
       */
      walletId: string;
      /**
       * The message to sign as a base64-encoded string.
       */
      messageBase64: string;
      /**
       * The duration in milliseconds to wait before the signing operation times out.
       */
      timeoutMs?: number;
      /**
       * For Cosmos transactions, the `SignDoc` as a base64-encoded string.
       */
      cosmosSignDocBase64?: string;
      /**
       * A callback that returns a boolean, indicating whether the signing operation should be cancelled.
       */
      isCanceled?: () => boolean;
    };
    response: FullSignatureRes;
  };
  signTransaction: {
    params: PollParams & {
      /**
       * The ID of the wallet to use for signing.
       */
      walletId: string;
      /**
       * The transaction to sign as a base64-encoded string.
       */
      rlpEncodedTxBase64: string;
      /**
       * For EVM transactions, the chain ID.
       */
      chainId: string;
      /**
       * The duration in milliseconds to wait before the signing operation times out.
       */
      timeoutMs?: number;
      /**
       * A callback that returns a boolean, indicating whether the signing operation should be cancelled.
       */
      isCanceled?: () => boolean;
    };
    response: FullSignatureRes;
  };
  initiateOnRampTransaction: {
    params: WalletParams & {
      /**
       * The on-ramp transaction options.
       */
      params: OnRampPurchaseCreateParams;
      /**
       * Whether to open a popup window for the user to complete the transaction.
       */
      shouldOpenPopup?: boolean;
    };
    response: {
      /**
       * The newly created on-ramp transaction.
       */
      onRampPurchase: OnRampPurchase;
      /**
       * A Para Portal URL for the user to complete the transaction.
       */
      portalUrl: string;
    };
  };
  getWalletBalance: {
    params: GetWalletBalanceParams;
    response: GetWalletBalanceResponse;
  };
  issueJwt: {
    params: IssueJwtParams;
    response: IssueJwtResponse;
  };
  getLinkedAccounts: {
    params: {
      withMetadata?: boolean;
    };
    response: LinkedAccounts & { userId: string };
  };
};

export type InternalMethods = {
  linkAccount: {
    params:
      | {
          auth: VerifiedAuth;
        }
      | {
          externalWallet: ExternalWalletInfo;
        }
      | {
          type: TLinkedAccountType | 'X';
        };
    response: AccountLinkInProgress;
  };
  unlinkAccount: {
    params: { linkedAccountId: string };
    response: LinkedAccounts;
  };
  verifyEmailOrPhoneLink: {
    params: {
      verificationCode?: string;
    };
    response: LinkedAccounts;
  };
  verifyOAuthLink: {
    params: OAuthParams;
    response: LinkedAccounts;
  };
  verifyFarcasterLink: {
    params: FarcasterParams;
    response: LinkedAccounts;
  };
  verifyTelegramLink: {
    params: TelegramParams;
    response: LinkedAccounts;
  };
  verifyExternalWalletLink: {
    params: Omit<VerifyExternalWalletParams, 'externalWallet'>;
    response: LinkedAccounts;
  };
};

export type CoreInterface = {
  [key in keyof CoreMethods]: Partial<CoreMethod<key>>;
};

export type InternalInterface = {
  [key in keyof InternalMethods]: Partial<InternalMethod<key>>;
};
