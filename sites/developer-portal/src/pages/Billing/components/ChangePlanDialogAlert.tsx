import { Alert, AlertDescription, AlertTitle, Button } from '@getpara/react-component-library';
import { Trans, useTranslation } from 'react-i18next';
import { usePlanMetadata } from '../../../hooks/configs/usePlanMetadata';
import { Info } from 'lucide-react';
import { usePlanRecommendation } from '../../../hooks/usePlanRecommendation';
import { useBillingStore } from '../store/useBillingStore';
import { PlanSlug } from '../../../utils/constants';

type ChangePlanDialogAlertProps = {
  type: 'CHANGE' | 'UPGRADE';
  planName: string;
};

export const ChangePlanDialogAlert = ({ type, planName }: ChangePlanDialogAlertProps) => {
  const newPlanSlug = useBillingStore(state => state.newPlanSlug);
  const setNewPlanSlug = useBillingStore(state => state.setNewPlanSlug);
  const { planMeta } = usePlanMetadata();
  const { upgradeRecommendation, changeRecommendation } = usePlanRecommendation(newPlanSlug);
  const { t } = useTranslation(['billing']);

  const premiumFeatureWarning =
    type === 'CHANGE' ? changeRecommendation.higherPlanRecommended : upgradeRecommendation.higherPlanRecommended;

  const recommendedPlanMeta = planMeta.find(p => p.slug === upgradeRecommendation.recommendedPlan);
  const recommendedPlanName = `${recommendedPlanMeta?.name} Plan`;

  const alertTitle =
    type === 'CHANGE' ? t('changePlanDialog.change.alert.title') : t('changePlanDialog.upgrade.alert.title');

  const handleRecommendationClick = () => {
    setNewPlanSlug(upgradeRecommendation.recommendedPlan as PlanSlug);
  };

  if (!premiumFeatureWarning) {
    return null;
  }

  return (
    <>
      <Alert>
        <Info className="para:size-4 para:stroke-primary" />
        <AlertTitle className="para:text-primary">{alertTitle}</AlertTitle>
        <AlertDescription className="para:inline">
          <Trans
            t={t}
            i18nKey={
              type === 'CHANGE' ? 'changePlanDialog.change.alert.description' : 'changePlanDialog.upgrade.alert.description'
            }
            values={{ planName, recommendedPlanName }}
            components={{ bold: <strong /> }}
          />
        </AlertDescription>
      </Alert>
      {type === 'UPGRADE' && (
        <div className="para:ml-auto">
          <Button variant="neutral" onClick={handleRecommendationClick}>
            <Trans t={t} i18nKey="changePlanDialog.upgrade.alert.buttonText" values={{ recommendedPlanName }} />
          </Button>
        </div>
      )}
    </>
  );
};
