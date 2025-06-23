import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  toast,
  Typography,
} from '@getpara/react-component-library';
import { MemberRole, OrganizationMember } from '../../../types/api';
import { useOrganizationMemberCapabilities } from '../../../hooks/api/queries/useOrganizationMember';
import { useRemoveMember } from '../../../hooks/api/mutations/useRemoveMember';
import { formatErrorMessage } from '../../../utils/formatErrorMessage';
import { AxiosError } from 'axios';
import { memo } from 'react';

type RemoveMemberDialogProps = {
  member?: OrganizationMember;
  open: boolean;
  setOpen: (_: boolean) => void;
  onSuccess: () => void;
};

export const RemoveMemberDialog = memo(({ member, open, setOpen, onSuccess }: RemoveMemberDialogProps) => {
  const { data: capabilities } = useOrganizationMemberCapabilities();
  const { mutate: removeMember, isPending: isRemoving } = useRemoveMember();

  const canRemove = capabilities?.canDeleteMembers && capabilities?.assignableRoles.includes(member?.role as MemberRole);

  const onOpenChange = (open: boolean) => {
    setOpen(open);
  };

  const handleRemoveClick = () => {
    if (member) {
      removeMember(
        { memberId: member.id },
        {
          onSuccess: () => {
            setOpen(false);
            onSuccess();
          },
          onError: err => {
            const message =
              ((err as AxiosError).response?.data as string) ?? 'If the problem persists, contact Para support.';

            toast.error('Failed to Remove Member', {
              description: formatErrorMessage(message),
            });
          },
        },
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button variant="destructive" disabled={!canRemove}>
          Remove Teammate
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Remove Teammate</DialogTitle>
          <DialogDescription>Are you sure you want to remove this teammate?</DialogDescription>
          <Typography className="para:font-semibold">
            {member?.user?.name ?? member?.user?.email ?? member?.pendingEmail ?? ''}
          </Typography>
        </DialogHeader>
        <DialogFooter>
          <div>
            <Button
              disabled={!canRemove || isRemoving}
              isLoading={isRemoving}
              variant="destructive"
              onClick={handleRemoveClick}
            >
              Remove
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
});
