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
import { MemberRole } from '../../../types/api';
import { useOrganizationMemberCapabilities } from '../../../hooks/api/queries/useOrganizationMember';
import { useGetAllOrganizationMembers } from '../../../hooks/api/queries/useOrganizationMembers';
import { useRemoveMember } from '../../../hooks/api/mutations/useRemoveMember';
import { formatErrorMessage } from '../../../utils/formatErrorMessage';
import { AxiosError } from 'axios';

type RemoveMemberDialogProps = {
  memberId?: string;
  open: boolean;
  setOpen: (_: boolean) => void;
  onSuccess: () => void;
};

export const RemoveMemberDialog = ({ memberId, open, setOpen, onSuccess }: RemoveMemberDialogProps) => {
  const { data: capabilities } = useOrganizationMemberCapabilities();
  const { data: members } = useGetAllOrganizationMembers();
  const { mutate: removeMember, isPending: isRemoving } = useRemoveMember();
  const member = members?.find(m => m.id === memberId);

  const canRemove = capabilities?.canDeleteMembers && capabilities?.assignableRoles.includes(member?.role as MemberRole);

  const onOpenChange = (open: boolean) => {
    setOpen(open);
  };

  const handleRemoveClick = () => {
    if (memberId) {
      removeMember(
        { memberId },
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
          <div className="para:flex para:justify-end">
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
};
