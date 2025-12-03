import { useMemo } from 'react';
import { useAssets } from '../../../../provider/providers/AssetsProvider.js';
import { SearchableButtonList } from '../../SearchableButtonList.js';
import { useSend } from './context.js';
import { formatAssetQuantity, formatCurrency } from '@getpara/web-sdk';
import { ModalStep } from '../../../utils/steps.js';
import { useModalStore } from '../../../stores/index.js';
import { AssetNetwork } from './AssetNetwork.js';

export function AccountSendNetwork() {
  const setStep = useModalStore(state => state.setStep);
  const { profileBalance } = useAssets();
  const { sendMetadata, setSendMetadata } = useSend();

  const assetNetworks = useMemo(() => {
    return sendMetadata.asset?.networks ?? [];
  }, [profileBalance, sendMetadata.asset]);

  return (
    <div style={{ width: '100%', maxHeight: '480px' }}>
      <SearchableButtonList
        items={assetNetworks}
        transformItem={item => {
          return {
            key: item.metadata!.zerionId!,
            icon: (
              <AssetNetwork assetSrc={sendMetadata.asset!.metadata!.logoUrl} networkSrc={item.metadata!.logoUrl} size={48} />
            ),
            text: sendMetadata.asset!.metadata!.symbol,
            textSecondary: item.metadata!.name,
            endText: formatAssetQuantity({ quantity: item.quantity, symbol: sendMetadata.asset!.metadata!.symbol }),
            endTextSecondary: formatCurrency(item.value),
          };
        }}
        searchPlaceholder="Search for a network"
        searchFilter={({ item, searchStr }) => {
          return item.metadata?.name?.toLowerCase().includes(searchStr.toLowerCase()) ?? false;
        }}
        onSelect={item => {
          setSendMetadata(prev => ({
            ...prev,
            network: item,
          }));
          setStep(ModalStep.ACCOUNT_SEND);
        }}
      />
    </div>
  );
}
