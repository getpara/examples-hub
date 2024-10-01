import styled from 'styled-components';
import { InlineText } from '../../../../components/common';
import { PREGEN_DOCS_LINK } from '../../../../utils/constants';
import { ConfigurationCard } from '../ConfigurationCard';
import { InnerConfigurationCard } from '../InnerConfigurationCard';
import { useGetOrganizationSubscriptionPlan } from '../../../../hooks/api/queries/useOrganizationSubscription';
import { HighlightedCard } from '../../../../components/HighlightedCard/HighlightedCard';
import { GradientCTAButton } from '../../../../components/GradientCTAButton/GradientCTAButton';
import { useNavigate } from 'react-router-dom';

const TITLE = 'Pregenerated Wallets';
const SUBTITLE =
  'Just looking to add MPC wallets to your existing app’s auth and user models? You can reserve wallets for users and progressively onboard them to Web3 with Pregenerated Wallets.';

export const PregenConfiguration = () => {
  const navigate = useNavigate();
  const { data: plan } = useGetOrganizationSubscriptionPlan();

  const handleUpgradeClick = () => {
    navigate('/billing');
  };

  if (!plan?.canPregen) {
    return (
      <HighlightedCard title={TITLE} subtitle={SUBTITLE}>
        <GradientCTAButton size="small" onClick={handleUpgradeClick}>
          Upgrade
        </GradientCTAButton>
      </HighlightedCard>
    );
  }

  return (
    <ConfigurationCard
      title={TITLE}
      subtitle={SUBTITLE}
      docsLink={PREGEN_DOCS_LINK}
      disableCollapse
      buttonVariant="learnMore"
    >
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
