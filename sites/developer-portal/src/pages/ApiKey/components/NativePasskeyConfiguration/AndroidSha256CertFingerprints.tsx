import { CpslInput } from '@getpara/react-components';
import { Controller, useFormContext } from 'react-hook-form';
import { UpdateNativePasskey } from '../../hooks/useNativePasskeyConfigFormData';
import { SHA256_FINGERPRINT_REGEX } from '../../../../utils/regex';

export const AndroidSha256CertFingerprints = () => {
  const { control } = useFormContext<UpdateNativePasskey>();

  return (
    <Controller
      name="androidSha256CertFingerprints"
      control={control}
      rules={{
        validate: value =>
          !value ||
          value
            ?.split(',')
            .map(v => v.trim())
            .every(v => SHA256_FINGERPRINT_REGEX.test(v)) ||
          'Must contain only valid SHA-256 fingerprints.',
      }}
      render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
        <CpslInput
          label="SHA-256 Cert Fingerprints"
          placeholder="Paste fingerprints here"
          onCpslInput={e => {
            onChange(e.detail.value);
          }}
          onCpslPaste={e => {
            onChange(e.detail.clipboardData?.getData('text'));
          }}
          onCpslBlur={onBlur}
          value={value ?? ''}
          errorText={error?.message}
          helperText="Separate each fingerprint by a comma."
          as="textarea"
        />
      )}
    />
  );
};
