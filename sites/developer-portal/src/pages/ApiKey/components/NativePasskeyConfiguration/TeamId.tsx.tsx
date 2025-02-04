import { CpslInput } from '@getpara/react-components';
import { Controller, useFormContext } from 'react-hook-form';
import { UpdateNativePasskey } from '../../hooks/useNativePasskeyConfigFormData';

export const TeamId = () => {
  const { control } = useFormContext<UpdateNativePasskey>();

  return (
    <Controller
      name="teamId"
      control={control}
      rules={{
        maxLength: { value: 10, message: 'Team ID must be 10 characters.' },
        minLength: { value: 10, message: 'Team ID must be 10 characters.' },
      }}
      render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
        <CpslInput
          label="Team ID"
          placeholder="e.g. A1B2C34DE5"
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
