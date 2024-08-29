import { CpslInput } from '@usecapsule/react-components';
import { InnerConfigurationCard } from '../InnerConfigurationCard';
import { Controller, useFormContext } from 'react-hook-form';
import { UpdateApiKeyEmail } from '../../hooks/useEmailConfigFormData';
import { LINKEDIN_URL_REGEX } from '../../../../utils/regex';

export const LinkedinUrl = () => {
  const { control } = useFormContext<UpdateApiKeyEmail>();

  return (
    <InnerConfigurationCard>
      <Controller
        name="linkedinUrl"
        control={control}
        rules={{
          pattern: {
            value: LINKEDIN_URL_REGEX,
            message: 'Must be a valid LinkedIn url.',
          },
        }}
        render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
          <CpslInput
            label="LinkedIn Profile Link"
            placeholder="https://www.linkedin.com/company/your-profile"
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
    </InnerConfigurationCard>
  );
};
