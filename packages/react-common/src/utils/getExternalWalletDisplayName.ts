import { ExternalWalletInfo } from '@getpara/user-management-client';
import { truncateAddress, TWalletType } from '@getpara/web-sdk';

export const getExternalWalletDisplayName = ({ address, type, addressBech32 }: ExternalWalletInfo) => {
  const walletType = type as TWalletType;
  let walletTypeDisplay: string;

  switch (walletType) {
    case 'EVM':
      walletTypeDisplay = 'EVM';
      break;
    case 'SOLANA':
      walletTypeDisplay = 'Solana';
      break;
    case 'COSMOS':
      walletTypeDisplay = 'Cosmos';
      break;
  }

  return `${walletTypeDisplay} ${truncateAddress(addressBech32 ?? address, walletType)}`;
};
