import { KeplrExtensionProvider, KeplrMobileProvider, Network } from '@delphi-labs/shuttle-react';
import { icon } from './keplrIcon.js';
import { hasInstalledExtension } from '../../../utils/hasInstalledProvider.js';
import { WalletWithProviders } from '../../../types/Wallet.js';

export const keplrWallet = ({ networks }: { networks: Network[] }): WalletWithProviders => {
  return {
    id: 'keplr',
    name: 'Keplr',
    installed: hasInstalledExtension('keplr'),
    iconUrl: icon,
    isExtension: true,
    isMobile: true,
    downloadUrl: 'https://www.keplr.app/get',
    extensionProvider: new KeplrExtensionProvider({ networks }),
    mobileProvider: new KeplrMobileProvider({ networks }),
  };
};
