import { CpslInput } from '@usecapsule/react-components';
import { InnerConfigurationCard } from '../InnerConfigurationCard';
import { Controller, useFormContext } from 'react-hook-form';
import { HTTPS_URL_REGEX } from '../../../../utils/regex';
import { UpdateApiKeyPortal } from '../../hooks/usePortalConfigFormData';

export const PortalUrl = () => {
  const { control } = useFormContext<UpdateApiKeyPortal>();

  return (
    <InnerConfigurationCard>
      <Controller
        name="portalUrl"
        control={control}
        rules={{
          pattern: {
            value: HTTPS_URL_REGEX,
            message: 'Must be a secure (https) url.',
          },
        }}
        render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
          <CpslInput
            label="Portal URL"
            placeholder="Enter Portal URL"
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
        )}
      />
    </InnerConfigurationCard>
  );
};
