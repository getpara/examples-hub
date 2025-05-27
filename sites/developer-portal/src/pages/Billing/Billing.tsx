import { useNavigate } from 'react-router-dom';
import { BillingContent } from './components/BillingContent';
import { useIsOwner } from '../../hooks/api/queries/useOrganizationMember';
import { useEffect } from 'react';
import { PageHeader } from '../../components/PageHeader';
import { useTranslation } from 'react-i18next';
import { useGetOrganizationSubscription } from '../../hooks/api/queries/useOrganizationSubscription';
import { Loader } from '@getpara/react-component-library';
import { ChangePlanDialog } from './components/ChangePlanDialog';

export const Billing = () => {
  const navigate = useNavigate();
  const { data: isOwner, isLoading: isMemberLoading } = useIsOwner();
  const { isLoading: isLoadingSubscription } = useGetOrganizationSubscription();
  const { t } = useTranslation(['billing']);

  useEffect(() => {
    if (!isMemberLoading && !isOwner) {
      navigate('/', { replace: true });
    }
  }, [isMemberLoading, isOwner, navigate]);

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
