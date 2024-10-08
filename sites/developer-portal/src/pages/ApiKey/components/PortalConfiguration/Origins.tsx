import { CpslInput } from '@usecapsule/react-components';
import { InnerConfigurationCard } from '../InnerConfigurationCard';
import { Controller, useFormContext } from 'react-hook-form';
import { UpdateApiKeyPortal } from '../../hooks/usePortalConfigFormData';

export const Origins = () => {
  const { control } = useFormContext<UpdateApiKeyPortal>();

  return (
    <InnerConfigurationCard>
      <Controller
        name="origins"
        control={control}
        render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
          <CpslInput
            label="Allowed Origins"
            placeholder="e.g. www.origin-1.com, www.origin-2.com"
            onCpslInput={e => {
              onChange(e.detail.value);
            }}
            onCpslPaste={e => {
              onChange(e.detail.clipboardData?.getData('text'));
            }}
            onCpslBlur={onBlur}
            value={value ?? ''}
            errorText={error?.message}
            helperText="Separate each domain by a comma."
            as="textarea"
          />
        )}
      />
    </InnerConfigurationCard>
  );
};
