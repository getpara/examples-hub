import * as uuid from 'uuid';
import {
  CurrentWalletIds,
  SupportedWalletTypes,
  TPregenIdentifierType,
  WalletEntity,
  TWalletScheme,
  TWalletType,
} from '@getpara/user-management-client';
import { Wallet } from '../types/index.js';
import { formatPhoneNumber } from './phone.js';

export const WalletSchemeTypeMap: Record<TWalletScheme, Partial<Record<TWalletType, true>>> = {
  DKLS: {
    EVM: true,
    COSMOS: true,
  },
  CGGMP: {
    EVM: true,
    COSMOS: true,
  },
  ED25519: {
    SOLANA: true,
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
      return formatPhoneNumber(a) === formatPhoneNumber(b);
    case 'CUSTOM_ID':
      return a === b;
    default:
      return a.replace(/^@/g, '').toLowerCase() === b.replace(/^@/g, '').toLowerCase();
  }
}

export function isWalletSupported(types: TWalletType[], wallet: Omit<Wallet, 'signer'>): boolean {
  return types.some((walletType: TWalletType) => !!WalletSchemeTypeMap[wallet?.scheme]?.[walletType]);
}

export function getSchemes(types: TWalletType[] | SupportedWalletTypes): TWalletScheme[] {
  return <TWalletScheme[]>Object.keys(WalletSchemeTypeMap).filter(scheme => {
    if (scheme === 'CGGMP') {
      return false;
    }
    return (Array.isArray(types) ? types : Object.keys(types)).some(type => WalletSchemeTypeMap[scheme][type]);
  });
}

export function getWalletTypes(schemes: TWalletScheme[]): TWalletType[] {
  return [
    ...new Set(
      schemes.reduce((acc, scheme) => {
        return [...acc, ...Object.keys(WalletSchemeTypeMap[scheme]).filter(type => WalletSchemeTypeMap[scheme][type])];
      }, []),
    ),
  ];
}

export function getEquivalentTypes(types: TWalletType[] | TWalletType): TWalletType[] {
  return getWalletTypes(getSchemes(Array.isArray(types) ? types : [types]));
}

export function entityToWallet(w: WalletEntity): Omit<Wallet, 'signer'> {
  return {
    ...w,
    createdAt: typeof w.createdAt === 'string' ? w.createdAt : w.createdAt.toISOString(),
    lastUsedAt: typeof w.lastUsedAt === 'string' ? w.lastUsedAt : w.lastUsedAt?.toISOString(),
    scheme: w.scheme as TWalletScheme,
    type: w.type as TWalletType,
    pregenIdentifierType: w.pregenIdentifierType as TPregenIdentifierType,
  };
}

export function migrateWallet(obj: Record<string, unknown>): Wallet {
  if (['USER', 'PREGEN'].includes(obj.type as string)) {
    obj.isPregen = obj.type === 'PREGEN';
    obj.type = obj.scheme === 'ED25519' ? 'SOLANA' : 'EVM';
  }

  if (!!obj.scheme && !obj.type) {
    obj.type = obj.scheme === 'ED25519' ? 'SOLANA' : 'EVM';
  }

  return obj as unknown as Wallet;
}

export function supportedWalletTypesEq(a: SupportedWalletTypes, b: SupportedWalletTypes) {
  return (
    a.length === b.length && a.every(({ type, optional }, index) => b[index].type === type && b[index].optional === optional)
  );
}

export function mergeCurrentWalletIds(original: CurrentWalletIds, additional: CurrentWalletIds): CurrentWalletIds {
  return [...new Set([...Object.keys(original), ...Object.keys(additional)])].reduce((acc, key) => {
    return {
      ...acc,
      [key]: [...new Set([...(original[key] || []), ...(additional[key] || [])])],
    };
  }, {});
}

export function newUuid(): string {
  return uuid.v4();
}
