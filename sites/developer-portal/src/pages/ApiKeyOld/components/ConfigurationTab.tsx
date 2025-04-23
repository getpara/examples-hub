import { OnRampFlowsConfiguration } from './OnRampFlowsConfiguration/OnRampFlowsConfiguration';
import { useParams } from 'react-router-dom';
import { useGetOrganizationKey } from '../../../hooks/api/queries/useOrganizationKeys';
import { Environment } from '../../../types/environment';
import { OnRampConfiguration } from './OnRampConfiguration';
import { PregenConfiguration } from './PregenConfiguration/PregenConfiguration';
import { NativePasskeyConfiguration } from './NativePasskeyConfiguration/NativePasskeyConfiguration';

export const ConfigurationTab = () => {
  const { apiKey, env, projectId } = useParams();
  const { data: apiKeyData } = useGetOrganizationKey(projectId ?? '', apiKey ?? '', env as Environment);

  return (
    <>
      <NativePasskeyConfiguration />
      <PregenConfiguration />
      <OnRampFlowsConfiguration />
      {(apiKeyData?.isBuyEnabled || apiKeyData?.isWithdrawEnabled) && <OnRampConfiguration />}
      {/* TODO: Add this back once BE is complete */}
      {/* <NativePasskeyConfiguration /> */}
    </>
  );
};
