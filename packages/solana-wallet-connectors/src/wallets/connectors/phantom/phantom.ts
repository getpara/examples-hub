import { isIosAndRedirectable } from '@solana/wallet-adapter-base';
import { Wallet } from '../../../types/Wallet.js';
import { icon } from './phantomIcon.js';

export const phantomWallet = (): Wallet => {
  return {
    id: 'phantom',
    internalId: 'PHANTOM',
    name: 'Phantom',
    iconUrl: icon,
    isExtension: true,
    isMobile: true,
    hasIosSafariExtension: false,
    getQrUri: async () => {
      if (typeof window !== 'undefined' && isIosAndRedirectable()) {
        const url = encodeURIComponent(window.location.href);
        const ref = encodeURIComponent(window.location.origin);
        return `https://phantom.app/ul/browse/${url}?ref=${ref}`;
      }
      return '';
    },
    downloadUrl: 'https://phantom.app/download',
  };
};
