import { PartnerEntity } from './partner.js';

/** @deprecated use the string union type `TWalletScheme` instead */
export enum WalletScheme {
  DKLS = 'DKLS',
  CGGMP = 'CGGMP',
  ED25519 = 'ED25519',
}

export const WALLET_SCHEMES = ['DKLS', 'CGGMP', 'ED25519'] as const;

export type TWalletScheme = (typeof WALLET_SCHEMES)[number];

/** @deprecated use the string union type `TWalletType` instead */
export enum WalletType {
  EVM = 'EVM',
  SOLANA = 'SOLANA',
  COSMOS = 'COSMOS',
}

export const WALLET_TYPES = ['EVM', 'SOLANA', 'COSMOS'] as const;

export type TWalletType = (typeof WALLET_TYPES)[number];

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
  SOLANA_DEVNET = 'SOLANA_DEVNET',
}

export type WalletRef = 'walletId' | 'externalWalletAddress';

export type WalletParams = Partial<{ walletId?: string; externalWalletAddress?: string }>;

export type EmbeddedWalletType = Exclude<TWalletType, never>;

export type ExternalWalletType = Exclude<TWalletType, never>;

export const PREGEN_IDENTIFIER_TYPES = [
  'EMAIL',
  'PHONE',
  'CUSTOM_ID',
  'DISCORD',
  'TWITTER',
  'TELEGRAM',
  'FARCASTER',
] as const;

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
  type: TWalletType;
  updatedAt: string;
  userId: string | null;
  lastUsedAt: string | null;
  lastUsedPartnerId?: string;
  lastUsedPartner?: PartnerEntity;
  ensName?: string | null;
  ensAvatar?: string | null;
}

export type CurrentWalletIds = Partial<Record<TWalletType, string[]>>;

export const NON_ED25519 = ['DKLS', 'CGGMP'];

export type SupportedWalletTypes = { type: TWalletType; optional?: boolean }[];
