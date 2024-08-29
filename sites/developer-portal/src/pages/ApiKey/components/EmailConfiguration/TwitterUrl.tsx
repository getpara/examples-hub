import { CpslInput } from '@usecapsule/react-components';
import { InnerConfigurationCard } from '../InnerConfigurationCard';
import { Controller, useFormContext } from 'react-hook-form';
import { UpdateApiKeyEmail } from '../../hooks/useEmailConfigFormData';
import { TWITTER_URL_REGEX } from '../../../../utils/regex';

export const TwitterUrl = () => {
  const { control } = useFormContext<UpdateApiKeyEmail>();

  return (
    <InnerConfigurationCard>
      <Controller
        name="twitterUrl"
        control={control}
        rules={{
          pattern: {
            value: TWITTER_URL_REGEX,
            message: 'Must be a valid Twitter/X url.',
          },
        }}
        render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
          <CpslInput
            label="Twitter/X Profile Link"
            placeholder="https://www.twitter.com/your-profile"
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
