import { CpslButton, CpslInput } from '@getpara/react-components';
import { Modal } from '../../../components/Modal/Modal';
import { useRemoveMember } from '../../../hooks/api/mutations/useRemoveMember';
import { triggerToast } from '../../../utils/toasts';
import { useGetSelectedOrganizationIsValid } from '../../../hooks/api/queries/useOrganizations';

interface RemoveMemberModalProps {
  open: boolean;
  memberId: string;
  memberEmail: string;
  onClose: () => void;
  onExited: () => void;
}

export const RemoveMemberModal = ({ open, memberEmail, memberId, onClose, onExited }: RemoveMemberModalProps) => {
  const { mutate: removeMember } = useRemoveMember();
  const { data: orgValid } = useGetSelectedOrganizationIsValid();

  const handleRemoveClick = () => {
    if (orgValid) {
      removeMember(
        { memberId },
        {
          onSuccess: () => {
            onClose();
            triggerToast({
              variant: 'success',
              title: 'Member Removed!',
            });
          },
          onError: () => {
            triggerToast({
              variant: 'error',
              title: 'Failed to Remove Member',
              body: 'Please try again. If the problem persists, contact Para support.',
            });
          },
        },
      );
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      onExited={onExited}
      title="Remove Member"
      titleColor="var(--cpsl-color-text-error)"
      subtitle="Are you sure you want to remove this member?"
    >
      <>
        <CpslInput value={memberEmail} disabled />
        <CpslButton variant="destructive" fullWidth onClick={handleRemoveClick} disabled={!orgValid}>
          Remove Member
        </CpslButton>
      </>
    </Modal>
  );
};
