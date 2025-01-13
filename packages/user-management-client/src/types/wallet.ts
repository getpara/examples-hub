import { OAuthMethod } from './auth.js';
import { PartnerEntity } from './partner.js';

export enum WalletScheme {
  DKLS = 'DKLS',
  CGGMP = 'CGGMP',
  ED25519 = 'ED25519',
}

export enum WalletType {
  EVM = 'EVM',
  SOLANA = 'SOLANA',
  COSMOS = 'COSMOS',
}

export enum Chain {
  ETH = 'ETH',
  CELO = 'CELO',
  MATIC = 'MATIC',
}

export enum Network {
  ETHEREUM = 'ETHEREUM',
  SEPOLIA = 'SEPOLIA',
  ARBITRUM = 'ARBITRUM',
  BASE = 'BASE',
  OPTIMISM = 'OPTIMISM',
  POLYGON = 'POLYGON',
  SOLANA = 'SOLANA',
  COSMOS = 'COSMOS',
  CELO = 'CELO',
  NOBLE = 'NOBLE',
}

export type WalletRef = 'walletId' | 'externalWalletAddress';

export type WalletParams = Partial<{ walletId?: string; externalWalletAddress?: string }>;

export const PREGEN_IDENTIFIER_TYPES = ['EMAIL', 'PHONE', 'CUSTOM_ID', OAuthMethod.DISCORD, OAuthMethod.TWITTER] as const;

export type TPregenIdentifierType = (typeof PREGEN_IDENTIFIER_TYPES)[number];

export type PregenIds = Partial<Record<TPregenIdentifierType, string[]>>;

export interface WalletEntity {
  address: string | null;
  createdAt: string;
  isPregen?: boolean;
  pregenIdentifier: string;
  pregenIdentifierType: TPregenIdentifierType;
  id: string;
  keyGenComplete: boolean;
  name: string | null;
  partnerId: string;
  partner?: PartnerEntity;
  publicKey: string | null;
  scheme: string;
  type: WalletType;
  updatedAt: string;
  userId: string | null;
  lastUsedAt: string | null;
  lastUsedPartnerId?: string;
  lastUsedPartner?: PartnerEntity;
}

export type CurrentWalletIds = Partial<Record<WalletType, string[]>>;

export const NON_ED25519 = [WalletScheme.DKLS, WalletScheme.CGGMP];
