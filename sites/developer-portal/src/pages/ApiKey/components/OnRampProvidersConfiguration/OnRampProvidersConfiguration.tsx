import { Controller } from 'react-hook-form';
import { useOnRampConfigProvidersFormData } from '../../hooks/useOnRampConfigFormData';
import { ON_RAMP_PROVIDERS, OnRampProvider } from '@usecapsule/react-sdk';
import { ON_RAMP_DOCS_LINK } from '../../../../utils/constants';
import { ArraySelect } from '../../../../components/ArraySelect/ArraySelect.js';
import { ConfigurationCard } from '../ConfigurationCard';
import { FormProvider } from 'react-hook-form';
import { Save } from '../Save';
import { CpslInput } from '@usecapsule/react-components';
import { InnerConfigurationCard } from '../InnerConfigurationCard.js';

export const OnRampProvidersConfiguration = () => {
  const form = useOnRampConfigProvidersFormData();

  const isRampEnabled = form.watch('onRampProviders')?.includes(OnRampProvider.RAMP);

  return (
    <ConfigurationCard
      title="On-Ramp Providers"
      subtitle="Configure the on- and off-ramp providers to offer in your Capsule Modal."
      docsLink={ON_RAMP_DOCS_LINK}
    >
      <FormProvider {...form}>
        <Controller
          name={'onRampProviders'}
          rules={{
            validate: {
              isNotEmpty: value => value?.length > 0 || 'At least one provider must be selected.',
            },
          }}
          render={({ field: { onChange, value }, fieldState }) => {
            return (
              <div>
                <ArraySelect<OnRampProvider, []>
                  ifEmpty={[]}
                  isOrderable
                  error={fieldState.error?.message}
                  value={value as OnRampProvider[]}
                  remaining={Object.values(OnRampProvider)}
                  onChange={onChange}
                  rowTitle={item => {
                    return ON_RAMP_PROVIDERS[item].name;
                  }}
                />
              </div>
            );
          }}
        />
        {isRampEnabled && (
          <InnerConfigurationCard>
            <Controller
              name={'rampApiKey'}
              rules={{
                validate: {
                  isPresentIfNeeded: value => (value && value.length > 0) || 'You must provide your own Ramp API key.',
                },
              }}
              render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => {
                return (
                  <CpslInput
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
          </InnerConfigurationCard>
        )}
        <Save />
      </FormProvider>
    </ConfigurationCard>
  );
};
