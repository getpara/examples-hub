import { CpslInput } from '@usecapsule/react-components';
import { InnerConfigurationCard } from '../InnerConfigurationCard';
import { Controller, useFormContext } from 'react-hook-form';
import { HEX_COLOR_REGEX } from '../../../../utils/regex';
import { UpdateApiKeyBranding } from '../../hooks/useBrandingConfigFormData';

export const BackgroundColor = () => {
  const { control } = useFormContext<UpdateApiKeyBranding>();

  return (
    <InnerConfigurationCard>
      <Controller
        name="backgroundColor"
        control={control}
        rules={{
          maxLength: 7,
          pattern: {
            value: HEX_COLOR_REGEX,
            message: 'Must be a valid hex color value.',
          },
        }}
        render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
          <CpslInput
            label="Background Color"
            placeholder="#000000"
            onCpslInput={e => {
              onChange(e.detail.value);
            }}
            onCpslPaste={e => {
              onChange(e.detail.clipboardData?.getData('text'));
            }}
            onCpslBlur={onBlur}
            value={value ?? ''}
            errorText={error?.message}
            maxlength={7}
          />
        )}
      />
    </InnerConfigurationCard>
  );
};
