import { useNavigate } from 'react-router-dom';
import { Loader } from '../../components/Loader';
import { Header } from './components/Header';
import { MembersTable } from './components/MembersTable';
import { useIsOwner } from '../../hooks/api/queries/useOrganizationMember';
import { useEffect } from 'react';

export const Team = () => {
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
      <MembersTable />
    </>
  );
};
