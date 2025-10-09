import { CurrentWalletIds, SupportedWalletTypes } from '@getpara/react-sdk';
import { GroupedWallets } from '../types';

export function getDefaultWalletIds(
  wallets: GroupedWallets,
  { partnerId, supportedWalletTypes }: { partnerId: string; supportedWalletTypes: SupportedWalletTypes },
): CurrentWalletIds | undefined {
  const walletIds = supportedWalletTypes.reduce(
    (acc, { type }) => ({
      ...acc,
      [type]: [
        ...new Set(
          Object.values(wallets)
            .flat()
            .filter(w => {
              const isCorrectType = (w.scheme === 'ED25519' ? ['SOLANA'] : ['EVM', 'COSMOS']).includes(type);
              const isPartnerOwned = partnerId === w.partnerId;
              const isPartnerLastUsed = partnerId === w.lastUsedPartnerId;

              return isCorrectType && (isPartnerOwned || isPartnerLastUsed);
            })
            .map(({ id }) => id),
        ),
      ],
    }),
    {},
  );

  return supportedWalletTypes.every(({ type, optional }) => optional || walletIds[type].length > 0) ? walletIds : undefined;
}
