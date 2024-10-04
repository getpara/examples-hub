import { CpslInput } from '@usecapsule/react-components';
import { InnerConfigurationCard } from '../InnerConfigurationCard';
import { Controller, useFormContext } from 'react-hook-form';
import { HEX_COLOR_REGEX } from '../../../../utils/regex';
import { UpdateApiKeyBranding } from '../../hooks/useBrandingConfigFormData';
import { ColorPickerPopover } from '../../../../components/ColorPickerPopover/ColorPickerPopover';

export const AccentColor = () => {
  const { control } = useFormContext<UpdateApiKeyBranding>();

  return (
    <InnerConfigurationCard>
      <Controller
        name="accentColor"
        control={control}
        rules={{
          maxLength: {
            value: 9,
            message: 'Must be a valid hex color value.',
          },
          minLength: {
            value: 4,
            message: 'Must be a valid hex color value.',
          },
          pattern: {
            value: HEX_COLOR_REGEX,
            message: 'Must be a valid hex color value.',
          },
        }}
        render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
          <CpslInput
            label="Accent Color"
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
            maxlength={9}
            minlength={4}
          >
            <ColorPickerPopover id="accentColor" color={value ?? undefined} onChange={onChange} />
          </CpslInput>
        )}
      />
    </InnerConfigurationCard>
  );
};
