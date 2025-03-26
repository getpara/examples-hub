import { PartnerEntity, TPregenIdentifierType, WalletScheme } from '@getpara/user-management-client';
import { EmbeddedWalletType, ExternalWalletType } from './methods.js';

export interface Wallet {
  createdAt?: string;
  id: string;
  name?: string;
  signer: string;
  address?: string;
  addressSecondary?: string;
  publicKey?: string;
  scheme?: WalletScheme;
  type?: EmbeddedWalletType | ExternalWalletType;
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
