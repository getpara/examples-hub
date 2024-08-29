import { CpslInput } from '@usecapsule/react-components';
import { InnerConfigurationCard } from '../InnerConfigurationCard';
import { Controller, useFormContext } from 'react-hook-form';
import { UpdateApiKeyEmail } from '../../hooks/useEmailConfigFormData';
import { GITHUB_URL_REGEX } from '../../../../utils/regex';

export const GithubUrl = () => {
  const { control } = useFormContext<UpdateApiKeyEmail>();

  return (
    <InnerConfigurationCard>
      <Controller
        name="githubUrl"
        control={control}
        rules={{
          pattern: {
            value: GITHUB_URL_REGEX,
            message: 'Must be a valid Github url.',
          },
        }}
        render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
          <CpslInput
            label="Github Profile Link"
            placeholder="https://www.github.com/your-profile"
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
