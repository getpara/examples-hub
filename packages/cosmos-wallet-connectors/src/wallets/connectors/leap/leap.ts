import { icon } from './leapIcon.js';
import { WalletWithType } from '../../../types/Wallet.js';
import { WalletType } from '@getpara/graz';
import { isMobile } from '@getpara/web-sdk';

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
