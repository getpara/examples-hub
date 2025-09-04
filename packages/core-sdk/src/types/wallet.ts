import {
  IWalletEntity,
  PartnerEntity,
  TPregenIdentifierType,
  TWalletScheme,
  TWalletType,
} from '@getpara/user-management-client';

export interface Wallet
  extends Omit<IWalletEntity, 'createdAt' | 'updatedAt' | 'lastUsedAt' | 'scheme' | 'type' | 'userId' | 'keyGenComplete'> {
  createdAt?: string;
  id: string;
  name?: string;
  signer: string;
  address?: string;
  addressSecondary?: string;
  publicKey?: string;
  scheme?: TWalletScheme;
  type?: TWalletType;
  isPregen?: boolean;
  pregenIdentifier?: string;
  pregenIdentifierType?: TPregenIdentifierType;
  userId?: string;
  partnerId?: string;
  partner?: PartnerEntity;
  lastUsedAt?: string;
  lastUsedPartner?: PartnerEntity;
  lastUsedPartnerId?: string;
  isExternal?: boolean;
  isExternalWithParaAuth?: boolean;
  externalProviderId?: string;
  isExternalWithVerification?: boolean;
  isExternalConnectionOnly?: boolean;
  ensName?: string | null;
  ensAvatar?: string | null;
}

/** @deprecated */
export enum PregenIdentifierType {
  EMAIL = 'EMAIL',
  PHONE = 'PHONE',
}

export interface SuccessfulSignatureRes {
  signature: string;
}

export interface DeniedSignatureRes {
  pendingTransactionId: string;
}

export interface DeniedSignatureResWithUrl extends DeniedSignatureRes {
  transactionReviewUrl: string;
}

export type SignatureRes = SuccessfulSignatureRes | DeniedSignatureRes;
export type FullSignatureRes = SuccessfulSignatureRes | DeniedSignatureResWithUrl;

export type ExternalWalletConnectionType = 'NONE' | 'CONNECTION_ONLY' | 'AUTHENTICATED' | 'VERIFICATION';
