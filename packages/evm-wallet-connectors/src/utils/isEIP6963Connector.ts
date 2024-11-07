import { WagmiConnectorInstance } from '../types/Wallet.js';

export const isEIP6963Connector = (wallet: WagmiConnectorInstance) => {
  return !!(!wallet.isRainbowKitConnector && wallet.icon?.startsWith('data:image') && wallet.uid && wallet.name);
};
