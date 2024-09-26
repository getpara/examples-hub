import styled from 'styled-components';
import { SplitCard } from '../../../components/SplitCard/SplitCard';
import { CpslButton, CpslText } from '@usecapsule/react-components';
import { useGetOrganizationSubscription } from '../../../hooks/api/queries/useOrganizationSubscription';
import { CARD_NAMES, getPaymentTypeConfig } from '../../../utils/paymentType';
import { InlineText } from '../../../components/common';
import { format } from 'date-fns';
import { useStripePlan } from '../../../hooks/useStripePlan';

export const PaymentMethod = () => {
  const { data: subscription } = useGetOrganizationSubscription();
  const { createCustomerPortalSession, isCreatingStripeSession } = useStripePlan();

  if (!subscription?.billing) {
    return null;
  }

  const handleUpdateButtonClick = async () => {
    await createCustomerPortalSession({ flow: 'paymentMethodUpdate' });
  };

  const paymentConfig = getPaymentTypeConfig(subscription.billing.type);

  const address = subscription.billing.address
    ? `${subscription.billing.address.line1 ?? ''}${subscription.billing.address.line2 ? ` ${subscription.billing.address.line2}` : ''}${subscription.billing.address.city ? `, ${subscription.billing.address.city}` : ''}${subscription.billing.address.state ? `, ${subscription.billing.address.state}` : ''}${subscription.billing.address.postalCode ? ` ${subscription.billing.address.postalCode}` : ''}${subscription.billing.address.country ? `, ${subscription.billing.address.country}` : ''}`
    : '';

  const PaymentDetails = () => {
    switch (subscription.billing!.type) {
      case 'card': {
        if (!subscription.billing?.card) {
          return null;
        }
        const cardExpDate = new Date();
        cardExpDate.setMonth(subscription.billing.card.expMonth - 1);
        cardExpDate.setFullYear(subscription.billing.card.expYear);

        return (
          <PaymentDetailsContainer>
            <InlineText weight="medium">
              <InlineText weight="bold">{CARD_NAMES[subscription.billing.card.brand]}</InlineText> ending in{' '}
              <InlineText weight="bold">{subscription.billing.card.last4}</InlineText>
            </InlineText>
            <InlineText weight="medium">
              Expires{' '}
              <InlineText weight="bold">
                {format(cardExpDate, 'MM')}/{format(cardExpDate, 'yy')}
              </InlineText>
            </InlineText>
          </PaymentDetailsContainer>
        );
      }
      case 'us_bank_account': {
        if (!subscription.billing?.bank) {
          return null;
        }
        return (
          <PaymentDetailsContainer>
            <InlineText weight="medium">
              Account ending in<CpslText weight="bold">{subscription.billing?.bank?.last4}</CpslText>
            </InlineText>
          </PaymentDetailsContainer>
        );
      }
      default: {
        return null;
      }
    }
  };

  return (
    <>
      <CpslText variant="bodyL" weight="semiBold">
        Payment Method
      </CpslText>
      <Container>
        <SplitCard
          LeftContent={
            <LeftContainer>
              <CpslText variant="bodyL" weight="semiBold">
                {paymentConfig.label}
                <PaymentDetails />
              </CpslText>
              <CpslText weight="medium">
                {subscription.billing.name}
                {address && <CpslText>{address}</CpslText>}
              </CpslText>
            </LeftContainer>
          }
          RightContent={
            <RightContainer>
              <CpslButton disabled={isCreatingStripeSession} onClick={handleUpdateButtonClick}>
                {paymentConfig.buttonText}
              </CpslButton>
            </RightContainer>
          }
        />
      </Container>
    </>
  );
};

const Container = styled.div`
  max-width: 840px;
`;

const LeftContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const RightContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  align-items: center;
`;

const PaymentDetailsContainer = styled.div`
  display: flex;
  gap: 24px;
`;
