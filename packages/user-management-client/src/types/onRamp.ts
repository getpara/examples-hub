import { Network, WalletType } from './wallet.js';

export enum OnRampProvider {
  RAMP = 'RAMP',
  STRIPE = 'STRIPE',
  MOONPAY = 'MOONPAY',
}

export enum OnRampAsset {
  ETHEREUM = 'ETHEREUM',
  USDC = 'USDC',
  TETHER = 'TETHER',
  POLYGON = 'POLYGON',
  SOLANA = 'SOLANA',
  ATOM = 'ATOM',
  CELO = 'CELO',
  CUSD = 'CUSD',
  CEUR = 'CEUR',
  CREAL = 'CREAL',
}

export enum OnRampPurchaseStatus {
  INITIATED = 'INITIATED',
  FINISHED = 'FINISHED',
  CANCELLED = 'CANCELLED',
}

export enum OnRampPurchaseType {
  BUY = 'BUY',
  SELL = 'SELL',
}
export interface OnRampPurchase {
  id: string;
  userId: string;
  type?: OnRampPurchaseType;
  walletId?: string | null;
  walletType?: WalletType;
  externalWalletAddress?: string | null;
  address?: string | null;
  status?: OnRampPurchaseStatus;
  provider?: OnRampProvider;
  providerKey?: string | null;
  fiat?: string | null;
  fiatQuantity?: string | null;
  asset?: OnRampAsset;
  assetQuantity?: string | null;
  network?: Network | null;
  testMode?: boolean;
}

export type OnRampPurchaseCreateParams = Omit<OnRampPurchase, 'id' | 'userId'> & {
  networks?: Network[] | 'all';
  assets?: OnRampAsset[] | 'all';
  defaultNetwork?: Network;
  defaultAsset?: OnRampAsset;
};

export type OnRampPurchaseUpdateParams = Omit<OnRampPurchase, 'id' | 'userId'>;

type ProviderAssetInfo = [string, Partial<Record<OnRampPurchaseType, boolean>>];

export type OnRampAssetInfo = Record<
  WalletType,
  Partial<Record<Network, Partial<Record<OnRampAsset, Partial<Record<OnRampProvider, ProviderAssetInfo>>>>>>
>;

export type OnRampAllowedAssets = Partial<Record<Network, true | OnRampAsset[]>>;

export type OnRampConfig = {
  isBuyEnabled: boolean;
  isReceiveEnabled: boolean;
  isWithdrawEnabled: boolean;
  assetInfo: OnRampAssetInfo;
  providers: OnRampProvider[];
  allowedAssets?: OnRampAllowedAssets;
  rampApiKey?: string;
  defaultOnRampAsset?: OnRampAsset;
  defaultOnRampNetwork?: Network;
  defaultBuyAmount?: [string, string];
};
