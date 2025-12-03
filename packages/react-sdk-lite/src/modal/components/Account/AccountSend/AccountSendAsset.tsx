import { useMemo, useCallback, memo } from 'react';
import { useWalletState } from '../../../../provider/index.js';
import { useAssets } from '../../../../provider/providers/AssetsProvider.js';
import { SearchableButtonList } from '../../SearchableButtonList.js';
import { useSend } from './context.js';
import { CpslIcon } from '@getpara/react-components';
import { formatAssetQuantity, formatCurrency, WalletBalance } from '@getpara/web-sdk';
import { ModalStep } from '../../../utils/steps.js';
import { useModalStore } from '../../../stores/index.js';
import { AssetNetwork } from './AssetNetwork.js';

const NetworkIcons = memo(({ networks }: { networks: WalletBalance['assets'][number]['networks'] }) => {
  return (
    <div style={{ position: 'relative', height: '12px' }}>
      {networks.slice(0, 3).map((network, index) => (
        <CpslIcon
          key={network.metadata?.logoUrl || index}
          src={network.metadata!.logoUrl}
          size="16px"
          radius="full"
          style={{
            borderRadius: '1000px',
            backgroundColor: 'var(--cpsl-color-primary)',
            position: 'absolute',
            top: 0,
            left: `${index * 8}px`,
            zIndex: 3 - index,
          }}
        />
      ))}
    </div>
  );
});
NetworkIcons.displayName = 'NetworkIcons';

export function AccountSendAsset() {
  const setStep = useModalStore(state => state.setStep);
  const { profileBalance } = useAssets();
  const { selectedWallet } = useWalletState();
  const { setSendMetadata, setTransferAmount } = useSend();

  const walletAssets = useMemo(() => {
    return profileBalance?.wallets.find(wallet => wallet.address === selectedWallet?.address)?.assets ?? [];
  }, [profileBalance, selectedWallet?.address]);

  const transformItem = useCallback((item: WalletBalance['assets'][number]) => {
    const isValued = item.value?.value && item.value?.value >= 0.01;
    const quantity = formatAssetQuantity({ quantity: item.quantity, symbol: item.metadata!.symbol });
    return {
      key: item.metadata!.zerionId!,
      icon: (
        <AssetNetwork
          assetSrc={item.metadata!.logoUrl}
          networkSrc={item.networks.length === 1 ? item.networks[0].metadata!.logoUrl : undefined}
          size={48}
        />
      ),
      text: item.metadata!.symbol,
      textSecondary:
        item.networks.length > 0 ? (
          item.networks.length === 1 ? (
            item.networks[0].metadata!.name
          ) : (
            <NetworkIcons networks={item.networks} />
          )
        ) : undefined,
      endText: isValued ? formatCurrency(item.value) : quantity,
      endTextSecondary: isValued ? quantity : undefined,
    };
  }, []);

  const searchFilter = useCallback(({ item, searchStr }: { item: WalletBalance['assets'][number]; searchStr: string }) => {
    if (!item.metadata) return false;
    const lowerSearchStr = searchStr.toLowerCase();
    return (
      item.metadata.symbol.toLowerCase().includes(lowerSearchStr) ||
      item.metadata.name.toLowerCase().includes(lowerSearchStr)
    );
  }, []);

  const onSelect = useCallback(
    (item: WalletBalance['assets'][number]) => {
      setTransferAmount(0);
      setSendMetadata({
        asset: item,
        network: item.networks[0],
      });
      setStep(item.networks.length > 1 ? ModalStep.ACCOUNT_SEND_NETWORK : ModalStep.ACCOUNT_SEND);
    },
    [setTransferAmount, setSendMetadata, setStep],
  );

  return (
    <div style={{ width: '100%' }}>
      <SearchableButtonList
        items={walletAssets}
        transformItem={transformItem}
        searchFilter={searchFilter}
        onSelect={onSelect}
      />
    </div>
  );
}
