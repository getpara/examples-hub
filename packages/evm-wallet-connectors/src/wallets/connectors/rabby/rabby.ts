import { DefaultWalletOptions, Wallet } from '../../../types/Wallet.js';
import { getInjectedConnector, hasInjectedProvider } from '../../../utils/getInjectedConnector.js';
import { getWalletConnectConnector } from '../../../utils/getWalletConnectConnector.js';
import { icon } from './rabbyIcon.js';

export type RabbyWalletOptions = DefaultWalletOptions;

export const rabbyWallet = ({ projectId, walletConnectParameters }: RabbyWalletOptions): Wallet => {
  const isRabbyInjected = hasInjectedProvider({ flag: 'isRabby' });

  return {
    id: 'rabby',
    name: 'Rabby Wallet',
    rdns: 'io.rabby',
    iconUrl: icon,
    installed: isRabbyInjected,
    isExtension: true,
    isMobile: false,
    downloadUrl: 'https://rabby.io',
    createConnector: isRabbyInjected
      ? getInjectedConnector({ flag: 'isRabby' })
      : getWalletConnectConnector({
          projectId,
          walletConnectParameters,
        }),
  };
};
