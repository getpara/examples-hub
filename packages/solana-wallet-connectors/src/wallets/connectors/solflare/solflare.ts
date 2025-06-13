import { isIosAndRedirectable } from '@solana/wallet-adapter-base';
import { Wallet } from '../../../types/Wallet.js';
import { icon } from './solflareIcon.js';

export const solflareWallet = (): Wallet => {
  return {
    id: 'solflare',
    internalId: 'SOLFLARE',
    name: 'Solflare',
    iconUrl: icon,
    isExtension: true,
    isMobile: true,
    hasIosSafariExtension: false,
    getQrUri: async () => {
      if (typeof window !== 'undefined' && isIosAndRedirectable()) {
        const url = encodeURIComponent(window.location.href);
        const ref = encodeURIComponent(window.location.origin);
        return `https://solflare.com/ul/v1/browse/${url}?ref=${ref}`;
      }
      return '';
    },
    downloadUrl: 'https://www.solflare.com/download/',
  };
};
