import styled from 'styled-components';
import { useEarlyAccess } from '../../../hooks/configs/useEarlyAccess';
import { EarlyAccessItem } from './EarlyAccessItem';
import { usePlanMetadata } from '../../../hooks/configs/usePlanMetadata';
import { useState } from 'react';
import { RequestedAccessModal } from './RequestedAccessModal';
import { RequestEnterpriseModal } from '../../../components/RequestEnterpriseModal/RequestEnterpriseModal';
import { useGetOrganizationEarlyAccess, useGetSelectedOrganization } from '../../../hooks/api/queries/useOrganizations';
import { useRequestEarlyAccess } from '../../../hooks/api/mutations/useRequestEarlyAccess';
import { triggerToast } from '../../../utils/toasts';
import { CpslText } from '@getpara/react-components';
import { useStripePlan } from '../../../hooks/useStripePlan';
import { useGetOrganizationSubscription } from '../../../hooks/api/queries/useOrganizationSubscription';

export const MainContent = () => {
  const { earlyAccessItems } = useEarlyAccess();
  const { isLowerPlan } = usePlanMetadata();
  const { data: subscription } = useGetOrganizationSubscription();
  const { data: earlyAccess } = useGetOrganizationEarlyAccess();
  const { mutate: requestEarlyAccess } = useRequestEarlyAccess();
  const { data: org } = useGetSelectedOrganization();
  const { changePlan, isCreatingStripeSession } = useStripePlan();

  const [requestedSlug, setRequestedSlug] = useState('');
  const [isRequestingEnterprise, setIsRequestingEnterprise] = useState(false);

  const handleRequestClick = (slug: string) => {
    requestEarlyAccess(
      { slug },
      {
        onSuccess: () => {
          setRequestedSlug(slug);
        },
        onError: () => {
          triggerToast({
            variant: 'error',
            title: 'Error Requesting Early Access',
            body: 'Please try again. If the problem persists, contact Para support.',
          });
        },
      },
    );
  };

  const handleCloseRequestedAccessModal = () => {
    setRequestedSlug('');
  };

  const handleUpgradeClick = async (planSlug: string) => {
    if (planSlug.toUpperCase() === 'ENTERPRISE' && !org?.enterpriseStripePriceId) {
      setIsRequestingEnterprise(true);
      return;
    }
    await changePlan(planSlug);
  };

  const handleCloseUpgradeModal = () => {
    setIsRequestingEnterprise(false);
  };

  return (
    <>
      {!earlyAccessItems?.length ? (
        <ZeroContainer>
          <CpslText variant="headingXS" weight="semiBold">
            No Early Access Items Yet!
          </CpslText>
        </ZeroContainer>
      ) : (
        <Container>
          {earlyAccessItems.map(item => {
            return (
              <EarlyAccessItem
                key={item.slug}
                {...item}
                isHigherPlanRequired={!subscription ? true : isLowerPlan(item.planSlug, subscription.plan.slug)}
                hasAccess={earlyAccess?.granted?.includes(item.slug) ?? false}
                requestedAccess={earlyAccess?.requested?.includes(item.slug) ?? false}
                onRequestClick={handleRequestClick}
                onUpgradeClick={handleUpgradeClick}
                disabled={isCreatingStripeSession}
              />
            );
          })}
        </Container>
      )}
      <RequestedAccessModal open={!!requestedSlug} onClose={handleCloseRequestedAccessModal} />
      <RequestEnterpriseModal open={isRequestingEnterprise} onClose={handleCloseUpgradeModal} />
    </>
  );
};

const Container = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const ZeroContainer = styled.div`
  display: flex;
  justify-content: center;
`;
