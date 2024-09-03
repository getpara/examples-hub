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
};

export type CommonWallet = {
  connect: () => Promise<{ address?: string; error?: string }>;
  connectMobile: () => Promise<{ address?: string; error?: string }>;
  type: 'EVM' | 'SOLANA' | 'COSMOS';
} & WalletMetadata;
