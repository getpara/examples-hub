import type { DefaultWalletOptions, Wallet } from '../../../types/Wallet.js';
import { getWalletConnectConnector } from '../../../utils/getWalletConnectConnector.js';
import { icon } from './valoraIcon.js';
import { isMobile } from '@getpara/web-sdk';

export type ValoraWalletOptions = DefaultWalletOptions;

export const valoraWallet = ({ projectId, walletConnectParameters }: ValoraWalletOptions): Wallet => {
  const getUri = (uri: string) => {
    // If generating on a mobile device, use the deeplink URI scheme for Valora, else use the WC uri
    return !isMobile() ? uri : `celo://wallet/wc?uri=${encodeURIComponent(uri)}`;
  };

  return {
    id: 'valora',
    internalId: 'VALORA',
    name: 'Valora',
    rdns: 'co.clabs.valora',
    iconUrl: icon,
    installed: false,
    isExtension: false,
    isMobile: true,
    downloadUrl: 'https://valora.xyz',
    getUri,
    createConnector: getWalletConnectConnector({
      projectId,
      walletConnectParameters,
    }),
  };
};
