import { ExtractAuth } from '@usecapsule/user-management-client';
import CapsuleWeb, { type OnRampConfig, type OnRampPurchase } from '@usecapsule/web-sdk';

export type Props = {
  appName?: string;
  capsule: CapsuleWeb;
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
