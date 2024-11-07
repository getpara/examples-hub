import { Wallet } from '../../../types/Wallet.js';
import { icon } from './phantomIcon.js';

export const phantomWallet = (): Wallet => {
  return {
    id: 'phantom',
    name: 'Phantom',
    iconUrl: icon,
    isExtension: true,
    isMobile: true,
    getUri: () => '',
    downloadUrl: 'https://phantom.app/download',
  };
};
