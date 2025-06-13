import { isIosAndRedirectable } from '@solana/wallet-adapter-base';
import { Wallet } from '../../../types/Wallet.js';
import { icon } from './backpackIcon.js';

export const backpackWallet = (): Wallet => {
  return {
    id: 'backpack',
    internalId: 'BACKPACK',
    name: 'Backpack',
    iconUrl: icon,
    isExtension: true,
    isMobile: true,
    hasIosSafariExtension: false,
    getQrUri: async () => {
      if (typeof window !== 'undefined' && isIosAndRedirectable()) {
        const url = encodeURIComponent(window.location.href);
        const ref = encodeURIComponent(window.location.origin);
        return `https://backpack.app/ul/v1/browse/${url}?ref=${ref}`;
      }
      return '';
    },
    downloadUrl: 'https://backpack.app/download',
  };
};
