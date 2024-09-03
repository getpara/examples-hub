import { createConnector } from 'wagmi';
import { coinbaseWallet as coinbaseWagmiWallet } from 'wagmi/connectors';
import { Wallet, WalletDetailsParams } from '../../../types/Wallet.js';
import { icon } from './coinbaseIcon.js';

export interface CoinbaseWalletOptions {
  appName: string;
  appIcon?: string;
}

export const coinbaseWallet = ({ appName, appIcon }: CoinbaseWalletOptions): Wallet => {
  const getUri = (uri: string) => uri;

  return {
    id: 'coinbase',
    name: 'Coinbase Wallet',
    rdns: 'com.coinbase.wallet',
    iconUrl: icon,
    // Note that we never resolve `installed` to `false` because the
    // Coinbase Wallet SDK falls back to other connection methods if
    // the injected connector isn't available
    installed: true,
    isExtension: true,
    isMobile: true,
    downloadUrl: 'https://www.coinbase.com/wallet/downloads',
    getUri,
    createConnector: (walletDetails: WalletDetailsParams) =>
      createConnector(config => ({
        ...coinbaseWagmiWallet({
          version: '4',
          appName,
          appLogoUrl: appIcon,
        })(config),
        ...walletDetails,
      })),
  };
};
