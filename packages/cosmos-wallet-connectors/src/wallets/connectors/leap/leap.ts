import { icon } from './leapIcon.js';
import { WalletWithType } from '../../../types/Wallet.js';
import { WalletType } from '@usecapsule/graz';
import { isMobile } from '@usecapsule/react-sdk';

export const leapWallet = (): WalletWithType => {
  return {
    id: 'leap',
    name: 'Leap',
    iconUrl: icon,
    isExtension: true,
    isMobile: isMobile() && true,
    downloadUrl: 'https://www.leapwallet.io/download',
    grazType: WalletType.LEAP,
    grazMobileType: WalletType.WC_LEAP_MOBILE,
  };
};
