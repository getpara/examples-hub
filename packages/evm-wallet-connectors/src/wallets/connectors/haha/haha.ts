import { DefaultWalletOptions, Wallet } from '../../../types/Wallet.js';
import { getInjectedConnector, hasInjectedProvider } from '../../../utils/getInjectedConnector.js';
import { icon } from './hahaIcon.js';
import { getWalletConnectConnector } from '../../../utils/getWalletConnectConnector.js';

export type HahaWalletOptions = DefaultWalletOptions;

export const hahaWallet = ({ projectId, walletConnectParameters }: HahaWalletOptions): Wallet => {
  const isHahaInjected = hasInjectedProvider({ namespace: 'haha' });
  const shouldUseWalletConnect = !isHahaInjected;

  const getUri = (uri: string) => {
    return uri;
  };

  return {
    id: 'haha',
    internalId: 'HAHA',
    name: 'HaHa',
    rdns: 'haha.me',
    iconUrl: icon,
    installed: isHahaInjected,
    isExtension: true,
    isMobile: true,
    getUri,
    downloadUrl: 'https://www.haha.me/',
    createConnector: shouldUseWalletConnect
      ? getWalletConnectConnector({
          projectId,
          walletConnectParameters,
        })
      : getInjectedConnector({ namespace: 'haha' }),
  };
};
