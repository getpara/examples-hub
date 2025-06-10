import { DefaultWalletOptions, Wallet } from '../../../types/Wallet.js';
import { getInjectedConnector, hasInjectedProvider } from '../../../utils/getInjectedConnector.js';
import { icon } from './backpackIcon.js';
import { getWalletConnectConnector } from '../../../utils/getWalletConnectConnector.js';

export type BackpackWalletOptions = DefaultWalletOptions;

export const backpackWallet = ({ projectId, walletConnectParameters }: BackpackWalletOptions): Wallet => {
  const isBackpackInjected = hasInjectedProvider({ namespace: 'backpack.ethereum' });
  const shouldUseWalletConnect = !isBackpackInjected;

  const getUri = (uri: string) => {
    return uri;
  };

  return {
    id: 'backpack',
    name: 'Backpack',
    rdns: 'app.backpack.mobile',
    iconUrl: icon,
    installed: isBackpackInjected,
    isExtension: true,
    isMobile: true,
    getUri,
    downloadUrl: 'https://backpack.app/download',
    createConnector: shouldUseWalletConnect
      ? getWalletConnectConnector({
          projectId,
          walletConnectParameters,
        })
      : getInjectedConnector({ namespace: 'backpack.ethereum' }),
  };
};
