import { useNavigate } from 'react-router-dom';
import { BillingContent } from './components/BillingContent';
import { useOrganizationMemberCapabilities } from '../../hooks/api/queries/useOrganizationMember';
import { useEffect } from 'react';
import { PageHeader } from '../../components/PageHeader';
import { useTranslation } from 'react-i18next';
import { useGetOrganizationSubscription } from '../../hooks/api/queries/useOrganizationSubscription';
import { Loader } from '@getpara/react-component-library';
import { ChangePlanDialog } from './components/ChangePlanDialog';

export const Billing = () => {
  const navigate = useNavigate();
  const { data: capabilities, isLoading: isMemberLoading } = useOrganizationMemberCapabilities();
  const { isLoading: isLoadingSubscription } = useGetOrganizationSubscription();
  const { t } = useTranslation(['billing']);

  useEffect(() => {
    if (!isMemberLoading && !capabilities?.canViewOrganizationBilling) {
      navigate('/', { replace: true });
    }
  }, [isMemberLoading, navigate, capabilities?.canViewOrganizationBilling]);

  if (isMemberLoading || isLoadingSubscription) {
    return <Loader className="para:m-auto para:size-14" />;
  }

  return (
    <div className="para:flex para:flex-col para:gap-6">
      <PageHeader title={t('title')} />
      <BillingContent />
      <ChangePlanDialog />
    </div>
  );
};
