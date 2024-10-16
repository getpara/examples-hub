import { Loader } from '../../components/Loader';
import { Header } from './components/Header';
import { MembersTable } from './components/MembersTable';
import { useIsOwner } from '../../hooks/api/queries/useOrganizationMember';

export const Team = () => {
  const { isLoading: isMemberLoading } = useIsOwner();

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
