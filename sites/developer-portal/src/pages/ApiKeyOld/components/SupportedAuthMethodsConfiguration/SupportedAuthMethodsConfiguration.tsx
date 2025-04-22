import { PREGEN_DOCS_LINK } from '../../../../utils/constants';
import { ConfigurationCard } from '../ConfigurationCard';
import { useSupportedAuthMethodsConfigFormData } from '../../hooks/useSupportedAuthMethodsConfigFormData';
import { FormProvider } from 'react-hook-form';
import { SupportedAuthMethods } from './SupportedAuthMethods';
import { ConfigurationActions } from '../ConfigurationActions';

const TITLE = 'Supported Auth Methods';
const SUBTITLE = 'Control which auth methods you would like your users to be able to user when creating an account.';

export const SupportedAuthMethodsConfiguration = () => {
  const form = useSupportedAuthMethodsConfigFormData();

  return (
    <ConfigurationCard
      title={TITLE}
      subtitle={SUBTITLE}
      docsLink={PREGEN_DOCS_LINK}
      disableCollapse
      buttonVariant="learnMore"
    >
      <FormProvider {...form}>
        <SupportedAuthMethods />
        <ConfigurationActions />
      </FormProvider>
    </ConfigurationCard>
  );
};
