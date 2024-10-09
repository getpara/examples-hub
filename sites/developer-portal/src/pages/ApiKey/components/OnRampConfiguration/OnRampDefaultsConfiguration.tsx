import { useMemo, useState } from 'react';
import { useOnRampAllAssets } from '../../../../hooks/api/queries/useOnRampAssets';
import { getAssetIcon, getAssetName, getNetworkName, Network, OnRampAsset, toAssetInfoArray } from '@usecapsule/react-sdk';
import { OptionDisplay } from './common';
import { GreenSwitch, SectionCard } from '../common';
import { CpslIcon, CpslInput, CpslSelect, CpslSelectItem } from '@usecapsule/react-components';
import { Controller, useFormContext, useWatch } from 'react-hook-form';
import { OnRampAssets } from '../../../../types/api';
import { useOnRampConfigFormData } from '../../hooks/useOnRampConfigFormData';

function getComboName(network: Network, asset: OnRampAsset): string {
  return `${getAssetName(asset)}${[OnRampAsset.USDC, OnRampAsset.TETHER, OnRampAsset.ETHEREUM, OnRampAsset.POLYGON].includes(asset) ? ` (${getNetworkName(network)})` : ''}`;
}

function getComboId(network: Network, asset: OnRampAsset): string {
  return `${network}-${asset}`;
}

const useOnRampAssets = () => {
  const { getValues } = useFormContext();

  const watch = useWatch({ name: 'onRampAssets' });

  return getValues('onRampAssets') || watch;
};

function isValidCombo(onRampAssets: OnRampAssets | undefined, network: Network, asset: OnRampAsset): boolean {
  return (
    !onRampAssets ||
    onRampAssets[network] === true ||
    (Array.isArray(onRampAssets[network]) && (onRampAssets[network].length === 0 || onRampAssets[network].includes(asset)))
  );
}

export function OnRampDefaultsConfiguration() {
  const { data: allAssets } = useOnRampAllAssets();
  const form = useOnRampConfigFormData();

  const onRampAssets = useOnRampAssets();

  const defaultAssetOptions = useMemo<[Network, OnRampAsset][]>(() => {
    if (!allAssets) return [];

    return (
      toAssetInfoArray(allAssets).reduce((acc: Array<[Network, OnRampAsset]>, [_, network, asset]) => {
        if (isValidCombo(onRampAssets, network, asset)) {
          return [...acc, [network, asset]];
        }

        return acc;
      }, []) as Array<[Network, OnRampAsset]>
    ).sort((a, b) => a[1].localeCompare(b[1]));
  }, [onRampAssets, allAssets]);

  const [isExpanded, setIsExpanded] = useState(
    !!form.watch('defaultOnRampNetwork') || Boolean(form.watch('defaultBuyAmount')),
  );

  if (!allAssets) {
    return null;
  }

  return (
    <Controller
      name="defaultOnRampNetwork"
      render={({ field: { onChange: setDefaultOnRampNetwork, value: defaultOnRampNetwork } }) => {
        return (
          <Controller
            name="defaultOnRampAsset"
            render={({ field: { onChange: setDefaultOnRampAsset, value: defaultOnRampAsset } }) => {
              const currentCombo = defaultOnRampAsset ? getComboId(defaultOnRampNetwork, defaultOnRampAsset) : undefined;
              return (
                <Controller
                  name="defaultBuyAmount"
                  render={({ field: { onChange: setDefaultBuyAmount, value: defaultBuyAmount } }) => {
                    return (
                      <SectionCard
                        title="Default Values"
                        subtitle="Set the default asset and amount that will be auto-populated when a user attempts to buy or sell crypto from one of the on-ramp providers."
                        accessory={
                          <GreenSwitch
                            checked={isExpanded}
                            onClick={e => {
                              if ((e.currentTarget as any).checked) {
                                setIsExpanded(false);
                                setDefaultOnRampNetwork(null);
                                setDefaultOnRampAsset(null);
                                setDefaultBuyAmount(null);
                              } else {
                                setIsExpanded(true);
                              }
                            }}
                          />
                        }
                      >
                        {isExpanded && (
                          <>
                            <CpslSelect
                              selectedValue={currentCombo}
                              label="Asset"
                              onCpslSelectValueChange={e => {
                                const str = e.detail as string;

                                if (str === 'NONE') {
                                  setDefaultOnRampAsset(null);
                                  setDefaultOnRampNetwork(null);
                                  return;
                                }

                                const [network, asset] = str.split('-') as [Network, OnRampAsset];

                                setDefaultOnRampAsset(asset);
                                setDefaultOnRampNetwork(network);
                              }}
                              dropdownMaxHeight={300}
                              showFormattedSelectedItem
                              placeholder="Select asset"
                            >
                              {defaultOnRampAsset && defaultOnRampNetwork && (
                                <OptionDisplay
                                  name={getComboName(defaultOnRampNetwork, defaultOnRampAsset)}
                                  icon={getAssetIcon(defaultOnRampAsset)}
                                  slot="selected-item"
                                />
                              )}
                              {defaultOnRampAsset && defaultOnRampNetwork && (
                                <CpslSelectItem key="NONE" value="NONE" slot="items">
                                  <OptionDisplay name="None" icon="x" />
                                </CpslSelectItem>
                              )}
                              {defaultAssetOptions.map(([network, asset]) => (
                                <CpslSelectItem
                                  key={getComboId(network, asset)}
                                  value={getComboId(network, asset)}
                                  slot="items"
                                >
                                  <OptionDisplay name={getComboName(network, asset)} icon={getAssetIcon(asset)} />
                                </CpslSelectItem>
                              ))}
                            </CpslSelect>
                            <CpslInput
                              label="Value"
                              value={defaultBuyAmount || ''}
                              key={defaultBuyAmount || ''}
                              onKeyDown={e => {
                                if (!/^(\d|\.)$/.test(e.key) && !['Delete', 'Backspace', 'Tab', 'Shift'].includes(e.key)) {
                                  e.preventDefault();
                                }
                              }}
                              onChange={e => {
                                const numericValue = (e.currentTarget?.value || '').replace(/[^0-9.]/g, '');
                                if (numericValue !== '') {
                                  const formattedValue = parseFloat(numericValue).toFixed(2);
                                  setDefaultBuyAmount(formattedValue);
                                } else {
                                  setDefaultBuyAmount(null);
                                }
                              }}
                              onBlur={e => {
                                const numericValue = (e.currentTarget.value || '').replace(/[^0-9.]/g, '');
                                if (numericValue === '') {
                                  setDefaultBuyAmount(null);
                                } else {
                                  setDefaultBuyAmount(parseFloat(numericValue).toFixed(2));
                                }
                              }}
                              placeholder="Enter amount"
                            >
                              <CpslIcon icon="currencyDollar" slot="start" />
                            </CpslInput>
                          </>
                        )}
                      </SectionCard>
                    );
                  }}
                />
              );
            }}
          />
        );
      }}
    />
  );
}
