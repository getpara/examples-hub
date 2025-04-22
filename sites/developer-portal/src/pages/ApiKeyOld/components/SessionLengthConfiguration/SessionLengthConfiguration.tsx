import { DOCS_LINK } from '../../../../utils/constants';
import { ConfigurationCard } from '../ConfigurationCard';
import { FormProvider } from 'react-hook-form';
import { useSessionLengthConfigFormData } from '../../hooks/useSessionLengthConfigFormData';
import { ConfigurationActions } from '../ConfigurationActions';
import { SessionLength } from './SessionLength';

export const SessionLengthConfiguration = () => {
  const form = useSessionLengthConfigFormData();

  return (
    <ConfigurationCard
      title="Session Length"
      subtitle="Control how long a user's session lasts"
      // TODO: customize the docs link
      docsLink={DOCS_LINK}
    >
      <FormProvider {...form}>
        <SessionLength />
        <ConfigurationActions />
      </FormProvider>
    </ConfigurationCard>
  );
};
