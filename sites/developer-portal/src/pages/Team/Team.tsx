import { MembersTable } from './components/MembersTable';
import { useOrganizationMemberCapabilities } from '../../hooks/api/queries/useOrganizationMember';
import { PageHeader } from '../../components/PageHeader';
import { useState } from 'react';
import { Button, Loader } from '@getpara/react-component-library';
import { UserPlus } from 'lucide-react';
import { AddMemberDialog } from '../../components/AddMemberDialogContent/AddMemberDialogContent';

export const Team = () => {
  const { data: capabilities, isLoading: isMemberLoading } = useOrganizationMemberCapabilities();
  const [addMemberDialogOpen, setAddMemberDialogOpen] = useState(false);

  if (isMemberLoading) {
    return <Loader className="para:m-auto para:size-14" />;
  }

  if (!capabilities?.canViewMembers) {
    return null;
  }

  const handleAddMemberClick = () => {
    if (capabilities?.canInviteMembers) {
      setAddMemberDialogOpen(true);
    }
  };

  return (
    <>
      <div className="para:flex para:flex-col para:gap-4 para:w-full">
        <PageHeader
          title={'Team'}
          ActionComponent={
            <Button variant="neutral" onClick={handleAddMemberClick}>
              <UserPlus />
              Add Team Member
            </Button>
          }
        />
        <MembersTable />
      </div>
      <AddMemberDialog open={addMemberDialogOpen} setOpen={setAddMemberDialogOpen} />
    </>
  );
};
