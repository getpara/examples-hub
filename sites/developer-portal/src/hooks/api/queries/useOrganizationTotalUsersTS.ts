import { useQuery } from '@tanstack/react-query';
import { OrganizationTotalUsersTSResponse } from '../../../types/api';
import { useAppStore } from '../../../stores/app/useAppStore';
import { getOrganizationTotalUsersTS } from '../../../api/organizations/queries';
import { sub } from 'date-fns';
import { TODAY } from '../../../utils/constants';
import { formatTSData } from '../../../utils/analyticsDataFormatters';

export const ORGANIZATIONS_TOTAL_USERS_TS_QUERY_KEY = 'organizationTotalUsersTS';

const DEFAULT_START_DATE = sub(TODAY, { months: 1 });
const DEFAULT_END_DATE = TODAY;

export const useOrganizationTotalUsersTSQuery = <T>(
  startDate: Date = DEFAULT_START_DATE,
  endDate: Date = DEFAULT_END_DATE,
  select: (data: OrganizationTotalUsersTSResponse) => T,
) => {
  const selectedOrganizationId = useAppStore(state => state.getSelectedOrganization());

  return useQuery({
    enabled: !!selectedOrganizationId,
    queryKey: [ORGANIZATIONS_TOTAL_USERS_TS_QUERY_KEY, selectedOrganizationId, startDate, endDate],
    queryFn: async () => {
      const { data } = await getOrganizationTotalUsersTS(selectedOrganizationId ?? '', startDate, endDate);

      return { data: formatTSData(data.data) };
    },
    select,
  });
};

export const useOrganizationTotalUsersTS = (startDate?: Date, endDate?: Date) => {
  return useOrganizationTotalUsersTSQuery(startDate, endDate, data => {
    return data.data;
  });
};
