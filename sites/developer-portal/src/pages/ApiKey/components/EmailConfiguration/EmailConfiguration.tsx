import { DOCS_LINK } from '../../../../utils/constants';
import { ConfigurationCard } from '../ConfigurationCard';
import { FormProvider } from 'react-hook-form';
import { useEmailConfigFormData } from '../../hooks/useEmailConfigFormData';
import { EmailOption } from './EmailOption';
import { TwitterUrl } from './TwitterUrl';
import { LinkedinUrl } from './LinkedinUrl';
import { ConfigurationActions } from '../ConfigurationActions';
import { GithubUrl } from './GithubUrl';

export const EmailConfiguration = () => {
  const form = useEmailConfigFormData();

  return (
    <ConfigurationCard
      title="Email Settings"
      subtitle="These emails are sent to users during onboarding and identity verification."
      // TODO: customize the docs link
      docsLink={DOCS_LINK}
    >
      <FormProvider {...form}>
        <EmailOption />
        <TwitterUrl />
        <LinkedinUrl />
        <GithubUrl />
        <ConfigurationActions />
      </FormProvider>
    </ConfigurationCard>
  );
};
