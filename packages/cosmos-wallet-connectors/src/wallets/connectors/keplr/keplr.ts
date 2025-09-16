import { icon } from './keplrIcon.js';
import { WalletWithType } from '../../../types/Wallet.js';
import { WalletType } from '@getpara/graz';
import { isMobile } from '@getpara/web-sdk';

export const keplrWallet = (): WalletWithType => {
  return {
    id: 'keplr',
    internalId: 'KEPLR',
    name: 'Keplr',
    iconUrl: icon,
    isExtension: true,
    isMobile: isMobile() && true,
    downloadUrl: 'https://www.keplr.app/get',
    grazType: WalletType.KEPLR,
    grazMobileType: WalletType.WC_KEPLR_MOBILE,
  };
};
