import { CpslInput } from '@getpara/react-components';
import { Controller, useFormContext } from 'react-hook-form';
import { UpdateNativePasskey } from '../../hooks/useNativePasskeyConfigFormData';
import { APPLE_BUNDLE_IDENTIFIER_REGEX } from '../../../../utils/regex';

export const BundleIdentifier = () => {
  const { control } = useFormContext<UpdateNativePasskey>();

  return (
    <Controller
      name="bundleIdentifier"
      control={control}
      rules={{
        pattern: {
          value: APPLE_BUNDLE_IDENTIFIER_REGEX,
          message: 'Must be a valid Apple bundle identifier.',
        },
      }}
      render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
        <CpslInput
          label="Bundle Identifier"
          placeholder="e.g. com.yourdomain.yourapp"
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
  );
};
