import { DefaultWalletOptions, Wallet } from '../../../types/Wallet.js';
import { getInjectedConnector, hasInjectedProvider } from '../../../utils/getInjectedConnector.js';
import { icon } from './phantomIcon.js';
import { getWalletConnectConnector } from '../../../utils/getWalletConnectConnector.js';

export type PhantomWalletOptions = DefaultWalletOptions;

export const phantomWallet = ({ projectId, walletConnectParameters }: PhantomWalletOptions): Wallet => {
  const isPhantomInjected = hasInjectedProvider({ namespace: 'phantom.ethereum' });
  const shouldUseWalletConnect = !isPhantomInjected;

  const getUri = (uri: string) => {
    return uri;
  };

  return {
    id: 'phantom',
    internalId: 'PHANTOM',
    name: 'Phantom',
    rdns: 'app.phantom',
    iconUrl: icon,
    installed: isPhantomInjected,
    isExtension: true,
    isMobile: true,
    getUri,
    downloadUrl: 'https://phantom.app/download',
    createConnector: shouldUseWalletConnect
      ? getWalletConnectConnector({
          projectId,
          walletConnectParameters,
        })
      : getInjectedConnector({ namespace: 'phantom.ethereum' }),
  };
};
