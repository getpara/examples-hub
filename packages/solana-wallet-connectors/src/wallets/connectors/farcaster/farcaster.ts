import { Wallet } from '../../../types/Wallet.js';
import { icon } from './farcasterIcon.js';

export const farcasterWallet = (): Wallet => {
  return {
    id: 'farcaster',
    internalId: 'FARCASTER',
    name: 'Farcaster',
    iconUrl: icon,
    isExtension: true,
    hasIosSafariExtension: false,
    downloadUrl: 'https://farcaster.xyz',
  };
};
