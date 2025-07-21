import { AuthInfo, OnRampPurchaseUpdateParams } from '@getpara/user-management-client';
import { OfframpDepositRequest, type OnRampConfig, type OnRampPurchase } from '@getpara/web-sdk';

export * from './externalWalletCommon.js';

export type OnRampProps = {
  appName?: string;
  email?: string;
  isDark?: boolean;
  isEmbedded?: boolean;
  onClose?: () => void;
  onRampConfig: OnRampConfig;
  onRampPurchase: OnRampPurchase;
  onDepositRequest: (_: OfframpDepositRequest) => Promise<string>;
  onUpdate: (_: OnRampPurchaseUpdateParams) => Promise<void>;
  onSuccess: (_: OnRampPurchaseUpdateParams) => Promise<void>;
};

export type ModalAuthInfo = AuthInfo &
  Partial<{
    pfpUrl: string | null;
    displayName: string | null;
  }>;
