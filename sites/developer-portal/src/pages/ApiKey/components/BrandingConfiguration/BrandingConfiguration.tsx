import { DOCS_LINK } from '../../../../utils/constants';
import { ConfigurationCard } from '../ConfigurationCard';
import { HomepageUrl } from './HomepageUrl';
import { ForegroundColor } from './ForegroundColor';
import { BackgroundColor } from './BackgroundColor';
import { Font } from './Font';
import { FormProvider } from 'react-hook-form';
import { useBrandingConfigFormData } from '../../hooks/useBrandingConfigFormData';
import { Save } from '../Save';
import { Icon, Logo } from './AssetUpload';

export const BrandingConfiguration = () => {
  const form = useBrandingConfigFormData();

  return (
    <ConfigurationCard
      title="Branding"
      subtitle="These settings will be applied to Capsule Portal and Emails only. Customizing your Capsule Modal is done with the Capsule SDK."
      // TODO: customize the docs link
      docsLink={DOCS_LINK}
    >
      <FormProvider {...form}>
        <HomepageUrl />
        <ForegroundColor />
        <BackgroundColor />
        <Font />
        <Icon />
        <Logo />
        <Save />
      </FormProvider>
    </ConfigurationCard>
  );
};
