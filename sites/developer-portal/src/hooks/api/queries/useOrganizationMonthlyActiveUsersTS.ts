import { useQuery } from '@tanstack/react-query';
import { OrganizationMonthlyActiveUsersTSResponse } from '../../../types/api';
import { getOrganizationMonthlyActiveUsersTS } from '../../../api/organizations/queries';
import { sub } from 'date-fns';
import { TODAY } from '../../../utils/constants';
import { formatDateInUTC } from '../../../utils/formatDate';
import { formatTSData } from '../../../utils/analyticsDataFormatters';
import { useParams } from 'react-router-dom';

export const ORGANIZATIONS_MONTHLY_ACTIVE_USERS_TS_QUERY_KEY = 'organizationMonthlyActiveUsersTS';

const DEFAULT_START_DATE = sub(TODAY, { months: 11 });
const DEFAULT_END_DATE = TODAY;

export const useOrganizationMonthlyActiveUsersTSQuery = <T>(
  startDate: Date = DEFAULT_START_DATE,
  endDate: Date = DEFAULT_END_DATE,
  select: (data: OrganizationMonthlyActiveUsersTSResponse) => T,
) => {
  const { organizationId } = useParams();

  return useQuery({
    enabled: !!organizationId,
    queryKey: [ORGANIZATIONS_MONTHLY_ACTIVE_USERS_TS_QUERY_KEY, organizationId, startDate, endDate],
    queryFn: async () => {
      const { data } = await getOrganizationMonthlyActiveUsersTS(organizationId ?? '', startDate, endDate);

      data.data = data.data.map(d => ({
        ...d,
        date: formatDateInUTC(new Date(d.date)).valueOf(),
      }));

      return { data: formatTSData(data.data) };
    },
    select,
  });
};

export const useOrganizationMonthlyActiveUsersTS = (startDate?: Date, endDate?: Date) => {
  return useOrganizationMonthlyActiveUsersTSQuery(startDate, endDate, data => {
    return data.data;
  });
};
