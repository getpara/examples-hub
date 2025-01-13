import { Controller } from 'react-hook-form';
import { Network, OnRampAsset, getOnRampNetworks, toAssetInfoArray } from '@usecapsule/react-sdk';
import { ArraySelect } from '../../../../../components/ArraySelect/index.js';
import { useOnRampAllAssets } from '../../../../../hooks/api/queries/useOnRampAssets.js';
import { SectionCard } from '../../common.js';
import { CpslIcon, CpslSelect as _CpslSelect, CpslTab, CpslTabs } from '@usecapsule/react-components';
import { CpslTabsCustomEvent, TabsChangedEventDetail } from '@usecapsule/core-components';
import { useOnRampConfigFormData } from '../../../hooks/useOnRampConfigFormData.js';
import { useMemo, useState } from 'react';
import _ from 'lodash';
import { NetworkAssetSelector, TABS, WatchTab } from './components.js';
import { useGetOrganizationKey } from '../../../../../hooks/api/queries/useOrganizationKeys.js';
import { useParams } from 'react-router-dom';
import { Environment } from '../../../../../types/environment.js';

export const OnRampAssetsConfiguration = () => {
  const { apiKey, env, projectId } = useParams();
  const { data: apiKeyData } = useGetOrganizationKey(projectId ?? '', apiKey ?? '', env as Environment);
  const { data: allAssets, isLoading } = useOnRampAllAssets();
  const form = useOnRampConfigFormData();

  const assetInfo = useMemo(() => (allAssets ? toAssetInfoArray(allAssets) : undefined), [allAssets]);

  const currentValue = form.watch('onRampAssets');
  const [tab, setTab] = useState<'any' | 'selection'>(!!currentValue ? 'selection' : 'any');

  return (
    <SectionCard
      title="On-Ramp Assets"
      subtitle="Configure which assets you want to offer in your modal. The configured providers will limit users to purchasing or selling these assets only."
      // TODO: customize the docs link
    >
      {allAssets && !isLoading && (
        <Controller
          name={'onRampAssets'}
          rules={{
            validate: {
              isValidShape: value =>
                !value ||
                Object.entries(value).reduce(
                  (acc: boolean, [network, value]) =>
                    acc &&
                    !!assetInfo?.some(([_, _network]) => network === _network) &&
                    (value === true || (Array.isArray(value) && value.length > 0)),
                  true,
                ) ||
                'Asset arrays cannot be empty',
            },
          }}
          render={({ field: { onChange, value } }) => {
            return (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <WatchTab
                  tab={tab}
                  onChange={() => {
                    onChange(null);
                  }}
                />

                <CpslTabs
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
                  <ArraySelect<Network, null>
                    ifEmpty={null}
                    value={!value ? value : (Object.keys(value) as Network[])}
                    remaining={getOnRampNetworks(allAssets)}
                    emptyText="Any asset on any compatible network"
                    onChange={newKeys => {
                      return onChange(
                        !newKeys
                          ? newKeys
                          : newKeys.reduce((acc, key) => ({ ...acc, [key]: (value ?? {})[key] ?? true }), {}),
                      );
                    }}
                    rowChild={network => {
                      return (
                        <NetworkAssetSelector
                          assetInfo={allAssets}
                          network={network}
                          assets={value[network]}
                          onChangeNetwork={falsy => {
                            if (!!falsy) return;
                            const { [network]: _omit, ...newValue } = value;

                            onChange(newValue);
                          }}
                          onChangeAssets={(asset, index) => {
                            if (!asset) {
                              if (index === undefined || !Array.isArray(value[network])) return;

                              onChange({
                                ...value,
                                [network]: (value[network] || []).filter((_: OnRampAsset, i) => i !== index),
                              });
                              return;
                            }
                            onChange({
                              ...value,
                              [network]:
                                asset === true || index === undefined
                                  ? true
                                  : value[network] === true
                                    ? [asset]
                                    : [
                                        ...(index > 0 ? (value[network] || []).slice(0, index) : []),
                                        asset,
                                        ...(index < value[network].length - 1
                                          ? (value[network] || []).slice(0, index + 1)
                                          : []),
                                      ],
                            });
                          }}
                        />
                      );
                    }}
                    rowAdd={() => {
                      const networkOptions = assetInfo
                        ? [
                            ...new Set(
                              assetInfo
                                .filter(([walletType, network]) => {
                                  return (
                                    apiKeyData?.supportedWalletTypes.some(({ type }) => type === walletType) &&
                                    !value?.[network] &&
                                    !['SEPOLIA', 'SOLANA_DEVNET'].includes(network)
                                  );
                                })
                                .map(([_, network]) => network),
                            ),
                          ]
                        : [];

                      return networkOptions.length > 0 ? (
                        <NetworkAssetSelector
                          assetInfo={allAssets}
                          onChangeNetwork={network => {
                            if (!network) return;
                            onChange({ ...value, [network]: true });
                          }}
                          networkOptions={networkOptions}
                        />
                      ) : undefined;
                    }}
                  />
                )}
              </div>
            );
          }}
        />
      )}
    </SectionCard>
  );
};
