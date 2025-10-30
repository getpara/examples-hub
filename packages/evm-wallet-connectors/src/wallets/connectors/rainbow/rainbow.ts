import { isAndroid, isIOS, isTelegram } from '@getpara/web-sdk';
import { DefaultWalletOptions, Wallet } from '../../../types/Wallet.js';
import { getInjectedConnector, hasInjectedProvider } from '../../../utils/getInjectedConnector.js';
import { getWalletConnectConnector } from '../../../utils/getWalletConnectConnector.js';
import { icon } from './rainbowIcon.js';

export type RainbowWalletOptions = DefaultWalletOptions;

export const rainbowWallet = ({ projectId, walletConnectParameters }: RainbowWalletOptions): Wallet => {
  const isRainbowInjected = hasInjectedProvider({ flag: 'isRainbow' });

  const deeplinkUri = 'rainbow://';

  const baseUri = isAndroid()
    ? `${deeplinkUri}wc`
    : isIOS()
      ? !isTelegram()
        ? // currently broken in MetaMask v6.5.0 https://github.com/MetaMask/metamask-mobile/issues/6457
          `${deeplinkUri}wc`
        : 'https://rnbwapp.com/wc'
      : 'https://rnbwapp.com/wc';

  const getUri = (uri: string) => {
    return `${baseUri}?uri=${encodeURIComponent(uri)}`;
  };

  return {
    id: 'rainbow',
    internalId: 'RAINBOW',
    name: 'Rainbow',
    rdns: 'me.rainbow',
    iconUrl: icon,
    installed: isRainbowInjected,
    isExtension: true,
    isMobile: true,
    downloadUrl: 'https://rainbow.me/',
    getUri,
    deeplinkUri,
    createConnector: isRainbowInjected
      ? getInjectedConnector({ flag: 'isRainbow' })
      : getWalletConnectConnector({
          projectId,
          walletConnectParameters,
        }),
  };
};
