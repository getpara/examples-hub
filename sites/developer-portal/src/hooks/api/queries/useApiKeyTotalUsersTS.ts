import { useQuery } from '@tanstack/react-query';
import { ApiKeyTotalUsersTSResponse } from '../../../types/api';
import { useAppStore } from '../../../stores/app/useAppStore';
import { sub } from 'date-fns';
import { TODAY } from '../../../utils/constants';
import { getApiKeyTotalUsersTS } from '../../../api/apiKeys/queries';
import { formatTSData } from '../../../utils/analyticsDataFormatters';

export const API_KEY_TOTAL_USERS_TS_QUERY_KEY = 'apiKeyTotalUsersTS';

const DEFAULT_START_DATE = sub(TODAY, { months: 1 });
const DEFAULT_END_DATE = TODAY;

export const useApiKeyTotalUsersTSQuery = <T>(
  projectId: string,
  keyId: string,
  env: string,
  startDate: Date = DEFAULT_START_DATE,
  endDate: Date = DEFAULT_END_DATE,
  select: (data: ApiKeyTotalUsersTSResponse) => T,
) => {
  const selectedOrganizationId = useAppStore(state => state.getSelectedOrganization());

  return useQuery({
    enabled: !!selectedOrganizationId && !!projectId && !!keyId,
    queryKey: [API_KEY_TOTAL_USERS_TS_QUERY_KEY, selectedOrganizationId, projectId, keyId, env, startDate, endDate],
    queryFn: async () => {
      const { data } = await getApiKeyTotalUsersTS(selectedOrganizationId ?? '', projectId, keyId, env, startDate, endDate);

      return { data: formatTSData(data.data) };
    },
    select,
  });
};

export const useApiKeyTotalUsersTS = (projectId: string, keyId: string, env: string, startDate?: Date, endDate?: Date) => {
  return useApiKeyTotalUsersTSQuery(projectId, keyId, env, startDate, endDate, data => {
    return data.data;
  });
};
