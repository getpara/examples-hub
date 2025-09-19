import { Wallet } from '../../../types/Wallet.js';
import { icon } from './metaMaskIcon.js';

export const metaMaskWallet = (): Wallet => {
  return {
    id: 'metaMask',
    internalId: 'METAMASK',
    name: 'MetaMask',
    iconUrl: icon,
    isExtension: true,
    isMobile: true,
    hasIosSafariExtension: false,
    // Metamask deep linking doesn't seem to work as expected currently.
    // getQrUri: async () => {
    //   if (typeof window !== 'undefined' && isIosAndRedirectable()) {
    //     const url = encodeURIComponent(window.location.href);
    //     return `https://link.metamask.io/dapp/${url}`;
    //   }
    //   return '';
    // },
    downloadUrl: 'https://metamask.io/download/',
  };
};
