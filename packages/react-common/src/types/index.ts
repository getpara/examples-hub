import { ExtractAuth } from '@getpara/user-management-client';
import ParaWeb, { type OnRampConfig, type OnRampPurchase } from '@getpara/web-sdk';

export * from './externalWalletCommon.js';

export type Props = {
  appName?: string;
  para: ParaWeb;
  isDark?: boolean;
  isEmbedded?: boolean;
  onClose?: () => void;
  onRampConfig: OnRampConfig;
  onRampPurchase: OnRampPurchase;
  setOnRampPurchase?: (_: OnRampPurchase) => void;
};

export type ModalAuthInfo = ExtractAuth &
  Partial<{
    pfpUrl: string | null;
    displayName: string | null;
  }>;
