import { icon } from './cosmostationIcon.js';
import { WalletWithType } from '../../../types/Wallet.js';
import { WalletType } from '@getpara/graz';
import { isMobile } from '@getpara/web-sdk';

export const cosmostationWallet = (): WalletWithType => {
  return {
    id: 'cosmostation',
    internalId: 'COSMOSTATION',
    name: 'Cosmostation',
    iconUrl: icon,
    isExtension: true,
    isMobile: isMobile() && true,
    downloadUrl: 'https://www.cosmostation.io/products/cosmostation_extension',
    grazType: WalletType.COSMOSTATION,
    grazMobileType: WalletType.WC_COSMOSTATION_MOBILE,
  };
};
