import { CpslAlert, CpslButton, CpslText } from '@usecapsule/react-components';
import { useGetSelectedOrganization, useGetSelectedOrganizationIsValid } from '../../../hooks/api/queries/useOrganizations';
import styled from 'styled-components';
import { SUPPORT_URL, TODAY } from '../../../utils/constants';
import { useStripePlan } from '../../../hooks/useStripePlan';
import { useGetOrganizationSubscription } from '../../../hooks/api/queries/useOrganizationSubscription';
import { differenceInCalendarDays } from 'date-fns';
import { InlineText } from '../../../components/common';
import { pluralize } from '../../../utils/pluralize';

export const AccountWarning = () => {
  const { data: orgValid } = useGetSelectedOrganizationIsValid();
  const { data: org } = useGetSelectedOrganization();
  const { data: subscription } = useGetOrganizationSubscription();
  const { createCustomerPortalSession, isCreatingStripeSession } = useStripePlan();

  const pastDue = subscription?.status === 'pastDue';
  const isHidden = orgValid && !pastDue;

  if (isHidden) {
    return null;
  }

  const handleUpdatePaymentClick = async () => {
    if (orgValid) await createCustomerPortalSession({});
  };

  const daysUntilSubscriptionCancel = subscription?.periodStart
    ? 14 - differenceInCalendarDays(TODAY, new Date(subscription.periodStart * 1000))
    : 0;

  const title = org?.suspended ? 'Account Suspended' : org?.archived ? 'Account Archived' : 'Account Overdue';
  const subtitle = !orgValid ? (
    'Please reach out for more information.'
  ) : (
    <>
      Please update your payment information {daysUntilSubscriptionCancel === 0 ? '' : 'in the next '}
      <InlineText variant="bodyS" weight="bold" color="secondary">
        {daysUntilSubscriptionCancel === 0
          ? 'today'
          : `${daysUntilSubscriptionCancel} ${pluralize(daysUntilSubscriptionCancel, 'day')}`}
      </InlineText>{' '}
      to maintain full access to your account.{' '}
    </>
  );
  const buttonText = !orgValid ? 'Contact Us' : 'Update Payment';
  const buttonAs = !orgValid ? 'a' : 'button';

  return (
    <StyledAlert variant="error" filled>
      <CpslText weight="semiBold">{title}</CpslText>
      <SubtitleContainer slot="subtitle">
        <InlineText variant="bodyS" weight="medium" color="secondary">
          {subtitle}
        </InlineText>
        <CpslButton
          size="small"
          fullWidth
          as={buttonAs}
          href={SUPPORT_URL}
          onClick={handleUpdatePaymentClick}
          disabled={isCreatingStripeSession}
        >
          {buttonText}
        </CpslButton>
      </SubtitleContainer>
    </StyledAlert>
  );
};

const StyledAlert = styled(CpslAlert)`
  width: 100%;

  --container-align-items: flex-start;
`;

const SubtitleContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;
