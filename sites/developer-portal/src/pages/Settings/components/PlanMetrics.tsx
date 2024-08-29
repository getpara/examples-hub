import styled from 'styled-components';
import { AnalyticsCard } from '../../../components/AnalyticsCard/AnalyticsCard';
import { truncateNumber } from '../../../utils/formatNumber';
import { useGetOrganizationPlan, useGetSelectedOrganization } from '../../../hooks/api/queries/useOrganizations';
import { useOrganizationUserMetrics } from '../../../hooks/api/queries/useOrganizationUserMetrics';
import { endOfDay, startOfMonth } from 'date-fns';

export const PlanMetrics = () => {
  const { data: activePlan } = useGetOrganizationPlan();
  const { data: organization } = useGetSelectedOrganization();
  const { data: userMetrics } = useOrganizationUserMetrics(startOfMonth(new Date()), endOfDay(new Date()));

  const usersString = `${userMetrics?.usersInTimeFrame ?? 0}/${
    activePlan?.maxAllowance ? truncateNumber(activePlan.maxAllowance) : '\u221E'
  }`;
  const totalUsersString = `${userMetrics?.totalUsers ?? 0}`;
  const activePlanName = activePlan?.name ?? '';
  const activePlanPrice = `Current Plan: $${organization?.planPrice ?? 0}/mo`;

  return (
    <>
      <Container>
        <AnalyticsCard title={usersString} subtitle="Users this month" />
        <AnalyticsCard title={totalUsersString} subtitle="Total Users" />
        <AnalyticsCard title={activePlanName} subtitle={activePlanPrice} />
      </Container>
    </>
  );
};

const Container = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
`;
