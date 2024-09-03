import { LeapCosmosExtensionProvider, LeapCosmosMobileProvider, Network } from '@delphi-labs/shuttle-react';
import { icon } from './leapIcon.js';
import { hasInstalledExtension } from '../../../utils/hasInstalledProvider.js';
import { WalletWithProviders } from '../../../types/Wallet.js';

export const leapWallet = ({ networks }: { networks: Network[] }): WalletWithProviders => {
  return {
    id: 'leap',
    name: 'Leap',
    installed: hasInstalledExtension('leap'),
    iconUrl: icon,
    isExtension: true,
    isMobile: true,
    downloadUrl: 'https://www.leapwallet.io/download',
    extensionProvider: new LeapCosmosExtensionProvider({ networks }),
    mobileProvider: new LeapCosmosMobileProvider({ networks }),
  };
};
