import { CpslInput } from '@getpara/react-components';
import { InnerConfigurationCard } from '../InnerConfigurationCard';
import { Controller, useFormContext } from 'react-hook-form';
import { HEX_COLOR_REGEX } from '../../../../utils/regex';
import { UpdateApiKeyBranding } from '../../hooks/useBrandingConfigFormData';
import { ColorPickerPopover } from '../../../../components/ColorPickerPopover/ColorPickerPopover';
import { readableColorIsBlack } from 'color2k';
import { ThemeMode } from '../../../../types/api';

export const BackgroundColor = () => {
  const { control, setValue } = useFormContext<UpdateApiKeyBranding>();

  return (
    <InnerConfigurationCard>
      <Controller
        name="backgroundColor"
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
            label="Background Color"
            placeholder="#000000"
            onCpslInput={e => {
              onChange(e.detail.value);
            }}
            onCpslPaste={e => {
              onChange(e.detail.clipboardData?.getData('text'));
            }}
            onCpslBlur={() => {
              if (!error) {
                let isLightMode = false;
                try {
                  if (readableColorIsBlack(value ?? '')) {
                    isLightMode = true;
                  }
                } catch (_) {}
                setValue('themeMode', isLightMode ? ThemeMode.LIGHT : ThemeMode.DARK);
              }
              onBlur();
            }}
            value={value ?? ''}
            errorText={error?.message}
            maxlength={9}
            minlength={4}
          >
            <ColorPickerPopover
              id="backgroundColor"
              color={value ?? undefined}
              onChange={color => {
                if (!error) {
                  let isLightMode = false;
                  try {
                    if (readableColorIsBlack(color)) {
                      isLightMode = true;
                    }
                  } catch (_) {}
                  setValue('themeMode', isLightMode ? ThemeMode.LIGHT : ThemeMode.DARK);
                }
                onChange(color);
              }}
            />
          </CpslInput>
        )}
      />
    </InnerConfigurationCard>
  );
};
