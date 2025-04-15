import {
  BackupKitEmailProps,
  CurrentWalletIds,
  ExternalWalletInfo,
  OnRampPurchase,
  OnRampPurchaseCreateParams,
  PregenAuth,
  Setup2faResponse,
  TelegramAuthResponse,
  VerifiedAuth,
  VerifyExternalWalletParams,
  WalletEntity,
  WalletParams,
  WalletType,
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
} from './methods.js';
import { ParaCore } from '../ParaCore.js';
import { FullSignatureRes, Wallet } from './wallet.js';
import { WalletTypeProp } from './config.js';

export const PARA_CORE_METHODS = [
  'getAuthInfo',
  'signUpOrLogInV2',
  'verifyNewAccountV2',
  'waitForLoginV2',
  'waitForSignupV2',
  'waitForWalletCreationV2',
  'getOAuthUrlV2',
  'verifyOAuthV2',
  'getFarcasterConnectUriV2',
  'verifyFarcasterV2',
  'verifyTelegramV2',
  'resendVerificationCode',
  'loginExternalWalletV2',
  'verifyExternalWalletV2',
  'setup2faV2',
  'enable2faV2',
  'verify2faV2',
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
  'getPregenWalletsV2',
  'hasPregenWalletV2',
  'updatePregenWalletIdentifierV2',
  'createPregenWalletV2',
  'createPregenWalletPerTypeV2',
  'claimPregenWalletsV2',
  'distributeNewWalletShare',
  'getUserShare',
  'setUserShare',
  'refreshShare',
  'signMessage',
  'signTransaction',
  'initiateOnRampTransaction',
  'getWalletBalance',
] as const;

export type CoreMethodName = (typeof PARA_CORE_METHODS)[number];

export type CoreMethodParams<method extends CoreMethodName & keyof CoreMethods> = CoreMethods[method] extends {
  params: infer P;
}
  ? P
  : never;

export type CoreMethodResponse<method extends CoreMethodName & keyof CoreMethods> = CoreMethods[method] extends {
  response: infer R;
}
  ? CoreMethods[method] extends { sync: true }
    ? R
    : Promise<R>
  : void;

export type CoreMethod<method extends CoreMethodName & keyof CoreMethods> =
  CoreMethodParams<method> extends void | never
    ? () => CoreMethodResponse<method>
    : (_?: CoreMethodParams<method>) => CoreMethodResponse<method>;

export type CoreAction<method extends CoreMethodName & keyof CoreMethods> =
  CoreMethodParams<method> extends void | never
    ? (_?: ParaCore) => CoreMethodResponse<method>
    : (_?: ParaCore, __?: CoreMethodParams<method>) => CoreMethodResponse<method>;

export type CoreMethods = Record<CoreMethodName, { params?: unknown; response?: unknown; sync?: true }> & {
  getAuthInfo: {
    params: void;
    response: CoreAuthInfo | undefined;
    sync: true;
  };
  signUpOrLogInV2: {
    params: WithCustomTheme &
      WithUseShortUrls & {
        /**
         * The user's email address or phone number, in the form `{ email: '...' } | { phone: '+1...' }`}
         */
        auth: VerifiedAuth;
      };
    response: AuthStateVerify | AuthStateLogin;
  };
  verifyNewAccountV2: {
    params: WithCustomTheme &
      WithUseShortUrls & {
        /**
         * The verification code entered by the user.
         */
        verificationCode: string;
      };
    response: AuthStateSignup;
  };
  waitForLoginV2: {
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
  waitForSignupV2: {
    params: PollParams & {
      /**
       * A function returning a boolean, indicating whether the signup process should be cancelled.
       */
      isCanceled?: () => boolean;
    };
    response: true;
  };
  waitForWalletCreationV2: {
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
  getOAuthUrlV2: {
    params: OAuthUrlParams & { sessionLookupId?: string };
    response: string;
  };
  verifyOAuthV2: {
    params: AuthStateBaseParams &
      OAuthUrlParams &
      PollParams & {
        /**
         * A function returning a boolean, indicating whether the OAuth process should be cancelled.
         */
        isCanceled?: () => boolean;
        /**
         * A callback function that will be invoked with the OAuth URL when it is available.
         * For example, you can use this to open the URL in a new window or tab.
         */
        onOAuthUrl?: (url: string) => void;
      };
    response: OAuthResponse;
  };
  getFarcasterConnectUriV2: {
    params: void;
    response: string;
  };
  verifyFarcasterV2: {
    params: AuthStateBaseParams &
      PollParams & {
        /**
         * A function returning a boolean, indicating whether the Farcaster login process should be cancelled.
         */
        isCanceled?: () => boolean;
        /**
         * A callback function that will be invoked with the Farcaster Connect URI when it is available.
         * You will need to display the URI as a QR code.
         */
        onConnectUri?: (uri: string) => void;
      };
    response: OAuthResponse;
  };
  verifyTelegramV2: {
    params: AuthStateBaseParams & {
      /**
       * The response received from the Telegram login bot.
       */
      telegramAuthResponse: TelegramAuthResponse;
    };
    response: OAuthResponse;
  };
  loginExternalWalletV2: {
    params: AuthStateBaseParams & {
      /**
       * The external wallet information to use for login.
       */
      externalWallet: ExternalWalletInfo;
    };
    response: AuthStateVerifyOrLogin;
  };
  verifyExternalWalletV2: {
    params: AuthStateBaseParams & VerifyExternalWalletParams;
    response: AuthStateSignup;
  };
  resendVerificationCode: {
    params: void;
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
  setup2faV2: {
    params: void;
    response: Setup2faResponse;
  };
  enable2faV2: {
    params: {
      /**
       * The two-factor authentication code entered by the user.
       */
      verificationCode: string;
    };
    response: void;
  };
  verify2faV2: {
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
    params: WalletTypeProp;
    response: Wallet[];
    sync: true;
  };
  fetchWallets: {
    params: void;
    response: WalletEntity[];
  };
  createWallet: {
    params: {
      type?: Uppercase<WalletType>;
      skipDistribute?: boolean;
    };
    response: [Wallet, string | undefined];
  };
  createWalletPerType: {
    params: {
      /**
       * Array of the wallet types to create
       */
      types?: Uppercase<WalletType>[];
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
  getPregenWalletsV2: {
    params: {
      /**
       * The pregen ID for the wallets to fetch. If not provided, all available wallets will be retrieved.
       */
      pregenId?: PregenAuth;
    };
    response: WalletEntity[];
  };
  updatePregenWalletIdentifierV2: {
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
  hasPregenWalletV2: {
    params: {
      /**
       * The pregen ID for the wallet to check.
       */
      pregenId: PregenAuth;
    };
    response: boolean;
  };
  createPregenWalletV2: {
    params: {
      /**
       * The type of wallet to create, 'EVM' | 'SOLANA' | 'COSMOS'
       */
      type: WalletType;
      /**
       * The pregen identifier for the wallet, in the form: `{ email: string } | { phone: string } | { telegramUserId: string } | { farcasterUsername: string } | { xUsername: string } | { discordUsername: string } | { customId: string }`
       */
      pregenId: PregenAuth;
    };
    response: Wallet;
  };
  createPregenWalletPerTypeV2: {
    params: {
      /**
       * The wallet types to create. If not provided, defaults to your application's `supportedWalletTypes` setting.
       */
      types?: WalletType[];
      /**
       * The pregen identifier for the wallets, in the form: `{ email: string } | { phone: string } | { telegramUserId: string } | { farcasterUsername: string } | { xUsername: string } | { discordUsername: string } | { customId: string }`
       */
      pregenId: PregenAuth;
    };
    response: Wallet[];
  };
  claimPregenWalletsV2: {
    params: {
      /**
       * The pregen identifier for the wallet to claim. If not provided, will attempt to claim all wallets in storage.
       */
      pregenId?: PregenAuth;
    };
    response: string | undefined;
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
};

export type CoreInterface = {
  [key in keyof CoreMethods]: CoreMethod<key>;
};
