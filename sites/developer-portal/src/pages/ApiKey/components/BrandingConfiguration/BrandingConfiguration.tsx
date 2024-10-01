import { BRANDING_DOCS_LINK } from '../../../../utils/constants';
import { ConfigurationCard } from '../ConfigurationCard';
import { HomepageUrl } from './HomepageUrl';
import { ForegroundColor } from './ForegroundColor';
import { BackgroundColor } from './BackgroundColor';
import { Font } from './Font';
import { FormProvider } from 'react-hook-form';
import { useBrandingConfigFormData } from '../../hooks/useBrandingConfigFormData';
import { Icon, Logo } from './AssetUpload';
import { ConfigurationActions } from '../ConfigurationActions';

export const BrandingConfiguration = () => {
  const form = useBrandingConfigFormData();

  return (
    <ConfigurationCard
      title="Branding"
      subtitle="These settings will be applied to Capsule Portal and Emails only. Customizing your Capsule Modal is done with the Capsule SDK."
      docsLink={BRANDING_DOCS_LINK}
      defaultOpen={!form.getValues('homepageUrl')}
    >
      <FormProvider {...form}>
        <HomepageUrl />
        <ForegroundColor />
        <BackgroundColor />
        <Font />
        <Icon />
        <Logo />
        <ConfigurationActions />
      </FormProvider>
    </ConfigurationCard>
  );
};
