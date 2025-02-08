import { TPregenIdentifierType, WalletEntity, WalletScheme, WalletType } from '@getpara/user-management-client';
import { stringToPhoneNumber } from './formatting.js';
import { SupportedWalletTypes, Wallet, WalletTypeProp } from '../types/index.js';

export const WalletSchemeTypeMap: Record<WalletScheme, Partial<Record<WalletType, true>>> = {
  [WalletScheme.DKLS]: {
    [WalletType.EVM]: true,
    [WalletType.COSMOS]: true,
  },
  [WalletScheme.CGGMP]: {
    [WalletType.EVM]: true,
    [WalletType.COSMOS]: true,
  },
  [WalletScheme.ED25519]: {
    [WalletType.SOLANA]: true,
  },
};

export function isPregenIdentifierMatch(
  a: string | null | undefined,
  b: string | null | undefined,
  type: TPregenIdentifierType,
): boolean {
  if (!a || !b) {
    return false;
  }
  switch (type) {
    case 'EMAIL':
      return a.toLowerCase() === b.toLowerCase();
    case 'PHONE':
      return stringToPhoneNumber(a) === stringToPhoneNumber(b);
    case 'CUSTOM_ID':
      return a === b;
    default:
      return a.replace(/^@/g, '').toLowerCase() === b.replace(/^@/g, '').toLowerCase();
  }
}

export function isWalletSupported(types: WalletType[], wallet: Omit<Wallet, 'signer'>): boolean {
  return types.some((walletType: WalletType) => !!WalletSchemeTypeMap[wallet.scheme][walletType]);
}

export function getSchemes(types: WalletTypeProp[] | SupportedWalletTypes): WalletScheme[] {
  return <WalletScheme[]>Object.keys(WalletSchemeTypeMap).filter(scheme => {
    if (scheme === WalletScheme.CGGMP) {
      return false;
    }
    return (Array.isArray(types) ? types : Object.keys(types)).some(type => WalletSchemeTypeMap[scheme][type]);
  });
}

export function getWalletTypes(schemes: WalletScheme[]): WalletType[] {
  return [
    ...new Set(
      schemes.reduce((acc, scheme) => {
        return [...acc, ...Object.keys(WalletSchemeTypeMap[scheme]).filter(type => WalletSchemeTypeMap[scheme][type])];
      }, []),
    ),
  ];
}

export function getEquivalentTypes(types: WalletTypeProp[] | WalletTypeProp): WalletType[] {
  return getWalletTypes(getSchemes((Array.isArray(types) ? types : [types]).map(t => WalletType[t])));
}

export function entityToWallet(w: WalletEntity): Omit<Wallet, 'signer'> {
  return {
    ...w,
    scheme: w.scheme as WalletScheme,
    type: w.type as WalletType,
    pregenIdentifierType: w.pregenIdentifierType as TPregenIdentifierType,
  };
}

export function migrateWallet(obj: Record<string, unknown>): Wallet {
  if (['USER', 'PREGEN'].includes(obj.type as string)) {
    obj.isPregen = obj.type === 'PREGEN';
    obj.type = obj.scheme === WalletScheme.ED25519 ? WalletType.SOLANA : WalletType.EVM;
  }

  if (!!obj.scheme && !obj.type) {
    obj.type = obj.scheme === WalletScheme.ED25519 ? WalletType.SOLANA : WalletType.EVM;
  }

  return obj as unknown as Wallet;
}
