import { createContext, PropsWithChildren, useContext, useMemo } from 'react';
import { AssetMetadataIndexed, ProfileBalance, formatCurrency, formatAssetQuantity } from '@getpara/web-sdk';
import { useAssetInfo } from '../hooks/utils/useAssetInfo.js';
import { useStore } from '../stores/useStore.js';
import { useProfileBalance } from '../hooks/queries/index.js';

type Value = {
  displayCurrency: 'USD';
  profileBalance: ProfileBalance | null;
  profileBalanceIsPending: boolean;
  assetMetadata: AssetMetadataIndexed | null;
  assetMetadataIsPending: boolean;
  totalBalance: string | undefined;
};

export const AssetsContext = createContext<Value>({
  displayCurrency: 'USD',
  profileBalance: null,
  profileBalanceIsPending: true,
  assetMetadata: null,
  assetMetadataIsPending: true,
  totalBalance: undefined,
});

export function AssetsProvider({ children }: PropsWithChildren) {
  const balancesConfig = useStore(state => state.modalConfig?.balances);
  const { data: profileBalance, isPending: profileBalanceIsPending } = useProfileBalance();
  const { data: assetMetadata, isPending: assetMetadataIsPending } = useAssetInfo();

  const totalBalance = useMemo(() => {
    switch (true) {
      case !balancesConfig:
      case balancesConfig?.displayType === 'AGGREGATED':
        if (!profileBalance?.value) {
          return undefined;
        }
        return formatCurrency(profileBalance.value);
      default: {
        if (!profileBalance) {
          return undefined;
        }
        const assetQuantity = profileBalance.wallets.reduce((acc, wallet) => {
          const asset = wallet.assets.find(a => a.metadata?.symbol === balancesConfig.asset.symbol);
          if (!asset) {
            return acc;
          }
          return acc + asset.quantity;
        }, 0);
        return formatAssetQuantity({ quantity: assetQuantity, symbol: balancesConfig.asset.symbol });
      }
    }
  }, [balancesConfig, profileBalance]);

  const value = useMemo(
    () => ({
      displayCurrency: 'USD' as const,
      profileBalance: profileBalance || null,
      profileBalanceIsPending,
      assetMetadata: assetMetadata || null,
      assetMetadataIsPending,
      totalBalance,
    }),
    [profileBalance, totalBalance, profileBalanceIsPending, assetMetadata, assetMetadataIsPending],
  );

  return <AssetsContext.Provider value={value}>{children}</AssetsContext.Provider>;
}

export const useAssets = () => useContext(AssetsContext);
