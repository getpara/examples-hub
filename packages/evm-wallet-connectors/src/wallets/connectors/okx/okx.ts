import { isAndroid } from '@getpara/web-sdk';
import { DefaultWalletOptions, Wallet } from '../../../types/Wallet.js';
import { getInjectedConnector, hasInjectedProvider } from '../../../utils/getInjectedConnector.js';
import { getWalletConnectConnector } from '../../../utils/getWalletConnectConnector.js';
import { icon } from './okxIcon.js';

export type OKXWalletOptions = DefaultWalletOptions;

export const okxWallet = ({ projectId, walletConnectParameters }: OKXWalletOptions): Wallet => {
  const isOKXInjected = hasInjectedProvider({ namespace: 'okxwallet' });
  const shouldUseWalletConnect = !isOKXInjected;

  const getUri = (uri: string) => {
    return isAndroid() ? uri : `okex://main/wc?uri=${encodeURIComponent(uri)}`;
  };

  return {
    id: 'okx',
    name: 'OKX Wallet',
    rdns: 'com.okex.wallet',
    iconUrl: icon,
    installed: isOKXInjected,
    isExtension: true,
    isMobile: true,
    getUri,
    downloadUrl: 'https://okx.com/download',
    createConnector: shouldUseWalletConnect
      ? getWalletConnectConnector({
          projectId,
          walletConnectParameters,
        })
      : getInjectedConnector({ namespace: 'okxwallet' }),
  };
};
