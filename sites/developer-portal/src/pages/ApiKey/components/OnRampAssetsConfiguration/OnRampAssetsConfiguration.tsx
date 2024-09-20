import { Controller } from 'react-hook-form';
import { useOnRampConfigAssetsFormData } from '../../hooks/useOnRampConfigFormData';
import { Network, NETWORKS, ON_RAMP_ASSETS, OnRampAsset, getOnRampNetworks, getOnRampAssets } from '@usecapsule/react-sdk';
import { DOCS_LINK } from '../../../../utils/constants';
import { ArraySelect } from '../../../../components/ArraySelect/ArraySelect.js';
import { ConfigurationCard } from '../ConfigurationCard';
import { FormProvider } from 'react-hook-form';
import { Save } from '../Save';
import { useOnRampAllAssets } from '../../../../hooks/api/queries/useOnRampAssets.js';

export const OnRampAssetsConfiguration = () => {
  const form = useOnRampConfigAssetsFormData();
  const { data: allAssets, isLoading } = useOnRampAllAssets();

  return (
    <ConfigurationCard
      title="On-Ramp Assets"
      subtitle="Configure which assets you want to offer in your Capsule Modal."
      // TODO: customize the docs link
      docsLink={DOCS_LINK}
    >
      {allAssets && !isLoading && (
        <FormProvider {...form}>
          <Controller
            name={'onRampAssets'}
            render={({ field: { onChange, value } }) => {
              return (
                <div>
                  <ArraySelect<Network, null>
                    ifEmpty={null}
                    value={!value ? value : (Object.keys(value) as Network[])}
                    remaining={getOnRampNetworks(allAssets, {})}
                    emptyText="Any asset on any compatible network"
                    onChange={newKeys => {
                      return onChange(
                        !newKeys
                          ? newKeys
                          : newKeys.reduce((acc, key) => ({ ...acc, [key]: (value ?? {})[key] ?? true }), {}),
                      );
                    }}
                    rowTitle={item => {
                      return NETWORKS[item as Network];
                    }}
                    rowChild={network => (
                      <div style={{ width: '100%', paddingLeft: '20px', paddingBottom: '12px' }}>
                        <ArraySelect<OnRampAsset, true>
                          ifEmpty={true}
                          emptyText={`Any available asset on ${NETWORKS[network]}`}
                          value={value[network]}
                          onChange={newArray => onChange({ ...value, [network]: newArray })}
                          rowTitle={id => ON_RAMP_ASSETS[id][1]}
                          remaining={getOnRampAssets(allAssets, { network }).map(id => id as OnRampAsset)}
                        />
                      </div>
                    )}
                  />
                </div>
              );
            }}
          />
          <Save />
        </FormProvider>
      )}
    </ConfigurationCard>
  );
};
