import { truncateAddress, WalletType } from '@getpara/web-sdk';

export const getExternalWalletDisplayName = ({ address, type }: { address: string; type: WalletType }) => {
  const walletType = type as WalletType;
  let walletTypeDisplay: string;

  switch (walletType) {
    case WalletType.EVM:
      walletTypeDisplay = 'EVM';
      break;
    case WalletType.SOLANA:
      walletTypeDisplay = 'Solana';
      break;
    case WalletType.COSMOS:
      walletTypeDisplay = 'Cosmos';
      break;
  }

  return `${walletTypeDisplay} ${truncateAddress(address, walletType)}`;
};
