import styled from 'styled-components';
import { InlineText } from '../../../../components/common';
import { PREGEN_DOCS_LINK } from '../../../../utils/constants';
import { ConfigurationCard } from '../ConfigurationCard';
import { InnerConfigurationCard } from '../InnerConfigurationCard';
import { useGetOrganizationSubscriptionPlan } from '../../../../hooks/api/queries/useOrganizationSubscription';
import { HighlightedCard } from '../../../../components/HighlightedCard/HighlightedCard';
import { GradientCTAButton } from '../../../../components/GradientCTAButton/GradientCTAButton';
import { useNavigate } from 'react-router-dom';

const TITLE = 'Native Passkey Configuration';

export const NativePasskeyConfiguration = () => {
  const navigate = useNavigate();
  const { data: plan } = useGetOrganizationSubscriptionPlan();

  const handleUpgradeClick = () => {
    navigate('/billing');
  };

  if (!plan?.canUseNativePasskeys) {
    return (
      <HighlightedCard title={TITLE}>
        <GradientCTAButton size="small" onClick={handleUpgradeClick}>
          Upgrade
        </GradientCTAButton>
      </HighlightedCard>
    );
  }

  return (
    <ConfigurationCard title={TITLE} docsLink={PREGEN_DOCS_LINK} disableCollapse buttonVariant="learnMore">
      <InnerConfigurationCard>
        <InlineText weight="medium">
          Status: <SuccessText weight="medium">Active</SuccessText>
        </InlineText>
      </InnerConfigurationCard>
    </ConfigurationCard>
  );
};

const SuccessText = styled(InlineText)`
  color: var(--cpsl-color-utility-green);
`;
