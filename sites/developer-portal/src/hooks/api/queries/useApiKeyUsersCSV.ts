import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { useIsValidKey, useIsValidOrg, useIsValidProject } from '../../useIsValidOrgConfig';
import { getUsersCSV } from '../../../api/apiKeys/queries';
import { AxiosError } from 'axios';

export const API_KEY_USERS_CSV_QUERY_KEY = 'apiKeyUsersCSV';

export const useApiKeyUsersCSV = (projectId: string, keyId: string, env: string) => {
  const { organizationId } = useParams();
  const isOrgValid = useIsValidOrg(organizationId);
  const isProjectValid = useIsValidProject(projectId);
  const isKeyValid = useIsValidKey(projectId, keyId);

  return useQuery({
    enabled: false,
    queryKey: [API_KEY_USERS_CSV_QUERY_KEY, organizationId, projectId, keyId, env, isOrgValid, isProjectValid, isKeyValid],
    queryFn: async () => {
      if (!isOrgValid || !isProjectValid || !isKeyValid) {
        return undefined;
      }

      const { data, headers } = await getUsersCSV(organizationId!, projectId, keyId, env);

      // Extract filename from Content-Disposition
      const contentDisposition = headers['content-disposition'];
      let filename = 'download.csv'; // fallback
      if (contentDisposition) {
        const match = contentDisposition.match(/filename=([^;]+)/);
        if (match && match[1]) {
          filename = match[1];
        }
      }

      return { data, filename };
    },
    retry: (_, err) => {
      return (err as AxiosError).status !== 429;
    },
    staleTime: 0,
  });
};
