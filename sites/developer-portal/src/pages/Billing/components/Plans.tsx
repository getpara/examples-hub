import { usePlanMetadata } from '../../../hooks/configs/usePlanMetadata';
import { useGetSelectedOrganization } from '../../../hooks/api/queries/useOrganizations';
import { useGetOrganizationEnterprisePrice } from '../../../hooks/api/queries/useOrganizationEnterprisePrice';
import { useGetOrganizationSubscription } from '../../../hooks/api/queries/useOrganizationSubscription';
import { PlanCard } from '../../../components/PlanCard/PlanCard';
import { CALENDLY_LINK, ENTERPRISE_PLAN_SLUG, PlanSlug } from '../../../utils/constants';
import { Typography } from '@getpara/react-component-library';
import { useTranslation } from 'react-i18next';
import { Sparkle } from 'lucide-react';
import { useBillingStore } from '../store/useBillingStore';

export const Plans = () => {
  const openChangeModal = useBillingStore(state => state.openChangeModal);
  const { planMeta } = usePlanMetadata();
  const { data: subscription } = useGetOrganizationSubscription();
  const { data: org } = useGetSelectedOrganization();
  const { data: enterprisePrice } = useGetOrganizationEnterprisePrice();
  const { t } = useTranslation(['billing']);

  const activeSlug = subscription?.plan.slug;
  const activeIndex = planMeta?.findIndex(p => p.slug === activeSlug);

  const handleUpgradeClick = async (planSlug: string) => {
    if (planSlug.toUpperCase() === ENTERPRISE_PLAN_SLUG && !org?.enterpriseStripePriceId) {
      window.open(CALENDLY_LINK, '_blank');
      return;
    }

    openChangeModal(planSlug as PlanSlug);
  };

  return (
    <>
      <Typography className="para:text-2xl para:font-semibold">{t('plans.title')}</Typography>
      <div className="para:flex para:flex-col para:gap-4">
        <div className="para:p-4 para:w-full para:flex para:gap-2 para:bg-primary para:rounded-lg">
          <div>
            <Sparkle className="para:size-4 para:stroke-muted" />
          </div>
          <Typography className="para:text-sm para:font-medium para:text-muted">{t('plans.betaUsersDisclosure')}</Typography>
        </div>
        {planMeta?.map((planMetadata, index) => (
          <PlanCard
            key={planMetadata.slug}
            planMetadata={planMetadata}
            isActive={planMetadata.slug.toUpperCase() === activeSlug}
            isHigherPlanActive={index < activeIndex}
            disabled={org?.hasRequestedUpgrade}
            onUpgradeClick={handleUpgradeClick}
            enterprisePrice={enterprisePrice}
          />
        ))}
      </div>
    </>
  );
};
