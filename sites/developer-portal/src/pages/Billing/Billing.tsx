import { useNavigate } from 'react-router-dom';
import { BillingContent } from './components/BillingContent';
import { Header } from './components/Header';
import { useIsOwner } from '../../hooks/api/queries/useOrganizationMember';
import { useEffect } from 'react';
import { Loader } from '../../components/Loader';

export const Billing = () => {
  const navigate = useNavigate();
  const { data: isOwner, isLoading: isMemberLoading } = useIsOwner();

  useEffect(() => {
    if (!isMemberLoading && !isOwner) {
      navigate('/', { replace: true });
    }
  }, [isMemberLoading, isOwner, navigate]);

  if (isMemberLoading) {
    return <Loader />;
  }

  return (
    <>
      <Header />
      <BillingContent />
    </>
  );
};
