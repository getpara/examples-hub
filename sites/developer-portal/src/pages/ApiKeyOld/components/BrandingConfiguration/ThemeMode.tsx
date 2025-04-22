import { CpslSelect, CpslSelectItem } from '@getpara/react-components';
import { InnerConfigurationCard } from '../InnerConfigurationCard';
import { Controller, useFormContext } from 'react-hook-form';
import { UpdateApiKeyBranding } from '../../hooks/useBrandingConfigFormData';
import { ThemeMode as ThemeModeEnum } from '../../../../types/api';

const THEME_MODE_LABELS: Record<ThemeModeEnum, string> = {
  [ThemeModeEnum.LIGHT]: 'Light',
  [ThemeModeEnum.DARK]: 'Dark',
};

export const ThemeMode = () => {
  const { control } = useFormContext<UpdateApiKeyBranding>();

  return (
    <InnerConfigurationCard>
      <Controller
        name="themeMode"
        control={control}
        render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
          <CpslSelect
            label="Theme Mode"
            selectedValue={value ?? ''}
            onCpslSelectValueChange={e => {
              onChange(e.detail);
            }}
            onCpslBlur={onBlur}
            errorText={error?.message}
            placeholder="Choose mode"
            formatValue={value => THEME_MODE_LABELS[value as ThemeModeEnum]}
          >
            {Object.values(ThemeModeEnum).map(mode => (
              <CpslSelectItem key={mode} slot="items" value={mode}>
                {THEME_MODE_LABELS[mode]}
              </CpslSelectItem>
            ))}
          </CpslSelect>
        )}
      />
    </InnerConfigurationCard>
  );
};
