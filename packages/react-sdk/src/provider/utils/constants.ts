import { WalletType } from '@getpara/web-sdk';

export const EXTERNAL_WALLET_PACKAGE_BY_TYPE = {
  [WalletType.EVM]: 'Wagmi',
  [WalletType.COSMOS]: 'Graz',
  [WalletType.SOLANA]: '@solana/wallet-adapter-react',
};
