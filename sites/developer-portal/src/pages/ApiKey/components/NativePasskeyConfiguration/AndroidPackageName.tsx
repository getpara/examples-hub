import { CpslInput } from '@usecapsule/react-components';
import { Controller, useFormContext } from 'react-hook-form';
import { UpdateNativePasskey } from '../../hooks/useNativePasskeyConfigFormData';
import { ANDROID_PACKAGE_NAME_REGEX } from '../../../../utils/regex';

export const AndroidPackageName = () => {
  const { control } = useFormContext<UpdateNativePasskey>();

  return (
    <Controller
      name="androidPackageName"
      control={control}
      rules={{
        pattern: {
          value: ANDROID_PACKAGE_NAME_REGEX,
          message: 'Must be a valid Android package name.',
        },
      }}
      render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
        <CpslInput
          label="Package Name"
          placeholder="Enter package name"
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
