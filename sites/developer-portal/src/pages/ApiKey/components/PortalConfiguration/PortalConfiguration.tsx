import { DOCS_LINK } from '../../../../utils/constants';
import { ConfigurationCard } from '../ConfigurationCard';
import { FormProvider } from 'react-hook-form';
import { PortalUrl } from './PortalUrl';
import { VerifyUrl } from './VerifyUrl';
import { usePortalConfigFormData } from '../../hooks/usePortalConfigFormData';
import { Save } from '../Save';

export const PortalConfiguration = () => {
  const form = usePortalConfigFormData();

  return (
    <ConfigurationCard
      title="Capsule Portal Settings"
      subtitle="To learn more about Capsule Portal, please visit the docs."
      // TODO: customize the docs link
      docsLink={DOCS_LINK}
    >
      <FormProvider {...form}>
        <PortalUrl />
        <VerifyUrl />
        <Save />
      </FormProvider>
    </ConfigurationCard>
  );
};
