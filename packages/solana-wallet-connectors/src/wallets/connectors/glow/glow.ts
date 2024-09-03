import { Wallet } from '../../../types/Wallet';
import { icon } from './glowIcon.js';

export const glowWallet = (): Wallet => {
  return {
    id: 'glow',
    name: 'Glow',
    iconUrl: icon,
    isExtension: true,
    isMobile: true,
    getUri: () => '',
    downloadUrl: 'https://glow.app',
  };
};
