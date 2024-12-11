import { icon } from './keplrIcon.js';
import { WalletWithType } from '../../../types/Wallet.js';
import { WalletType } from '@usecapsule/graz';
import { isMobile } from '@usecapsule/react-sdk';

export const keplrWallet = (): WalletWithType => {
  return {
    id: 'keplr',
    name: 'Keplr',
    iconUrl: icon,
    isExtension: true,
    isMobile: isMobile() && true,
    downloadUrl: 'https://www.keplr.app/get',
    grazType: WalletType.KEPLR,
    grazMobileType: WalletType.WC_KEPLR_MOBILE,
  };
};
