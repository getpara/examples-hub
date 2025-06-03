import { useGetOrganizationSubscription } from '../../../hooks/api/queries/useOrganizationSubscription';
import { CARD_NAMES } from '../../../utils/paymentType';
import { FlatCard } from '../../../components/FlatCard';
import { format } from 'date-fns';
import { useStripePlan } from '../../../hooks/useStripePlan';
import { Button, Typography } from '@getpara/react-component-library';
import { Trans, useTranslation } from 'react-i18next';
import { CreditCard } from 'lucide-react';

export const PaymentMethod = () => {
  const { t } = useTranslation(['billing']);
  const { data: subscription } = useGetOrganizationSubscription();
  const { createCustomerPortalSession, isCreatingStripeSession } = useStripePlan();

  if (!subscription?.billing) {
    return null;
  }

  const handleUpdateButtonClick = async () => {
    await createCustomerPortalSession({ flow: 'paymentMethodUpdate' });
  };

  const address = subscription.billing.address
    ? `${subscription.billing.address.line1 ?? ''}${subscription.billing.address.line2 ? ` ${subscription.billing.address.line2}` : ''}${subscription.billing.address.city ? `, ${subscription.billing.address.city}` : ''}${subscription.billing.address.state ? `, ${subscription.billing.address.state}` : ''}${subscription.billing.address.postalCode ? ` ${subscription.billing.address.postalCode}` : ''}${subscription.billing.address.country ? `, ${subscription.billing.address.country}` : ''}`
    : '';

  let buttonText = t('paymentMethod.default.buttonText');

  switch (subscription.billing.type) {
    case 'card': {
      buttonText = t('paymentMethod.card.buttonText');
      break;
    }
    case 'us_bank_account': {
      buttonText = t('paymentMethod.card.buttonText');
      buttonText = t('paymentMethod.bank.buttonText');
    }
  }

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
          <>
            <Typography className="para:inline para:font-medium" color="secondary">
              <Trans
                t={t}
                i18nKey="paymentMethod.card.details"
                components={{ bold: <strong /> }}
                values={{ cardName: CARD_NAMES[subscription.billing.card.brand], last4: subscription.billing.card.last4 }}
              />
            </Typography>
            <Typography className="para:inline" color="secondary">
              <Trans
                t={t}
                i18nKey="paymentMethod.card.expiration"
                components={{ bold: <strong /> }}
                values={{ date: `${format(cardExpDate, 'MM')}/${format(cardExpDate, 'yy')}` }}
              />
            </Typography>
          </>
        );
      }
      case 'us_bank_account': {
        if (!subscription.billing?.bank) {
          return null;
        }
        return (
          <Typography className="para:inline para:font-medium" color="secondary">
            <Trans
              t={t}
              i18nKey="paymentMethod.bank.details"
              components={{ bold: <strong /> }}
              values={{ last4: subscription.billing?.bank?.last4 }}
            />
          </Typography>
        );
      }
      default: {
        return null;
      }
    }
  };

  return (
    <FlatCard>
      <div className="para:flex para:flex-col para:md:flex-row para:gap-4 para:justify-between">
        <div className="para:flex para:flex-col para:gap-4">
          <Typography className="para:text-xl para:font-semibold">{t('paymentMethod.title')}</Typography>
          <div className="para:flex para:gap-4">
            <PaymentDetails />
          </div>
          <Typography color="secondary" className="para:font-medium">
            {subscription.billing.name}
            {address && (
              <Typography color="secondary" className="para:font-medium">
                {address}
              </Typography>
            )}
          </Typography>
        </div>
        <div className="para:flex para:justify-end">
          <Button
            variant="neutral"
            onClick={handleUpdateButtonClick}
            isLoading={isCreatingStripeSession}
            disabled={isCreatingStripeSession}
          >
            <CreditCard />
            {buttonText}
          </Button>
        </div>
      </div>
    </FlatCard>
  );
};
