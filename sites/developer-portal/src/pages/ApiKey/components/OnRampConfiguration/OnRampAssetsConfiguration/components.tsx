import {
  Network,
  OnRampAsset,
  getOnRampAssets,
  OnRampAssetInfo,
  getNetworkName,
  getNetworkIcon,
  getAssetName,
  getAssetIcon,
} from '@usecapsule/react-sdk';
import { InnerSelect, OptionDisplay } from '../common.js';
import {
  CpslButton,
  CpslIcon,
  CpslSelect as _CpslSelect,
  CpslSelectItem,
  CpslTab,
  CpslTabs,
  CpslRow,
  CpslCol as _CpslCol,
} from '@usecapsule/react-components';
import { CpslTabsCustomEvent, IconType, TabsChangedEventDetail } from '@usecapsule/core-components';
import { useEffect, useState } from 'react';
import _ from 'lodash';
import styled from 'styled-components';

export const TABS: { tab: 'any' | 'selection'; title: string; icon: IconType }[] = [
  { tab: 'any', title: 'All Available Assets', icon: 'globe' },
  { tab: 'selection', title: 'Custom Selection', icon: 'sliders' },
];

export const DeleteButton = ({ onClick }: { onClick?: () => void }) => {
  return (
    <CpslButton variant="ghost" style={{ visibility: onClick ? 'visible' : 'hidden' }} onClick={onClick ?? undefined}>
      <CpslIcon icon="trash" />
    </CpslButton>
  );
};

export function NetworkAssetSelector({
  assetInfo,
  network,
  networkOptions = [],
  assets,
  onChangeNetwork,
  onChangeAssets,
}: {
  assetInfo: OnRampAssetInfo;
  network?: Network | undefined;
  assets?: undefined | true | OnRampAsset[];
  onChangeNetwork?: (network: Network | undefined) => void;
  onChangeAssets?: (asset: true | undefined | OnRampAsset, index?: number) => void;
  networkOptions?: Network[];
}) {
  const [isUnset, isAny] = [network === undefined, assets === true];

  const [tab, setTab] = useState<'any' | 'selection'>(isAny ? 'any' : 'selection');
  const assetOptions = getOnRampAssets(assetInfo, { network }).filter(a => !Array.isArray(assets) || !assets.includes(a));

  useEffect(() => {
    if (tab === 'any') {
      onChangeAssets?.(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  return (
    <CpslCol>
      <CpslCol>
        <CpslCol>
          <Label>Network</Label>
          <SelectContainer>
            <InnerSelect
              selectedValue={network}
              onCpslSelectValueChange={
                isUnset && onChangeNetwork
                  ? e => {
                      onChangeNetwork(e.detail as Network);
                    }
                  : undefined
              }
              disabled={!!network}
              showFormattedSelectedItem
              placeholder="Add a network"
              style={{ flex: 1 }}
            >
              {!!network && (
                <div style={{ display: 'flex', alignItems: 'center', width: '100%' }} slot="selected-item">
                  <OptionDisplay name={getNetworkName(network)} icon={getNetworkIcon(network)} />
                </div>
              )}
              {networkOptions.map((n: Network) => (
                <CpslSelectItem key={n} value={n} slot="items">
                  <OptionDisplay name={getNetworkName(n)} icon={getNetworkIcon(n)} />
                </CpslSelectItem>
              ))}
            </InnerSelect>
            {!!network && (
              <DeleteButton
                onClick={
                  !!network
                    ? () => {
                        onChangeNetwork?.(undefined);
                      }
                    : undefined
                }
              />
            )}
          </SelectContainer>
        </CpslCol>
        {!!assets && (
          <>
            <CpslTabs
              style={{ marginTop: '12px' }}
              selectedTab={tab}
              onCpslTabsChanged={(event: CpslTabsCustomEvent<TabsChangedEventDetail>) => {
                setTab(event.detail.tab as 'any' | 'selection');
              }}
            >
              {TABS.map(({ tab, icon, title }) => (
                <CpslTab key={tab} tab={tab}>
                  <CpslIcon slot="start" icon={icon} />
                  {title}
                </CpslTab>
              ))}
            </CpslTabs>
            {tab === 'selection' && (
              <>
                <Label>Assets</Label>
                {Array.isArray(assets) && (
                  <>
                    {assets.map((asset, index) => (
                      <SelectContainer>
                        <InnerSelect
                          key={`${asset}-${index}`}
                          selectedValue={asset}
                          disabled={assetOptions.length === 0}
                          onCpslSelectValueChange={
                            onChangeAssets
                              ? e => {
                                  onChangeAssets(e.detail as OnRampAsset, index);
                                }
                              : undefined
                          }
                          showFormattedSelectedItem
                        >
                          {asset && (
                            <OptionDisplay name={getAssetName(asset)} icon={getAssetIcon(asset)} slot="selected-item" />
                          )}
                          {assetOptions.map((a: OnRampAsset) => (
                            <CpslSelectItem key={a} value={a} slot="items">
                              <OptionDisplay name={getAssetName(a)} icon={getAssetIcon(a)} />
                            </CpslSelectItem>
                          ))}
                        </InnerSelect>
                        <DeleteButton onClick={asset ? () => onChangeAssets?.(undefined, index) : undefined} />
                      </SelectContainer>
                    ))}
                  </>
                )}
                {(assets === true || assetOptions.length > 0) && (
                  <InnerSelect
                    onCpslSelectValueChange={
                      onChangeAssets
                        ? e => onChangeAssets(e.detail as OnRampAsset, Array.isArray(assets) ? assets.length : 0)
                        : undefined
                    }
                    showFormattedSelectedItem
                    placeholder="Select asset"
                  >
                    {assetOptions.map((a: OnRampAsset) => (
                      <CpslSelectItem key={a} value={a} slot="items">
                        <OptionDisplay name={getAssetName(a)} icon={getAssetIcon(a)} />
                      </CpslSelectItem>
                    ))}
                  </InnerSelect>
                )}
              </>
            )}
          </>
        )}
      </CpslCol>
    </CpslCol>
  );
}

export function WatchTab({ tab, onChange }: { tab: 'any' | 'selection'; onChange: () => void }) {
  useEffect(() => {
    if (tab === 'any') {
      onChange();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  return null;
}

const CpslCol = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const SelectContainer = styled(CpslRow)`
  gap: 12px;
  align-items: center;
`;

export const Label = styled.div`
  font-size: 12px;
  width: 100%;
`;
