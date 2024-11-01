import { isIOS, isTelegram } from '@usecapsule/react-sdk';
import { DefaultWalletOptions, Wallet } from '../../../types/Wallet';
import { getInjectedConnector, hasInjectedProvider } from '../../../utils/getInjectedConnector.js';
import { getWalletConnectConnector } from '../../../utils/getWalletConnectConnector';
import { icon } from './zerionIcon.js';

export type ZerionWalletOptions = DefaultWalletOptions;

export const zerionWallet = ({ projectId, walletConnectParameters }: ZerionWalletOptions): Wallet => {
  const isZerionInjected = hasInjectedProvider({
    namespace: 'zerionWallet',
    flag: 'isZerion',
  });

  const getUri = (uri: string) => {
    return isTelegram() && isIOS()
      ? `https://app.zerion.io/wc?uri=${encodeURIComponent(uri)}`
      : `zerion://wc?uri=${encodeURIComponent(uri)}`;
  };

  return {
    id: 'zerion',
    name: 'Zerion',
    rdns: 'io.zerion.wallet',
    iconUrl: icon,
    installed: isZerionInjected,
    isExtension: true,
    isMobile: true,
    getUri,
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
