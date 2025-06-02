import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  toast,
  Typography,
} from '@getpara/react-component-library';
import { Trans, useTranslation } from 'react-i18next';
import { usePlan } from '../../../hooks/api/queries/usePlans';
import { usePlanMetadata } from '../../../hooks/configs/usePlanMetadata';
import { FREE_PLAN_SLUG } from '../../../utils/constants';
import {
  useGetOrganizationSubscription,
  useHasStripeSubscription,
} from '../../../hooks/api/queries/useOrganizationSubscription';
import { useStripePlan } from '../../../hooks/useStripePlan';
import { useChangePlan } from '../../../hooks/api/mutations/useChangePlan';
import { ChangePlanDialogProjectArchive } from './ChangePlanDialogProjectArchive';
import { ChangePlanDialogAlert } from './ChangePlanDialogAlert';
import { useMemo, useState } from 'react';
import { useGetAllActiveProjects } from '../../../hooks/api/queries/useProjects';
import { useCancelPlan } from '../../../hooks/api/mutations/useCancelPlan';
import { useBillingStore } from '../store/useBillingStore';

export const ChangePlanDialog = () => {
  const open = useBillingStore(state => state.isChangeModalOpen);
  const newPlanSlug = useBillingStore(state => state.newPlanSlug);
  const setIsChangeModalOpen = useBillingStore(state => state.setIsChangeModalOpen);

  const { data: hasSubscription } = useHasStripeSubscription();
  const { data: subscription } = useGetOrganizationSubscription();
  const { isCreatingStripeSession, createSubscription } = useStripePlan();
  const { mutateAsync: changePlan, isPending: isChangingPlan } = useChangePlan();
  const { mutateAsync: cancelPlan, isPending: isCancelingPlan } = useCancelPlan();
  const { planMeta } = usePlanMetadata();
  const { data: plan } = usePlan(newPlanSlug ?? '');
  const { t } = useTranslation(['billing', 'error']);
  const { data: allActiveProjects } = useGetAllActiveProjects();

  const activeSlug = subscription?.plan.slug;
  const activeIndex = planMeta?.findIndex(p => p.slug === activeSlug);
  const selectedIndex = planMeta.findIndex(p => p.slug === newPlanSlug);
  const type = selectedIndex < activeIndex ? 'CHANGE' : 'UPGRADE';

  const [selectedProjectIds, setSelectedProjectIds] = useState<string[]>([]);

  const remainingProjectIds = useMemo(() => {
    return allActiveProjects?.filter(project => !selectedProjectIds.includes(project.id)).map(project => project.id) ?? [];
  }, [allActiveProjects, selectedProjectIds]);

  const metadata = planMeta.find(p => p.slug === newPlanSlug);
  const isFreePlan = newPlanSlug?.toUpperCase() === FREE_PLAN_SLUG;
  const isTieredPrice = plan?.isTieredPrice;
  const tiers = plan?.tiers;
  const planPrice = (isTieredPrice ? (tiers?.[0].flatPrice ?? 0) : (plan?.price ?? 0)) / 100;
  const tierUnitPrice = (tiers?.[1]?.unitPrice ?? 0) / 100;
  const monthlyPrice = t('changePlanDialog.plan.monthlyPrice', { price: planPrice });
  const allowanceStringWithTier = t('changePlanDialog.plan.allowance', {
    allowance: (isTieredPrice ? (tiers?.[0].upTo ?? 0) : (metadata?.maxAllowance ?? 0)).toLocaleString(),
  });
  const overageCost = t('changePlanDialog.plan.overageCost', { cost: tierUnitPrice });

  const planName = t('changePlanDialog.plan.name', { name: metadata?.name });
  const title = type === 'CHANGE' ? t('changePlanDialog.change.title') : t('changePlanDialog.upgrade.title');
  const isDisabled =
    isChangingPlan || isCancelingPlan || isCreatingStripeSession || remainingProjectIds.length > (plan?.maxProjects ?? 1);

  const onOpenChange = (open: boolean) => {
    setIsChangeModalOpen(open);
  };

  const handleConfirmClick = async () => {
    if (!newPlanSlug) {
      return;
    }

    try {
      if (newPlanSlug === FREE_PLAN_SLUG) {
        await cancelPlan(
          { remainingProjectIds },
          {
            onError: () => {
              toast.error(t('api.organization.plan.change.error', { ns: 'error' }), {
                description: t('api.defaultMessage', { ns: 'error' }),
              });
            },
          },
        );
      } else if (!hasSubscription) {
        await createSubscription(newPlanSlug);
      } else {
        await changePlan(
          { planSlug: newPlanSlug, remainingProjectIds },
          {
            onError: () => {
              toast.error(t('api.organization.plan.change.error', { ns: 'error' }), {
                description: t('api.defaultMessage', { ns: 'error' }),
              });
            },
          },
        );
      }
      setIsChangeModalOpen(false);
    } catch {}
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            <Trans
              t={t}
              i18nKey={
                type === 'CHANGE' && isFreePlan ? 'changePlanDialog.downgradeDescription' : 'changePlanDialog.description'
              }
              components={{ bold: <strong /> }}
            />
          </DialogDescription>
          <div className="para:flex para:justify-between para:gap-2">
            <Typography className="para:font-semibold">{planName}</Typography>
            <div className="para:flex para:flex-col para:gap-1 para:items-end">
              <Typography className="para:text-sm para:font-semibold" color="muted">
                {monthlyPrice}
              </Typography>
              <Typography className="para:text-xs para:font-medium" color="muted">
                {allowanceStringWithTier}
              </Typography>
              {!isFreePlan && (
                <Typography className="para:text-xs para:font-medium" color="muted">
                  {overageCost}
                </Typography>
              )}
            </div>
          </div>
          <ChangePlanDialogAlert type={type} planName={planName} />
          {type === 'CHANGE' && (
            <ChangePlanDialogProjectArchive
              plan={plan}
              planName={planName}
              setSelectedProjectIds={setSelectedProjectIds}
              selectedProjectIds={selectedProjectIds}
            />
          )}
        </DialogHeader>
        <DialogFooter>
          <div className="para:flex para:justify-end">
            <Button
              disabled={isDisabled}
              isLoading={isCreatingStripeSession || isChangingPlan || isCancelingPlan}
              onClick={handleConfirmClick}
            >
              {t('changePlanDialog.buttonText')}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
