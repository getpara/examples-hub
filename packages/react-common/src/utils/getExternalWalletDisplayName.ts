import { ExternalWalletInfo } from '@getpara/user-management-client';
import { truncateAddress, WalletType } from '@getpara/web-sdk';

export const getExternalWalletDisplayName = ({ address, type, addressBech32 }: ExternalWalletInfo) => {
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

  return `${walletTypeDisplay} ${truncateAddress(addressBech32 ?? address, walletType)}`;
};
