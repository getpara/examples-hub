import { useGetOrganizationSubscription } from '../../../hooks/api/queries/useOrganizationSubscription';
import { FlatCard } from '../../../components/common';
import { useStripePlan } from '../../../hooks/useStripePlan';
import { Button, Typography } from '@getpara/react-component-library';
import { useTranslation } from 'react-i18next';
import { ExternalLink } from 'lucide-react';

export const ManagePlan = () => {
  const { t } = useTranslation(['billing']);
  const { data: subscription } = useGetOrganizationSubscription();
  const { createCustomerPortalSession, isCreatingStripeSession } = useStripePlan();

  if (!subscription?.billing) {
    return null;
  }

  const handleUpdateButtonClick = async () => {
    await createCustomerPortalSession({});
  };

  return (
    <FlatCard>
      <div className="para:flex para:flex-col para:md:flex-row para:gap-4 para:justify-between para:items-center">
        <Typography className="para:font-semibold">{t('managePlan.label')}</Typography>
        <div className="para:flex para:justify-end">
          <Button
            variant="neutral"
            onClick={handleUpdateButtonClick}
            isLoading={isCreatingStripeSession}
            disabled={isCreatingStripeSession}
          >
            {t('managePlan.buttonText')}
            <ExternalLink />
          </Button>
        </div>
      </div>
    </FlatCard>
  );
};
