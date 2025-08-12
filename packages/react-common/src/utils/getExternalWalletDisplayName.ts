import { ExternalWalletInfo } from '@getpara/user-management-client';
import { truncateAddress, TWalletType } from '@getpara/web-sdk';

export const getExternalWalletDisplayName = (
  { address, type, providerId, addressBech32 }: ExternalWalletInfo,
  { withAddress = false }: { withAddress?: boolean } = {},
) => {
  const walletType = type as TWalletType;

  return `${
    providerId ??
    {
      EVM: 'EVM',
      SOLANA: 'Solana',
      COSMOS: 'Cosmos',
    }[type]
  }${withAddress ? ` ${truncateAddress(addressBech32 ?? address, walletType)}` : ''}`;
};
