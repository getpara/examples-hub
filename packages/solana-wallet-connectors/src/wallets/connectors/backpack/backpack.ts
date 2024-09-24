import { Wallet } from '../../../types/Wallet';
import { icon } from './backpackIcon.js';

export const backpackWallet = (): Wallet => {
  return {
    id: 'backpack',
    name: 'Backpack',
    iconUrl: icon,
    isExtension: true,
    isMobile: true,
    getUri: () => '',
    downloadUrl: 'https://backpack.app/download',
  };
};
