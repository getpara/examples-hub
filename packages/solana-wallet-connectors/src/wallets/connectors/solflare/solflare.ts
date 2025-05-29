import { Wallet } from '../../../types/Wallet.js';
import { icon } from './solflareIcon.js';

export const solflareWallet = (): Wallet => {
  return {
    id: 'solflare',
    name: 'Solflare',
    iconUrl: icon,
    isExtension: true,
    isMobile: true,
    getUri: () => '',
    downloadUrl: 'https://www.solflare.com/download/',
  };
};
