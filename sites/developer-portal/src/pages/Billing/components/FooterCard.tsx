import styled from 'styled-components';
import { BaseCard } from '../../../components/common';
import { CpslButton, CpslText } from '@usecapsule/react-components';
import { SUPPORT_URL } from '../../../utils/constants';
import {
  useHasStripeSubscription,
  useWillStripeSubscriptionCancel,
} from '../../../hooks/api/queries/useOrganizationSubscription';

export const FooterCard = () => {
  const { data: willSubscriptionCancel } = useWillStripeSubscriptionCancel();
  const { data: hasSubscription } = useHasStripeSubscription();

  return (
    <>
      <Container>
        <BaseCard>
          <InnerContainer>
            <Text variant="bodyS" weight="medium">
              Not finding the features or plan you are looking for? We’d love to hear about what you need!
            </Text>
            <ButtonContainer>
              <CpslButton size="small" as="a" href={SUPPORT_URL}>
                Get In Touch
              </CpslButton>
              {hasSubscription && (
                <CpslButton
                  disabled={willSubscriptionCancel}
                  variant="destructive"
                  size="small"
                  as="a"
                  href="https://usecapsule.com/talk-to-us"
                  target="_blank"
                >
                  Cancel Plan
                </CpslButton>
              )}
            </ButtonContainer>
          </InnerContainer>
        </BaseCard>
      </Container>
    </>
  );
};

const Container = styled.div`
  max-width: 840px;
`;

const InnerContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 24px;
`;

const ButtonContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const Text = styled(CpslText)`
  flex-basis: 450px;
`;
