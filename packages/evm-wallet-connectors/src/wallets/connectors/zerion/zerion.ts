import { isIOS, isTelegram } from '@getpara/web-sdk';
import { DefaultWalletOptions, Wallet } from '../../../types/Wallet.js';
import { getInjectedConnector, hasInjectedProvider } from '../../../utils/getInjectedConnector.js';
import { getWalletConnectConnector } from '../../../utils/getWalletConnectConnector.js';
import { icon } from './zerionIcon.js';

export type ZerionWalletOptions = DefaultWalletOptions;

export const zerionWallet = ({ projectId, walletConnectParameters }: ZerionWalletOptions): Wallet => {
  const isZerionInjected = hasInjectedProvider({
    namespace: 'zerionWallet',
    flag: 'isZerion',
  });

  const deeplinkUri = 'zerion://';

  const baseUri = isTelegram() && isIOS() ? 'https://app.zerion.io/wc' : `${deeplinkUri}wc`;

  const getUri = (uri: string) => {
    return `${baseUri}?uri=${encodeURIComponent(uri)}`;
  };

  return {
    id: 'zerion',
    internalId: 'ZERION',
    name: 'Zerion',
    rdns: 'io.zerion.wallet',
    iconUrl: icon,
    installed: isZerionInjected,
    isExtension: true,
    isMobile: true,
    getUri,
    deeplinkUri,
    downloadUrl: 'https://zerion.io/download',
    createConnector: isZerionInjected
      ? getInjectedConnector({
          namespace: 'zerionWallet',
          flag: 'isZerion',
        })
      : getWalletConnectConnector({
          projectId,
          walletConnectParameters,
        }),
  };
};
