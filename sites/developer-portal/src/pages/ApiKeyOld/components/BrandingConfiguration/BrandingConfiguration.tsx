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
import { AccentColor } from './AccentColor';
import { ThemeMode } from './ThemeMode';

export const BrandingConfiguration = () => {
  const form = useBrandingConfigFormData();

  return (
    <ConfigurationCard
      title="Branding"
      subtitle="These settings will be applied to Para Portal and Emails only. Customizing your Para Modal is done with the Para SDK."
      docsLink={BRANDING_DOCS_LINK}
      defaultOpen={!form.getValues('homepageUrl')}
    >
      <FormProvider {...form}>
        <HomepageUrl />
        <ForegroundColor />
        <BackgroundColor />
        <AccentColor />
        <ThemeMode />
        <Font />
        <Icon />
        <Logo />
        <ConfigurationActions />
      </FormProvider>
    </ConfigurationCard>
  );
};
