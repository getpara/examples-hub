import { Auth, PregenIds, PrimaryAuth, TAuthMethod, TWalletType, WalletEntity } from '@getpara/user-management-client';

export type LoginRes = {
  userId: string;
  userHandle: string;
  signature: any;
  publicKey?: string;
  passwordId?: string;
  biometricId?: string;
};

export type PortalAuthParams = {
  encryptionKey?: string;
  sessionId?: string;
  newDeviceEncryptionKey?: string;
  newDeviceSessionLookupId?: string;
  skipAutoLogin?: boolean;
  isForKnownDeviceLogin?: boolean;
  partnerId?: string;
  pregenIds?: PregenIds;
  isEmbedded?: boolean;
  authMethod?: TAuthMethod;
};

export type AuthLoginParams = PortalAuthParams & {
  auth: PrimaryAuth | Auth<'userId'>;
};

export type AuthLoginPasswordParams = AuthLoginParams & {
  password: string;
};

export type ShareData = {
  walletId: string;
  walletScheme: string;
  signer: string;
  partnerId?: string;
  protocolId?: string;
};

export type AuthUpdateKeySharesParams = PortalAuthParams & {
  userId: string;
  encryptionKey: string;
  userHandle?: string;
  signature?: any;
  passwordId?: string;
  enclaveShares?: ShareData[];
};

export type GroupedWallets = Partial<Record<TWalletType, WalletEntity[]>>;
