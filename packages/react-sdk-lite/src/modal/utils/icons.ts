import { TExternalWallet } from '@getpara/web-sdk';
import { ACCOUNT_TYPES } from '../constants/oAuthLogos.js';
import { IconType } from '@getpara/react-components';

export function getExternalWalletIcon(
  internalId: TExternalWallet | string | undefined,
  { branded = false }: { branded?: boolean } = {},
): IconType | undefined {
  if (!internalId) {
    return 'wallet02';
  }

  const data = ACCOUNT_TYPES?.[internalId];

  if (!data) {
    return 'wallet02';
  }

  return branded ? data.iconBranded || data.icon : data.icon;
}
