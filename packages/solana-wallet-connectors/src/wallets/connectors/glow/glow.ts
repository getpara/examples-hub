import { Wallet } from '../../../types/Wallet.js';
import { icon } from './glowIcon.js';
import { isIosAndRedirectable } from '@solana/wallet-adapter-base';

export const glowWallet = (): Wallet => {
  return {
    id: 'glow',
    name: 'Glow',
    iconUrl: icon,
    isExtension: true,
    isMobile: true,
    hasIosSafariExtension: isIosAndRedirectable(),
    downloadUrl: 'https://glow.app',
  };
};
