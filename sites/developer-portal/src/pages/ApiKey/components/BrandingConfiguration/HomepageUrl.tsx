import { CpslInput } from '@usecapsule/react-components';
import { InnerConfigurationCard } from '../InnerConfigurationCard';
import { Controller, useFormContext } from 'react-hook-form';
import { HTTPS_URL_REGEX } from '../../../../utils/regex';
import { UpdateApiKeyBranding } from '../../hooks/useBrandingConfigFormData';

export const HomepageUrl = () => {
  const { control } = useFormContext<UpdateApiKeyBranding>();

  return (
    <InnerConfigurationCard>
      <Controller
        name="homepageUrl"
        control={control}
        rules={{
          required: 'Website URL is required.',
          pattern: {
            value: HTTPS_URL_REGEX,
            message: 'Must be a secure (https) url.',
          },
        }}
        render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
          <CpslInput
            label="Website URL"
            placeholder="https://www.yourwebsite.com"
            onCpslInput={e => {
              onChange(e.detail.value?.toLowerCase());
            }}
            onCpslPaste={e => {
              onChange(e.detail.clipboardData?.getData('text'));
            }}
            onCpslBlur={onBlur}
            value={value ?? ''}
            // Manually adding the error for no value here since the initial form validation trigger doesn't always seem to work
            errorText={!value ? 'Website URL is required.' : error?.message}
          />
        )}
      />
    </InnerConfigurationCard>
  );
};
