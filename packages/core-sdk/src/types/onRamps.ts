import { Network, OnRampAsset, OnRampProvider, OnRampPurchaseType, WalletType } from '@getpara/user-management-client';

export type ProviderAssetInfo = [string, Partial<Record<OnRampPurchaseType, boolean>>];

export type OnRampAssetInfo = Record<
  WalletType,
  Partial<Record<Network, Partial<Record<OnRampAsset, Partial<Record<OnRampProvider, ProviderAssetInfo>>>>>>
>;

export type OnRampAssetInfoRow = [WalletType, Network, OnRampAsset, Partial<Record<OnRampProvider, ProviderAssetInfo>>];

export enum OnRampMethod {
  ACH = 'ACH',
  DEBIT = 'Debit',
  CREDIT = 'Credit',
  APPLE_PAY = 'Apple Pay',
}
