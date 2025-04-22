import { BrandingConfiguration } from './BrandingConfiguration/BrandingConfiguration';
import { EmailConfiguration } from './EmailConfiguration/EmailConfiguration';
import { OnRampFlowsConfiguration } from './OnRampFlowsConfiguration/OnRampFlowsConfiguration';
import { PortalConfiguration } from './PortalConfiguration/PortalConfiguration';
import { useParams } from 'react-router-dom';
import { useGetOrganizationKey } from '../../../hooks/api/queries/useOrganizationKeys';
import { Environment } from '../../../types/environment';
import { OnRampConfiguration } from './OnRampConfiguration';
import { PregenConfiguration } from './PregenConfiguration/PregenConfiguration';
import { NativePasskeyConfiguration } from './NativePasskeyConfiguration/NativePasskeyConfiguration';
import { SupportedWalletTypesConfiguration } from './SupportedWalletTypesConfiguration';
import { PopupConfiguration } from './PopupConfiguration/PopupConfiguration';
import { SupportedAuthMethodsConfiguration } from './SupportedAuthMethodsConfiguration/SupportedAuthMethodsConfiguration';
import { SessionLengthConfiguration } from './SessionLengthConfiguration/SessionLengthConfiguration';

export const ConfigurationTab = () => {
  const { apiKey, env, projectId } = useParams();
  const { data: apiKeyData } = useGetOrganizationKey(projectId ?? '', apiKey ?? '', env as Environment);

  return (
    <>
      <BrandingConfiguration />
      <EmailConfiguration />
      <NativePasskeyConfiguration />
      <PregenConfiguration />
      <PopupConfiguration />
      <SessionLengthConfiguration />
      <SupportedAuthMethodsConfiguration />
      <SupportedWalletTypesConfiguration />
      <OnRampFlowsConfiguration />
      {(apiKeyData?.isBuyEnabled || apiKeyData?.isWithdrawEnabled) && <OnRampConfiguration />}
      <PortalConfiguration />
      {/* TODO: Add this back once BE is complete */}
      {/* <NativePasskeyConfiguration /> */}
    </>
  );
};
