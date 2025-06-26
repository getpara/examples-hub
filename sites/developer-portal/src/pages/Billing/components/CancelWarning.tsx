import { Button, toast, Typography } from '@getpara/react-component-library';
import { CircleAlert } from 'lucide-react';
import { Trans, useTranslation } from 'react-i18next';
import { useReinstatePlan } from '../../../hooks/api/mutations/useReinstatePlan';
import { useGetOrganizationSubscription } from '../../../hooks/api/queries/useOrganizationSubscription';
import { differenceInCalendarDays } from 'date-fns';
import { pluralize } from '../../../utils/pluralize';

export const CancelWarning = () => {
  const { data: subscription } = useGetOrganizationSubscription();
  const { mutateAsync: reinstatePlan, isPending: isReinstatingPlan } = useReinstatePlan();
  const { t } = useTranslation(['billing', 'error']);

  const willCancel = subscription?.cancelAtPeriodEnd;
  const daysRemaining = subscription?.periodEnd
    ? differenceInCalendarDays(new Date(subscription.periodEnd * 1000), new Date())
    : undefined;

  const daysRemainingString =
    daysRemaining !== undefined ? `${daysRemaining} ${pluralize(daysRemaining, 'day')}` : undefined;

  const handleReinstateClick = async () => {
    await reinstatePlan(null, {
      onError: () => {
        toast.error(t('api.organization.plan.reinstate.error', { ns: 'error' }), {
          description: t('api.defaultMessage', { ns: 'error' }),
        });
      },
    });
  };

  if (!willCancel) {
    return null;
  }

  return (
    <div className="para:p-4 para:w-full para:flex para:gap-2 para:bg-destructive para:rounded-lg para:-mb-4 para:items-center">
      <CircleAlert className="para:size-4 para:stroke-muted" />
      <Typography className="para:text-sm para:font-medium para:text-muted para:flex-1">
        <Trans
          t={t}
          i18nKey="downgradeWarning.title"
          components={{ bold: <strong /> }}
          values={{ daysRemaining: daysRemainingString }}
        />
      </Typography>
      <Button variant="neutral" onClick={handleReinstateClick} isLoading={isReinstatingPlan} disabled={isReinstatingPlan}>
        {t('downgradeWarning.buttonText')}
      </Button>
    </div>
  );
};
