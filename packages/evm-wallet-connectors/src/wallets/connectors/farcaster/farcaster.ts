import { createConnector } from 'wagmi';
import { DefaultWalletOptions, Wallet, WalletDetailsParams } from '../../../types/Wallet.js';
import { icon } from './farcasterIcon.js';

export const farcasterWallet = ({ para, createFarcasterConnector }: DefaultWalletOptions): Wallet => {
  return {
    id: 'farcaster',
    internalId: 'FARCASTER',
    name: 'Farcaster',
    rdns: 'xyz.farcaster.MiniAppWallet',
    iconUrl: icon,
    installed: para?.isReady && para?.isFarcasterMiniApp,
    isExtension: true,
    downloadUrl: 'https://warpcast.xyz/',
    createConnector: (walletDetails: WalletDetailsParams) =>
      createConnector(config => ({
        ...createFarcasterConnector()(config),
        ...walletDetails,
      })),
  };
};
