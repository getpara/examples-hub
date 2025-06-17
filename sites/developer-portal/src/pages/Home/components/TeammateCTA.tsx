import { ArrowRight } from 'lucide-react';
import { FlatCard } from '../../../components/FlatCard';
import { Typography } from '@getpara/react-component-library';
import { useOrganizationMemberCapabilities } from '../../../hooks/api/queries/useOrganizationMember';
import { useState } from 'react';
import { AddMemberDialog } from '../../../components/AddMemberDialogContent/AddMemberDialogContent';

export const TeammateCTA = () => {
  const { data: capabilities } = useOrganizationMemberCapabilities();
  const [addMemberDialogOpen, setAddMemberDialogOpen] = useState(false);

  if (!capabilities?.canInviteMembers) {
    return null;
  }

  const handleAddMemberClick = () => {
    if (capabilities?.canInviteMembers) {
      setAddMemberDialogOpen(true);
    }
  };

  return (
    <>
      <FlatCard
        className="para:pt-[13px] para:lg:pt-[26px] para:px-4 para:lg:px-8 para:pb-[15px] para:lg:pb-[30px] para:hover:shadow-md para:transition-shadow para:duration-200 para:ease-out para:cursor-pointer"
        onClick={handleAddMemberClick}
      >
        <div className="para:flex para:items-center para:gap-2 para:justify-between para:w-full para:h-full">
          <div>
            <Typography className="para:text-xl para:font-semibold">Invite a teammate</Typography>
            <Typography color="muted" className="para:text-sm para:font-medium">
              Add teammates to help manage your Para instance.
            </Typography>
          </div>
          <ArrowRight />
        </div>
      </FlatCard>
      <AddMemberDialog open={addMemberDialogOpen} setOpen={setAddMemberDialogOpen} />
    </>
  );
};
