import { useQuery } from '@tanstack/react-query';
import { ApiKeyMonthlyActiveUsersTSResponse } from '../../../types/api';
import { useAppStore } from '../../../stores/app/useAppStore';
import { sub } from 'date-fns';
import { TODAY } from '../../../utils/constants';
import { getApiKeyMonthlyActiveUsersTS } from '../../../api/apiKeys/queries';
import { formatTSData } from '../../../utils/analyticsDataFormatters';

export const API_KEY_MONTHLY_ACTIVE_USERS_TS_QUERY_KEY = 'apiKeyMonthlyActiveUsersTS';

const DEFAULT_START_DATE = sub(TODAY, { months: 11 });
const DEFAULT_END_DATE = TODAY;

export const useApiKeyMonthlyActiveUsersTSQuery = <T>(
  projectId: string,
  keyId: string,
  env: string,
  startDate: Date = DEFAULT_START_DATE,
  endDate: Date = DEFAULT_END_DATE,
  select: (data: ApiKeyMonthlyActiveUsersTSResponse) => T,
) => {
  const selectedOrganizationId = useAppStore(state => state.getSelectedOrganization());

  return useQuery({
    enabled: !!selectedOrganizationId && !!projectId && !!keyId,
    queryKey: [API_KEY_MONTHLY_ACTIVE_USERS_TS_QUERY_KEY, selectedOrganizationId, projectId, keyId, env, startDate, endDate],
    queryFn: async () => {
      const { data } = await getApiKeyMonthlyActiveUsersTS(
        selectedOrganizationId ?? '',
        projectId,
        keyId,
        env,
        startDate,
        endDate,
      );

      return { data: formatTSData(data.data) };
    },
    select,
  });
};

export const useApiKeyMonthlyActiveUsersTS = (
  projectId: string,
  keyId: string,
  env: string,
  startDate?: Date,
  endDate?: Date,
) => {
  return useApiKeyMonthlyActiveUsersTSQuery(projectId, keyId, env, startDate, endDate, data => {
    return data.data;
  });
};
