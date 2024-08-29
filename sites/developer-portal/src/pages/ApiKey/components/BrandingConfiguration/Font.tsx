import { CpslSelect, CpslSelectItem, CpslText } from '@usecapsule/react-components';
import { InnerConfigurationCard } from '../InnerConfigurationCard';
import { Controller, useFormContext } from 'react-hook-form';
import { styled } from 'styled-components';
import { EMAIL_FONTS } from '../../../../utils/constants';
import { UpdateApiKeyBranding } from '../../hooks/useBrandingConfigFormData';

export const Font = () => {
  const { control } = useFormContext<UpdateApiKeyBranding>();

  return (
    <InnerConfigurationCard>
      <Controller
        name="font"
        control={control}
        render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
          <CpslSelect
            label="Font"
            selectedValue={value ?? ''}
            onCpslSelectValueChange={e => {
              onChange(e.detail);
            }}
            onCpslBlur={onBlur}
            showFormattedSelectedItem
            errorText={error?.message}
            placeholder="Choose font"
          >
            {value && (
              <FontSelected $fontFamily={value} slot="selected-item">
                {value}
              </FontSelected>
            )}
            {EMAIL_FONTS.map(font => (
              <FontItem key={font} slot="items" value={font} $fontFamily={font}>
                {font}
              </FontItem>
            ))}
          </CpslSelect>
        )}
      />
    </InnerConfigurationCard>
  );
};

const FontItem = styled(CpslSelectItem)<{ $fontFamily: string }>`
  font-family: ${({ $fontFamily }) => $fontFamily};
`;

const FontSelected = styled(CpslText)<{ $fontFamily: string }>`
  font-family: ${({ $fontFamily }) => $fontFamily};
`;
