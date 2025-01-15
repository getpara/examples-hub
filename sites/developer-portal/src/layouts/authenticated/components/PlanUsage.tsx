import { CpslButton, CpslCard, CpslText } from '@usecapsule/react-components';
import { useGetOrganizationSubscription } from '../../../hooks/api/queries/useOrganizationSubscription';
import styled from 'styled-components';
import { usePlanMetadata } from '../../../hooks/configs/usePlanMetadata';
import { useNavigate, useParams } from 'react-router-dom';
import { useOrganizationUserMetrics } from '../../../hooks/api/queries/useOrganizationUserMetrics';
import { truncateNumber } from '../../../utils/formatNumber';
import { GradientProgressBar } from '../../../components/GradientProgressBar/GradientProgressBar';
import { ENTERPRISE_PLAN_SLUG, FREE_PLAN_SLUG } from '../../../utils/constants';
import { useOrganizationTotalUserCount } from '../../../hooks/api/queries/useOrganizationTotalUserCount';

export const PlanUsage = () => {
  const { organizationId } = useParams();
  const navigate = useNavigate();
  const { planMetaBySlug } = usePlanMetadata();
  const { data: subscription } = useGetOrganizationSubscription();
  const { data: userMetrics } = useOrganizationUserMetrics(
    subscription?.billingPeriodStart ? new Date(subscription?.billingPeriodStart * 1000) : undefined,
    subscription?.billingPeriodEnd ? new Date(subscription?.billingPeriodEnd * 1000) : undefined,
  );
  const { data: totalUsers } = useOrganizationTotalUserCount();

  const activePlan = subscription?.plan;
  const isEnterprise = activePlan?.slug.toUpperCase() === ENTERPRISE_PLAN_SLUG;
  const isFree = activePlan?.slug.toUpperCase() === FREE_PLAN_SLUG;
  const currentMonthlyUsers = (isFree ? totalUsers?.lowerEnvCount : userMetrics?.usersInTimeFrame) ?? 0;
  const maxUsers = (isFree ? activePlan?.maxBetaUsers : activePlan?.maxProdMAUs) ?? 0;
  const planMetadata = planMetaBySlug[activePlan?.slug ?? ''];
  const usageString = `${currentMonthlyUsers.toLocaleString()}/${truncateNumber(maxUsers)}`;

  const handleUpgradeClick = () => {
    navigate(`/${organizationId}/billing`);
  };

  return (
    <Container>
      <InnerContainer>
        <CpslText variant="bodyL" weight="semiBold">
          {planMetadata.name} Tier
        </CpslText>
        <UsageTextContainer>
          <CpslText>Usage</CpslText>
          <CpslText variant="body2XS" color="secondary">
            {usageString}
          </CpslText>
        </UsageTextContainer>
        <GradientProgressBar current={currentMonthlyUsers} max={maxUsers} />
        {!isEnterprise && (
          <StyledButton fullWidth onClick={handleUpgradeClick}>
            Upgrade Plan
          </StyledButton>
        )}
      </InnerContainer>
    </Container>
  );
};

const Container = styled(CpslCard)`
  padding-top: 16px;
  --card-padding-top: 16px;
  --card-padding-bottom: 16px;
  --card-padding-start: 13px;
  --card-padding-end: 13px;
  --card-border-width: 0px;
  --card-background-color: var(--cpsl-color-background-4);
`;

const InnerContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 13px;
`;

const StyledButton = styled(CpslButton)`
  --button-font-size: 12px;
  --button-padding-top: 8px;
  --button-padding-bottom: 8px;
  --button-padding-start: 16px;
  --button-padding-end: 16px;
  --button-border-radius: 8px;
`;

const UsageTextContainer = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;
