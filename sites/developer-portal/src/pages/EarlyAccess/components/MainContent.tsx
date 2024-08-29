import styled from 'styled-components';
import { useEarlyAccess } from '../../../hooks/configs/useEarlyAccess';
import { EarlyAccessItem } from './EarlyAccessItem';
import { usePlans } from '../../../hooks/configs/usePlans';
import { useState } from 'react';
import { RequestedAccessModal } from './RequestedAccessModal';
import { UpgradePlanModal } from '../../../components/UpgradePlanModal/UpgradePlanModal';
import { useGetOrganizationEarlyAccess, useGetOrganizationPlan } from '../../../hooks/api/queries/useOrganizations';
import { useRequestEarlyAccess } from '../../../hooks/api/mutations/useRequestEarlyAccess';
import { triggerToast } from '../../../utils/toasts';
import { CpslText } from '@usecapsule/react-components';

export const MainContent = () => {
  const { earlyAccessItems } = useEarlyAccess();
  const { isLowerPlan, plansBySlug } = usePlans();
  const { data: activePlan } = useGetOrganizationPlan();
  const { data: earlyAccess } = useGetOrganizationEarlyAccess();
  const { mutate: requestEarlyAccess } = useRequestEarlyAccess();

  const [requestedSlug, setRequestedSlug] = useState('');
  const [upgradePlanName, setUpgradePlanName] = useState('');
  const [upgradePlanSlug, setUpgradePlanSlug] = useState('');

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
            body: 'Please try again. If the problem persists, contact Capsule support.',
          });
        },
      },
    );
  };

  const handleCloseRequestedAccessModal = () => {
    setRequestedSlug('');
  };

  const handleUpgradeClick = (planSlug: string) => {
    setUpgradePlanName(plansBySlug[planSlug].name);
    setUpgradePlanSlug(planSlug);
  };

  const handleCloseUpgradeModal = () => {
    setUpgradePlanSlug('');
  };

  const handleUpgradeModalExited = () => {
    setUpgradePlanName('');
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
                isHigherPlanRequired={!activePlan ? true : isLowerPlan(item.planSlug, activePlan.slug)}
                hasAccess={earlyAccess?.granted?.includes(item.slug) ?? false}
                requestedAccess={earlyAccess?.requested?.includes(item.slug) ?? false}
                onRequestClick={handleRequestClick}
                onUpgradeClick={handleUpgradeClick}
              />
            );
          })}
        </Container>
      )}
      <RequestedAccessModal open={!!requestedSlug} onClose={handleCloseRequestedAccessModal} />
      <UpgradePlanModal
        open={!!upgradePlanSlug}
        planName={upgradePlanName}
        planSlug={upgradePlanSlug}
        onClose={handleCloseUpgradeModal}
        onExited={handleUpgradeModalExited}
      />
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
