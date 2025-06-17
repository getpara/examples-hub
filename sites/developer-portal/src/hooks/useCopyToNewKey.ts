import { useNavigate, useParams } from 'react-router-dom';
import { Environment } from '../types/environment';
import { useCreateApiKey } from './api/mutations/useCreateApiKey';
import { useGetAvailableKeyEnv, useGetOrganizationKey } from './api/queries/useOrganizationKeys';
import { useGetSelectedOrganization, useGetSelectedOrganizationIsValid } from './api/queries/useOrganizations';
import { getApiKeyCopyValues } from '../utils/getApiKeyCopyValues';
import { toast } from '@getpara/react-component-library';
import { AxiosError } from 'axios';
import { formatEnvName } from '../utils/apiKey';
import { useGetOrganizationHasNativePasskeyAccess } from './api/queries/useOrganizationSubscription';

export const useCopyToNewKey = () => {
  const { projectId, apiKey, env } = useParams();
  const { data: availableKeyEnv } = useGetAvailableKeyEnv(projectId ?? '');
  const { data: orgValid } = useGetSelectedOrganizationIsValid();
  const { data: org } = useGetSelectedOrganization();
  const { data: hasNativePasskeyAccess } = useGetOrganizationHasNativePasskeyAccess();
  const { mutate: createApiKey, isPending: isCreatingKey } = useCreateApiKey();
  const { data: apiKeyData } = useGetOrganizationKey(projectId ?? '', apiKey ?? '', env as Environment);
  const navigate = useNavigate();

  const copyToNewKey = () => {
    if (org && orgValid && !!availableKeyEnv && projectId) {
      createApiKey(
        {
          projectId,
          env: availableKeyEnv,
          // Using default values here so we don't copy unsaved changes
          data: {
            ...(apiKeyData && getApiKeyCopyValues({ key: apiKeyData, nextEnv: availableKeyEnv, hasNativePasskeyAccess })),
            homepageUrl: apiKeyData?.homepageUrl ?? org?.homepageUrl ?? null,
          },
        },
        {
          onSuccess: data => {
            navigate(`/${org.id}/project/${projectId}/key/${data.key.environment as Environment}/${data.key.id}`);

            toast.success('Key Created!');
          },
          onError: err => {
            let body = 'Please try again. If the problem persists, contact Para support.';

            if ((err as AxiosError).response?.data === 'max keys created for the current project') {
              body = `You've reached the max number of ${formatEnvName(availableKeyEnv)} API keys allowed on this project. Archive another key or create another project to add more API keys.`;
            }

            toast.error('Failed to Create Key', {
              description: body,
            });
          },
        },
      );
    }
  };

  return { copyToNewKey, isCreatingKey };
};
