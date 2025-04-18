import { createConnector } from 'wagmi';
import { Wallet, WalletDetailsParams } from '../../src/types/Wallet.js';
import { mock } from 'wagmi/connectors';
import { TEST_WALLET } from '../constants.js';

export const mockWallet = (): Wallet => {
  return {
    id: 'mock',
    name: 'Mock',
    rdns: 'io.mock',
    iconUrl: '',
    installed: true,
    isExtension: true,
    isMobile: true,
    downloadUrl: 'https://test.com/',
    createConnector: (walletDetails: WalletDetailsParams) => {
      const mockFn = mock({
        accounts: [TEST_WALLET.address as `0x${string}`],
      });

      return createConnector(config => ({
        ...mockFn(config),
        ...walletDetails,
      }));
    },
  };
};
