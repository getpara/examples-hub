import ParaWeb from '@getpara/web-sdk';
import { WALLET_TYPES_METADATA } from '../constants/constants.js';

export function getWalletDisplayName(
  para: ParaWeb,
  {
    type,
    isExternal,
    name,
    isMenu = false,
    hideWallets = false,
  }: Partial<
    Pick<(typeof para.availableWallets)[0], 'type' | 'isExternal' | 'name'> & {
      isMenu?: boolean;
      hideWallets?: boolean;
    }
  >,
) {
  if (para.isMultiWallet) {
    return (
      name ??
      `${isExternal ? 'External ' : ''}${type ? (WALLET_TYPES_METADATA[type]?.name ?? '') : ''}${!hideWallets && (isMenu || isExternal) ? ' Wallet' : ''}`
    );
  }

  return hideWallets ? 'My Account' : name || 'My Wallet';
}
