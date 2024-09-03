import { isAndroid, isIOS } from '@usecapsule/web-sdk';
import { DefaultWalletOptions, Wallet } from '../../../types/Wallet.js';
import { getInjectedConnector, hasInjectedProvider } from '../../../utils/getInjectedConnector.js';
import { getWalletConnectConnector } from '../../../utils/getWalletConnectConnector.js';
import { icon } from './rainbowIcon.js';

export type RainbowWalletOptions = DefaultWalletOptions;

export const rainbowWallet = ({ projectId, walletConnectParameters }: RainbowWalletOptions): Wallet => {
  const isRainbowInjected = hasInjectedProvider({ flag: 'isRainbow' });

  const getUri = (uri: string) => {
    return isAndroid()
      ? uri
      : isIOS()
        ? `rainbow://wc?uri=${encodeURIComponent(uri)}`
        : `https://rnbwapp.com/wc?uri=${encodeURIComponent(uri)}`;
  };

  return {
    id: 'rainbow',
    name: 'Rainbow',
    rdns: 'me.rainbow',
    iconUrl: icon,
    installed: isRainbowInjected,
    isExtension: true,
    isMobile: true,
    downloadUrl: 'https://rainbow.me/',
    getUri,
    createConnector: isRainbowInjected
      ? getInjectedConnector({ flag: 'isRainbow' })
      : getWalletConnectConnector({
          projectId,
          walletConnectParameters,
        }),
  };
};
