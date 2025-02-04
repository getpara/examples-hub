import { ParaWalletConnectParameters, Wallet } from '../../../types/Wallet.js';
import { getWalletConnectConnector } from '../../../utils/getWalletConnectConnector.js';
import { icon } from './walletConnectIcon.js';

export interface WalletConnectWalletOptions {
  projectId: string;
  options?: ParaWalletConnectParameters;
}

export const walletConnectWallet = ({ projectId, options }: WalletConnectWalletOptions): Wallet => {
  const getUri = (uri: string) => uri;

  return {
    id: 'walletConnect',
    name: 'WalletConnect',
    installed: undefined,
    iconUrl: icon,
    isMobile: true,
    getUri,
    createConnector: getWalletConnectConnector({
      projectId,
      walletConnectParameters: options,
    }),
  };
};
