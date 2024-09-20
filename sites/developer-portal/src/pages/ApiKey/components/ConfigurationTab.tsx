import { BrandingConfiguration } from './BrandingConfiguration/BrandingConfiguration';
import { EmailConfiguration } from './EmailConfiguration/EmailConfiguration';
import { NativePasskeyConfiguration } from './NativePasskeyConfiguration';
import { OnRampFlowsConfiguration } from './OnRampFlowsConfiguration/OnRampFlowsConfiguration';
import { OnRampAssetsConfiguration } from './OnRampAssetsConfiguration/OnRampAssetsConfiguration';
import { OnRampProvidersConfiguration } from './OnRampProvidersConfiguration/OnRampProvidersConfiguration';
import { PortalConfiguration } from './PortalConfiguration/PortalConfiguration';
import { useParams } from 'react-router-dom';
import { useGetOrganizationKey } from '../../../hooks/api/queries/useOrganizationKeys';
import { Environment } from '../../../types/environment';

export const ConfigurationTab = () => {
  const { apiKey, env, projectId } = useParams();
  const { data: apiKeyData } = useGetOrganizationKey(projectId ?? '', apiKey ?? '', env as Environment);

  return (
    <>
      <BrandingConfiguration />
      <EmailConfiguration />
      <OnRampFlowsConfiguration />
      {(apiKeyData?.isBuyEnabled || apiKeyData?.isWithdrawEnabled) && (
        <>
          <OnRampProvidersConfiguration />
          <OnRampAssetsConfiguration />
        </>
      )}
      <PortalConfiguration />
      <NativePasskeyConfiguration />
    </>
  );
};
