import { BrandingConfiguration } from './BrandingConfiguration/BrandingConfiguration';
import { EmailConfiguration } from './EmailConfiguration/EmailConfiguration';
import { NativePasskeyConfiguration } from './NativePasskeyConfiguration';
import { PortalConfiguration } from './PortalConfiguration/PortalConfiguration';

export const ConfigurationTab = () => {
  return (
    <>
      <BrandingConfiguration />
      <EmailConfiguration />
      <PortalConfiguration />
      <NativePasskeyConfiguration />
    </>
  );
};
