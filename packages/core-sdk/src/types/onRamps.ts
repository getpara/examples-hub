import { Network, OnRampAsset, OnRampProvider, OnRampPurchaseType, TWalletType } from '@getpara/user-management-client';

export type ProviderAssetInfo = [string, Partial<Record<OnRampPurchaseType, boolean>>];

export type OnRampAssetInfo = Record<
  TWalletType,
  Partial<Record<Network, Partial<Record<OnRampAsset, Partial<Record<OnRampProvider, ProviderAssetInfo>>>>>>
>;

export type OnRampAssetInfoRow = [TWalletType, Network, OnRampAsset, Partial<Record<OnRampProvider, ProviderAssetInfo>>];

export enum OnRampMethod {
  ACH = 'ACH',
  DEBIT = 'Debit',
  CREDIT = 'Credit',
  APPLE_PAY = 'Apple Pay',
}
