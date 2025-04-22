import { Controller } from 'react-hook-form';
import { ON_RAMP_PROVIDERS, OnRampProvider } from '@getpara/react-sdk';
import { ArraySelect } from '../../../../components/ArraySelect/index.js';
import { CpslRow, CpslText } from '@getpara/react-components';
import { BrandIcon, InnerInput } from './common.js';
import { SectionCard, GreenSwitch } from '../common.js';

export const OnRampProvidersConfiguration = () => {
  return (
    <SectionCard
      title="On-Ramp Providers"
      subtitle="Configure which providers to display in your modal. The provider buttons will be displayed in the order below, if they offer your specified assets and if the user's selected wallet is a qualifying type."
    >
      <Controller
        name={'onRampProviders'}
        rules={{
          validate: {
            isNotEmpty: value => value?.length > 0 || 'At least one provider must be selected.',
          },
        }}
        render={({ field: { onChange, value }, fieldState }) => {
          const valueWithRemaining: OnRampProvider[] = [
            ...(value as OnRampProvider[]),
            ...(Object.keys(OnRampProvider).filter(key => !value?.includes(key as OnRampProvider)) as OnRampProvider[]),
          ];

          return (
            <ArraySelect<OnRampProvider, []>
              ifEmpty={[]}
              isOrderable
              error={fieldState.error?.message}
              value={valueWithRemaining}
              remaining={[]}
              onChange={items => onChange(items.filter(item => value.includes(item)))}
              rowTitle={item => {
                return (
                  <CpslRow style={{ alignItems: 'center', flex: 1 }}>
                    <CpslRow style={{ alignItems: 'center', gap: '8px', flex: 1 }}>
                      <BrandIcon icon={ON_RAMP_PROVIDERS[item].icon} />
                      <CpslText variant="bodyM" style={{ fontWeight: '600' }}>
                        {ON_RAMP_PROVIDERS[item].name}
                      </CpslText>
                    </CpslRow>
                    <GreenSwitch
                      checked={value.includes(item)}
                      onClick={e => {
                        const isChecked = e.currentTarget.checked;
                        const newValue = isChecked ? value.filter((v: OnRampProvider) => v !== item) : [...value, item];

                        onChange(newValue);
                      }}
                    />
                  </CpslRow>
                );
              }}
              rowChild={item => {
                if (item === 'RAMP' && value.includes(item)) {
                  return (
                    <Controller
                      name={'rampApiKey'}
                      rules={{
                        validate: {
                          isPresentIfNeeded: value =>
                            (value && value.length > 0) || 'You must provide your own Ramp API key.',
                        },
                      }}
                      render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => {
                        return (
                          <InnerInput
                            label="Ramp API Key"
                            placeholder="Enter your Ramp production API key"
                            onCpslInput={e => {
                              onChange(e.detail.value);
                            }}
                            onCpslPaste={e => {
                              onChange(e.detail.clipboardData?.getData('text'));
                            }}
                            onCpslBlur={onBlur}
                            value={value ?? ''}
                            errorText={error?.message}
                          />
                        );
                      }}
                    />
                  );
                }
                return null;
              }}
            />
          );
        }}
      />
    </SectionCard>
  );
};
