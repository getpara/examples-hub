import { createConnector } from 'wagmi';
import { safe } from 'wagmi/connectors';
import type { Wallet, WalletDetailsParams } from '../../../types/Wallet.js';
import { icon } from './safeIcon.js';

export const safeWallet = (): Wallet => ({
  id: 'safe',
  name: 'Safe',
  rdns: 'io.safe',
  iconUrl: icon,
  installed:
    // Only allowed in iframe context
    !(typeof window === 'undefined') && window?.parent !== window,
  isExtension: false,
  isMobile: false,
  downloadUrl: 'https://safe.global',
  createConnector: (walletDetails: WalletDetailsParams) => {
    return createConnector(config => ({
      ...safe()(config),
      ...walletDetails,
    }));
  },
});
