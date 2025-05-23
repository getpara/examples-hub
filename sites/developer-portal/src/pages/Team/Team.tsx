import { Loader } from '../../components/Loader';
import { MembersTable } from './components/MembersTable';
import { useIsOwner } from '../../hooks/api/queries/useOrganizationMember';
import { PageHeader } from '../../components/PageHeader';
import { AddMemberDialog } from './components/AddMemberDialog';
import { useState } from 'react';

export const Team = () => {
  const { isLoading: isMemberLoading } = useIsOwner();
  const [addMemberDialogOpen, setAddMemberDialogOpen] = useState(false);

  if (isMemberLoading) {
    return <Loader />;
  }

  return (
    <div className="para:flex para:flex-col para:gap-4">
      <PageHeader
        title={'Team'}
        ActionComponent={<AddMemberDialog open={addMemberDialogOpen} setOpen={setAddMemberDialogOpen} />}
      />
      <MembersTable />
    </div>
  );
};
