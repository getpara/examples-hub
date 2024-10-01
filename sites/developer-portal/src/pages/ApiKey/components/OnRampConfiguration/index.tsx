import { FormProvider } from 'react-hook-form';
import { DOCS_LINK } from '../../../../utils/constants.js';
import { useOnRampConfigFormData } from '../../hooks/useOnRampConfigFormData.js';
import { ConfigurationCard } from '../ConfigurationCard.js';
import { Save } from '../Save.js';
import { OnRampProvidersConfiguration } from './OnRampProvidersConfiguration.js';
import { OnRampAssetsConfiguration } from './OnRampAssetsConfiguration/index.js';
import { OnRampDefaultsConfiguration } from './OnRampDefaultsConfiguration.js';

export const OnRampConfiguration = () => {
  const form = useOnRampConfigFormData();
  return (
    <ConfigurationCard
      title="On-Ramps"
      subtitle="Configure your Capsule Modal's on-ramp providers and available assets for purchase or withdrawal."
      docsLink={DOCS_LINK}
    >
      <FormProvider {...form}>
        <OnRampProvidersConfiguration />
        <OnRampAssetsConfiguration />
        <OnRampDefaultsConfiguration />
        <Save />
      </FormProvider>
    </ConfigurationCard>
  );
};
