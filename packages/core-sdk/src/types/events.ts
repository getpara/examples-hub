import { CurrentWalletIds } from '@getpara/user-management-client';
import { FullSignatureRes } from './wallet.js';
import { Wallet } from './wallet.js';

const EVENT_PREFIX = 'para';

export enum ParaEvent {
  LOGIN_EVENT = `${EVENT_PREFIX}Login`,
  ACCOUNT_CREATION_EVENT = `${EVENT_PREFIX}AccountCreation`,
  ACCOUNT_SETUP_EVENT = `${EVENT_PREFIX}AccountSetup`,
  LOGOUT_EVENT = `${EVENT_PREFIX}Logout`,
  SIGN_MESSAGE_EVENT = `${EVENT_PREFIX}SignMessage`,
  SIGN_TRANSACTION_EVENT = `${EVENT_PREFIX}SignTransaction`,
  EXTERNAL_WALLET_CHANGE_EVENT = `${EVENT_PREFIX}ExternalWalletChange`,
  WALLETS_CHANGE_EVENT = `${EVENT_PREFIX}WalletsChange`,
  WALLET_CREATED = `${EVENT_PREFIX}WalletCreated`,
  PREGEN_WALLET_CLAIMED = `${EVENT_PREFIX}PregenWalletClaimed`,
}

export type BaseEvent<T> = {
  data: T;
  error?: Error;
};

export type LoginResponse = { isComplete: boolean; isError?: boolean; needsWallet?: boolean; partnerId?: string };
export type LoginEvent = CustomEventInit<BaseEvent<LoginResponse>>;

export type AccountCreationEvent = CustomEventInit<BaseEvent<boolean>>;

export type AccountSetupResponse = { walletIds: CurrentWalletIds; recoverySecret?: string };
export type AccountSetupEvent = CustomEventInit<BaseEvent<AccountSetupResponse>>;

export type LogoutEvent = CustomEventInit<BaseEvent<null>>;

export type SignMessageEvent = CustomEventInit<BaseEvent<FullSignatureRes>>;

export type SignTransactionEvent = CustomEventInit<BaseEvent<FullSignatureRes>>;

export type ExternalWalletChangeEvent = CustomEventInit<BaseEvent<null>>;

export type WalletsChangeEvent = CustomEventInit<BaseEvent<null>>;

export type WalletCreatedResponse = { wallet: Omit<Wallet, 'signer'>; recoverySecret?: string };
export type WalletCreatedEvent = CustomEventInit<BaseEvent<WalletCreatedResponse>>;

export type PregenWalletClaimedResponse = { wallet: Omit<Wallet, 'signer'>; recoverySecret?: string };
export type PregenWalletClaimedEvent = CustomEventInit<BaseEvent<WalletCreatedResponse>>;
