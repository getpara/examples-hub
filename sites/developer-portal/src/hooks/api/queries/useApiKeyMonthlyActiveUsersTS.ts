import { useQuery } from '@tanstack/react-query';
import { ApiKeyMonthlyActiveUsersTSResponse } from '../../../types/api';
import { sub } from 'date-fns';
import { TODAY } from '../../../utils/constants';
import { getApiKeyMonthlyActiveUsersTS } from '../../../api/apiKeys/queries';
import { formatTSData } from '../../../utils/analyticsDataFormatters';
import { useParams } from 'react-router-dom';
import { useIsValidKey, useIsValidOrg, useIsValidProject } from '../../useIsValidOrgConfig';

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
  const { organizationId } = useParams();
  const isOrgValid = useIsValidOrg(organizationId);
  const isProjectValid = useIsValidProject(projectId);
  const isKeyValid = useIsValidKey(projectId, keyId);

  return useQuery({
    enabled: isOrgValid && isProjectValid && isKeyValid,
    queryKey: [API_KEY_MONTHLY_ACTIVE_USERS_TS_QUERY_KEY, organizationId, projectId, keyId, env, startDate, endDate],
    queryFn: async () => {
      const { data } = await getApiKeyMonthlyActiveUsersTS(organizationId ?? '', projectId, keyId, env, startDate, endDate);

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
