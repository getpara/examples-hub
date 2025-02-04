import { IconType } from '@getpara/react-components';

export type WalletMetadata = {
  id: string;
  name: string;
  iconUrl: string;
  installed?: boolean;
  isExtension?: boolean;
  isMobile?: boolean;
  isWeb?: boolean;
  downloadUrl?: string;
  getQrUri?: () => Promise<string>;
  downloadUrls?: {
    android?: string;
    ios?: string;
    mobile?: string;
    qrCode?: string;
    chrome?: string;
    edge?: string;
    firefox?: string;
    opera?: string;
    safari?: string;
    browserExtension?: string;
    macos?: string;
    windows?: string;
    linux?: string;
    desktop?: string;
  };
};

export type CommonWallet = {
  connect: () => Promise<{ address?: string; error?: string }>;
  connectMobile: (isManualWalletConnect?: boolean) => Promise<{ address?: string; error?: string }>;
  type: 'EVM' | 'SOLANA' | 'COSMOS';
} & WalletMetadata;

export type CommonChain = {
  id: string | number;
  name: string;
};

export type Tab<T> = {
  label: string;
  value: T;
  icon: IconType;
};
